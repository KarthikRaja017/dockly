// import { api } from './apiConfig';

// export async function addMaintenanceTask(params: any) {
//   return api.post('/add/maintenance', params).then(res => res.data);
// }

// export async function getMaintenanceTasks(params: any) {
//   return api.get('/get/maintenance', { params }).then(res => res.data);
// }

// export async function updateMaintenanceTask(taskId: string, params: any) {
//   return api.put(`/update/maintenance/${taskId}`, params).then(res => res.data);
// }

// export async function deleteMaintenanceTask(taskId: string) {
//   return api.delete(`/delete/maintenance/${taskId}`).then(res => res.data);
// }

// export async function deleteAllMaintenanceTasks(params: any) {
//   return api.delete('/delete-all/maintenance', { params }).then(res => res.data);
// }

// export async function addUtility(params: any) {
//   return api.post('/add/utility', params).then(res => res.data);
// }

// export async function getUtilities(params: any) {
//   return api.get('/get/utility', { params }).then(res => res.data);
// }

// export async function updateUtility(utilityId: string, params: any) {
//   return api.put(`/utility/update/${utilityId}`, params).then(res => res.data);
// }

// export async function deleteUtility(utilityId: string) {
//   return api.delete(`/utility/delete/${utilityId}`).then(res => res.data);
// }

// export async function addInsurance(params: any) {
//   return api.post('/add/insurance', params).then(res => res.data);
// }

// export async function getInsurance(params: any) {
//   return api.get('/get/insurance', { params }).then(res => res.data);
// }

// export async function updateInsurance(insuranceId: string, params: any) {
//   return api.put(`/update/insurance/${insuranceId}`, params).then(res => res.data);
// }

// export async function deleteInsurance(insuranceId: string) {
//   return api.delete(`/delete/insurance/${insuranceId}`).then(res => res.data);
// }
// export async function addProperty(params: any) {
//   return api.post('/add/property', params).then(res => res.data);
// }

// export async function getProperties(params: any) {
//   return api.get('/get/property', { params }).then(res => res.data);
// }

// export async function updateProperty(propertyId: string, params: any) {
//   return api.put(`/property/update/${propertyId}`, params).then(res => res.data);
// }

// export async function deleteProperty(propertyId: string) {
//   return api.delete(`/property/delete/${propertyId}`).then(res => res.data);
// }

import { api } from './apiConfig';

// Interface for Property data
interface Property {
  id: string;
  address: string;
  purchaseDate: string;
  purchasePrice: number;
  squareFootage: string;
  lotSize: string;
  propertyTaxId: string;
  is_active: number;
}

// Interface for API response
interface ApiResponse<T> {
  status: number;
  message: string;
  payload: T;
}

export async function addMaintenanceTask(
  params: any
): Promise<ApiResponse<{ task: any }>> {
  return api.post('/add/maintenance', params).then((res) => res.data);
}

export async function getMaintenanceTasks(
  params: any
): Promise<ApiResponse<{ tasks: any[] }>> {
  return api.get('/get/maintenance', { params }).then((res) => res.data);
}

export async function updateMaintenanceTask(
  taskId: string,
  params: any
): Promise<ApiResponse<{ task: any }>> {
  return api
    .put(`/update/maintenance/${taskId}`, params)
    .then((res) => res.data);
}

export async function deleteMaintenanceTask(
  taskId: string
): Promise<ApiResponse<{}>> {
  return api.delete(`/delete/maintenance/${taskId}`).then((res) => res.data);
}

export async function deleteAllMaintenanceTasks(
  params: any
): Promise<ApiResponse<{}>> {
  return api
    .delete('/delete-all/maintenance', { params })
    .then((res) => res.data);
}

export async function addUtility(
  params: any
): Promise<ApiResponse<{ utility: any }>> {
  return api.post('/add/utility', params).then((res) => res.data);
}

export async function getUtilities(
  params: any
): Promise<ApiResponse<{ utilities: any[] }>> {
  return api.get('/get/utility', { params }).then((res) => res.data);
}

export async function updateUtility(
  utilityId: string,
  params: any
): Promise<ApiResponse<{ utility: any }>> {
  return api
    .put(`/utility/update/${utilityId}`, params)
    .then((res) => res.data);
}

export async function deleteUtility(
  utilityId: string
): Promise<ApiResponse<{ utility: any }>> {
  return api.delete(`/utility/delete/${utilityId}`).then((res) => res.data);
}

export async function addInsurance(
  params: any
): Promise<ApiResponse<{ insurance: any }>> {
  return api.post('/add/insurance', params).then((res) => res.data);
}

export async function getInsurance(
  params: any
): Promise<ApiResponse<{ insurances: any[] }>> {
  return api.get('/get/insurance', { params }).then((res) => res.data);
}

export async function updateInsurance(
  insuranceId: string,
  params: any
): Promise<ApiResponse<{ insurance: any }>> {
  return api
    .put(`/update/insurance/${insuranceId}`, params)
    .then((res) => res.data);
}

export async function deleteInsurance(
  insuranceId: string
): Promise<ApiResponse<{ insurance: any }>> {
  return api.delete(`/delete/insurance/${insuranceId}`).then((res) => res.data);
}

export async function addProperty(
  params: any
): Promise<ApiResponse<{ property: Property }>> {
  return api.post('/add/property', params).then((res) => res.data);
}

export async function getProperties(
  params: any
): Promise<ApiResponse<{ properties: Property[] }>> {
  return api.get('/get/property', { params }).then((res) => res.data);
}

export async function updateProperty(
  propertyId: string,
  params: any
): Promise<ApiResponse<{ property: Property }>> {
  return api
    .put(`/property/update/${propertyId}`, params)
    .then((res) => res.data);
}

export async function deleteProperty(
  propertyId: string
): Promise<ApiResponse<{ property: Property }>> {
  try {
    const response = await api
      .delete(`/propertyenka/property/delete/${propertyId}`)
      .then((res) => res.data);
    return response;
  } catch (error) {
    console.error(`Error deleting property ${propertyId}:`, error);
    throw error;
  }
}

// Interface for Mortgage data
interface Mortgage {
  id: string;
  name: string;
  meta: string;
  amount: number;
  interestRate: number;
  term: number;
  created_at?: string;
  updated_at?: string;
  is_active: number;
}

// Interface for API response
interface ApiResponse<T> {
  status: number;
  message: string;
  payload: T;
}

export async function addMortgage(
  params: any
): Promise<ApiResponse<{ loans: Mortgage[] }>> {
  return api.post('/add/mortgage', params).then((res) => res.data);
}

export async function getLoansAndMortgages(
  params: any
): Promise<ApiResponse<{ loans: Mortgage[] }>> {
  return api.get('/get/mortgage', { params }).then((res) => res.data);
}

export async function updateMortgage(
  mortgageId: string,
  params: any
): Promise<ApiResponse<{ loans: Mortgage[] }>> {
  return api
    .put(`/update/mortgage/${mortgageId}`, params)
    .then((res) => res.data);
}

export async function deleteMortgage(
  mortgageId: string
): Promise<ApiResponse<{ loans: Mortgage[] }>> {
  return api.delete(`/delete/mortgage/${mortgageId}`).then((res) => res.data);
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
