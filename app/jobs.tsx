import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Mock Job Data ──────────────────────────────────────────────────────────────
const JOBS = [
  {
    id: 'j1',
    title: 'Data Entry Operator',
    company: 'UP State Infra Ltd.',
    location: 'Bareilly, UP',
    type: 'Full-time',
    salary: '₹12,000 – ₹15,000/mo',
    posted: '2 days ago',
    icon: 'document-text',
    color: '#3B82F6',
    description:
      'We are looking for a diligent Data Entry Operator to type information into our database system from paper documents. The candidate must be fast and accurate at typing and well-versed in related computer applications.',
    requirements: [
      'Minimum 10th pass; 12th or graduate preferred',
      'Typing speed of at least 30 WPM',
      'Basic knowledge of MS Excel and MS Word',
      'Good attention to detail',
    ],
    howToApply: 'Bring your resume and a government ID to our Bareilly office, Civil Lines. Walk-ins accepted Monday–Friday, 10am–4pm.',
  },
  {
    id: 'j2',
    title: 'Sales Executive',
    company: 'Reliance Retail',
    location: 'Bareilly, UP',
    type: 'Full-time',
    salary: '₹15,000 – ₹22,000/mo + incentives',
    posted: '1 day ago',
    icon: 'cart',
    color: '#10B981',
    description:
      'Reliance Retail is hiring enthusiastic Sales Executives to assist customers, manage billing, stock, and maintain a pleasant shopping experience in our store.',
    requirements: [
      '12th pass or graduate',
      'Fluent in Hindi; English a plus',
      'Good communication and customer-service skills',
      'Freshers welcome',
    ],
    howToApply: 'Apply online at careers.relianceretail.com or walk in to the Reliance Smart store, Pilibhit Bypass, Bareilly.',
  },
  {
    id: 'j3',
    title: 'Office Assistant',
    company: 'Parth Gautam Foundation',
    location: 'Bareilly, UP',
    type: 'Part-time',
    salary: '₹8,000 – ₹10,000/mo',
    posted: '3 days ago',
    icon: 'business',
    color: '#8B5CF6',
    description:
      'The Foundation is looking for a responsible Office Assistant to support daily administrative operations, manage files, coordinate appointments, and assist the team with community outreach activities.',
    requirements: [
      '10th pass and above',
      'Basic computer literacy',
      'Honest and punctual',
      'Prior NGO experience a plus but not required',
    ],
    howToApply: 'Email your resume to hr@parthgautam.org or visit the Foundation office, Civil Lines, Bareilly.',
  },
  {
    id: 'j4',
    title: 'Delivery Partner',
    company: 'Zomato / Swiggy',
    location: 'Bareilly, UP (Remote – Field)',
    type: 'Part-time',
    salary: '₹15,000 – ₹25,000/mo (variable)',
    posted: 'Today',
    icon: 'bicycle',
    color: '#F59E0B',
    description:
      'Join India\'s largest food delivery networks as a Delivery Partner. Set your own hours, earn per delivery, and get additional bonuses during peak hours and special events.',
    requirements: [
      'Must own a bicycle or two-wheeler',
      'Valid driving licence for two-wheeler',
      'Android smartphone with data plan',
      '18 years or above',
    ],
    howToApply: 'Sign up directly on the Zomato or Swiggy partner app, available on Google Play Store. Onboarding takes 2–3 days.',
  },
  {
    id: 'j5',
    title: 'Primary School Teacher',
    company: 'Saraswati Vidya Mandir',
    location: 'Fatehganj, Bareilly',
    type: 'Full-time',
    salary: '₹10,000 – ₹14,000/mo',
    posted: '5 days ago',
    icon: 'school',
    color: '#EF4444',
    description:
      'A private primary school is seeking a dedicated and caring teacher for Classes 1–5. The role involves teaching Hindi, Mathematics, and General Knowledge. Experience with young learners is preferred.',
    requirements: [
      'Graduate with B.Ed or D.El.Ed preferred',
      'Minimum 1 year teaching experience',
      'Strong Hindi communication skills',
      'Passion for working with children',
    ],
    howToApply: 'Call 98765-00001 or visit the school office, Station Road, Fatehganj, Bareilly with your CV and certificates.',
  },
  {
    id: 'j6',
    title: 'Security Guard',
    company: 'G4S Security Solutions',
    location: 'Various — Bareilly District',
    type: 'Full-time',
    salary: '₹11,000 – ₹13,000/mo',
    posted: '1 week ago',
    icon: 'shield-checkmark',
    color: '#374151',
    description:
      'G4S is hiring Security Guards for multiple sites including retail stores, residential complexes, and hospitals across Bareilly district. Uniform and training provided.',
    requirements: [
      '18–45 years of age',
      'Minimum 8th pass',
      'Physical fitness test (conducted at office)',
      'Ex-servicemen preferred but not required',
    ],
    howToApply: 'Walk in to G4S Office, Rampur Garden, Bareilly with Aadhaar and one passport photo.',
  },
  {
    id: 'j7',
    title: 'IT Support Technician',
    company: 'Tech Serve India',
    location: 'Remote – Bareilly',
    type: 'Remote',
    salary: '₹18,000 – ₹28,000/mo',
    posted: '4 days ago',
    icon: 'laptop',
    color: '#06B6D4',
    description:
      'Tech Serve India is looking for an IT Support Technician who can troubleshoot hardware, software, and network issues remotely. Experience with Windows OS, basic networking, and ticketing systems is essential.',
    requirements: [
      'Diploma or graduate in IT / Computer Science',
      'Experience with Windows 10/11 and basic networking',
      'Good English communication skills (written)',
      'Own laptop required for remote work',
    ],
    howToApply: 'Apply via LinkedIn (search "Tech Serve India Bareilly") or email resume@techserveindia.in with subject line "IT Support Application".',
  },
  {
    id: 'j8',
    title: 'Beautician / Mehendi Artist',
    company: 'Pragati Salon & Wellness',
    location: 'Izzatnaagar, Bareilly',
    type: 'Part-time',
    salary: '₹8,000 – ₹18,000/mo + tips',
    posted: '2 days ago',
    icon: 'flower',
    color: '#EC4899',
    description:
      'We are looking for a skilled beautician and/or mehendi artist for our growing salon. Flexible hours, a positive work environment, and commission-based earnings on top of the base salary.',
    requirements: [
      'Certificate in Beauty & Wellness or equivalent training',
      'Mehendi design experience preferred',
      'Good hygiene and professional attitude',
      'Minimum 6 months experience',
    ],
    howToApply: 'WhatsApp your portfolio photos to 98765-00002 or visit Pragati Salon, Railway Road, Izzatnaagar.',
  },
];

