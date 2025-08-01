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
  source_email?: string;
  account_name?: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  modifiedTime: string;
  shared: boolean;
  parents?: string[];
  description?: string;
  tags?: string[];
  source_email?: string;
  account_name?: string;
  owners?: Array<{
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
  limit: number;
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

// Account colors for visual differentiation
export const ACCOUNT_COLORS = {
  google: [
    '#4285f4', // Primary Google Blue
    '#34a853', // Google Green
    '#ea4335', // Google Red
    '#fbbc04', // Google Yellow
    '#9c27b0', // Purple
    '#ff5722', // Deep Orange
  ],
  outlook: [
    '#0078d4', // Primary Outlook Blue
    '#00bcf2', // Light Blue
    '#8764b8', // Purple
    '#00b7c3', // Teal
    '#038387', // Dark Teal
    '#486991', // Steel Blue
  ],
};

// Get account color based on provider and index
export const getAccountColor = (provider: string, index: number): string => {
  const colors =
    ACCOUNT_COLORS[provider as keyof typeof ACCOUNT_COLORS] ||
    ACCOUNT_COLORS.google;
  return colors[index % colors.length];
};

// Helper function to determine file source from ID or email
export const getFileSource = (
  file: DriveFile | DriveFolder
): 'google' | 'outlook' => {
  if (file.source_email) {
    return file.source_email.includes('outlook') ||
      file.source_email.includes('hotmail') ||
      file.source_email.includes('live') ||
      file.source_email.includes('msn')
      ? 'outlook'
      : 'google';
  }
  return 'google'; // Default fallback
};

// Combined file operations that work with both Google Drive and Outlook
export async function listDriveFiles(params: {
  folderId?: string;
  sortBy?: string;
  sortOrder?: string;
  pageSize?: number;
}) {
  try {
    // Fetch from both Google Drive and Outlook
    const [googleResponse, outlookResponse] = await Promise.allSettled([
      api.post('/drive/files', params),
      api.post('/drive/outlook/files', params),
    ]);

    const googleData =
      googleResponse.status === 'fulfilled'
        ? googleResponse.value?.data?.payload
        : null;
    const outlookData =
      outlookResponse.status === 'fulfilled'
        ? outlookResponse.value?.data?.payload
        : null;

    // Merge results
    const mergedFiles = [
      ...(googleData?.files || []),
      ...(outlookData?.files || []),
    ];

    const mergedFolders = [
      ...(googleData?.folders || []),
      ...(outlookData?.folders || []),
    ];

    const mergedAccounts = [
      ...(googleData?.connected_accounts || []),
      ...(outlookData?.connected_accounts || []),
    ];

    const mergedErrors = [
      ...(googleData?.errors || []),
      ...(outlookData?.errors || []),
    ];

    return {
      data: {
        payload: {
          files: mergedFiles,
          folders: mergedFolders,
          connected_accounts: mergedAccounts,
          errors: mergedErrors,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching files:', error);
    return {
      data: {
        payload: {
          files: [],
          folders: [],
          connected_accounts: [],
          errors: [{ error: 'Failed to fetch files' }],
        },
      },
    };
  }
}

export async function uploadDriveFile(params: {
  file: File;
  parentId?: string;
  provider?: 'google' | 'outlook';
}) {
  const formData = new FormData();
  formData.append('file', params.file);
  if (params.parentId) {
    formData.append('parentId', params.parentId);
  }

  // Determine which service to use based on provider or default to Google
  const endpoint =
    params.provider === 'outlook' ? '/drive/outlook/upload' : '/drive/upload';

  return api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function downloadDriveFile(params: {
  fileId: string;
  provider?: 'google' | 'outlook';
}) {
  // Try the specified provider first, then fallback
  if (params.provider === 'outlook') {
    try {
      return await api.post('/drive/outlook/download', params, {
        responseType: 'blob',
      });
    } catch (error) {
      // Fallback to Google Drive
      return await api.post('/drive/download', params, {
        responseType: 'blob',
      });
    }
  } else {
    try {
      return await api.post('/drive/download', params, {
        responseType: 'blob',
      });
    } catch (error) {
      // Fallback to Outlook
      return await api.post('/drive/outlook/download', params, {
        responseType: 'blob',
      });
    }
  }
}

export async function deleteDriveFile(params: {
  fileId: string;
  provider?: 'google' | 'outlook';
}) {
  // Try the specified provider first, then fallback
  if (params.provider === 'outlook') {
    try {
      return await api.delete('/drive/outlook/delete', { data: params });
    } catch (error) {
      return await api.delete('/drive/delete', { data: params });
    }
  } else {
    try {
      return await api.delete('/drive/delete', { data: params });
    } catch (error) {
      return await api.delete('/drive/outlook/delete', { data: params });
    }
  }
}

export async function createDriveFolder(params: {
  name: string;
  parentId?: string;
  provider?: 'google' | 'outlook';
}) {
  // Use specified provider or default to Google
  const endpoint =
    params.provider === 'outlook'
      ? '/drive/outlook/folder/create'
      : '/drive/folder/create';
  return api.post(endpoint, params);
}

export async function shareDriveFile(params: {
  fileId: string;
  email: string;
  role?: string;
  provider?: 'google' | 'outlook';
}) {
  // Try the specified provider first, then fallback
  if (params.provider === 'outlook') {
    try {
      return await api.post('/drive/outlook/share', params);
    } catch (error) {
      return await api.post('/drive/share', params);
    }
  } else {
    try {
      return await api.post('/drive/share', params);
    } catch (error) {
      return await api.post('/drive/outlook/share', params);
    }
  }
}

export async function getDriveFileInfo(params: {
  fileId: string;
  provider?: 'google' | 'outlook';
}) {
  // Try the specified provider first, then fallback
  if (params.provider === 'outlook') {
    try {
      return await api.get(`/drive/outlook/file/${params.fileId}`);
    } catch (error) {
      return await api.get(`/drive/file/${params.fileId}`);
    }
  } else {
    try {
      return await api.get(`/drive/file/${params.fileId}`);
    } catch (error) {
      return await api.get(`/drive/outlook/file/${params.fileId}`);
    }
  }
}

export async function getDriveStorage() {
  try {
    const [googleResponse, outlookResponse] = await Promise.allSettled([
      api.get('/drive/storage'),
      api.get('/drive/outlook/storage'),
    ]);

    const googleData =
      googleResponse.status === 'fulfilled'
        ? googleResponse.value?.data?.payload
        : null;
    const outlookData =
      outlookResponse.status === 'fulfilled'
        ? outlookResponse.value?.data?.payload
        : null;

    return {
      data: {
        payload: {
          google: googleData,
          outlook: outlookData,
          combined: {
            used:
              (googleData?.total_storage?.used || 0) +
              (outlookData?.total_storage?.used || 0),
            limit:
              (googleData?.total_storage?.limit || 0) +
              (outlookData?.total_storage?.limit || 0),
          },
        },
      },
    };
  } catch (error) {
    return api.get('/drive/storage');
  }
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
  provider?: 'google' | 'outlook';
}) {
  if (params.provider === 'outlook') {
    try {
      return await api.post('/drive/outlook/rename', params);
    } catch (error) {
      return await api.post('/drive/rename', params);
    }
  } else {
    try {
      return await api.post('/drive/rename', params);
    } catch (error) {
      return await api.post('/drive/outlook/rename', params);
    }
  }
}

export async function copyDriveFile(params: {
  fileId: string;
  parentId?: string;
  name?: string;
  provider?: 'google' | 'outlook';
}) {
  if (params.provider === 'outlook') {
    try {
      return await api.post('/drive/outlook/copy', params);
    } catch (error) {
      return await api.post('/drive/copy', params);
    }
  } else {
    try {
      return await api.post('/drive/copy', params);
    } catch (error) {
      return await api.post('/drive/outlook/copy', params);
    }
  }
}

export async function moveDriveFile(params: {
  fileId: string;
  targetFolderId: string;
  provider?: 'google' | 'outlook';
}) {
  if (params.provider === 'outlook') {
    try {
      return await api.post('/drive/outlook/move', params);
    } catch (error) {
      return await api.post('/drive/move', params);
    }
  } else {
    try {
      return await api.post('/drive/move', params);
    } catch (error) {
      return await api.post('/drive/outlook/move', params);
    }
  }
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
