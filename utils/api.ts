import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// ─── Base URL ────────────────────────────────────────────────────────────────
const getBaseUrl = () => {
  if (__DEV__) {
    // For Expo Go: use the machine's IP address dynamically
    const host = Constants.expoConfig?.hostUri?.split(':').shift();
    if (host) {
      return `http://${host}:8001/api`;
    }
    // Fallback for Android emulator if host detection fails
    if (Platform.OS === 'android') {
      return "http://10.0.2.2:8001/api";
    }
    // Default for web/iOS
    return "http://localhost:8001/api";
  }
  // Production URL
  return "https://pg-foundation-backend.onrender.com/api";
};

const BASE_URL = "https://pg-foundation-backend-production.up.railway.app/api"
console.log(`[API] Base URL set to: ${BASE_URL}`);

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
    gender?: string;
    address?: string;
    isVoter?: boolean | null;
    consent?: boolean;
  }) => {
    const payload = {
      ...userData,
      is_voter: userData.isVoter ?? false,
      consent_given_at: userData.consent ? new Date().toISOString() : null,
    };
    // Remove the camelCase version before sending
    delete (payload as any).isVoter;
    delete (payload as any).consent;

    const res = await api.post('/auth/register', payload);
    return res.data; // full user object from Supabase
  },

  login: async (phone: string) => {
    const res = await api.post('/auth/login', { phone });
    return res.data;
  },
};

// ─── Users API ───────────────────────────────────────────────────────────────
export const userAPI = {
  getById: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  getActivity: async (id: string) => {
    const res = await api.get(`/users/${id}/activity`);
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

  create: async (programData: any) => {
    const res = await api.post('/programs', programData);
    return res.data;
  },
};

// ─── Health Camps API ────────────────────────────────────────────────────────
export const healthCampsAPI = {
  getAll: async (category?: string, ward?: string) => {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    if (ward) params.ward = ward;
    const res = await api.get('/health-camps', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/health-camps/${id}`);
    return res.data;
  },
};

// ─── Health Camp Registrations API ───────────────────────────────────────────
export const healthCampRegistrationsAPI = {
  register: async (registrationData: { camp_id: string; user_id: string }) => {
    const res = await api.post('/health-camp-registrations', registrationData);
    return res.data;
  },

  checkStatus: async (camp_id: string, user_id: string) => {
    const res = await api.get('/health-camp-registrations/check', {
      params: { camp_id, user_id },
    });
    return res.data; // { registered: boolean, registration: any }
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

// ─── Registrations API ────────────────────────────────────────────────────────
export const registrationsAPI = {
  register: async (registrationData: { program_id: string; user_id: string }) => {
    const res = await api.post('/registrations', registrationData);
    return res.data;
  },

  checkStatus: async (program_id: string, user_id: string) => {
    const res = await api.get('/registrations/check', {
      params: { program_id, user_id },
    });
    return res.data; // { registered: boolean, registration: any }
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

// ─── Hospital (Doctor Appointment System) API ────────────────────────────────
const getHospitalBaseUrl = () => {
  if (__DEV__) {
    const host = Constants.expoConfig?.hostUri?.split(':').shift();
    if (host) {
      return `http://${host}:3000`;
    }
    return "http://localhost:3000";
  }
  return 'https://appointment-management-system-pink.vercel.app';
};

export const HOSPITAL_BASE_URL = getHospitalBaseUrl();

const OPD_API_KEY = 'pgf-opd-key-2026';

const hospitalAxios = axios.create({
  baseURL: HOSPITAL_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const hospitalAPI = {
  /**
   * Fetch all available doctors from the hospital DB.
   * Maps to GET /api/doctors on the doctor-appointment-management app.
   */
  getDoctors: async (): Promise<any[]> => {
    const res = await hospitalAxios.get('/api/doctors');
    return res.data;
  },

  /**
   * Upload a document (image or PDF) for an appointment.
   */
  uploadDocument: async (file: { uri: string; name: string; type: string }, patientId: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
    formData.append('patientId', patientId);
    formData.append('bucket', 'uploads');

    const res = await hospitalAxios.post('/api/opd-online/upload', formData, {
      headers: {
        'x-api-key': OPD_API_KEY,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Book an OPD appointment online.
   * Maps to POST /api/opd-online on the doctor-appointment-management app.
   *
   * @param data - booking details
   */
  bookOpdOnline: async (data: {
    patientName: string;
    citizenId?: string;
    phone?: string;
    doctorId?: string;
    doctorName?: string;
    specialty?: string;
    date: string;   // YYYY-MM-DD
    time: string;   // e.g. "10:00 AM"
    notes?: string;
    age?: string;
    gender?: string;
    address?: string;
    medicalReports?: string[];
    prescriptions?: string[];
    imaging?: string[];
    appointmentType?: string;
  }): Promise<{ success: boolean; message: string; appointment: any }> => {
    const res = await hospitalAxios.post('/api/opd-online', data, {
      headers: { 'x-api-key': OPD_API_KEY },
    });
    return res.data;
  },

  /**
   * Fetch all OPD appointments booked by a citizen.
   * Maps to GET /api/opd-online?citizenId=... on the doctor-appointment-management app.
   *
   * @param citizenId - the user's citizen_id from PGF auth store
   */
  getMyAppointments: async (citizenId: string): Promise<any[]> => {
    const res = await hospitalAxios.get('/api/opd-online', {
      params: { citizenId },
    });
    return res.data.appointments || [];
  },

  /**
   * Fetch all appointments and associated prescriptions by citizen_id (UCCN)
   */
  getAppointmentsByCitizenId: async (citizenId: string): Promise<any[]> => {
    const res = await hospitalAxios.get(`/api/appointments/uccn/${citizenId}`);
    return res.data;
  },

  /**
   * Fetch all imaging records by citizen_id (UCCN)
   */
  getImagingByCitizenId: async (citizenId: string): Promise<any[]> => {
    const res = await hospitalAxios.get(`/api/imaging/uccn/${citizenId}`);
    return res.data;
  },

  /**
   * Fetch all medical records by citizen_id (UCCN)
   */
  getMedicalRecordsByCitizenId: async (citizenId: string): Promise<any[]> => {
    const res = await hospitalAxios.get(`/api/medical-records/uccn/${citizenId}`);
    return res.data;
  },

  /**
   * Fetch all prescriptions by citizen_id (UCCN)
   */
  getPrescriptionsByCitizenId: async (citizenId: string): Promise<any[]> => {
    const res = await hospitalAxios.get(`/api/prescriptions/uccn/${citizenId}`);
    return res.data;
  },
};

