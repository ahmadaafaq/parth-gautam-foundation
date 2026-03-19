import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Mock Data ───────────────────────────────────────────────────────────────
const DOCTORS = [
  {
    id: '1',
    name: 'Dr. Anjali Sharma',
    specialization: 'General Physician',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '12 years',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&h=200&auto=format&fit=crop',
    available: true,
  },
  {
    id: '2',
    name: 'Dr. Rakesh Gupta',
    specialization: 'Cardiologist',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '18 years',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop',
    available: true,
  },
  {
    id: '3',
    name: 'Dr. Priya Verma',
    specialization: 'Paediatrician',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '9 years',
    rating: 4.7,
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    available: true,
  },
  {
    id: '4',
    name: 'Dr. Suresh Agarwal',
    specialization: 'Orthopaedic Surgeon',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '22 years',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&h=200&auto=format&fit=crop',
    available: false,
  },
  {
    id: '5',
    name: 'Dr. Meena Tiwari',
    specialization: 'Gynaecologist',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '15 years',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop',
    available: true,
  },
  {
    id: '6',
    name: 'Dr. Amit Saxena',
    specialization: 'Dermatologist',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '10 years',
    rating: 4.6,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop',
    available: true,
  },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

// Generate next 7 days
function getNextDays(count: number) {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: d.toISOString().split('T')[0],
      day: dayNames[d.getDay()],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
    });
  }
  return days;
}

const DATES = getNextDays(7);

