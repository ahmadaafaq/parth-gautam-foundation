import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '../../../store/languageStore';

export default function ApplyNewVoterScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const [autoFill, setAutoFill] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    aadhaar: '',
  });

  const handleAutoFill = (value: boolean) => {
    setAutoFill(value);
    if (value) {
      setFormData({
        firstName: 'Anjali',
        lastName: 'Sharma',
        dob: '01/05/2005',
        aadhaar: 'XXXX-XXXX-1234',
      });
      Alert.alert('Auto-filled', 'Data populated from your Citizen Card.');
    } else {
      setFormData({ firstName: '', lastName: '', dob: '', aadhaar: '' });
    }
  };

  const [docs, setDocs] = useState({
    photo: false,
    address: false,
  });

  const handleUpload = (type: 'photo' | 'address') => {
    setDocs((prev) => ({ ...prev, [type]: true }));
    Alert.alert('Uploaded', `Mock ${type} uploaded successfully.`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('applyForNewVoter')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* <View style={styles.autofillCard}>
          <View style={styles.autofillInfo}>
            <Ionicons name="card" size={24} color="#3B82F6" />
            <Text style={styles.autofillText}>Auto-fill via Citizen Card</Text>
          </View>
          <Switch 
            value={autoFill}
            onValueChange={handleAutoFill}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={autoFill ? '#3B82F6' : '#F9FAFB'}
          />
        </View> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('personalDetails')}</Text>

          <Text style={styles.label}>{t('firstName')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Anjali"
            value={formData.firstName}
            onChangeText={(t) => setFormData({ ...formData, firstName: t })}
          />

          <Text style={styles.label}>{t('lastName')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Sharma"
            value={formData.lastName}
            onChangeText={(t) => setFormData({ ...formData, lastName: t })}
          />

          <Text style={styles.label}>{t('dateOfBirth')}</Text>
          <TextInput
            style={styles.input}
            placeholder="DD/MM/YYYY"
            value={formData.dob}
            onChangeText={(t) => setFormData({ ...formData, dob: t })}
          />

          <Text style={styles.label}>{t('aadhaarNumber')}</Text>
          <TextInput
            style={styles.input}
            placeholder="12-digit Aadhaar Number"
            value={formData.aadhaar}
            onChangeText={(t) => setFormData({ ...formData, aadhaar: t })}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('documentUpload')}</Text>

          <TouchableOpacity
            style={[styles.uploadButton, docs.photo && styles.uploadButtonSuccess]}
            onPress={() => handleUpload('photo')}
          >
            <Ionicons name={docs.photo ? "checkmark-circle" : "camera"} size={24} color={docs.photo ? "#10B981" : "#6B7280"} />
            <Text style={[styles.uploadButtonText, docs.photo && { color: '#10B981' }]}>
              {docs.photo ? t('passportPhotoUploaded') : t('uploadPassportPhoto')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.uploadButton, docs.address && styles.uploadButtonSuccess]}
            onPress={() => handleUpload('address')}
          >
            <Ionicons name={docs.address ? "checkmark-circle" : "document-text"} size={24} color={docs.address ? "#10B981" : "#6B7280"} />
            <Text style={[styles.uploadButtonText, docs.address && { color: '#10B981' }]}>
              {docs.address ? t('addressProofUploaded') : t('uploadValidAddressProof')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => Alert.alert(t('success'), t('applicationSubmitted'), [{ text: 'OK', onPress: () => router.back() }])}
        >
          <Text style={styles.submitButtonText}>{t('submitApplication')}</Text>
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
  autofillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  autofillInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  autofillText: { fontSize: 15, fontWeight: '600', color: '#1E3A8A' },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 6 },
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
    marginBottom: 12,
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
