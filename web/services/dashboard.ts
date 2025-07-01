import { api } from './apiConfig';

export async function getDashboardBoards(params: any) {
  return api.get('/get/dashboard/boards', {
    params,
  });
}

export async function getUserHubs(params: any) {
  return api.get('/get/user/hubs', { params });
}

export async function getRecentActivities(params: any) {
  return api.get('/get/notifications', { params });
}

export async function respondToNotification(params: any) {
  return api.post('/respond/notification', params);
}
