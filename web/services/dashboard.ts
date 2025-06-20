import { api } from './apiConfig';

export async function getDashboardBoards(params: any) {
  return api.get('/get/dashboard/boards', {
    params,
  });
}
