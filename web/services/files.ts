import { api } from './apiConfig';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  modifiedTime: string;
  createdTime: string;
  thumbnailLink?: string;
  webViewLink: string;
  webContentLink?: string;
  owners: Array<{
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }>;
  shared: boolean;
  starred: boolean;
  trashed: boolean;
  parents?: string[];
  version?: number;
  description?: string;
  tags?: string[];
  lastViewedByMeTime?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  modifiedTime: string;
  shared: boolean;
  parents?: string[];
  description?: string;
  tags?: string[];
  owners?: Array<{
    // Add this property
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }>;
}

export interface BulkOperationResult {
  success: boolean;
  processedItems: number;
  errors: Array<{
    itemId: string;
    itemName: string;
    error: string;
  }>;
}

export interface DuplicateFile {
  name: string;
  files: DriveFile[];
  totalSize: number;
}

export interface StorageInfo {
  used: number;
  total: number;
  usedByType: {
    [mimeType: string]: number;
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  fileName: string;
  fileId?: string;
  timestamp: string;
  details?: string;
}

// Basic file operations
export async function listDriveFiles(params: {
  folderId?: string;
  sortBy?: string;
  sortOrder?: string;
  pageSize?: number;
}) {
  return api.post('/drive/files', params);
}

export async function uploadDriveFile(params: {
  file: File;
  parentId?: string;
}) {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.parentId) {
    formData.append('parentId', params.parentId);
  }
  return api.post('/drive/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function downloadDriveFile(params: { fileId: string }) {
  return api.post('/drive/download', params, { responseType: 'blob' });
}

export async function deleteDriveFile(params: { fileId: string }) {
  return api.delete('/drive/delete', { data: params });
}

export async function createDriveFolder(params: {
  name: string;
  parentId?: string;
}) {
  return api.post('/drive/folder/create', params);
}

export async function shareDriveFile(params: {
  fileId: string;
  email: string;
  role?: string;
}) {
  return api.post('/drive/share', params);
}

export async function getDriveFileInfo(params: { fileId: string }) {
  return api.get(`/drive/file/${params.fileId}`);
}

export async function getDriveStorage() {
  return api.get('/drive/storage');
}

// Bulk operations
export async function bulkDownloadFiles(params: { fileIds: string[] }) {
  return api.post('/drive/bulk/download', params, { responseType: 'blob' });
}

export async function bulkDeleteFiles(params: { fileIds: string[] }) {
  return api.post('/drive/bulk/delete', params);
}

export async function bulkMoveFiles(params: {
  fileIds: string[];
  targetFolderId: string;
}) {
  return api.post('/drive/bulk/move', params);
}

export async function bulkCopyFiles(params: {
  fileIds: string[];
  targetFolderId: string;
}) {
  return api.post('/drive/bulk/copy', params);
}

export async function bulkShareFiles(params: {
  fileIds: string[];
  email: string;
  role: string;
}) {
  return api.post('/drive/bulk/share', params);
}

// File operations
export async function renameDriveFile(params: {
  fileId: string;
  newName: string;
}) {
  return api.post('/drive/rename', params);
}

export async function copyDriveFile(params: {
  fileId: string;
  parentId?: string;
  name?: string;
}) {
  return api.post('/drive/copy', params);
}

export async function moveDriveFile(params: {
  fileId: string;
  targetFolderId: string;
}) {
  return api.post('/drive/move', params);
}

export async function starDriveFile(params: {
  fileId: string;
  starred: boolean;
}) {
  return api.post('/drive/star', params);
}

// Advanced search
export async function advancedSearch(params: {
  query?: string;
  mimeType?: string;
  modifiedTimeRange?: { start: string; end: string };
  sizeRange?: { min: number; max: number };
  starred?: boolean;
  shared?: boolean;
  ownedByMe?: boolean;
  parentId?: string;
}) {
  return api.post('/drive/search/advanced', params);
}

// Duplicate detection
export async function findDuplicateFiles(params: { folderId?: string }) {
  return api.post('/drive/duplicates/find', params);
}

// Storage analytics
export async function getStorageAnalytics() {
  return api.get('/drive/analytics/storage');
}

// Activity tracking
export async function getActivityLog(params: {
  limit?: number;
  offset?: number;
}) {
  return api.get('/drive/activity', { params });
}

export async function logActivity(params: {
  action: string;
  fileId?: string;
  fileName: string;
  details?: string;
}) {
  return api.post('/drive/activity/log', params);
}
