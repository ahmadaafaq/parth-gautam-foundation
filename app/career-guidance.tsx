import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Mock Data ──────────────────────────────────────────────────────────────────
const CONSULTANTS = [
  {
    id: '1',
    name: 'Vikram Malhotra',
    specialization: 'IT & Software Careers',
    experience: '10 years',
    rating: 4.9,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop',
    online: true,
    inPerson: true,
    languages: 'Hindi, English',
  },
  {
    id: '2',
    name: 'Deepika Sharma',
    specialization: 'Government Jobs & UPSC',
    experience: '8 years',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=200&h=200&fit=crop',
    online: true,
    inPerson: false,
    languages: 'Hindi, English',
  },
  {
    id: '3',
    name: 'Rajesh Tiwari',
    specialization: 'Entrepreneurship & Business',
    experience: '15 years',
    rating: 4.7,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop',
    online: true,
    inPerson: true,
    languages: 'Hindi',
  },
  {
    id: '4',
    name: 'Kavita Nair',
    specialization: 'Creative Arts & Design',
    experience: '7 years',
    rating: 4.6,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    online: true,
    inPerson: true,
    languages: 'Hindi, English, Marathi',
  },
  {
    id: '5',
    name: 'Suresh Pandey',
    specialization: 'Banking & Finance',
    experience: '12 years',
    rating: 4.8,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    online: false,
    inPerson: true,
    languages: 'Hindi, English',
  },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

function getNextDays(count: number) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      key: d.toISOString().split('T')[0],
      day: dayNames[d.getDay()],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
    };
  });
}

const DATES = getNextDays(7);

