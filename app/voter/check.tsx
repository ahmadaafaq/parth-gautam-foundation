import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '../../store/languageStore';

export default function CheckStatusScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'epic' | 'name'>('epic');
  const [searched, setSearched] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('registrationStatus')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'epic' && styles.tabActive]}
            onPress={() => { setActiveTab('epic'); setSearched(false); }}
          >
            <Text style={[styles.tabText, activeTab === 'epic' && styles.tabTextActive]}>{t('byEpic')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'name' && styles.tabActive]}
            onPress={() => { setActiveTab('name'); setSearched(false); }}
          >
            <Text style={[styles.tabText, activeTab === 'name' && styles.tabTextActive]}>By Name</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchCard}>
          {activeTab === 'epic' ? (
            <>
              <Text style={styles.label}>{t('epicNumber')}</Text>
              <TextInput style={styles.input} placeholder="e.g. ABC1234567" autoCapitalize="characters" />
            </>
          ) : (
            <>
              <Text style={styles.label}>{t('fullName')}</Text>
              <TextInput style={styles.input} placeholder="Enter your name" />
              <Text style={styles.label}>{t('fathersHusbandsName')}</Text>
              <TextInput style={styles.input} placeholder="Enter relative's name" />
            </>
          )}

          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setSearched(true)}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.searchButtonText}>{t('searchDetails')}</Text>
          </TouchableOpacity>
        </View>

        {searched && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.statusBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#059669" />
                <Text style={styles.statusText}>{t('activeVoter')}</Text>
              </View>
              <Text style={styles.epicId}>ABC9876543</Text>
            </View>
            
            <View style={styles.resultDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('fullName')}</Text>
                <Text style={styles.detailValue}>Rahul Sharma</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('relativesName')}</Text>
                <Text style={styles.detailValue}>Prakash Sharma</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('constituency')}</Text>
                <Text style={styles.detailValue}>Ward 14, City Center</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{t('pollingBooth')}</Text>
                <Text style={styles.detailValue}>Govt. High School, Room 3</Text>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.ctaCard} onPress={() => router.push('/voter/apply' as any)}>
          <View style={styles.ctaIcon}>
            <Ionicons name="person-add" size={24} color="#3B82F6" />
          </View>
          <View style={styles.ctaContent}>
            <Text style={styles.ctaTitle}>{t('notFoundInList')}</Text>
            <Text style={styles.ctaSubtitle}>{t('applyVoterMinutes')}</Text>
          </View>
          <Ionicons name="arrow-forward" size={24} color="#3B82F6" />
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#1F2937' },
  searchCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#E5E7EB' },
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
  searchButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    overflow: 'hidden',
    marginBottom: 24,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 14, fontWeight: 'bold', color: '#059669' },
  epicId: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
  resultDetails: { padding: 16, gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 13, color: '#6B7280', flex: 1 },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#1F2937', flex: 2, textAlign: 'right' },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 40,
  },
  ctaIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  ctaContent: { flex: 1 },
  ctaTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 4 },
  ctaSubtitle: { fontSize: 13, color: '#3B82F6' },
});
