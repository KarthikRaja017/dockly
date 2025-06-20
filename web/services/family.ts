// family.ts
import { api } from './apiConfig';

// Add Axios interceptor for token handling (already present, but ensuring it's correct)
if (typeof window !== 'undefined') {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('Dtoken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

interface ScheduleData {
  school_church: {
    name: string;
    type: string;
    date: string;
    time: string;
    place: string;
    addedBy: string;
    editedBy: string;
  };
}

interface ContactData {
  contacts: {
    name: string;
    role: string;
    phone: string;
    addedBy: string;
    addedTime?: string;
    editedBy?: string;
    editedTime?: string;
  };
}

export async function addFamilyMember(params: any) {
  return api
    .post('/add/family-member', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data);
}

// Axios interceptor for token handling
if (typeof window !== 'undefined') {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('Dtoken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      } else {
        console.warn(
          'No token found in localStorage. Requests may fail if authentication is required.'
        );
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

// Interface for schedule data payload
// (Removed duplicate ScheduleData interface)

// Interface for contact data payload
// (Removed duplicate ContactData interface)

// Add a new contact
export async function addContacts(params: ContactData): Promise<any> {
  try {
    const response = await api.post('/add/contacts', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
}

// Fetch contacts for a user
export async function getUserContacts(params: {
  userId?: string;
}): Promise<any> {
  try {
    const response = await api.get('/get/contacts', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
}

// Add a new schedule
export async function addSchedules(params: ScheduleData): Promise<any> {
  try {
    const response = await api.post('/add/school_church', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding schedule:', error);
    throw error;
  }
}

// Fetch schedules for a user

export async function updateContact(params: ContactData & { id: number }) {
  return api
    .put('/update/contacts', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data);
}

export async function updateSchedule(params: ScheduleData & { id: number }) {
  return api
    .put('/update/school_church', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data);
}

export async function addMealPlan(params: any) {
  return api
    .post('/add/meal-planning', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data);
}

export async function addFamilyTasks(data: any) {
  return api
    .post('/add/sharedtasks', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data);
}

export async function addCustomSection(data: any) {
  return api
    .post('/add/customsection', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data);
}

// export const getUsersFamilyMembers = async (params = {}) => {
//   const token = localStorage.getItem('Dtoken');
//   return api.get('/get/family-members', {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     params,
//   });
// };

export async function addFamilyGuidelines(params: any) {
  return api
    .post('/add/family-guidelines', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.data);
}

// export async function addFamilyGuidelines(guideline: any): Promise<any> {
//   return api.post("/add/family-guidelines", guideline, {
//     headers: {
//       "Content-Type": "application/json",
//     },
//   }).then(response => response.data);
// }

export async function getUserSharedTasks() {
  const response = await api.get('/get/family-tasks');
  return response.data;
}

export async function getUserSchedules(p0: { userId: string }) {
  const response = await api.get('/get/family-schedules');
  return response.data;
}

export async function getUserMealPlan() {
  const response = await api.get('/get/family-mealplan');
  return response.data;
}

export async function getFamilyGuidelines() {
  const response = await api.get('/get/familyguidelines');
  return response.data;
}
export async function getUsersFamilyMembers() {
  const response = await api.get('/get/family-members');
  return response.data;
}