const FILTERS = ['All', 'Full-time', 'Part-time', 'Remote'];

// ─── Service cards ─────────────────────────────────────────────────────────────
const JOB_SERVICES = [
  {
    id: 'interview',
    title: 'Interview Preparation',
    description: 'Mock questions, sample answers & tips',
    icon: 'people',
    color: '#3B82F6',
    route: '/interview-prep',
  },
  {
    id: 'resume',
    title: 'Resume Builder',
    description: 'Create a professional resume in minutes',
    icon: 'document-text',
    color: '#10B981',
    route: '/resume-builder',
  },

];

// ─── Job Detail Modal ───────────────────────────────────────────────────────────
function JobDetailModal({
  job,
  onClose,
}: {
  job: typeof JOBS[0];
  onClose: () => void;
}) {
  return (
    <Modal visible animationType="slide" transparent>
      <View style={md.overlay}>
        <View style={md.sheet}>
          {/* Header */}
          <LinearGradient colors={[job.color, job.color + 'BB']} style={md.header}>
            <TouchableOpacity onPress={onClose} style={md.closeBtn}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={md.iconCircle}>
              <Ionicons name={job.icon as any} size={30} color="#fff" />
            </View>
            <Text style={md.jobTitle}>{job.title}</Text>
            <Text style={md.company}>{job.company}</Text>
          </LinearGradient>

          <ScrollView contentContainerStyle={md.content} showsVerticalScrollIndicator={false}>
            {/* Meta chips */}
            <View style={md.chips}>
              <Chip icon="location-outline" label={job.location} />
              <Chip icon="time-outline" label={job.type} />
              <Chip icon="cash-outline" label={job.salary} color="#10B981" />
              <Chip icon="calendar-outline" label={`Posted ${job.posted}`} />
            </View>

            <Section title="About the Role" icon="document-text-outline">
              <Text style={md.bodyText}>{job.description}</Text>
            </Section>

            <Section title="Requirements" icon="checkmark-circle-outline">
              {job.requirements.map((r, i) => (
                <View key={i} style={md.bulletRow}>
                  <View style={[md.bullet, { backgroundColor: job.color }]} />
                  <Text style={md.bulletText}>{r}</Text>
                </View>
              ))}
            </Section>

            <Section title="How to Apply" icon="send-outline">
              <Text style={md.bodyText}>{job.howToApply}</Text>
            </Section>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Apply CTA */}
          <View style={md.cta}>
            <TouchableOpacity style={[md.applyBtn, { backgroundColor: job.color }]} onPress={onClose}>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={md.applyBtnText}>Apply Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Chip({ icon, label, color = '#374151' }: { icon: string; label: string; color?: string }) {
  return (
    <View style={md.chip}>
      <Ionicons name={icon as any} size={12} color={color} />
      <Text style={[md.chipText, { color }]}>{label}</Text>
    </View>
  );
}
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <View style={md.section}>
      <View style={md.sectionHeader}>
        <Ionicons name={icon as any} size={16} color="#3B82F6" />
        <Text style={md.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const md = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#F9FAFB', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%', overflow: 'hidden',
  },
  header: { padding: 20, alignItems: 'center', paddingTop: 16 },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  iconCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  jobTitle: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 4 },
  company: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  content: { padding: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  chipText: { fontSize: 11, fontWeight: '700' },
  section: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  bodyText: { fontSize: 13, color: '#4B5563', lineHeight: 21 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7, flexShrink: 0 },
  bulletText: { fontSize: 13, color: '#4B5563', flex: 1, lineHeight: 20 },
  cta: {
    padding: 16, paddingBottom: 28,
    borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#fff',
  },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15, borderRadius: 14,
  },
  applyBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

