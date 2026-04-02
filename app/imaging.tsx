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

export default function ImagingScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { user } = useAuthStore();
  const [imagingData, setImagingData] = useState<any[]>([]);
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
    fetchImaging();
  }, [user]);

  const fetchImaging = async () => {
    if (!user?.citizen_id) return;
    try {
      setLoading(true);
      const data = await hospitalAPI.getImagingByCitizenId(user.citizen_id);
      setImagingData(data);
    } catch (err) {
      console.warn('Could not load imaging data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="images" size={48} color="#fff" />
          <Text style={styles.headerTitle}>{t('imagingCard')}</Text>
          <Text style={styles.headerSubtitle}>{t('imagingDesc')}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.imagingView}>
            {loading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingText}>Loading imaging records...</Text>
              </View>
            ) : imagingData.length > 0 ? (
              imagingData.map((img) => {
                let thumb = img.thumbnail;
                try {
                  const parsed = JSON.parse(img.thumbnail || "[]");
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    thumb = parsed[0];
                  }
                } catch (e) {
                  // Not a JSON array, use as is
                }

                const imageUrl = thumb?.startsWith('http')
                  ? thumb
                  : thumb ? `${HOSPITAL_BASE_URL}${thumb}` : '';

                return (
                  <View key={img.id} style={styles.card}>
                    <Image
                      source={{
                        uri: `${imageUrl}?apiKey=pgf-opd-key-2026`
                      }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                      onError={(e) => {
                        console.warn(`[ImagingError] Failed to load image at: ${imageUrl}`, e.nativeEvent.error);
                      }}
                    />
                    <View style={styles.imageOverlay}>
                      <TouchableOpacity
                        style={styles.viewFullBtn}
                        onPress={() => handleViewFull(thumb)}
                      >
                        <Text style={styles.viewFullText}>View Full</Text>
                        <Ionicons name="open-outline" size={14} color="#fff" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.studyType}>{img.study_type}</Text>
                        <View style={[styles.aiBadge, { backgroundColor: img.ai_flag === 'Normal' ? '#D1FAE5' : '#FEE2E2' }]}>
                          <Text style={[styles.aiBadgeText, { color: img.ai_flag === 'Normal' ? '#059669' : '#DC2626' }]}>
                            {img.ai_flag || 'Unknown'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailsRow}>
                        <Ionicons name="body-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{img.body_part} ({img.modality})</Text>
                      </View>

                      <View style={styles.detailsRow}>
                        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{img.date} {img.month} {img.year}</Text>
                      </View>

                      <View style={styles.detailsRow}>
                        <Ionicons name="person-outline" size={16} color="#6B7280" />
                        <Text style={styles.detailText}>{img.doctor}</Text>
                      </View>

                      {img.id && (
                        <View style={[styles.detailsRow, { marginTop: 4 }]}>
                          <Ionicons name="barcode-outline" size={14} color="#9CA3AF" />
                          <Text style={[styles.detailText, { fontSize: 12, color: '#9CA3AF' }]}>{img.id}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.centerBox}>
                <Ionicons name="images-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyText}>No imaging records found.</Text>
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
  imagingView: { paddingVertical: 8 },

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
  cardContent: { padding: 16 },
  imageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  viewFullBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewFullText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  studyType: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  aiBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  aiBadgeText: { fontSize: 12, fontWeight: '700' },
  detailsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  detailText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },

  centerBox: { padding: 40, alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  emptyText: { marginTop: 12, color: '#6B7280', fontSize: 16 },
});
