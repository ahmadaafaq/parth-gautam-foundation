import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../../store/languageStore';

export default function PollingBoothScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();

  const boothDetails = {
    name: 'Govt. Higher Secondary School',
    room: 'Room No. 3',
    address: 'Near Old Market, Ward 14, City Center',
    boothNumber: '112 / 24',
    date: 'April 25, 2024',
    time: '7:00 AM - 6:00 PM',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('findPollingBooth')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.mapPlaceholder}>
          <LinearGradient colors={['#E5E7EB', '#D1D5DB']} style={styles.mapGradient}>
            <Ionicons name="map" size={48} color="#9CA3AF" />
            <Text style={styles.mapText}>{t('mapPreview')}</Text>
          </LinearGradient>
          <TouchableOpacity style={styles.navigationFab}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.fabGradient}>
              <Ionicons name="navigate" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.boothHeader}>
            <View style={styles.boothBadge}>
              <Text style={styles.boothBadgeText}>{t('booth')} {boothDetails.boothNumber}</Text>
            </View>
            <Text style={styles.boothName}>{boothDetails.name}</Text>
            <Text style={styles.roomName}>{boothDetails.room}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="location" size={20} color="#3B82F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('addressLabel')}</Text>
              <Text style={styles.infoValue}>{boothDetails.address}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="calendar" size={20} color="#10B981" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('votingDate')}</Text>
              <Text style={styles.infoValue}>{boothDetails.date}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color="#F59E0B" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('votingHours')}</Text>
              <Text style={styles.infoValue}>{boothDetails.time}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.directionsButton}>
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.directionsButtonText}>{t('navigateViaGoogleMaps')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noticeBox}>
          <Ionicons name="alert-circle" size={20} color="#6B7280" />
          <Text style={styles.noticeText}>
            {t('carryIdProof')}
          </Text>
        </View>
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
  scrollView: { flex: 1 },
  mapPlaceholder: {
    height: 240,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  mapGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  mapText: { fontSize: 16, color: '#6B7280', fontWeight: 'bold' },
  navigationFab: {
    position: 'absolute',
    bottom: -28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    marginTop: 40,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  boothHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  boothBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  boothBadgeText: { fontSize: 12, fontWeight: '700', color: '#3B82F6', textTransform: 'uppercase' },
  boothName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 4 },
  roomName: { fontSize: 14, color: '#6B7280' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 20 },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  infoValue: { fontSize: 15, color: '#1F2937', fontWeight: '500', lineHeight: 22 },
  directionsButton: {
    marginTop: 12,
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  directionsButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  noticeBox: {
    margin: 16,
    marginTop: 24,
    marginBottom: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  noticeText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 18 },
});
