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
}

export interface FileVersion {
  id: string;
  modifiedTime: string;
  size?: number;
  downloadUrl?: string;
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

// Existing functions
export async function listDriveFiles(params: any) {
  return api.post('/drive/files', params);
}

export async function uploadDriveFile(params: any) {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.parentId) {
    formData.append('parentId', params.parentId);
  }

  return api.post('/drive/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export async function downloadDriveFile(params: any) {
  return api.post('/drive/download', params, {
    responseType: 'blob',
  });
}

export async function deleteDriveFile(params: any) {
  return api.delete('/drive/delete', {
    data: params,
  });
}

export async function createDriveFolder(params: any) {
  return api.post('/drive/folder/create', params);
}

export async function shareDriveFile(params: any) {
  return api.post('/drive/share', params);
}

export async function getDriveFileInfo(params: any) {
  return api.get(`/drive/file/${params.fileId}`);
}

export async function getDriveStorage() {
  return api.get('/drive/storage');
}

// Enhanced functions for advanced features

// Bulk operations
export async function bulkDownloadFiles(params: { fileIds: string[] }) {
  return api.post('/drive/bulk/download', params, {
    responseType: 'blob',
  });
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
  role: 'reader' | 'writer' | 'commenter';
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

export async function addFileTags(params: { fileId: string; tags: string[] }) {
  return api.post('/drive/tags/add', params);
}

export async function removeFileTags(params: {
  fileId: string;
  tags: string[];
}) {
  return api.post('/drive/tags/remove', params);
}

export async function addFileDescription(params: {
  fileId: string;
  description: string;
}) {
  return api.post('/drive/description', params);
}

// Version history
export async function getFileVersions(params: { fileId: string }) {
  return api.get(`/drive/file/${params.fileId}/versions`);
}

export async function restoreFileVersion(params: {
  fileId: string;
  versionId: string;
}) {
  return api.post('/drive/file/restore-version', params);
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

export async function mergeDuplicateFiles(params: {
  keepFileId: string;
  deleteFileIds: string[];
}) {
  return api.post('/drive/duplicates/merge', params);
}

// Storage analytics
export async function getStorageAnalytics() {
  return api.get('/drive/analytics/storage');
}

export async function getFileTypeAnalytics() {
  return api.get('/drive/analytics/file-types');
}

export async function getUsageAnalytics(params: {
  timeRange: 'week' | 'month' | 'year';
}) {
  return api.get(`/drive/analytics/usage?timeRange=${params.timeRange}`);
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

// Sharing enhancements
export async function createShareLink(params: {
  fileId: string;
  expirationTime?: string;
  password?: string;
  allowDownload?: boolean;
}) {
  return api.post('/drive/share/link', params);
}

export async function revokeShareLink(params: {
  fileId: string;
  linkId: string;
}) {
  return api.post('/drive/share/revoke', params);
}

export async function getSharedWithMe(params: {
  pageSize?: number;
  pageToken?: string;
}) {
  return api.get('/drive/shared-with-me', { params });
}

// Folder operations
export async function getFolderTree(params: { rootFolderId?: string }) {
  return api.get('/drive/folder/tree', { params });
}

export async function createFolderStructure(params: {
  structure: Array<{
    name: string;
    parentId?: string;
    children?: any[];
  }>;
}) {
  return api.post('/drive/folder/create-structure', params);
}

// File conversion
export async function convertFile(params: {
  fileId: string;
  targetFormat: string;
  options?: any;
}) {
  return api.post('/drive/convert', params);
}

// OCR for images
export async function extractTextFromImage(params: { fileId: string }) {
  return api.post('/drive/ocr/extract', params);
}

// Compression
export async function createArchive(params: {
  fileIds: string[];
  archiveName: string;
  format: 'zip' | 'tar' | '7z';
}) {
  return api.post('/drive/archive/create', params);
}

export async function extractArchive(params: {
  fileId: string;
  targetFolderId?: string;
}) {
  return api.post('/drive/archive/extract', params);
}

// Sync operations
export async function syncFolder(params: {
  folderId: string;
  localPath?: string;
  direction: 'up' | 'down' | 'both';
}) {
  return api.post('/drive/sync', params);
}

export async function getSyncStatus(params: { syncId: string }) {
  return api.get(`/drive/sync/${params.syncId}/status`);
}

// Backup and restore
export async function createBackup(params: {
  fileIds?: string[];
  folderId?: string;
  backupName: string;
}) {
  return api.post('/drive/backup/create', params);
}

export async function listBackups() {
  return api.get('/drive/backup/list');
}

export async function restoreBackup(params: {
  backupId: string;
  targetFolderId?: string;
}) {
  return api.post('/drive/backup/restore', params);
}

// Comments and collaboration
export async function addComment(params: {
  fileId: string;
  content: string;
  anchor?: any;
}) {
  return api.post('/drive/comments/add', params);
}

export async function getComments(params: { fileId: string }) {
  return api.get(`/drive/file/${params.fileId}/comments`);
}

export async function resolveComment(params: {
  fileId: string;
  commentId: string;
}) {
  return api.post('/drive/comments/resolve', params);
}

// Advanced permissions
export async function getFilePermissions(params: { fileId: string }) {
  return api.get(`/drive/file/${params.fileId}/permissions`);
}

export async function updatePermissions(params: {
  fileId: string;
  permissions: Array<{
    email: string;
    role: string;
    type: 'user' | 'group' | 'domain' | 'anyone';
  }>;
}) {
  return api.post('/drive/permissions/update', params);
}

// Trash management
export async function listTrashedFiles() {
  return api.get('/drive/trash');
}

export async function restoreFromTrash(params: {
  fileId: string;
  parentId?: string;
}) {
  return api.post('/drive/trash/restore', params);
}

export async function permanentlyDelete(params: { fileId: string }) {
  return api.delete('/drive/trash/permanent', { data: params });
}

export async function emptyTrash() {
  return api.delete('/drive/trash/empty');
}
