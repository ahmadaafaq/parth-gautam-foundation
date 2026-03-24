import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../store/languageStore';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const SCHOLARSHIPS = [
  {
    id: '1',
    name: 'PM National Scholarship Scheme',
    organization: 'Ministry of Education, Govt. of India',
    category: 'Merit-based',
    amount: '₹12,000 / year',
    lastDate: '31 May 2025',
    website: 'https://scholarships.gov.in',
    eligibility: 'Students scoring 60%+ in class 12 and enrolled in UG courses.',
    description:
      'The PM National Scholarship Scheme provides financial assistance to meritorious students from economically weaker sections to pursue higher education in India.',
    benefits: [
      '₹12,000 per annum for girl students',
      '₹10,000 per annum for boy students',
      'Direct bank transfer (DBT)',
      'Renewable for up to 3 years',
    ],
    color: '#3B82F6',
    icon: 'school',
  },
  {
    id: '2',
    name: 'UP State Scholarship (Pre-Matric)',
    organization: 'UP Social Welfare Department',
    category: 'State – Class 9 & 10',
    amount: '₹3,000 – ₹6,000',
    lastDate: '15 Jun 2025',
    website: 'https://scholarship.up.gov.in',
    eligibility: 'Students of Class 9–10 from OBC/SC/ST/Minority communities in UP.',
    description:
      'The UP Pre-Matric Scholarship is designed to reduce dropout rates among minority and backward-class students studying in classes 9 and 10.',
    benefits: [
      'Annual maintenance allowance',
      'Book, uniform, and stationery grants',
      'Academic fee reimbursement',
    ],
    color: '#F59E0B',
    icon: 'book',
  },
  {
    id: '3',
    name: 'Parth Gautam Foundation Merit Award',
    organization: 'Parth Gautam Foundation',
    category: 'Community – All levels',
    amount: '₹5,000 – ₹15,000',
    lastDate: '30 Apr 2025',
    website: 'https://parthgautam.org',
    eligibility: 'Registered citizens of Ward 1–20 with 70%+ marks in last exam.',
    description:
      'The Foundation\'s own annual merit award supports bright students from underserved wards. Priority is given to first-generation learners.',
    benefits: [
      'Cash award up to ₹15,000',
      'Certificate of merit',
      'Mentorship from professionals',
      'Preference in skill training programs',
    ],
    color: '#10B981',
    icon: 'trophy',
  },
  {
    id: '4',
    name: 'NSP Post-Matric Scholarship',
    organization: 'Ministry of Social Justice, Govt. of India',
    category: 'Post-Matric (11th onwards)',
    amount: 'Up to ₹7,500 / year',
    lastDate: '30 Jun 2025',
    website: 'https://scholarships.gov.in',
    eligibility: 'SC/ST/OBC students enrolled in Class 11, 12 or college with family income ≤ ₹2.5 LPA.',
    description:
      'The NSP Post-Matric Scholarship covers tuition fees and maintenance allowances for socially and economically disadvantaged students in post-matric education.',
    benefits: [
      'Full tuition fee reimbursement',
      'Maintenance allowance',
      'Study tour charges',
      'Book allowance',
    ],
    color: '#8B5CF6',
    icon: 'ribbon',
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function ScholarshipsScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const [selected, setSelected] = useState<typeof SCHOLARSHIPS[0] | null>(null);

  // ── Detail View ──
  if (selected) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.detailHeader}>
          <TouchableOpacity onPress={() => setSelected(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.detailHeaderTitle} numberOfLines={2}>{selected.name}</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}>
          {/* Badge Row */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: selected.color + '20' }]}>
              <Ionicons name={selected.icon as any} size={14} color={selected.color} />
              <Text style={[styles.badgeText, { color: selected.color }]}>{selected.category}</Text>
            </View>
            <View style={styles.lastDateBadge}>
              <Ionicons name="time-outline" size={14} color="#EF4444" />
              <Text style={styles.lastDateText}>{t('lastDate')}: {selected.lastDate}</Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountCard}>
            <Ionicons name="cash-outline" size={22} color="#10B981" />
            <View>
              <Text style={styles.amountLabel}>{t('awardAmount')}</Text>
              <Text style={styles.amountValue}>{selected.amount}</Text>
            </View>
          </View>

          {/* Organization */}
          <InfoBlock icon="business-outline" label={t('offeredBy')} value={selected.organization} />

          {/* Description */}
          <InfoBlock icon="document-text-outline" label={t('aboutThisScholarship')} value={selected.description} />

          {/* Eligibility */}
          <InfoBlock icon="person-circle-outline" label={t('whoCanApply')} value={selected.eligibility} />

          {/* Benefits */}
          <View style={styles.infoBlock}>
            <View style={styles.infoHeader}>
              <Ionicons name="gift-outline" size={18} color="#8B5CF6" />
              <Text style={styles.infoLabel}>{t('benefits')}</Text>
            </View>
            {selected.benefits.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{b}</Text>
              </View>
            ))}
          </View>

          {/* Apply Button */}
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => Linking.openURL(selected.website).catch(() => { })}
          >
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.applyBtnGradient}>
              <Ionicons name="open-outline" size={18} color="#fff" />
              <Text style={styles.applyBtnText}>{t('applyOnOfficialWebsite')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.websiteHint}>{selected.website}</Text>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── List View ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="school" size={44} color="#fff" />
          <Text style={styles.headerTitle}>{t('scholarships')}</Text>
          {/* <Text style={styles.headerSubtitle}>Apply for financial aid programs</Text> */}
        </View>
      </LinearGradient>

      <FlatList
        data={SCHOLARSHIPS}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelected(item)}
            activeOpacity={0.85}
          >
            <View style={[styles.cardIcon, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={28} color={item.color} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardOrg}>{item.organization}</Text>
              <View style={styles.cardMeta}>
                <View style={styles.amountChip}>
                  <Ionicons name="cash-outline" size={12} color="#10B981" />
                  <Text style={styles.amountChipText}>{item.amount}</Text>
                </View>
                <View style={styles.dateChipInline}>
                  <Ionicons name="time-outline" size={12} color="#EF4444" />
                  <Text style={styles.dateChipText}>{item.lastDate}</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ alignSelf: 'center' }} />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────
