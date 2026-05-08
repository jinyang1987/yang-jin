import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ResourceCategory, ResourceInstance, UserProfile, ArchiveRecord, WorkflowApplication, ApplicationType, AppRole, Permission } from '../types';

export interface ResourceVersion {
  id: string;
  version: number;
  url: string;
  name: string;
  createdAt: number;
  createdBy: string;
  comment?: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firestoreService = {
  // Categories
  async getCategories(): Promise<ResourceCategory[]> {
    const path = 'categories';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResourceCategory));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async saveCategory(category: ResourceCategory) {
    const path = 'categories';
    try {
      const { id, ...data } = category;
      await setDoc(doc(db, path, id), data, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteCategory(id: string) {
    const path = `categories/${id}`;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async saveCategoriesBatch(toUpdate: ResourceCategory[], toDeleteIds: string[]) {
    console.log("FirestoreService: Batch operation starting...", { updating: toUpdate.length, deleting: toDeleteIds.length });
    const batch = writeBatch(db);
    
    // Deletions
    toDeleteIds.forEach(id => {
      const docRef = doc(db, 'categories', id);
      batch.delete(docRef);
    });
    
    // Updates
    toUpdate.forEach(cat => {
      const { id, ...rawData } = cat;
      if (!id) {
        console.error("FirestoreService: Missing ID for category", cat);
        return;
      }
      
      // Clean undefined values to prevent Firestore errors
      const data: Record<string, any> = {};
      Object.keys(rawData).forEach(key => {
        const val = (rawData as any)[key];
        if (val !== undefined && val !== null) {
          // If it's fields array, we should also clean its items?
          // For now just top level is enough as fields items usually don't have undefineds
          data[key] = val;
        }
      });

      const docRef = doc(db, 'categories', id);
      batch.set(docRef, data, { merge: true });
    });
    
    try {
      await batch.commit();
      console.log("FirestoreService: Batch operation committed successfully");
    } catch (error) {
      console.error("FirestoreService: Batch commit failed", error);
      handleFirestoreError(error, OperationType.WRITE, 'categories-batch');
    }
  },

  // Resources
  async getResources(categoryId: string, includeDeleted = false): Promise<ResourceInstance[]> {
    const path = 'resources';
    try {
      let q = query(
        collection(db, path), 
        where('categoryId', '==', categoryId)
      );
      
      if (!includeDeleted) {
        q = query(q, where('isDeleted', '!=', true));
      }
      
      const snap = await getDocs(q);
      return snap.docs.map(d => {
        const data = d.data();
        const normalizeDate = (val: any) => {
          if (!val) return Date.now();
          if (typeof val.toMillis === 'function') return val.toMillis();
          if (typeof val === 'number') return val;
          if (val instanceof Date) return val.getTime();
          return Date.now();
        };

        return {
          id: d.id,
          ...data,
          createdAt: normalizeDate(data.createdAt),
          updatedAt: normalizeDate(data.updatedAt),
          expiryDate: data.expiryDate ? normalizeDate(data.expiryDate) : undefined
        } as ResourceInstance;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createResource(categoryId: string, data: Record<string, any>, department: string) {
    const path = 'resources';
    try {
      const docData = {
        categoryId,
        data,
        status: 'pending',
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        department
      };
      return await addDoc(collection(db, path), docData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateResource(id: string, data: Partial<ResourceInstance>) {
    const path = `resources/${id}`;
    try {
      const updates: any = { ...data, updatedAt: serverTimestamp() };
      // Convert timestamps if needed
      await updateDoc(doc(db, 'resources', id), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async softDeleteResource(id: string) {
    const path = `resources/${id}`;
    try {
      await updateDoc(doc(db, 'resources', id), { 
        isDeleted: true,
        deletedAt: Date.now(),
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async restoreResource(id: string) {
    const path = `resources/${id}`;
    try {
      await updateDoc(doc(db, 'resources', id), { 
        isDeleted: false,
        deletedAt: null,
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getDeletedResources(): Promise<ResourceInstance[]> {
    const path = 'resources';
    try {
      const q = query(collection(db, path), where('isDeleted', '==', true));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async batchCreateResources(categoryId: string, items: any[], department: string) {
    const batch = writeBatch(db);
    const path = 'resources';
    
    items.forEach(item => {
      const docRef = doc(collection(db, path));
      batch.set(docRef, {
        categoryId,
        data: item,
        status: 'pending',
        isDeleted: false,
        createdBy: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        department
      });
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'resources-batch');
    }
  },

  async updateResourceStatus(id: string, status: string) {
    const path = `resources/${id}`;
    try {
      await updateDoc(doc(db, 'resources', id), { 
        status, 
        updatedAt: serverTimestamp() 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async addResourceVersion(resourceId: string, version: Omit<ResourceVersion, 'id' | 'createdAt'>) {
    const path = `resources/${resourceId}`;
    try {
      const resourceDoc = await getDoc(doc(db, 'resources', resourceId));
      if (!resourceDoc.exists()) throw new Error('Resource not found');
      
      const currentData = resourceDoc.data() as ResourceInstance;
      const versions = currentData.versions || [];
      const newVersion = {
        ...version,
        id: `v-${Date.now()}`,
        createdAt: Date.now()
      };
      
      await updateDoc(doc(db, 'resources', resourceId), {
        versions: [...versions, newVersion],
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Archive Management
  async getArchives(department?: string): Promise<ArchiveRecord[]> {
    const path = 'archives';
    try {
      let q = query(collection(db, path), where('status', '!=', 'deleted'));
      if (department) {
        q = query(q, where('department', '==', department));
      }
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ArchiveRecord));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createArchive(data: Omit<ArchiveRecord, 'id' | 'createdAt' | 'createdBy'>) {
    const path = 'archives';
    try {
      const docData = {
        ...data,
        createdBy: auth.currentUser?.uid,
        createdAt: Date.now()
      };
      return await addDoc(collection(db, path), docData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Workflow Applications
  async getApplications(type?: ApplicationType, userId?: string): Promise<WorkflowApplication[]> {
    const path = 'applications';
    try {
      let q = query(collection(db, path));
      if (type) q = query(q, where('type', '==', type));
      if (userId) q = query(q, where('applicantId', '==', userId));
      
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkflowApplication));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async createApplication(data: Omit<WorkflowApplication, 'id' | 'createdAt' | 'status' | 'approvalNodes'>) {
    const path = 'applications';
    try {
      const docData = {
        ...data,
        status: 'pending',
        approvalNodes: [
          { role: 'Tender Center Manager', status: 'pending' }
        ],
        createdAt: Date.now()
      };
      return await addDoc(collection(db, path), docData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async approveApplication(id: string, userId: string, userName: string, comment?: string) {
    const path = `applications/${id}`;
    try {
      const docRef = doc(db, 'applications', id);
      const appSnap = await getDoc(docRef);
      if (!appSnap.exists()) throw new Error('Application not found');
      
      const appData = appSnap.data() as WorkflowApplication;
      // Simple logic: update the first pending node
      const nodes = [...appData.approvalNodes];
      const pendingIdx = nodes.findIndex(n => n.status === 'pending');
      if (pendingIdx !== -1) {
        nodes[pendingIdx] = {
          ...nodes[pendingIdx],
          status: 'approved',
          userId,
          userName,
          comment,
          updatedAt: Date.now()
        };
      }
      
      const isComplete = nodes.every(n => n.status === 'approved');
      const updates: any = {
        approvalNodes: nodes,
        status: isComplete ? 'approved' : 'pending'
      };
      
      if (isComplete && appData.type === 'print') {
        // Set 1 day print window limit
        updates['details.printWindowEnd'] = Date.now() + 24 * 60 * 60 * 1000;
      }
      
      await updateDoc(docRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // User Profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const path = `users/${uid}`;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? (snap.data() as UserProfile) : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    const path = 'users';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => ({ ...d.data() } as UserProfile));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async updateUserRole(uid: string, role: string) {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), { role, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Roles & Permissions
  async getRoles(): Promise<AppRole[]> {
    const path = 'roles';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AppRole));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async saveRole(role: Partial<AppRole>) {
    const path = 'roles';
    try {
      const id = role.id || doc(collection(db, path)).id;
      await setDoc(doc(db, path, id), {
        ...role,
        id,
        updatedAt: Date.now(),
        createdAt: role.createdAt || Date.now()
      }, { merge: true });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteRole(id: string) {
    const path = `roles/${id}`;
    try {
      await deleteDoc(doc(db, 'roles', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
