import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || '';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (phone: string) => {
    const response = await api.post('/auth/login', null, { params: { phone } });
    return response.data;
  },
};

export const programsAPI = {
  getAll: async (category?: string, ward?: string) => {
    const response = await api.get('/programs', { params: { category, ward } });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/programs/${id}`);
    return response.data;
  },
};

export const suggestionsAPI = {
  getForUser: async (userId: string) => {
    const response = await api.get(`/suggestions/${userId}`);
    return response.data;
  },
};

export const issuesAPI = {
  create: async (issueData: any) => {
    const response = await api.post('/issues', issueData);
    return response.data;
  },
  getAll: async (ward?: string, status?: string) => {
    const response = await api.get('/issues', { params: { ward, status } });
    return response.data;
  },
};

export const updatesAPI = {
  getAll: async (ward?: string) => {
    const response = await api.get('/updates', { params: { ward } });
    return response.data;
  },
};

export const chatAPI = {
  sendMessage: async (userId: string, message: string, sessionId: string) => {
    const response = await api.post('/chat', { user_id: userId, message, session_id: sessionId });
    return response.data;
  },
};

export const seedAPI = {
  seedDatabase: async () => {
    const response = await api.post('/seed');
    return response.data;
  },
};
