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
}

export interface DriveFolder {
  id: string;
  name: string;
  modifiedTime: string;
  shared: boolean;
  parents?: string[];
}

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
