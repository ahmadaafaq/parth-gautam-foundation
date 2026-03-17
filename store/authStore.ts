import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  phone: string;
  age_group: string;
  ward: string;
  occupation: string;
  interests: string[];
  citizen_id: string;
  volunteer_points: number;
  programs_attended: number;
  community_reports: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  setUser: (user) => {
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user)).catch(console.error);
    } else {
      AsyncStorage.removeItem('user').catch(console.error);
    }
    set({ user, isAuthenticated: !!user });
  },
  
  logout: () => {
    AsyncStorage.removeItem('user').catch(console.error);
    set({ user: null, isAuthenticated: false });
  },
  
  loadUser: async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  },
}));
