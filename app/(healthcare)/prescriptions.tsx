import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { hospitalAPI, HOSPITAL_BASE_URL } from '../../utils/api';
import { Linking } from 'react-native';

export default function PrescriptionsScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const [prescriptionsData, setPrescriptionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  const handleViewFull = (url: string) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `${HOSPITAL_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    const authenticatedUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}apiKey=pgf-opd-key-2026`;
    Linking.openURL(authenticatedUrl).catch(err => {
      console.error('Error opening URL:', err);
      Alert.alert(t('error'), t('unableToOpenAttachment'));
    });
  };

  const fetchPrescriptions = async () => {
    if (!user?.citizen_id) return;
    try {
      setLoading(true);
      // Fetch both structured prescriptions and uploaded prescription files from medical records
      const [structuredRx, uploadedRx] = await Promise.all([
        hospitalAPI.getPrescriptionsByCitizenId(user.citizen_id),
        hospitalAPI.getMedicalRecordsByCitizenId(user.citizen_id)
      ]);

      // Filter medical records to only include prescriptions
      const filteredUploaded = (uploadedRx || []).filter((r: any) =>
        r.record_type === 'Prescription' || r.summary?.includes('(Prescription)')
      ).map((r: any) => ({
        ...r,
        isUploadedFile: true, // Tag to distinguish from structured records
        doctor_name: r.doctor,
        issued: r.date,
        instructions: r.summary
      }));

      // Merge and sort by date/issued
      const merged = [...(structuredRx || []), ...filteredUploaded].sort((a, b) => {
        const dateA = new Date(a.issued || a.created_at || 0).getTime();
        const dateB = new Date(b.issued || b.created_at || 0).getTime();
        return dateB - dateA;
      });

      setPrescriptionsData(merged);
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
                <Text style={styles.loadingText}>{t('loadingPrescriptions')}</Text>
              </View>
            ) : prescriptionsData.length > 0 ? (
              prescriptionsData.map((rx) => {
                let attachment = rx.attachment_url;
                try {
                  const parsed = JSON.parse(rx.attachment_url || "[]");
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    attachment = parsed[0];
                  }
                } catch (e) {
                  // Not JSON
                }

                const imageUrl = attachment?.startsWith('http')
                  ? attachment
                  : attachment ? `${HOSPITAL_BASE_URL}${attachment}` : '';

                return (
                  <View key={rx.id} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.doctorName}>{rx.doctor_name || t('doctorNotSpecified')}</Text>
                        <View style={styles.dateRow}>
                          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                          <Text style={styles.dateText}>{t('issued')}: {rx.issued}</Text>
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: rx.status === 'Active' ? '#D1FAE5' : '#F3F4F6' }]}>
                        <Text style={[styles.statusBadgeText, { color: rx.status === 'Active' ? '#059669' : '#6B7280' }]}>
                          {rx.status === 'Active' ? t('active') : (rx.status || t('active'))}
                        </Text>
                      </View>
                    </View>

                    {/* Medications List (for structured records) */}
                    {/* {!rx.isUploadedFile && (
                      <View style={styles.medicationsList}>
                        {(rx.medications || []).map((med: any, idx: number) => (
                          <View key={idx} style={styles.medicationRow}>
                            <Ionicons name="disc" size={8} color="#10B981" style={{ marginTop: 6, marginRight: 8 }} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.medicationName}>{med.medication}</Text>
                              <View style={styles.medDetailsRow}>
                                <Text style={styles.medicationDosage}>{t('dosage')}: {med.dosage}</Text>
                                <Text style={styles.medicationQty}>{t('quantity')}: {med.quantity}</Text>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    )} */}

                    {/* Attachment Image (shows for both uploaded files and clinical records with scans) */}
                    {attachment ? (
                      <View style={styles.imageBox}>
                        <Image
                          source={{
                            uri: `${imageUrl}?apiKey=pgf-opd-key-2026`
                          }}
                          style={styles.thumbnail}
                          resizeMode="cover"
                          onError={(e) => {
                            console.warn(`[PrescriptionImageError] Failed to load image at: ${imageUrl}`, e.nativeEvent.error);
                          }}
                        />
                        <View style={styles.imageOverlay}>
                          <Ionicons name="image-outline" size={20} color="#fff" />
                          <Text style={styles.imageBadge}>
                            {rx.isUploadedFile ? t('prescriptionImage') : t('clinicalAttachment')}
                          </Text>
                          <TouchableOpacity
                            style={styles.viewFullBtn}
                            onPress={() => handleViewFull(attachment)}
                          >
                            <Text style={styles.viewFullText}>{t('viewFull')}</Text>
                            <Ionicons name="open-outline" size={14} color="#fff" style={{ marginLeft: 4 }} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : null}

                    {/* Instructions & Duration */}
                    {/* <View style={styles.footerBlock}>
                      <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={16} color="#6B7280" />
                        <Text style={styles.infoTitle}>{t('duration')}: </Text>
                        <Text style={styles.infoText}>{rx.duration || t('na')}</Text>
                      </View>
                      {(rx.instructions || rx.summary) && (
                        <View style={[styles.infoRow, { marginTop: 8, alignItems: 'flex-start' }]}>
                          <Ionicons name="information-circle-outline" size={16} color="#6B7280" style={{ marginTop: 2 }} />
                          <Text style={styles.infoTitle}>{t('instructions')}: </Text>
                          <Text style={[styles.infoText, { flex: 1, fontStyle: 'italic' }]}>{rx.instructions || rx.summary}</Text>
                        </View>
                      )}
                    </View> */}

                    {rx.id && (
                      <View style={styles.idRow}>
                        <Ionicons name="barcode-outline" size={14} color="#9CA3AF" />
                        <Text style={styles.idText}>{t('id')}: {rx.id}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.centerBox}>
                <Ionicons name="medical-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>{t('noPrescriptionsFound')}</Text>
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

  imageBox: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    justifyContent: 'space-between',
  },
  viewFullBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewFullText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  imageBadge: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
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