// ─── Helper: Confirm Row ────────────────────────────────────────────────────────
function ConfirmRow({ icon, label, value, accent = '#8B5CF6' }: { icon: string; label: string; value: string; accent?: string }) {
  return (
    <View style={styles.confirmRow}>
      <View style={[styles.confirmRowIcon, { backgroundColor: accent + '20' }]}>
        <Ionicons name={icon as any} size={16} color={accent} />
      </View>
      <Text style={styles.confirmRowLabel}>{label}</Text>
      <Text style={styles.confirmRowValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
type Step = 'list' | 'mode' | 'schedule';

export default function CareerGuidanceScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('list');
  const [selected, setSelected] = useState<typeof CONSULTANTS[0] | null>(null);
  const [mode, setMode] = useState<'online' | 'inperson' | null>(null);
  const [selectedDate, setSelectedDate] = useState(DATES[0].key);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSelectConsultant = (c: typeof CONSULTANTS[0]) => {
    setSelected(c);
    setMode(null);
    setSelectedDate(DATES[0].key);
    setSelectedSlot(null);
    setStep('mode');
  };

  const handleSelectMode = (m: 'online' | 'inperson') => {
    setMode(m);
    setStep('schedule');
  };

  const handleBook = () => {
    if (!selectedSlot) return;
    setShowConfirm(true);
  };

  const handleDone = () => {
    setShowConfirm(false);
    router.back();
  };

  const selectedDateObj = DATES.find((d) => d.key === selectedDate);

  // ── Consultant List ──
  if (step === 'list') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="briefcase" size={44} color="#fff" />
            <Text style={styles.headerTitle}>Career Guidance</Text>
            <Text style={styles.headerSubtitle}>Book a session with an expert consultant</Text>
          </View>
        </LinearGradient>

        <FlatList
          data={CONSULTANTS}
          keyExtractor={(c) => c.id}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <Text style={styles.sectionTitleList}>Our Expert Consultants</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleSelectConsultant(item)}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.cardInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.name}</Text>
                  <View style={[styles.onlineBadge, !item.online && styles.offlineBadge]}>
                    <View style={[styles.dot, !item.online && styles.offDot]} />
                    <Text style={[styles.onlineText, !item.online && styles.offlineText]}>
                      {item.online ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.spec}>{item.specialization}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="star" size={13} color="#F59E0B" />
                  <Text style={styles.metaText}>{item.rating}</Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.metaText}>{item.experience}</Text>
                </View>
                <View style={styles.modeChips}>
                  {item.online && (
                    <View style={styles.modeChip}>
                      <Ionicons name="videocam-outline" size={11} color="#3B82F6" />
                      <Text style={styles.modeChipText}>Online</Text>
                    </View>
                  )}
                  {item.inPerson && (
                    <View style={[styles.modeChip, { backgroundColor: '#F0FDF4' }]}>
                      <Ionicons name="location-outline" size={11} color="#10B981" />
                      <Text style={[styles.modeChipText, { color: '#10B981' }]}>In-Person</Text>
                    </View>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ alignSelf: 'center' }} />
            </TouchableOpacity>
          )}
        />
      </SafeAreaView>
    );
  }

  // ── Mode Selection ──
  if (step === 'mode') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.bookingHeader}>
          <TouchableOpacity onPress={() => setStep('list')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.bookingHeaderTitle}>Choose Session Type</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Consultant card */}
          <View style={styles.selectedCard}>
            <Image source={{ uri: selected!.avatar }} style={styles.selectedAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedName}>{selected!.name}</Text>
              <Text style={styles.selectedSpec}>{selected!.specialization}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.metaText}>{selected!.rating}  •  {selected!.experience}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>How would you like to connect?</Text>

          {selected!.online && (
            <TouchableOpacity style={styles.modeCard} onPress={() => handleSelectMode('online')} activeOpacity={0.85}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.modeIconBg}>
                <Ionicons name="videocam" size={28} color="#fff" />
              </LinearGradient>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>Online Consultation</Text>
                <Text style={styles.modeDesc}>Video call session from the comfort of your home</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {selected!.inPerson && (
            <TouchableOpacity style={styles.modeCard} onPress={() => handleSelectMode('inperson')} activeOpacity={0.85}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.modeIconBg}>
                <Ionicons name="location" size={28} color="#fff" />
              </LinearGradient>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>In-Person Session</Text>
                <Text style={styles.modeDesc}>Meet face-to-face at the foundation's career centre</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Schedule ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.bookingHeader}>
        <TouchableOpacity onPress={() => setStep('mode')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bookingHeaderTitle}>Select Date & Time</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Consultant */}
        <View style={styles.selectedCard}>
          <Image source={{ uri: selected!.avatar }} style={styles.selectedAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedName}>{selected!.name}</Text>
            <Text style={styles.selectedSpec}>{selected!.specialization}</Text>
            <View style={[styles.sessionTypeBadge, mode === 'online' ? { backgroundColor: '#EFF6FF' } : { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name={mode === 'online' ? 'videocam-outline' : 'location-outline'} size={12} color={mode === 'online' ? '#3B82F6' : '#10B981'} />
              <Text style={[styles.sessionTypeText, { color: mode === 'online' ? '#3B82F6' : '#10B981' }]}>
                {mode === 'online' ? 'Online Session' : 'In-Person Session'}
              </Text>
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
          onPress={handleBook}
          disabled={!selectedSlot}
        >
          <LinearGradient
            colors={selectedSlot ? ['#8B5CF6', '#7C3AED'] : ['#D1D5DB', '#D1D5DB']}
            style={styles.bookBtnGradient}
          >
            <Ionicons name={mode === 'online' ? 'videocam-outline' : 'location-outline'} size={20} color="#fff" />
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
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.confirmIconBg}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.confirmTitle}>Session Booked!</Text>
            <Text style={styles.confirmSubtitle}>Your career guidance session has been confirmed.</Text>
            <View style={styles.confirmDetails}>
              <ConfirmRow icon="person-outline" label="Consultant" value={selected!.name} />
              <ConfirmRow icon="briefcase-outline" label="Specialization" value={selected!.specialization} />
              <ConfirmRow
                icon={mode === 'online' ? 'videocam-outline' : 'location-outline'}
                label="Session Type"
                value={mode === 'online' ? 'Online Consultation' : 'In-Person Session'}
              />
              <ConfirmRow
                icon="calendar-outline"
                label="Date"
                value={`${selectedDateObj?.day}, ${selectedDateObj?.date} ${selectedDateObj?.month}`}
              />
              <ConfirmRow icon="time-outline" label="Time" value={selectedSlot!} />
            </View>
            <TouchableOpacity style={styles.confirmDoneBtn} onPress={handleDone}>
              <Text style={styles.confirmDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  // ── Mode Selection ──
  if (step === 'mode') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.bookingHeader}>
          <TouchableOpacity onPress={() => setStep('list')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.bookingHeaderTitle}>Choose Session Type</Text>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Consultant card */}
          <View style={styles.selectedCard}>
            <Image source={{ uri: selected!.avatar }} style={styles.selectedAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selectedName}>{selected!.name}</Text>
              <Text style={styles.selectedSpec}>{selected!.specialization}</Text>
              <View style={styles.metaRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.metaText}>{selected!.rating}  •  {selected!.experience}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>How would you like to connect?</Text>

          {selected!.online && (
            <TouchableOpacity style={styles.modeCard} onPress={() => handleSelectMode('online')} activeOpacity={0.85}>
              <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.modeIconBg}>
                <Ionicons name="videocam" size={28} color="#fff" />
              </LinearGradient>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>Online Consultation</Text>
                <Text style={styles.modeDesc}>Video call session from the comfort of your home</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {selected!.inPerson && (
            <TouchableOpacity style={styles.modeCard} onPress={() => handleSelectMode('inperson')} activeOpacity={0.85}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.modeIconBg}>
                <Ionicons name="location" size={28} color="#fff" />
              </LinearGradient>
              <View style={styles.modeInfo}>
                <Text style={styles.modeTitle}>In-Person Session</Text>
                <Text style={styles.modeDesc}>Meet face-to-face at the foundation's career centre</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Schedule ──
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.bookingHeader}>
        <TouchableOpacity onPress={() => setStep('mode')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bookingHeaderTitle}>Select Date & Time</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Consultant */}
        <View style={styles.selectedCard}>
          <Image source={{ uri: selected!.avatar }} style={styles.selectedAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedName}>{selected!.name}</Text>
            <Text style={styles.selectedSpec}>{selected!.specialization}</Text>
            <View style={[styles.sessionTypeBadge, mode === 'online' ? { backgroundColor: '#EFF6FF' } : { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name={mode === 'online' ? 'videocam-outline' : 'location-outline'} size={12} color={mode === 'online' ? '#3B82F6' : '#10B981'} />
              <Text style={[styles.sessionTypeText, { color: mode === 'online' ? '#3B82F6' : '#10B981' }]}>
                {mode === 'online' ? 'Online Session' : 'In-Person Session'}
              </Text>
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
          onPress={handleBook}
          disabled={!selectedSlot}
        >
          <LinearGradient
            colors={selectedSlot ? ['#8B5CF6', '#7C3AED'] : ['#D1D5DB', '#D1D5DB']}
            style={styles.bookBtnGradient}
          >
            <Ionicons name={mode === 'online' ? 'videocam-outline' : 'location-outline'} size={20} color="#fff" />
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
            <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.confirmIconBg}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </LinearGradient>
            <Text style={styles.confirmTitle}>Session Booked!</Text>
            <Text style={styles.confirmSubtitle}>Your career guidance session has been confirmed.</Text>
            <View style={styles.confirmDetails}>
              <ConfirmRow icon="person-outline" label="Consultant" value={selected!.name} />
              <ConfirmRow icon="briefcase-outline" label="Specialization" value={selected!.specialization} />
              <ConfirmRow
                icon={mode === 'online' ? 'videocam-outline' : 'location-outline'}
                label="Session Type"
                value={mode === 'online' ? 'Online Consultation' : 'In-Person Session'}
              />
              <ConfirmRow
                icon="calendar-outline"
                label="Date"
                value={`${selectedDateObj?.day}, ${selectedDateObj?.date} ${selectedDateObj?.month}`}
              />
              <ConfirmRow icon="time-outline" label="Time" value={selectedSlot!} />
            </View>
            <TouchableOpacity style={styles.confirmDoneBtn} onPress={handleDone}>
              <Text style={styles.confirmDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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

  // List header
  sectionTitleList: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12, paddingHorizontal: 16, marginTop: 4 },

  // Consultant card
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 14,
    marginBottom: 12, marginHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  avatar: { width: 68, height: 68, borderRadius: 34, marginRight: 14, backgroundColor: '#E5E7EB' },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  name: { fontSize: 15, fontWeight: '700', color: '#1F2937', flex: 1 },
  spec: { fontSize: 13, color: '#8B5CF6', fontWeight: '600', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  metaText: { fontSize: 12, color: '#6B7280' },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#D1D5DB' },
  modeChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  modeChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#EFF6FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
  modeChipText: { fontSize: 10, fontWeight: '700', color: '#3B82F6' },
  onlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2,
  },
  offlineBadge: { backgroundColor: '#F3F4F6' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  offDot: { backgroundColor: '#9CA3AF' },
  onlineText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
  offlineText: { color: '#9CA3AF' },

  // Selected consultant card
  selectedCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 14, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  selectedAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E5E7EB' },
  selectedName: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  selectedSpec: { fontSize: 13, color: '#8B5CF6', fontWeight: '600', marginBottom: 6 },
  sessionTypeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start',
  },
  sessionTypeText: { fontSize: 11, fontWeight: '700' },

  // Mode cards
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 12, paddingHorizontal: 16 },
  modeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 16, padding: 16, marginBottom: 14, gap: 14, marginHorizontal: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  modeIconBg: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  modeInfo: { flex: 1 },
  modeTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  modeDesc: { fontSize: 12, color: '#6B7280', lineHeight: 17 },

  // Date & slots
  section: { paddingHorizontal: 16, marginBottom: 8 },
  dateRow: { gap: 10, paddingBottom: 4 },
  dateChip: {
    alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 14, backgroundColor: '#fff', minWidth: 56,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  dateChipActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  dateDayText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  dateDateText: { fontSize: 20, fontWeight: '800', color: '#1F2937', marginVertical: 2 },
  dateMonthText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  dateTextActive: { color: '#fff' },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: {
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  slotChipActive: { backgroundColor: '#8B5CF6', borderColor: '#8B5CF6' },
  slotText: { fontSize: 13, color: '#374151', fontWeight: '600' },
  slotTextActive: { color: '#fff' },

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

  // Modal
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
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  confirmRowLabel: { fontSize: 12, color: '#6B7280', width: 90, paddingTop: 5 },
  confirmRowValue: { fontSize: 13, fontWeight: '600', color: '#1F2937', flex: 1, paddingTop: 5 },
  confirmDoneBtn: { backgroundColor: '#8B5CF6', paddingVertical: 14, paddingHorizontal: 48, borderRadius: 14 },
  confirmDoneText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
