import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
})

export const uploadCSV        = (formData)             => API.post('/api/upload', formData)
export const startPredictions = ()                     => API.post('/api/predict')
export const getMachines      = (page = 1, limit = 30) => API.get(`/api/machines?page=${page}&limit=${limit}`)
export const getAllMachines    = ()                     => API.get('/api/machines?page=1&limit=10000')
export const getSensors       = ()                     => API.get('/api/sensors')
export const getPredictions   = ()                     => API.get('/api/predictions')
export const getAlerts        = ()                     => API.get('/api/alerts')
export const runPredictions = startPredictions