import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', { user: userData }),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

export const carsAPI = {
  getCars: (params) => api.get('/cars', { params }),
  getCar: (id) => api.get(`/cars/${id}`),
  createCar: (formData) => api.post('/cars', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateCar: (id, formData) => api.patch(`/cars/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteCar: (id) => api.delete(`/cars/${id}`),
  updateCarStatus: (id, status) => api.patch(`/cars/${id}/update_status`, { status }),
};

export const bookingsAPI = {
  getBookings: (params) => api.get('/bookings', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  createBooking: (bookingData) => api.post('/bookings', { booking: bookingData }),
  updateBooking: (id, bookingData) => api.patch(`/bookings/${id}`, { booking: bookingData }),
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
  updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/update_status`, { status }),
};

export const usersAPI = {
  getUsers: () => api.get('/users'),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.patch(`/users/${id}`, { user: userData }),
};

export default api;