// ─── Main Jobs Screen ───────────────────────────────────────────────────────────
export default function JobsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedJob, setSelectedJob] = useState<typeof JOBS[0] | null>(null);

  const filtered = activeFilter === 'All' ? JOBS : JOBS.filter((j) => j.type === activeFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Ionicons name="briefcase" size={48} color="#fff" />
          <Text style={styles.headerTitle}>Jobs & Careers</Text>
          <Text style={styles.headerSubtitle}>Discover opportunities and build your career</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Service Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tools & Resources</Text>
          <View style={styles.servicesGrid}>
            {JOB_SERVICES.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => router.push(service.route as any)}
                activeOpacity={0.85}
              >
                <View style={[styles.serviceIcon, { backgroundColor: service.color + '20' }]}>
                  <Ionicons name={service.icon as any} size={28} color={service.color} />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Job Opportunities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Job Opportunities</Text>
            <Text style={styles.countText}>{filtered.length} jobs</Text>
          </View>

          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Job list */}
          {filtered.map((job) => (
            <TouchableOpacity
              key={job.id}
              style={styles.jobCard}
              onPress={() => setSelectedJob(job)}
              activeOpacity={0.85}
            >
              <View style={[styles.jobIconBox, { backgroundColor: job.color + '18' }]}>
                <Ionicons name={job.icon as any} size={26} color={job.color} />
              </View>
              <View style={styles.jobInfo}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                <Text style={styles.jobCompany}>{job.company}</Text>
                <View style={styles.jobMeta}>
                  <Ionicons name="location-outline" size={11} color="#6B7280" />
                  <Text style={styles.jobMetaText}>{job.location}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.jobMetaText}>{job.posted}</Text>
                </View>
              </View>
              <View style={styles.jobRight}>
                <View style={[styles.jobTypeBadge, { backgroundColor: job.color + '18' }]}>
                  <Text style={[styles.jobTypeText, { color: job.color }]}>{job.type}</Text>
                </View>
                <Text style={styles.jobSalary}>{job.salary}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
  section: { padding: 16, paddingTop: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 },
  countText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },

  // Service cards
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: {
    width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  serviceIcon: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  serviceTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  serviceDescription: { fontSize: 12, color: '#6B7280', lineHeight: 16 },

  // Filters
  filtersRow: { gap: 8, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  filterChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  filterTextActive: { color: '#fff' },

  // Job cards
  jobCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 10, gap: 12, alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  jobIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  jobCompany: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  jobMetaText: { fontSize: 11, color: '#9CA3AF' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB' },
  jobRight: { alignItems: 'flex-end', gap: 6, flexShrink: 0 },
  jobTypeBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  jobTypeText: { fontSize: 10, fontWeight: '800' },
  jobSalary: { fontSize: 11, fontWeight: '700', color: '#1F2937' },
});
