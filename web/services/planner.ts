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
  text: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  date?: string;
  time?: string;
  status?: string;
  goal_id?: string;
  [key: string]: any;
}

interface WeeklyGoal {
  id?: string;
  uid: string;
  goal: string;
  date?: string;
  time?: string;
  priority?: 'high' | 'medium' | 'low';
}

// New comprehensive planner data endpoint
export async function getAllPlannerData(
  params: {
    show_dockly?: boolean;
    show_google?: boolean;
    filtered_emails?: string[];
  } = {}
) {
  return api.get('/get/planner-data-comprehensive', { params });
}

export async function addWeeklyGoal(params: WeeklyGoal) {
  return api.post('/add/weekly-goals', params);
}

export async function updateWeeklyGoal(params: WeeklyGoal) {
  return api.put('/update/weekly-goals', params);
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

export async function updateWeeklyTodo(params: WeeklyTodo) {
  return api.put('/update/weekly-todos', params);
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

export async function addPlannerNotes(params: {
  title: string;
  description: string;
  date: string;
}) {
  return api.post('/add/planner-notes', params);
}

export async function getPlannerNotes() {
  return api.get('/get/planner-notes');
}

// Update a planner note
export async function updatePlannerNote(params: {
  id: string;
  title?: string;
  description?: string;
  date?: string;
  status?: string;
}) {
  return api.put('/update/planner-notes', params);
}

// Delete a planner note
export async function deletePlannerNote(id: string) {
  return api.delete(`/delete/planner-notes?id=${id}`);
}

export async function addProject(params: any) {
  return api.post('/add/project', params);
}

export async function getProjects(params: { source?: string } = {}) {
  return api.get('/get/projects', {
    params,
  });
}

export async function addTask(params: any) {
  return api.post('/add/task', params);
}

export async function getTasks(params: any) {
  return api.get('/get/tasks', { params });
}

export async function updateTask(params: any) {
  return api.post('/update/task', params);
}

export async function deleteWeeklyGoal(params: any) {
  return api.post('/delete/weekly-goals', params);
}

export async function shareGoal(params: {
  email: string[];
  goal: {
    id?: string;
    title: string;
    date: string;
    time?: string;
    completed?: boolean;
  };
  tagged_members?: string[];
}) {
  return api.post('/share/goals', params);
}

export async function shareTodo(params: {
  email: string[];
  tagged_members?: string[];
  todo: {
    title: string;
    created_at?: string;
    time?: string;
    priority?: 'high' | 'medium' | 'low';
    completed?: boolean;
  };
}) {
  return api.post('/share/todo', params);
}

export async function deleteWeeklyTodo(params: any) {
  return api.post('/delete/weekly-todos', params);
}

export async function addHabit(params: any) {
  return api.post('/add/habit', params);
}

export async function getHabits(params: any) {
  return api.get('/get/habits', { params });
}

export async function updateHabit(params: any) {
  return api.post('/update/habit', params);
}
