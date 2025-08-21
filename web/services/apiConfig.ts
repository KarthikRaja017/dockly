import axios from 'axios';

// export const API_URL = 'http://localhost:5000/server/api';
export const API_URL = 'https://dockly.onrender.com/server/api'; //DEPLOYMENT
// export const API_URL = 'https://dockly-deployment.onrender.com/server/api'; //DEPLOYMENT

// export const API_URL = 'http://127.0.0.1:5000/server/api'; //DEPLOYMENT
// export const API_URL =
//   process.env.REACT_APP_API_URL || 'https://dockly.onrender.com//server/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (typeof window !== 'undefined') {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('Dtoken'); // ✅ Now runs only on client
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

export async function emailVerification(params: any) {
  return api.post('/user/email/otpVerification', params);
}

export async function mobileVerification(params: any) {
  return api.post('/user/mobile/otpVerification', params);
}

export async function signInVerification(params: any) {
  return api.post('/user/signIn/otpVerification', params);
}

export async function userDetails(params: any) {
  return api.post('/user/add-details', params);
}

export async function userLogin(params: any) {
  return api.post('/user/sign-in', params);
}
export async function getBankDetails(params: any) {
  return api.post('/get-bank-details', params);
}

export async function bankSignup(params: any) {
  return api.post('/signup/bank', params);
}

export async function bankConnect(params: any) {
  return api.post('/connect/bank', params);
}
export async function getBankAccount(params: any) {
  return api.post('/get/bank-account', params);
}

export async function getSmartBookmarks(uid: string) {
  return api.get('/bookmarks/get', {
    params: { uid },
  });
}

export async function getLoansAndMortgages(params: any) {
  return api.post('/get/loans_and_mortgages', params).then((res) => res.data);
}

export async function getCurrentUser(params: string) {
  return api.get('/user/get/currentUser', {
    params: { params },
  });
}

export async function saveBankTransactions(params: any) {
  return api.post('/save/bank-transactions', params).then((res) => res.data);
}

export async function getSavedTransactions(params: any) {
  return api.post('/get/saved-transactions', params).then((res) => res.data);
}

export async function getRecurringTransactions(params: any) {
  return api
    .post('/get/recurring-transactions', params)
    .then((res) => res.data);
}

export async function addAccounts(params: any) {
  return api.post('/add/accounts', params);
}

export async function getAccounts(params: any) {
  return api.post('/get/accounts', params);
}

export async function getExpenseIncome(params: any) {
  return api.post('/get/income-expense', params).then((res) => res.data);
}
// /get/total-balance
export async function getTotalBalance(params: any) {
  return api.post('/get/total-balance', params).then((res) => res.data);
}

export async function addFinanceGoal(params: any) {
  return api.post('/add/finance_goal', params);
}
export async function getFinanceGoal(params: any) {
  return api.get('/get/finance_goal', {
    params: { ...params },
  });
}

export async function updateFinanceGoal(params: any) {
  return api.post('/update/finance_goal', params);
}


export async function generateMonthlyBudget(payload: { uid: string }) {
    console.log('Sending POST request to /get/monthly-budget with payload:', payload);
    try {
        const response = await api.post('/get/monthly-budget', payload);
        console.log('Response from /get/monthly-budget:', response.data);
        return response;
    } catch (error: any) {
        console.error('Error in generateMonthlyBudget:', error.message);
        throw error;
    }
}
export async function updateMonthlyBudget(payload: { uid: string; budget_categories: any }) {
  console.log('Sending POST request to /update/monthly-budget with payload:', payload);
  try {
    const response = await api.post('/update/monthly-budget', payload);
    console.log('Response from /update/monthly-budget:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in updateMonthlyBudget:', error.message);
    throw error;
  }
}

export async function saveBudgetCategory(payload: { uid: string; transaction_id: string; category: string }) {
  console.log('Sending POST request to /save/budget-category with payload:', payload);
  try {
    const response = await api.post('/save/budget-category', payload);
    console.log('Response from /save/budget-category:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in saveBudgetCategory:', error.message);
    throw error;
  }
}

export async function getBankTransactions(payload: { uid: string }) {
  console.log('Sending GET request to /get/bank-transactions with payload:', payload);
  try {
    const response = await api.get('/get/bank-transactions', { params: payload });
    console.log('Response from /get/bank-transactions:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getBankTransactions:', error.message);
    throw error;
  }
}
export async function updateTransactionCategory(payload: { uid: string; transaction_id: string; category: string }) {
  console.log('Sending POST request to /update/transaction-category with payload:', payload);
  try {
    const response = await api.post('/update/transaction-category', payload);
    console.log('Response from /update/transaction-category:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in updateTransactionCategory:', error.message);
    throw error;
  }
}

export async function getTransactionsByCategory(payload: { uid: string; category?: string }) {
  console.log('Sending GET request to /get/transactions-by-category with payload:', payload);
  try {
    const response = await api.get('/get/transactions-by-category', { params: payload });
    console.log('Response from /get/transactions-by-category:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in getTransactionsByCategory:', error.message);
    throw error;
  }
}

export async function updateBudgetAllocation(payload: { uid: string; category: string; budget_amount: number }) {
  console.log('Sending POST request to /update/budget-allocation with payload:', payload);
  try {
    const response = await api.post('/update/budget-allocation', payload);
    console.log('Response from /update/budget-allocation:', response.data);
    return response;
  } catch (error: any) {
    console.error('Error in updateBudgetAllocation:', error.message);
    throw error;
  }
}

