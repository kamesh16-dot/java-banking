import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Response interceptor: unwrap data, handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

// ─── Accounts ─────────────────────────────────────────────────────────────────
export const accountApi = {
  getByUser: (userId) => api.get('/accounts', { params: { userId } }),
  lookup: (accountNumber) => api.get('/accounts/lookup', { params: { accountNumber } }),
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactionApi = {
  getAll: (accountId) => api.get('/transactions', { params: { accountId } }),
  getPaged: (params) => api.get('/transactions/paged', { params }),
  deposit: (data) => api.post('/transactions/deposit', data),
  withdraw: (data) => api.post('/transactions/withdraw', data),
  transfer: (data) => api.post('/transactions/transfer', data),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getCustomers: (search) => api.get('/admin/customers', { params: { search } }),
  toggleAccountStatus: (id) => api.patch(`/admin/accounts/${id}/status`),
}

export default api
