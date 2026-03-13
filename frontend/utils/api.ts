import axios from 'axios';
import { Platform } from 'react-native';

// ─── Base URL ────────────────────────────────────────────────────────────────
// On Android emulator, `localhost` of the host machine is reachable via 10.0.2.2.
// On a real device or Expo Go on a physical phone, replace with your machine's
// LAN IP address, e.g. http://192.168.1.100:8001
const BASE_URL = "http://192.168.1.5:8001/api"
// Platform.OS === 'android'
//   ? 'http://10.0.2.2:8001/api'
//   : 'http://localhost:8001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authAPI = {
  register: async (userData: {
    name: string;
    phone: string;
    age_group: string;
    ward: string;
    occupation: string;
    interests: string[];
  }) => {
    const res = await api.post('/auth/register', userData);
    return res.data; // full user object from Supabase
  },

  login: async (phone: string) => {
    const res = await api.post('/auth/login', { phone });
    return res.data;
  },
};

// ─── Programs API ────────────────────────────────────────────────────────────
export const programsAPI = {
  getAll: async (category?: string, ward?: string) => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (ward) params.ward = ward;
    const res = await api.get('/programs', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/programs/${id}`);
    return res.data;
  },

  create: async (programData: {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    location: string;
    ward: string;
    date?: string;
    seats_available?: number;
    image?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const res = await api.post('/programs', programData);
    return res.data;
  },
};

// ─── Suggestions API ─────────────────────────────────────────────────────────
export const suggestionsAPI = {
  getForUser: async (userId: string) => {
    const res = await api.get(`/suggestions/${userId}`);
    return res.data;
  },
};

// ─── Issues API ──────────────────────────────────────────────────────────────
export const issuesAPI = {
  create: async (issueData: {
    user_id: string;
    issue_type: string;
    description: string;
    location: string;
    ward: string;
    image?: string;
    latitude?: number;
    longitude?: number;
  }) => {
    const res = await api.post('/issues', issueData);
    return res.data;
  },

  getAll: async (ward?: string, status?: string) => {
    const params: Record<string, string> = {};
    if (ward) params.ward = ward;
    if (status) params.status = status;
    const res = await api.get('/issues', { params });
    return res.data;
  },
};

// ─── Updates API ─────────────────────────────────────────────────────────────
export const updatesAPI = {
  getAll: async (ward?: string) => {
    const params: Record<string, string> = {};
    if (ward) params.ward = ward;
    const res = await api.get('/updates', { params });
    return res.data;
  },
};

// ─── Chat API ────────────────────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: async (userId: string, message: string, sessionId: string) => {
    const res = await api.post('/chat', {
      user_id: userId,
      message,
      session_id: sessionId,
    });
    return res.data; // { response: string }
  },
};

// ─── Seed API ────────────────────────────────────────────────────────────────
export const seedAPI = {
  seedDatabase: async () => {
    const res = await api.post('/seed');
    return res.data;
  },
};
