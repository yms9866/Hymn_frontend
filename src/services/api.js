import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
const excludeAuthEndpoints = [
  '/login/', 
  '/register/', 
  '/session/status/',
  '/hymns/next/',
  '/hymns/finish/'
];

api.interceptors.request.use(
  (config) => {
    // Get the path part of the URL (without query parameters)
    const url = new URL(config.url, API_URL);
    const path = url.pathname;
    
    // Check if the exact path is in the exclude list
    const shouldExclude = excludeAuthEndpoints.some(endpoint => 
      path.endsWith(endpoint)
    );
    
    console.log('Request interceptor - path:', path, 'shouldExclude:', shouldExclude);
    
    if (shouldExclude) {
      // Remove any existing Authorization header for excluded endpoints
      if (config.headers.Authorization) {
        delete config.headers.Authorization;
      }
      return config;
    }
    
    // Add token for authenticated endpoints
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/register/', data),
  login: (data) => api.post('/login/', data),
};

// Session APIs
export const sessionAPI = {
  getStatus: (queryParams = '') => {
    // Handle both object and string query parameters
    let queryString = '';
    
    if (typeof queryParams === 'object' && queryParams !== null) {
      // Convert object to query string
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      queryString = params.toString() ? `?${params.toString()}` : '';
    } else if (typeof queryParams === 'string' && queryParams) {
      // Handle string query parameters
      queryString = queryParams.startsWith('?') ? queryParams : `?${queryParams}`;
    }
    
    console.log('sessionAPI.getStatus - URL:', `/session/status${queryString}`);
    return api.get(`/session/status${queryString}`);
  },
  start: (resumePrevious = false) => api.post('/session/start/', { resume_previous: resumePrevious }),
  stop: () => api.post('/session/stop/'),
  getLastSession: () => api.get('/session/last/'),
};

// Hymn APIs
export const hymnAPI = {
  list: () => api.get('/hymns/'),
  getNext: (studentName) => api.post('/hymns/next/', { student_name: studentName }),
  finish: (assignmentId, studentName) => api.post('/hymns/finish/', { 
    assignment_id: assignmentId,
    student_name: studentName 
  }),
};

export default api;
