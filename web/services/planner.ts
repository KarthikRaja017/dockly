import { api } from './apiConfig';

// Interfaces
interface Project {
  id?: string;
  uid: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
}

interface Task {
  id?: string;
  uid: string;
  project_id: string;
  description: string;
  completed?: boolean;
  date?: string;
  time?: string;
  priority?: 'high' | 'medium' | 'low';
}

interface WeeklyFocus {
  id?: string;
  uid: string;
  description: string;
}

interface WeeklyTodo {
  id?: string;
  uid: string;
  description: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  date?: string;
  time?: string;
  status?: string;
}
export async function addWeeklyGoal(params: any) {
  return api.post('/add/weekly-goals', params);
}

export async function addEvents(params: any) {
  return api.post('/add/events', params);
}

export async function getWeeklyGoals(params: {}) {
  return api.get('/get/weekly-goals', { params });
}

export async function getPlanner(params: {}) {
  return api.get('/get/planner', { params });
}

export async function addWeeklyTodo(params: WeeklyTodo) {
  return api.post('/add/weekly-todos', params);
}

export async function getWeeklyTodos(params: {}) {
  return api.get('/get/weekly-todos', { params });
}

export async function addWeeklyFocus(params: WeeklyFocus) {
  return api.post('/add/weekly-focus', params);
}

export async function getWeeklyFocus(params: {}) {
  return api.get('/get/weekly-focus', { params });
}

export async function addSmartNotes(params: any) {
  return api.post('/add/smart-notes', params);
}

export async function getSmartNotes(params: any) {
  return api.get('/get/smart-notes', {
    params: { ...params },
  });
}

export async function fetchNoteSuggestions(
  uid: string,
  source: string
): Promise<string[]> {
  const response = await api.get(`/smartnotes/suggestions/${uid}`, {
    params: { source },
  });
  return response.data;
}
