import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { hospitalAPI } from '../../utils/api';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    if (!user?.citizen_id) return;
    try {
      setLoadingAppointments(true);
      const data = await hospitalAPI.getAppointmentsByCitizenId(user.citizen_id);
      setAppointmentsData(data);
    } catch (err) {
      console.warn('Could not load appointments data:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="calendar" size={48} color="#fff" />
          <Text style={styles.headerTitle}>{t('appointmentsCard')}</Text>
          <Text style={styles.headerSubtitle}>{t('appointmentsDesc')}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.appointmentsView}>
            {loadingAppointments ? (
              <View style={{ padding: 32, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#EF4444" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>{t('loadingAppointments')}</Text>
              </View>
            ) : appointmentsData.length > 0 ? (
              appointmentsData.map((appt) => (
                <View key={appt.id} style={styles.appointmentCard}>
                  <View style={styles.apptHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.apptDoctor}>{appt.doctor}</Text>
                      <Text style={styles.apptSpecialty}>{appt.specialty}</Text>
                    </View>
                    <View style={[styles.apptStatus, { backgroundColor: appt.status === 'Completed' ? '#D1FAE5' : '#E0F2FE' }]}>
                      <Text style={[styles.apptStatusText, { color: appt.status === 'Completed' ? '#059669' : '#0284C7' }]}>
                        {appt.status === 'Completed' ? t('completed') : (appt.status || t('pending'))}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.apptDetails}>
                    <View style={styles.apptDetailItem}>
                      <Ionicons name="calendar-outline" size={16} color="#4B5563" />
                      <Text style={styles.apptDetailText}>{appt.date}</Text>
                    </View>
                    <View style={styles.apptDetailItem}>
                      <Ionicons name="time-outline" size={16} color="#4B5563" />
                      <Text style={styles.apptDetailText}>{appt.time}</Text>
                    </View>
                  </View>

                  {/* Prescription Section inside Appointment */}
                  {appt.prescriptions && (
                    <View style={styles.prescriptionBlock}>
                      <View style={styles.prescriptionHeader}>
                        <Ionicons name="medical-outline" size={18} color="#10B981" />
                        <Text style={styles.prescriptionTitle}>{t('prescription')}</Text>
                      </View>
                      <View style={styles.medicationsList}>
                        {(appt.prescriptions.medications || []).map((med: any, idx: number) => (
                          <View key={idx} style={styles.medicationRow}>
                            <Ionicons name="disc" size={8} color="#6B7280" style={{ marginTop: 6, marginRight: 6 }} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.medicationName}>{med.medication}</Text>
                              <Text style={styles.medicationDosage}>{t('dosage')}: {med.dosage}  |  {t('quantity')}: {med.quantity}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                      {appt.prescriptions.instructions && (
                        <View style={styles.instructionsBlock}>
                          <Text style={styles.instructionsTitle}>{t('instructions')}:</Text>
                          <Text style={styles.instructionsText}>{appt.prescriptions.instructions}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
                <Text style={{ marginTop: 12, color: '#6B7280', fontSize: 16 }}>{t('noAppointmentsFound')}</Text>
              </View>
            )}
          </View>
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    margin: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  appointmentsView: { paddingVertical: 8 },
  appointmentCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  apptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  apptDoctor: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  apptSpecialty: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  apptStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  apptStatusText: { fontSize: 12, fontWeight: '600' },
  apptDetails: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  apptDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  apptDetailText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },
  prescriptionBlock: {
    marginTop: 8, backgroundColor: '#F0FDF4', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  prescriptionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  prescriptionTitle: { fontSize: 14, fontWeight: '700', color: '#065F46' },
  medicationsList: { gap: 8 },
  medicationRow: { flexDirection: 'row', alignItems: 'flex-start' },
  medicationName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  medicationDosage: { fontSize: 13, color: '#4B5563', marginTop: 2 },
  instructionsBlock: { marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#BBF7D0' },
  instructionsTitle: { fontSize: 13, fontWeight: '600', color: '#065F46', marginBottom: 4 },
  instructionsText: { fontSize: 13, color: '#065F46', fontStyle: 'italic' },
});
