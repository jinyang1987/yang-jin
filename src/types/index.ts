/**
 * Metadata-driven architecture types
 */

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  BOOLEAN = 'boolean',
  TEXTAREA = 'textarea',
  FILE = 'file',
}

export interface FieldValidation {
  required?: boolean;
  pattern?: string; // Regex
  message?: string;
  min?: number;
  max?: number;
}

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldSchema {
  id: string;
  name: string;
  key: string;
  type: FieldType;
  options?: FieldOption[];
  validation?: FieldValidation;
  placeholder?: string;
  defaultValue?: any;
  description?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  role: string;
  allowEditFields: string[]; // Keys of fields editable in this step
}

export interface ResourceCategory {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  fields: FieldSchema[];
  parentId?: string; // Add this for hierarchy
  workflow?: {
    enabled: boolean;
    steps: WorkflowStep[];
  };
  watermarkConfig?: {
    enabled: boolean;
    textTemplate: string; // e.g. "CONFIDENTIAL - ${userName}"
  };
}

export interface ResourceInstance {
  id: string;
  categoryId: string;
  data: Record<string, any>;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'expired' | 'deleted';
  currentStepId?: string;
  createdBy: string;
  ownerId?: string; // Standard ownership
  createdAt: number;
  updatedAt: number;
  expiryDate?: number;
  department: string;
  fileUrl?: string; // Primary file link
  currentVersion?: number;
  attachments?: {
    url: string;
    name: string;
    type: string;
    size: number;
    isWatermarked?: boolean;
    isViewOnly?: boolean;
  }[];
  versions?: {
    id: string;
    version: number;
    url: string;
    name: string;
    createdAt: number;
    createdBy: string;
    comment?: string;
  }[];
}

export interface ArchiveRecord {
  id: string;
  code: string;
  title: string;
  type: string;
  location: string;
  status: 'available' | 'borrowed' | 'missing' | 'deleted';
  description?: string;
  department: string;
  createdAt: number;
  createdBy: string;
}

export type ApplicationType = 'print' | 'physical_reservation';

export interface WorkflowApplication {
  id: string;
  type: ApplicationType;
  applicantId: string;
  applicantName: string;
  department: string;
  targetResources: string[]; // IDs
  targetArchives?: string[]; // IDs
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvalNodes: {
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    userId?: string;
    userName?: string;
    comment?: string;
    updatedAt?: number;
  }[];
  details: {
    printQuantity?: number;
    printWindowEnd?: number; // expiry of print permission
    borrowStartTime?: number;
    borrowEndTime?: number;
    watermarkText?: string;
    returnTime?: number;
    actualReturnTime?: number;
    extensionReason?: string;
  };
  createdAt: number;
}

export interface Permission {
  id: string;
  name: string;
  module: 'resources' | 'archives' | 'system' | 'projects' | 'approvals';
  action: 'read' | 'write' | 'delete' | 'audit' | 'config';
  description: string;
}

export interface AppRole {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // List of permission IDs
  isSystem?: boolean; // System roles cannot be deleted
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: string; // Dynamic role ID or 'admin'
  department: string;
  isSuperAdmin?: boolean;
}
