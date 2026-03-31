import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '../store/languageStore';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'dark' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguageStore();

  const isLight = variant === 'light';

  return (
    <View style={[styles.container, isLight && styles.containerLight]}>
      <TouchableOpacity
        style={[
          styles.button,
          language === 'hi' && styles.buttonActive,
          isLight && language === 'hi' && styles.buttonActiveLight,
        ]}
        onPress={() => setLanguage('hi')}
      >
        <Text
          style={[
            styles.buttonText,
            isLight && styles.buttonTextLight,
            language === 'hi' && styles.buttonTextActive,
            isLight && language === 'hi' && styles.buttonTextActiveLight,
          ]}
        >
          {t('hindi')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          language === 'en' && styles.buttonActive,
          isLight && language === 'en' && styles.buttonActiveLight,
        ]}
        onPress={() => setLanguage('en')}
      >
        <Text
          style={[
            styles.buttonText,
            isLight && styles.buttonTextLight,
            language === 'en' && styles.buttonTextActive,
            isLight && language === 'en' && styles.buttonTextActiveLight,
          ]}
        >
          {t('english')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  containerLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  buttonActive: {
    backgroundColor: '#3B82F6',
  },
  buttonActiveLight: {
    backgroundColor: '#fff',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  buttonTextLight: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  buttonTextActive: {
    color: '#fff',
  },
  buttonTextActiveLight: {
    color: '#3B82F6',
  },
});