// ─── Component ───────────────────────────────────────────────────────────────
export default function BookAppointmentScreen() {
  const router = useRouter();

  // Step: 'list' | 'book'
  const [step, setStep] = useState<'list' | 'book'>('list');
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState(DATES[0].key);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelectDoctor = (doctor: typeof DOCTORS[0]) => {
    if (!doctor.available) return;
    setSelectedDoctor(doctor);
    setSelectedDate(DATES[0].key);
    setSelectedSlot(null);
    setStep('book');
  };

  const handleBookAppointment = () => {
    if (!selectedSlot) return;
    setShowConfirm(true);
  };

  const handleConfirmDone = () => {
    setShowConfirm(false);
    router.back();
  };

  // ── Doctor List ──
  if (step === 'list') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="calendar" size={42} color="#fff" />
            <Text style={styles.headerTitle}>Book Appointment</Text>
            <Text style={styles.headerSubtitle}>Choose a doctor & schedule your visit</Text>
          </View>
        </LinearGradient>

        <FlatList
          data={DOCTORS}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: doctor }) => (
            <TouchableOpacity
              style={[styles.doctorCard, !doctor.available && styles.doctorCardDisabled]}
              onPress={() => handleSelectDoctor(doctor)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: doctor.avatar }} style={styles.avatar} />
              <View style={styles.doctorInfo}>
                <View style={styles.doctorNameRow}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  {!doctor.available && (
                    <View style={styles.unavailableBadge}>
                      <Text style={styles.unavailableText}>Unavailable</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.specialization}>{doctor.specialization}</Text>
                <View style={styles.hospitalRow}>
                  <Ionicons name="location-outline" size={12} color="#6B7280" />
                  <Text style={styles.hospitalText} numberOfLines={1}>{doctor.hospital}</Text>
                </View>
                <View style={styles.doctorMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={13} color="#F59E0B" />
                    <Text style={styles.metaText}>{doctor.rating}</Text>
                  </View>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>{doctor.experience}</Text>
                </View>
              </View>
              {doctor.available && (
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ alignSelf: 'center' }} />
              )}
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // ── Booking Form ──
  const selectedDateObj = DATES.find(d => d.key === selectedDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.bookingHeader}>
        <TouchableOpacity onPress={() => setStep('list')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bookingHeaderTitle}>Select Date & Time</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Selected Doctor */}
        <View style={styles.selectedDoctorCard}>
          <Image source={{ uri: selectedDoctor!.avatar }} style={styles.selectedAvatar} />
          <View>
            <Text style={styles.selectedDoctorName}>{selectedDoctor!.name}</Text>
            <Text style={styles.selectedSpec}>{selectedDoctor!.specialization}</Text>
            <View style={styles.hospitalRow}>
              <Ionicons name="location-outline" size={12} color="#6B7280" />
              <Text style={styles.hospitalText} numberOfLines={2}>{selectedDoctor!.hospital}</Text>
            </View>
          </View>
        </View>

        {/* Date Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {DATES.map((d) => (
              <TouchableOpacity
                key={d.key}
                style={[styles.dateChip, selectedDate === d.key && styles.dateChipActive]}
                onPress={() => { setSelectedDate(d.key); setSelectedSlot(null); }}
              >
                <Text style={[styles.dateDayText, selectedDate === d.key && styles.dateTextActive]}>{d.day}</Text>
                <Text style={[styles.dateDateText, selectedDate === d.key && styles.dateTextActive]}>{d.date}</Text>
                <Text style={[styles.dateMonthText, selectedDate === d.key && styles.dateTextActive]}>{d.month}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]}
                onPress={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
              >
                <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>



        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bookBtn, !selectedSlot && styles.bookBtnDisabled]}
          onPress={handleBookAppointment}
          disabled={!selectedSlot}
        >
          <LinearGradient
            colors={selectedSlot ? ['#EF4444', '#DC2626'] : ['#D1D5DB', '#D1D5DB']}
            style={styles.bookBtnGradient}
          >
            <Ionicons name="calendar-outline" size={20} color="#fff" />
            <Text style={styles.bookBtnText}>
              {selectedSlot ? `Book for ${selectedSlot}` : 'Select a Time Slot'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.confirmIconBg}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.confirmTitle}>Appointment Booked!</Text>
            <Text style={styles.confirmSubtitle}>Your appointment has been confirmed.</Text>

            <View style={styles.confirmDetails}>
              <ConfirmRow icon="person-outline" label="Doctor" value={selectedDoctor!.name} />
              <ConfirmRow icon="medical-outline" label="Specialization" value={selectedDoctor!.specialization} />
              <ConfirmRow icon="location-outline" label="Hospital" value={selectedDoctor!.hospital} />
              <ConfirmRow
                icon="calendar-outline"
                label="Date"
                value={`${selectedDateObj?.day}, ${selectedDateObj?.date} ${selectedDateObj?.month}`}
              />
              <ConfirmRow icon="time-outline" label="Time" value={selectedSlot!} />

            </View>

            <TouchableOpacity style={styles.confirmDoneBtn} onPress={handleConfirmDone}>
              <Text style={styles.confirmDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ConfirmRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.confirmRow}>
      <View style={styles.confirmRowIcon}>
        <Ionicons name={icon} size={16} color="#EF4444" />
      </View>
      <Text style={styles.confirmRowLabel}>{label}</Text>
      <Text style={styles.confirmRowValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header (list screen)
  header: { paddingBottom: 28, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: {
    margin: 16, width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerContent: { alignItems: 'center', paddingHorizontal: 24 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginTop: 12, marginBottom: 6 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center' },

  // Header (booking screen)
  bookingHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 16, paddingHorizontal: 8,
  },
  bookingHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },

  // Doctor card
  doctorCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  doctorCardDisabled: { opacity: 0.55 },
  avatar: { width: 68, height: 68, borderRadius: 34, marginRight: 14, backgroundColor: '#E5E7EB' },
  doctorInfo: { flex: 1 },
  doctorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  doctorName: { fontSize: 15, fontWeight: '700', color: '#1F2937', flex: 1 },
  unavailableBadge: {
    backgroundColor: '#FEE2E2', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2,
  },
  unavailableText: { fontSize: 10, fontWeight: '600', color: '#EF4444' },
  specialization: { fontSize: 13, color: '#EF4444', fontWeight: '600', marginBottom: 4 },
  hospitalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 3, marginBottom: 6, flex: 1 },
  hospitalText: { fontSize: 11, color: '#6B7280', flex: 1 },
  doctorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: '#6B7280' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB' },

  // Booking form
  selectedDoctorCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff',
    margin: 16, borderRadius: 16, padding: 14, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  selectedAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E5E7EB' },
  selectedDoctorName: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  selectedSpec: { fontSize: 13, color: '#EF4444', fontWeight: '600', marginBottom: 4 },

  section: { paddingHorizontal: 16, marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },

  // Date picker
  dateRow: { gap: 10, paddingBottom: 4 },
  dateChip: {
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, backgroundColor: '#fff', minWidth: 56,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  dateChipActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  dateDayText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  dateDateText: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginVertical: 2 },
  dateMonthText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  dateTextActive: { color: '#fff' },

  // Slots
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: {
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  slotChipActive: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  slotText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  slotTextActive: { color: '#fff' },

  // Fee summary
  feeSummary: {
    margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  feeLabel: { fontSize: 14, color: '#6B7280' },
  feeValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  feeTotalRow: {
    borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, marginBottom: 0,
  },
  feeTotalLabel: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  feeTotalValue: { fontSize: 16, fontWeight: '800', color: '#EF4444' },

  // Bottom bar
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 16, paddingBottom: 24,
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 6,
  },
  bookBtn: { borderRadius: 14, overflow: 'hidden' },
  bookBtnDisabled: { opacity: 0.7 },
  bookBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 15,
  },
  bookBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Confirmation modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  confirmCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    alignItems: 'center', width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 10,
  },
  confirmIconBg: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  confirmTitle: { fontSize: 22, fontWeight: '800', color: '#1F2937', marginBottom: 6 },
  confirmSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  confirmDetails: {
    width: '100%', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 20,
  },
  confirmRow: {
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10,
  },
  confirmRowIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  confirmRowLabel: { fontSize: 12, color: '#6B7280', width: 90, paddingTop: 5 },
  confirmRowValue: { fontSize: 13, fontWeight: '600', color: '#1F2937', flex: 1, paddingTop: 5 },
  confirmDoneBtn: {
    backgroundColor: '#EF4444', paddingVertical: 14, paddingHorizontal: 48, borderRadius: 14,
  },
  confirmDoneText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
