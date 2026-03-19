import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Mock Doctors ─────────────────────────────────────────────────────────────
const DOCTORS = [
  {
    id: '1',
    name: 'Dr. Anjali Sharma',
    specialization: 'General Physician',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '12 years',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&h=200&auto=format&fit=crop',
    online: true,
  },
  {
    id: '2',
    name: 'Dr. Rakesh Gupta',
    specialization: 'Cardiologist',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '18 years',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop',
    online: false,
  },
  {
    id: '3',
    name: 'Dr. Priya Verma',
    specialization: 'Paediatrician',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '9 years',
    rating: 4.7,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=200&h=200&auto=format&fit=crop',
    online: true,
  },
  {
    id: '4',
    name: 'Dr. Meena Tiwari',
    specialization: 'Gynaecologist',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '15 years',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop',
    online: true,
  },
  {
    id: '5',
    name: 'Dr. Amit Saxena',
    specialization: 'Dermatologist',
    hospital: 'Mission Hospital, Civil Lines, Bareilly',
    experience: '10 years',
    rating: 4.6,
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&h=200&auto=format&fit=crop',
    online: false,
  },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

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

// ─── Mock Video Call Screen ───────────────────────────────────────────────────
function VideoCallScreen({ doctor, onEnd }: { doctor: typeof DOCTORS[0]; onEnd: () => void }) {
  const [callTime, setCallTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setInterval(() => setCallTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <View style={vcStyles.container}>
      {/* Remote video (doctor) — blurred gradient simulating a video */}
      <LinearGradient colors={['#0F172A', '#1E3A5F', '#0F172A']} style={vcStyles.remoteVideo}>
        <Image source={{ uri: doctor.avatar }} style={vcStyles.doctorVideoAvatar} />
        <Text style={vcStyles.doctorVideoName}>{doctor.name}</Text>
        <Text style={vcStyles.doctorVideoSpec}>{doctor.specialization}</Text>
      </LinearGradient>

      {/* Call timer */}
      <View style={vcStyles.timerBadge}>
        <View style={vcStyles.liveDot} />
        <Text style={vcStyles.timerText}>{formatTime(callTime)}</Text>
      </View>

      {/* Self-preview (bottom-right corner) */}
      {!camOff ? (
        <View style={vcStyles.selfPreview}>
          <LinearGradient colors={['#374151', '#1F2937']} style={vcStyles.selfGradient}>
            <Ionicons name="person" size={28} color="#9CA3AF" />
            <Text style={vcStyles.youText}>You</Text>
          </LinearGradient>
        </View>
      ) : (
        <View style={[vcStyles.selfPreview, { backgroundColor: '#111' }]}>
          <Ionicons name="videocam-off" size={20} color="#6B7280" />
        </View>
      )}

      {/* Bottom controls */}
      <View style={vcStyles.controls}>
        <TouchableOpacity
          style={[vcStyles.controlBtn, muted && vcStyles.controlBtnActive]}
          onPress={() => setMuted(!muted)}
        >
          <Ionicons name={muted ? 'mic-off' : 'mic'} size={24} color={muted ? '#EF4444' : '#fff'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[vcStyles.controlBtn, camOff && vcStyles.controlBtnActive]}
          onPress={() => setCamOff(!camOff)}
        >
          <Ionicons name={camOff ? 'videocam-off' : 'videocam'} size={24} color={camOff ? '#EF4444' : '#fff'} />
        </TouchableOpacity>

        {/* End call */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity style={vcStyles.endCallBtn} onPress={onEnd}>
            <Ionicons name="call" size={28} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={vcStyles.controlBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={vcStyles.controlBtn}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Teleconsultation Component ─────────────────────────────────────────
export default function TeleconsultationScreen() {
  const router = useRouter();

  // Step: 'list' | 'mode' | 'schedule' | 'videocall'
  const [step, setStep] = useState<'list' | 'mode' | 'schedule' | 'videocall'>('list');
  const [selectedDoctor, setSelectedDoctor] = useState<typeof DOCTORS[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState(DATES[0].key);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCallEnded, setShowCallEnded] = useState(false);

  const handleSelectDoctor = (doctor: typeof DOCTORS[0]) => {
    setSelectedDoctor(doctor);
    setSelectedDate(DATES[0].key);
    setSelectedSlot(null);
    setStep('mode');
  };

  const handleInstant = () => setStep('videocall');
  const handleSchedule = () => setStep('schedule');

  const handleBook = () => {
    if (!selectedSlot) return;
    setShowConfirm(true);
  };

  const handleConfirmDone = () => {
    setShowConfirm(false);
    router.back();
  };

  const handleEndCall = () => {
    setShowCallEnded(true);
  };

  const handleCallEndedDone = () => {
    setShowCallEnded(false);
    router.back();
  };

  // ── Video Call ──
  if (step === 'videocall') {
    return (
      <>
        <VideoCallScreen doctor={selectedDoctor!} onEnd={handleEndCall} />
        {/* Call ended modal */}
        <Modal visible={showCallEnded} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.confirmCard}>
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.confirmIconBg}>
                <Ionicons name="call" size={36} color="#fff" />
              </LinearGradient>
              <Text style={styles.confirmTitle}>Call Ended</Text>
              <Text style={styles.confirmSubtitle}>Your teleconsultation session has ended.</Text>
              <View style={styles.confirmDetails}>
                <ConfirmRow icon="person-outline" label="Doctor" value={selectedDoctor!.name} />
                <ConfirmRow icon="medical-outline" label="Specialization" value={selectedDoctor!.specialization} />
                <ConfirmRow icon="time-outline" label="Type" value="Instant Consultation" />
              </View>
              <TouchableOpacity style={styles.confirmDoneBtn} onPress={handleCallEndedDone}>
                <Text style={styles.confirmDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // ── Doctor List ──
  if (step === 'list') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="videocam" size={42} color="#fff" />
            <Text style={styles.headerTitle}>Teleconsultation</Text>
            <Text style={styles.headerSubtitle}>Consult a doctor from anywhere</Text>
          </View>
        </LinearGradient>

        <FlatList
          data={DOCTORS}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: doctor }) => (
            <TouchableOpacity
              style={styles.doctorCard}
              onPress={() => handleSelectDoctor(doctor)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: doctor.avatar }} style={styles.avatar} />
              <View style={styles.doctorInfo}>
                <View style={styles.doctorNameRow}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <View style={[styles.onlineBadge, !doctor.online && styles.offlineBadge]}>
                    <View style={[styles.onlineDot, !doctor.online && styles.offlineDot]} />
                    <Text style={[styles.onlineText, !doctor.online && styles.offlineText]}>
                      {doctor.online ? 'Online' : 'Offline'}
                    </Text>
                  </View>
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
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ alignSelf: 'center' }} />
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // ── Consultation Mode ──
  if (step === 'mode') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.bookingHeader}>
          <TouchableOpacity onPress={() => setStep('list')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.bookingHeaderTitle}>Choose Consultation Type</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Doctor card */}
          <View style={styles.selectedDoctorCard}>
            <Image source={{ uri: selectedDoctor!.avatar }} style={styles.selectedAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedDoctorName}>{selectedDoctor!.name}</Text>
              <Text style={[styles.selectedSpec, { color: '#10B981' }]}>{selectedDoctor!.specialization}</Text>
              <View style={styles.hospitalRow}>
                <Ionicons name="location-outline" size={12} color="#6B7280" />
                <Text style={styles.hospitalText} numberOfLines={1}>{selectedDoctor!.hospital}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>How would you like to consult?</Text>

          {/* Instant */}
          <TouchableOpacity style={styles.modeCard} onPress={handleInstant} activeOpacity={0.85}>
            <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.modeIconBg}>
              <Ionicons name="flash" size={28} color="#fff" />
            </LinearGradient>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Instant Consultation</Text>
              <Text style={styles.modeDesc}>Connect with the doctor right now via video call</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Scheduled */}
          <TouchableOpacity style={styles.modeCard} onPress={handleSchedule} activeOpacity={0.85}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.modeIconBg}>
              <Ionicons name="calendar" size={28} color="#fff" />
            </LinearGradient>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Scheduled Consultation</Text>
              <Text style={styles.modeDesc}>Pick a date and time for an online video consultation</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Schedule Form ──
  const selectedDateObj = DATES.find(d => d.key === selectedDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.bookingHeader}>
        <TouchableOpacity onPress={() => setStep('mode')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bookingHeaderTitle}>Select Date & Time</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Selected Doctor */}
        <View style={styles.selectedDoctorCard}>
          <Image source={{ uri: selectedDoctor!.avatar }} style={styles.selectedAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedDoctorName}>{selectedDoctor!.name}</Text>
            <Text style={[styles.selectedSpec, { color: '#10B981' }]}>{selectedDoctor!.specialization}</Text>

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
                style={[styles.slotChip, selectedSlot === slot && styles.slotChipActiveGreen]}
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
          onPress={handleBook}
          disabled={!selectedSlot}
        >
          <LinearGradient
            colors={selectedSlot ? ['#10B981', '#059669'] : ['#D1D5DB', '#D1D5DB']}
            style={styles.bookBtnGradient}
          >
            <Ionicons name="videocam-outline" size={20} color="#fff" />
            <Text style={styles.bookBtnText}>
              {selectedSlot ? `Schedule for ${selectedSlot}` : 'Select a Time Slot'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.confirmIconBg}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.confirmTitle}>Appointment Scheduled!</Text>
            <Text style={styles.confirmSubtitle}>Your online consultation has been booked.</Text>
            <View style={styles.confirmDetails}>
              <ConfirmRow icon="person-outline" label="Doctor" value={selectedDoctor!.name} />
              <ConfirmRow icon="medical-outline" label="Specialization" value={selectedDoctor!.specialization} />
              <ConfirmRow icon="videocam-outline" label="Type" value="Online Consultation" />
              <ConfirmRow
                icon="calendar-outline"
                label="Date"
                value={`${selectedDateObj?.day}, ${selectedDateObj?.date} ${selectedDateObj?.month}`}
              />
              <ConfirmRow icon="time-outline" label="Time" value={selectedSlot!} />
            </View>
            <TouchableOpacity style={[styles.confirmDoneBtn, { backgroundColor: '#10B981' }]} onPress={handleConfirmDone}>
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
      <View style={[styles.confirmRowIcon, { backgroundColor: '#D1FAE5' }]}>
        <Ionicons name={icon} size={16} color="#10B981" />
      </View>
      <Text style={styles.confirmRowLabel}>{label}</Text>
      <Text style={styles.confirmRowValue} numberOfLines={2}>{value}</Text>
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

  bookingHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 16, paddingHorizontal: 8,
  },
  bookingHeaderTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },

  doctorCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    padding: 14, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  avatar: { width: 68, height: 68, borderRadius: 34, marginRight: 14, backgroundColor: '#E5E7EB' },
  doctorInfo: { flex: 1 },
  doctorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  doctorName: { fontSize: 15, fontWeight: '700', color: '#1F2937', flex: 1 },
  onlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2,
  },
  offlineBadge: { backgroundColor: '#F3F4F6' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  offlineDot: { backgroundColor: '#9CA3AF' },
  onlineText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
  offlineText: { color: '#9CA3AF' },
  specialization: { fontSize: 13, color: '#EF4444', fontWeight: '600', marginBottom: 4 },
  hospitalRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 3, marginBottom: 6, flex: 1 },
  hospitalText: { fontSize: 11, color: '#6B7280', flex: 1 },
  doctorMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, color: '#6B7280' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB' },

  selectedDoctorCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 14, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  selectedAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E5E7EB' },
  selectedDoctorName: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  selectedSpec: { fontSize: 13, fontWeight: '600', marginBottom: 4 },

  modeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, padding: 16, marginBottom: 14, gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  modeIconBg: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  modeInfo: { flex: 1 },
  modeTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  modeDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17, marginBottom: 8 },
  modeFeeBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start',
  },
  modeFeeText: { fontSize: 12, fontWeight: '600', color: '#0284C7' },

  section: { paddingHorizontal: 16, marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12 },

  dateRow: { gap: 10, paddingBottom: 4 },
  dateChip: {
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, backgroundColor: '#fff', minWidth: 56,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  dateChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  dateDayText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  dateDateText: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginVertical: 2 },
  dateMonthText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  dateTextActive: { color: '#fff' },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: {
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  slotChipActiveGreen: { backgroundColor: '#10B981', borderColor: '#10B981' },
  slotText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  slotTextActive: { color: '#fff' },

  feeSummary: {
    margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  feeLabel: { fontSize: 14, color: '#6B7280' },
  feeValue: { fontSize: 14, color: '#1F2937', fontWeight: '600' },
  feeTotalRow: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10, marginBottom: 0 },
  feeTotalLabel: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  feeTotalValue: { fontSize: 16, fontWeight: '800' },

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
  confirmSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20, textAlign: 'center' },
  confirmDetails: {
    width: '100%', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, marginBottom: 20,
  },
  confirmRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  confirmRowIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  confirmRowLabel: { fontSize: 12, color: '#6B7280', width: 90, paddingTop: 5 },
  confirmRowValue: { fontSize: 13, fontWeight: '600', color: '#1F2937', flex: 1, paddingTop: 5 },
  confirmDoneBtn: { backgroundColor: '#EF4444', paddingVertical: 14, paddingHorizontal: 48, borderRadius: 14 },
  confirmDoneText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

// ─── Video Call Styles ────────────────────────────────────────────────────────
const vcStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  remoteVideo: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  doctorVideoAvatar: {
    width: 120, height: 120, borderRadius: 60, marginBottom: 16,
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)',
  },
  doctorVideoName: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 6 },
  doctorVideoSpec: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },

  timerBadge: {
    position: 'absolute', top: 56, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E' },
  timerText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  selfPreview: {
    position: 'absolute', bottom: 120, right: 16,
    width: 100, height: 140, borderRadius: 16,
    backgroundColor: '#1E293B', overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)',
  },
  selfGradient: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', gap: 6 },
  youText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },

  controls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingVertical: 24, paddingBottom: 44,
    backgroundColor: 'rgba(15,23,42,0.85)',
  },
  controlBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  controlBtnActive: { backgroundColor: 'rgba(239,68,68,0.2)' },
  endCallBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    transform: [{ rotate: '135deg' }],
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
});
