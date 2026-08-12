import { supabase } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(endpoint, options = {}) {
  const cleanApiBase = API_BASE.replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanApiBase}${cleanEndpoint}`;
  
  // Set default headers
  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Automatically attach auth token if present
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (e) {
    console.error('Error getting auth session', e);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errData.message || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  // Handle empty or 204 responses
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Shop Settings
  getSettings: () => request('/api/v1/shop/settings'),
  updateSettings: (data) => request('/api/v1/shop/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/v1/shop/upload/logo', {
      method: 'POST',
      body: formData,
    });
  },
  uploadFounderPhoto: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/v1/shop/upload/founder_photo', {
      method: 'POST',
      body: formData,
    });
  },

  // Services
  getServiceCategories: (activeOnly = true) => request(`/api/v1/services/categories?active_only=${activeOnly}`),
  createServiceCategory: (data) => request('/api/v1/services/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateServiceCategory: (id, data) => request(`/api/v1/services/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteServiceCategory: (id) => request(`/api/v1/services/categories/${id}`, {
    method: 'DELETE',
  }),
  getServices: (categoryId = null, activeOnly = true) => {
    let url = `/api/v1/services/?active_only=${activeOnly}`;
    if (categoryId) url += `&category_id=${categoryId}`;
    return request(url);
  },
  getAllServicesAdmin: () => request('/api/v1/services/all'),
  createService: (data) => request('/api/v1/services/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateService: (id, data) => request(`/api/v1/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteService: (id) => request(`/api/v1/services/${id}`, {
    method: 'DELETE',
  }),
  uploadServiceImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/v1/services/upload-image', {
      method: 'POST',
      body: formData,
    });
  },

  // Accessories
  getAccessoryCategories: (activeOnly = true) => request(`/api/v1/accessories/categories?active_only=${activeOnly}`),
  createAccessoryCategory: (data) => request('/api/v1/accessories/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAccessoryCategory: (id, data) => request(`/api/v1/accessories/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteAccessoryCategory: (id) => request(`/api/v1/accessories/categories/${id}`, {
    method: 'DELETE',
  }),
  getAccessories: (categoryId = null, activeOnly = true) => {
    let url = `/api/v1/accessories/?active_only=${activeOnly}`;
    if (categoryId) url += `&category_id=${categoryId}`;
    return request(url);
  },
  getAllAccessoriesAdmin: () => request('/api/v1/accessories/all'),
  createAccessory: (data) => request('/api/v1/accessories/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateAccessory: (id, data) => request(`/api/v1/accessories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteAccessory: (id) => request(`/api/v1/accessories/${id}`, {
    method: 'DELETE',
  }),
  uploadAccessoryImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request('/api/v1/accessories/upload-image', {
      method: 'POST',
      body: formData,
    });
  },

  // Enquiries
  createEnquiry: (data) => request('/api/v1/enquiries/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getEnquiries: (type = null, status = null) => {
    let url = '/api/v1/enquiries/';
    const params = [];
    if (type) params.push(`type=${type}`);
    if (status) params.push(`status=${status}`);
    if (params.length) url += `?${params.join('&')}`;
    return request(url);
  },
  getEnquiryStats: () => request('/api/v1/enquiries/stats'),
  updateEnquiryStatus: (id, statusVal) => request(`/api/v1/enquiries/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ enquiry_status: statusVal }),
  }),

  // Admin Dashboard / Auth check
  verifyAdmin: () => request('/api/v1/auth/verify-admin', {
    method: 'POST',
  }),
  getDashboardStats: () => request('/api/v1/dashboard/stats'),
  updateProfile: (data) => request('/api/v1/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};
