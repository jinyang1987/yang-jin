import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      if (authUser) {
        try {
          const profileRef = doc(db, 'users', authUser.uid);
          const profileSnap = await getDoc(profileRef);
          
          if (profileSnap.exists()) {
            const data = profileSnap.data() as UserProfile;
            if (authUser.email === 'jinlinrun198x@gmail.com' && data.role !== 'admin') {
              data.role = 'admin';
              try {
                await setDoc(profileRef, { role: 'admin' }, { merge: true });
              } catch (e) {
                console.warn("Could not persist admin role update", e);
              }
            }
            setProfile(data);
          } else {
            const isSpecificAdmin = authUser.email === 'jinlinrun198x@gmail.com';
            const newProfile: UserProfile = {
              uid: authUser.uid,
              email: authUser.email || '',
              name: authUser.displayName || '新用户',
              role: isSpecificAdmin ? 'admin' : 'user',
              department: 'integration',
              isSuperAdmin: isSpecificAdmin
            };
            await setDoc(profileRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Profile fetch error:", error);
          if (authUser.email === 'jinlinrun198x@gmail.com') {
            setProfile({
              uid: authUser.uid,
              email: authUser.email,
              name: authUser.displayName || 'Admin',
              role: 'admin',
              department: 'integration'
            } as UserProfile);
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
