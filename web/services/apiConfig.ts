import axios from 'axios';

// export const API_URL = 'http://localhost:5000/server/api';
export const API_URL = 'https://dockly.onrender.com/server/api'; //DEPLOYMENT
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
