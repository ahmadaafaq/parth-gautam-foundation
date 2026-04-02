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
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { hospitalAPI, HOSPITAL_BASE_URL } from '../utils/api';
import { Linking } from 'react-native';

export default function MedicalRecordsScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const [recordsData, setRecordsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleViewFull = (url: string) => {
    if (!url) return;
    const fullUrl = url.startsWith('http') ? url : `${HOSPITAL_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
    const authenticatedUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}apiKey=pgf-opd-key-2026`;
    Linking.openURL(authenticatedUrl).catch(err => {
      console.error('Error opening URL:', err);
      Alert.alert('Error', 'Unable to open attachment.');
    });
  };

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    if (!user?.citizen_id) return;
    try {
      setLoading(true);
      const data = await hospitalAPI.getMedicalRecordsByCitizenId(user.citizen_id);
      setRecordsData(data);
    } catch (err) {
      console.warn('Could not load medical records data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="document-text" size={48} color="#fff" />
          <Text style={styles.headerTitle}>{t('reportsCard')}</Text>
          <Text style={styles.headerSubtitle}>{t('reportsDesc')}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.recordsView}>
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading medical records...</Text>
              </View>
            ) : recordsData.length > 0 ? (
              recordsData.map((record) => {
                let attachment = record.attachment_url;
                try {
                  const parsed = JSON.parse(record.attachment_url || "[]");
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    attachment = parsed[0];
                  }
                } catch (e) {
                  // Not JSON
                }

                const imageUrl = attachment?.startsWith('http')
                  ? attachment
                  : attachment ? `${HOSPITAL_BASE_URL}${attachment}` : '';

                const isImage = attachment && (
                  record.attachment_type?.startsWith('image/') ||
                  attachment.match(/\.(jpg|jpeg|png|gif|webp)$/i)
                );

                return (
                  <View key={record.id} style={styles.card}>
                    {attachment && isImage ? (
                      <Image
                        source={{
                          uri: `${imageUrl}?apiKey=pgf-opd-key-2026`
                        }}
                        style={styles.thumbnail}
                        resizeMode="cover"
                        onError={(e) => {
                          console.warn(`[MedicalRecordImageError] Failed to load image at: ${imageUrl}`, e.nativeEvent.error);
                        }}
                      />
                    ) : (
                      <View style={[styles.thumbnail, styles.noImage]}>
                        <Ionicons name="document-text" size={40} color="#D1D5DB" />
                      </View>
                    )}
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.recordType}>{record.record_type}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: record.status === 'Active' ? '#D1FAE5' : '#F3F4F6' }]}>
                          <Text style={[styles.statusBadgeText, { color: record.status === 'Active' ? '#059669' : '#6B7280' }]}>
                            {record.status}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.summaryText}>{record.summary}</Text>

                      <View style={styles.separator} />

                      <View style={styles.detailsRow}>
                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{record.date}</Text>
                      </View>

                      <View style={styles.detailsRow}>
                        <Ionicons name="person-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{record.doctor}</Text>
                      </View>

                      {record.id && (
                        <View style={[styles.detailsRow, { marginTop: 4 }]}>
                          <Ionicons name="barcode-outline" size={14} color="#9CA3AF" />
                          <Text style={[styles.detailText, { fontSize: 12, color: '#9CA3AF' }]}>{record.id}</Text>
                        </View>
                      )}

                      {attachment && (
                        <TouchableOpacity
                          style={styles.fullViewRow}
                          onPress={() => handleViewFull(attachment)}
                        >
                          <Ionicons name="open-outline" size={18} color="#8B5CF6" />
                          <Text style={styles.fullViewText}>View Full Document</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.centerBox}>
                <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No medical records found.</Text>
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
  recordsView: { paddingVertical: 8 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recordType: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  summaryText: { fontSize: 14, color: '#4B5563', fontStyle: 'italic', marginBottom: 12 },
  separator: { height: 1, backgroundColor: '#E5E7EB', marginBottom: 12 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  detailText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },

  fullViewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 8,
  },
  fullViewText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '700',
  },

  centerBox: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  emptyText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});
