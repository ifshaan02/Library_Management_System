
import axios from 'axios'

// Point this at your ASP.NET Core API base URL (see launchSettings.json / your dotnet run output)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5148/api'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('lms_token')
      localStorage.removeItem('lms_user')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
