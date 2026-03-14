import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, Language, TranslationKey } from '../utils/translations';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'hi', // Default to Hindi
  
  setLanguage: (lang: Language) => {
    AsyncStorage.setItem('language', lang).catch(console.error);
    set({ language: lang });
  },
  
  t: (key: TranslationKey) => {
    const { language } = get();
    return translations[language][key] || key;
  },
  
  loadLanguage: async () => {
    try {
      const savedLang = await AsyncStorage.getItem('language');
      if (savedLang === 'hi' || savedLang === 'en') {
        set({ language: savedLang });
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  },
}));
