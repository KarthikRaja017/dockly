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

function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v));
  } else if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      acc[snakeKey] = toSnakeCase(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
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
// export async function addContacts(params: ContactData): Promise<any> {
//   try {
//     const response = await api.post('/add/contacts', params, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Error adding contact:', error);
//     throw error;
//   }
// }

// Fetch contacts for a user

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
export async function getUsersFamilyMembers(params: any) {
  const response = await api.get('/get/family-members', { params });
  return response.data;
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

interface GuardianData {
  name: string;
  relationship: string;
  phone: string;
  details?: string;
  addedBy: string;
}

interface PetData {
  name: string;
  species: string;
  breed: string;
  guardianEmail?: string;
  guardianContact?: string;
  userId: string;
}

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

export async function getUserContacts(
  params: { userId?: string } = {}
): Promise<any> {
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

export async function addGuardians(params: GuardianData): Promise<any> {
  try {
    const response = await api.post('/add/guardian-emergency-info', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding guardian:', error);
    throw error;
  }
}

export async function getGuardians(
  params: { userId?: string } = {}
): Promise<any> {
  try {
    const response = await api.get('/get/guardian-emergency-info', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching guardians:', error);
    throw error;
  }
}

export async function addPets(params: PetData): Promise<any> {
  try {
    const response = await api.post('/add/pet', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding pet:', error);
    throw error;
  }
}

export const getPets = async () => {
  try {
    const response = await api.get('/get/pets');
    return response;
  } catch (error) {
    throw error;
  }
};

export async function addNote(params: {
  title: string;
  description: string;
  category_id: number;
  user_id: string;
}) {
  return api.post('/family/add/notes', params);
}

export async function getAllNotes() {
  return api.get('/family/get/notes');
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

export async function addPersonalInfo(params: any): Promise<any> {
  try {
    const response = await api.post('/add/personal-info', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding personal info:', error);
    throw error;
  }
}

export async function getPersonalInfo(params: {
  userId: string;
}): Promise<any> {
  try {
    const response = await api.get('/get/personal-info', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching personal info:', error);
    throw error;
  }
}

// School Info
// Add school info
export async function addSchoolInfo(params: any): Promise<any> {
  try {
    const response = await api.post('/add/school-info', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding school info:', error);
    throw error;
  }
}

// Add activities
export async function addActivities(params: any): Promise<any> {
  try {
    const response = await api.post('/add/activities', params, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error adding activities:', error);
    throw error;
  }
}

// family.ts
// ... (existing imports and functions remain the same)

export async function getSchoolInfo(params: { userId: string }): Promise<any> {
  try {
    const response = await api.get('/get/school-info', {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching school info:', error);
    throw error;
  }
}

export async function addPet(params: PetData): Promise<any> {
  try {
    const response = await api.post('/add/pet', toSnakeCase(params));
    return response.data;
  } catch (error) {
    console.error('Error adding pet:', error);
    throw error;
  }
}

export async function getUserPets(
  params: { user_id?: string } = {}
): Promise<any> {
  try {
    const response = await api.get('/get/pets', {
      params: toSnakeCase(params),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pets:', error);
    throw error;
  }
}

export async function getUpcomingActivities(userId: string): Promise<any> {
  try {
    const response = await api.get('/get/upcoming-events', {
      params: { user_id: userId },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming activities:', error);
    throw error;
  }
}
