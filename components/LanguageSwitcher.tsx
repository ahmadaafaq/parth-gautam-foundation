import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '../store/languageStore';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguageStore();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, language === 'hi' && styles.buttonActive]}
        onPress={() => setLanguage('hi')}
      >
        <Text style={[styles.buttonText, language === 'hi' && styles.buttonTextActive]}>
          {t('hindi')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, language === 'en' && styles.buttonActive]}
        onPress={() => setLanguage('en')}
      >
        <Text style={[styles.buttonText, language === 'en' && styles.buttonTextActive]}>
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
    padding: 4,
    gap: 4,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonActive: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  buttonTextActive: {
    color: '#fff',
  },
});
