import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '../../store/languageStore';

export default function TrackVoterStatusScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const [appId, setAppId] = useState('');
  const [showProgress, setShowProgress] = useState(false);

  const statusStages = [
    { id: 1, label: 'Submitted', date: 'Oct 12, 2024', status: 'completed' },
    { id: 2, label: 'Under Review', date: 'Oct 14, 2024', status: 'active' },
    { id: 3, label: 'Field Verification', status: 'pending' },
    { id: 4, label: 'Approved / Rejected', status: 'pending' },
  ];

  const handleTrack = () => {
    if (!appId) {
      Alert.alert(t('error'), t('errorFillFields'));
      return;
    }
    setShowProgress(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('trackApplication')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.searchCard}>
          <Text style={styles.label}>{t('appIdOrEpic')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. VTR987654321"
            value={appId}
            onChangeText={setAppId}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.trackButton} onPress={handleTrack}>
            <Text style={styles.trackButtonText}>{t('trackProgress')}</Text>
          </TouchableOpacity>
        </View>

        {showProgress && (
          <View style={styles.timelineCard}>
            <Text style={styles.cardTitle}>{t('applicationProgress')}</Text>
            
            <View style={styles.timeline}>
              {statusStages.map((stage, index) => (
                <View key={stage.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.circle,
                      stage.status === 'completed' && styles.circleCompleted,
                      stage.status === 'active' && styles.circleActive,
                    ]}>
                      {stage.status === 'completed' ? (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      ) : stage.status === 'active' ? (
                        <View style={styles.innerCircle} />
                      ) : null}
                    </View>
                    {index < statusStages.length - 1 && (
                      <View style={[
                        styles.line,
                        stage.status === 'completed' && styles.lineCompleted
                      ]} />
                    )}
                  </View>
                  
                  <View style={styles.timelineRight}>
                    <Text style={[
                      styles.stageLabel,
                      stage.status === 'active' && styles.stageLabelActive,
                      stage.status === 'pending' && styles.stageLabelPending,
                    ]}>
                      {stage.label}
                    </Text>
                    {stage.date && <Text style={styles.stageDate}>{stage.date}</Text>}
                    {stage.status === 'active' && (
                      <View style={styles.activeIndicator}>
                        <Text style={styles.activeText}>{t('inProgress')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.notificationInfo}>
              <Ionicons name="notifications" size={20} color="#3B82F6" />
              <Text style={styles.notificationText}>
                {t('receiveUpdatesNotice')}
              </Text>
            </View>
          </View>
        )}
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
  searchCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
  label: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 8 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 20,
  },
  trackButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  trackButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  timelineCard: { backgroundColor: '#fff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 40 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 24 },
  timeline: { paddingLeft: 8 },
  timelineItem: { flexDirection: 'row', minHeight: 80 },
  timelineLeft: { alignItems: 'center', marginRight: 16, width: 24 },
  circle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  circleCompleted: { backgroundColor: '#10B981' },
  circleActive: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#3B82F6' },
  innerCircle: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
  line: { position: 'absolute', top: 24, bottom: 0, width: 2, backgroundColor: '#E5E7EB' },
  lineCompleted: { backgroundColor: '#10B981' },
  timelineRight: { flex: 1, paddingTop: 2 },
  stageLabel: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  stageLabelActive: { color: '#3B82F6' },
  stageLabelPending: { color: '#9CA3AF' },
  stageDate: { fontSize: 13, color: '#6B7280' },
  activeIndicator: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
  activeText: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },
  notificationInfo: { marginTop: 24, padding: 16, backgroundColor: '#F3F4F6', borderRadius: 12, flexDirection: 'row', gap: 12, alignItems: 'center' },
  notificationText: { flex: 1, fontSize: 13, color: '#6B7280', lineHeight: 18 },
});
