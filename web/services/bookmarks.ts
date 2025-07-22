import axios from 'axios';
import { api } from './apiConfig';

export async function addBookmark(params: any) {
  return api.post('/bookmarks/add/bookmark', params);
}

export async function deleteBookmark(params: any) {
  return api.post('/bookmarks/delete/bookmark', params);
}

export async function toggleFavorite(params: any) {
  return api.post('/bookmarks/toggle/bookmark', params);
}

export async function getBookmarks(params: any = {}) {
  return api.get('/bookmarks/get/bookmarks', {
    params,
  });
}

export async function getCategories(params: { source?: string } = {}) {
  return api.get('/bookmarks/categories', {
    params,
  });
}

export async function getStats(params: { source?: string } = {}) {
  return api.get('/bookmarks/stats', {
    params,
  });
}
