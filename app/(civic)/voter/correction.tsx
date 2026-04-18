import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '../../../store/languageStore';

export default function VoterCorrectionScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  
  const [formData, setFormData] = useState({
    epicNumber: '',
    fieldToCorrect: '',
    correctedValue: '',
  });

  const [docs, setDocs] = useState({
    supportingDoc: false,
  });

  const handleUpload = () => {
    setDocs({ supportingDoc: true });
    Alert.alert(t('documentUploaded'), t('documentUploaded'));
  };

  const handleSubmit = () => {
    if (!formData.epicNumber || !formData.fieldToCorrect || !formData.correctedValue) {
      Alert.alert(t('error'), t('errorFillFields'));
      return;
    }
    Alert.alert(
      t('requestSubmitted'), 
      t('correctionSubmitted'),
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('correctionOfDetails')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            {t('useServiceToCorrect')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('applicationDetails')}</Text>
          
          <Text style={styles.label}>{t('epicNumber')} *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ABC1234567"
            autoCapitalize="characters"
            value={formData.epicNumber}
            onChangeText={(t) => setFormData({ ...formData, epicNumber: t })}
          />

          <Text style={styles.label}>{t('whatNeedsCorrection')} *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Name Spelling / Address"
            value={formData.fieldToCorrect}
            onChangeText={(t) => setFormData({ ...formData, fieldToCorrect: t })}
          />

          <Text style={styles.label}>{t('correctValue')} *</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            placeholder="Enter the correct information here..."
            multiline
            value={formData.correctedValue}
            onChangeText={(t) => setFormData({ ...formData, correctedValue: t })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('supportingDocuments')}</Text>
          <Text style={styles.hintText}>{t('uploadSupportingDocHint')}</Text>

          <TouchableOpacity 
            style={[styles.uploadButton, docs.supportingDoc && styles.uploadButtonSuccess]}
            onPress={handleUpload}
          >
            <Ionicons name={docs.supportingDoc ? "checkmark-circle" : "cloud-upload"} size={24} color={docs.supportingDoc ? "#10B981" : "#6B7280"} />
            <Text style={[styles.uploadButtonText, docs.supportingDoc && { color: '#10B981' }]}>
              {docs.supportingDoc ? t('documentUploaded') : t('uploadProofDoc')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>{t('submitCorrectionRequest')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  scrollView: { flex: 1, padding: 16 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
    alignItems: 'center',
  },
  infoText: { flex: 1, fontSize: 14, color: '#1E40AF', lineHeight: 20 },
  section: { 
    backgroundColor: '#fff', 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 24, 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
  hintText: { fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 18 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadButtonSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    borderStyle: 'solid',
  },
  uploadButtonText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  submitButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