function InfoBlock({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.infoBlock}>
      <View style={styles.infoHeader}>
        <Ionicons name={icon as any} size={18} color="#3B82F6" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: { paddingBottom: 28, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: {
    margin: 16, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerContent: { alignItems: 'center', paddingHorizontal: 24 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 12, marginBottom: 6 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },

  // List card
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardIcon: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center',
    justifyContent: 'center', marginRight: 12,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  cardOrg: { fontSize: 12, color: '#6B7280', marginBottom: 8 },
  cardMeta: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  amountChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  amountChipText: { fontSize: 11, fontWeight: '700', color: '#10B981' },
  dateChipInline: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEF2F2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3,
  },
  dateChipText: { fontSize: 11, fontWeight: '700', color: '#EF4444' },

  // Detail header
  detailHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 16, paddingHorizontal: 8,
  },
  detailHeaderTitle: {
    flex: 1, fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center',
  },
  detailContent: { padding: 16 },

  // Badges
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  lastDateBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#FEF2F2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
  },
  lastDateText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },

  // Amount card
  amountCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#ECFDF5', borderRadius: 14, padding: 14, marginBottom: 12,
  },
  amountLabel: { fontSize: 12, color: '#6B7280' },
  amountValue: { fontSize: 18, fontWeight: '800', color: '#065F46' },

  // Info blocks
  infoBlock: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  infoValue: { fontSize: 13, color: '#4B5563', lineHeight: 20 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#8B5CF6', marginTop: 7 },
  bulletText: { fontSize: 13, color: '#4B5563', flex: 1, lineHeight: 20 },

  // Apply button
  applyBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 6, marginBottom: 4 },
  applyBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15,
  },
  applyBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  websiteHint: { textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 4 },
});
