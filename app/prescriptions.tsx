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
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { hospitalAPI } from '../utils/api';

export default function PrescriptionsScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const [prescriptionsData, setPrescriptionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  const fetchPrescriptions = async () => {
    if (!user?.citizen_id) return;
    try {
      setLoading(true);
      const data = await hospitalAPI.getPrescriptionsByCitizenId(user.citizen_id);
      setPrescriptionsData(data);
    } catch (err) {
      console.warn('Could not load prescriptions data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="medical" size={48} color="#fff" />
          <Text style={styles.headerTitle}>{t('prescriptionCard')}</Text>
          <Text style={styles.headerSubtitle}>{t('prescriptionDesc')}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.prescriptionsView}>
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#10B981" />
                <Text style={styles.loadingText}>Loading prescriptions...</Text>
              </View>
            ) : prescriptionsData.length > 0 ? (
              prescriptionsData.map((rx) => (
                <View key={rx.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.doctorName}>{rx.doctor_name}</Text>
                      <View style={styles.dateRow}>
                        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                        <Text style={styles.dateText}>Issued: {rx.issued}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: rx.status === 'Active' ? '#D1FAE5' : '#F3F4F6' }]}>
                      <Text style={[styles.statusBadgeText, { color: rx.status === 'Active' ? '#059669' : '#6B7280' }]}>
                        {rx.status}
                      </Text>
                    </View>
                  </View>

                  {/* Medications List */}
                  <View style={styles.medicationsList}>
                    {(rx.medications || []).map((med: any, idx: number) => (
                      <View key={idx} style={styles.medicationRow}>
                        <Ionicons name="disc" size={8} color="#10B981" style={{ marginTop: 6, marginRight: 8 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.medicationName}>{med.medication}</Text>
                          <View style={styles.medDetailsRow}>
                            <Text style={styles.medicationDosage}>Dosage: {med.dosage}</Text>
                            <Text style={styles.medicationQty}>Qty: {med.quantity}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Instructions & Duration */}
                  <View style={styles.footerBlock}>
                    <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={16} color="#6B7280" />
                      <Text style={styles.infoTitle}>Duration: </Text>
                      <Text style={styles.infoText}>{rx.duration}</Text>
                    </View>
                    {rx.instructions && (
                      <View style={[styles.infoRow, { marginTop: 8, alignItems: 'flex-start' }]}>
                        <Ionicons name="information-circle-outline" size={16} color="#6B7280" style={{marginTop: 2}} />
                        <Text style={styles.infoTitle}>Instructions: </Text>
                        <Text style={[styles.infoText, { flex: 1, fontStyle: 'italic' }]}>{rx.instructions}</Text>
                      </View>
                    )}
                  </View>
                  
                  {rx.id && (
                    <View style={styles.idRow}>
                      <Ionicons name="barcode-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.idText}>{rx.id}</Text>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.centerBox}>
                <Ionicons name="medical-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No prescriptions found.</Text>
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
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingBottom: 32, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: {
    margin: 16, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerContent: { alignItems: 'center', paddingHorizontal: 24 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginTop: 16, marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  prescriptionsView: { paddingVertical: 8 },
  
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16,
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  doctorName: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 13, color: '#6B7280' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  
  medicationsList: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#BBF7D0', marginBottom: 16 },
  medicationRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  medicationName: { fontSize: 15, fontWeight: '700', color: '#065F46', marginBottom: 4 },
  medDetailsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  medicationDosage: { fontSize: 13, color: '#047857' },
  medicationQty: { fontSize: 13, color: '#047857', fontWeight: '600' },
  
  footerBlock: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 12, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoTitle: { fontSize: 13, fontWeight: '600', color: '#374151' },
  infoText: { fontSize: 13, color: '#4B5563' },
  
  idRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  idText: { fontSize: 12, color: '#9CA3AF' },

  centerBox: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  emptyText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});
