import api from './client'

// ---------- Auth ----------
export const login = (username, password) => api.post('/auth/login', { username, password })
export const bootstrapAdmin = (payload) => api.post('/auth/bootstrap-admin', payload)
export const register = (payload) => api.post('/auth/register', payload)

// ---------- Books ----------
export const getBooks = (params) => api.get('/books', { params })
export const getBook = (id) => api.get(`/books/${id}`)
export const createBook = (payload) => api.post('/books', payload)
export const updateBook = (id, payload) => api.put(`/books/${id}`, payload)
export const deleteBook = (id) => api.delete(`/books/${id}`)

// ---------- Categories ----------
export const getCategories = () => api.get('/categories')
export const createCategory = (payload) => api.post('/categories', payload)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

// ---------- Borrowers ----------
export const getBorrowers = (params) => api.get('/borrowers', { params })
export const getBorrower = (id) => api.get(`/borrowers/${id}`)
export const createBorrower = (payload) => api.post('/borrowers', payload)
export const updateBorrower = (id, payload) => api.put(`/borrowers/${id}`, payload)
export const deleteBorrower = (id) => api.delete(`/borrowers/${id}`)

// ---------- Loans / Circulation ----------
export const getLoans = (params) => api.get('/loans', { params })
export const getOverdueLoans = () => api.get('/loans/overdue')
export const getLoansForBorrower = (borrowerId) => api.get(`/loans/borrower/${borrowerId}`)
export const checkoutBook = (payload) => api.post('/loans/checkout', payload)
export const returnBook = (loanId) => api.post('/loans/return', { loanId })
