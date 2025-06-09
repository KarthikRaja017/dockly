import { api } from './apiConfig';

export default async function addUsername(params: any) {
  return api.post('/user/add/username', params);
}

export async function userAddEmail(params: any) {
  return api.post('/user/sign-up/email', params);
}

export async function userAddProfile(params: any) {
  return api.post('/user/add/profile', params);
}

export async function getUserProfile(params: any) {
  return api.get('/user/get/profile', { params });
}

export async function getUserGetStarted(params: any) {
  return api.get('/user/get/started', { params });
}
