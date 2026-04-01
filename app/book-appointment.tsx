import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { hospitalAPI } from '../utils/api';
import * as DocumentPicker from 'expo-document-picker';

// ─── Constants ────────────────────────────────────────────────────────────────
// Static slots removed in favor of dynamic generation

function getNextDays(count: number) {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Force IST (UTC+5:30) regardless of device local timezone
  const now = new Date();
  const istMillis = now.getTime() + (5.5 * 3600000);
  const istToday = new Date(istMillis);

  for (let i = 0; i < count; i++) {
    const d = new Date(istToday);
    d.setUTCDate(istToday.getUTCDate() + i);
    
    // Extract IST components using UTC getters on the shifted object
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const localKey = `${year}-${month}-${day}`;

    days.push({
      key: localKey,
      day: dayNames[d.getUTCDay()],
      date: d.getUTCDate(),
      month: monthNames[d.getUTCMonth()],
    });
  }
  return days;
}




// Top-level constant was removed to prevent staleness across midnight


// ─── Doctor type ─────────────────────────────────────────────────────────────
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  experience?: string;
  rating?: number;
  avatar?: string;
  available: boolean;
  specialty_id?: string;
  specialties?: { name: string };
}

function mapApiDoctor(d: any): Doctor {
  return {
    id: d.id,
    name: d.name,
    specialization: d.specialties?.name || d.specialty || 'General Physician',
    hospital: d.hospital || 'Mission Hospital, Civil Lines, Bareilly',
    experience: d.experience || '',
    rating: d.rating || 4.8,
    avatar: d.image || d.avatar || d.photo_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=EF4444&color=fff&size=128`,
    available: d.is_active !== false,
    specialty_id: d.specialty_id,
    specialties: d.specialties,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function BookAppointmentScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();
  const { user } = useAuthStore();

  // ── State ──
  const [step, setStep] = useState<'list' | 'book'>('list');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [doctorError, setDoctorError] = useState<string | null>(null);

  // ── Helper to map age_group to numeric age ──
  const getInitialAge = (group?: string) => {
    if (!group) return '25';
    // Handle both hyphen types
    const normalizedGroup = group.replace('–', '-');
    if (normalizedGroup.includes('18')) return '21';
    if (normalizedGroup.includes('25')) return '30';
    if (normalizedGroup.includes('35')) return '40';
    if (normalizedGroup.includes('45')) return '52';
    if (normalizedGroup.includes('60')) return '65';
    return '25';
  };

  // ── Date Generation ──
  const freshDates = getNextDays(7);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(freshDates[0].key);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // ── Sync Selected Date (Defensive Fix for midnight staleness) ──
  useEffect(() => {
    // If current selectedDate is NOT in the new freshDates array, reset it to TODAY
    if (freshDates.length > 0 && !freshDates.some(d => d.key === selectedDate)) {
      setSelectedDate(freshDates[0].key);
    }
  }, [freshDates, selectedDate]);

  // These stay in state to be sent to the API, but hidden from UI
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientAge, setPatientAge] = useState(getInitialAge(user?.age_group));
  const [patientGender, setPatientGender] = useState((user as any)?.gender?.toLowerCase() || 'Others');
  const [notes, setNotes] = useState('');

  // ── Dynamic Slot Generation ──
  const availableSlots = React.useMemo(() => {
    const slots = [];
    // From 9:00 AM (540 mins) to 5:00 PM (1020 mins)
    for (let minutes = 540; minutes <= 1020; minutes += 15) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      let displayH = h > 12 ? h - 12 : h;
      if (displayH === 0) displayH = 12; // Handle midnight/noon if ever applicable
      const slotStr = `${displayH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
      slots.push({ h, m, str: slotStr });
    }

    // Get current IST time (UTC + 5:30)
    const now = new Date();
    const istOffset = 5.5 * 3600000;
    const istNow = new Date(now.getTime() + istOffset);
    const todayKey = `${istNow.getUTCFullYear()}-${String(istNow.getUTCMonth() + 1).padStart(2, '0')}-${String(istNow.getUTCDate()).padStart(2, '0')}`;

    if (selectedDate === todayKey) {
      const currentH = istNow.getUTCHours();
      const currentM = istNow.getUTCMinutes();
      return slots.filter(s => (s.h > currentH) || (s.h === currentH && s.m > currentM)).map(s => s.str);
    }
    return slots.map(s => s.str);
  }, [selectedDate]);

  const [booking, setBooking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  // ── Document Upload State ──
  const [uploading, setUploading] = useState(false);
  const [docTab, setDocTab] = useState<'medical' | 'prescription' | 'imaging'>('medical');
  const [medicalDocs, setMedicalDocs] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [prescriptionDocs, setPrescriptionDocs] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [imagingDocs, setImagingDocs] = useState<DocumentPicker.DocumentPickerAsset[]>([]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: true,
      });

      if (!result.canceled) {
        if (docTab === 'medical') setMedicalDocs([...medicalDocs, ...result.assets]);
        else if (docTab === 'prescription') setPrescriptionDocs([...prescriptionDocs, ...result.assets]);
        else if (docTab === 'imaging') setImagingDocs([...imagingDocs, ...result.assets]);
      }
    } catch (err) {
      console.error('Pick error:', err);
    }
  };

  const removeDoc = (category: string, index: number) => {
    if (category === 'medical') setMedicalDocs(medicalDocs.filter((_, i) => i !== index));
    else if (category === 'prescription') setPrescriptionDocs(prescriptionDocs.filter((_, i) => i !== index));
    else if (category === 'imaging') setImagingDocs(imagingDocs.filter((_, i) => i !== index));
  };

  // ── Load doctors on mount ──
  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoadingDoctors(true);
      setDoctorError(null);
      const data = await hospitalAPI.getDoctors();
      setDoctors(data.map(mapApiDoctor));
    } catch (err: any) {
      console.error('Failed to load doctors:', err);
      setDoctorError('Could not load doctors. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    if (!doctor.available) return;
    setSelectedDoctor(doctor);
    setSelectedDate(freshDates[0].key);
    setSelectedSlot(null);
    setPatientName(user?.name || '');
    setPatientPhone(user?.phone || '');
    setNotes('');
    setStep('book');
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !selectedDoctor) return;
    if (!patientName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    setBooking(true);
    try {
      // 1. Upload Documents
      const uploadCategory = async (docs: DocumentPicker.DocumentPickerAsset[]) => {
        const urls: string[] = [];
        for (const doc of docs) {
          const res = await hospitalAPI.uploadDocument({
            uri: doc.uri,
            name: doc.name,
            type: doc.mimeType || 'application/octet-stream',
          }, user?.citizen_id || user?.id || 'guest');
          urls.push(res.url);
        }
        return urls;
      };

      const [mUrls, pUrls, iUrls] = await Promise.all([
        uploadCategory(medicalDocs),
        uploadCategory(prescriptionDocs),
        uploadCategory(imagingDocs),
      ]);

      const result = await hospitalAPI.bookOpdOnline({
        patientName: patientName.trim(),
        citizenId: user?.citizen_id,
        phone: patientPhone.trim() || user?.phone,
        age: patientAge,
        gender: patientGender,
        address: (user as any)?.address || (user?.ward ? `Ward: ${user.ward}` : 'PGF Area'),
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialization,
        date: selectedDate,
        time: selectedSlot,
        notes: notes.trim() || undefined,
        medicalReports: mUrls,
        prescriptions: pUrls,
        imaging: iUrls,
      });

      setBookedAppointment(result.appointment);
      setShowConfirm(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to book appointment. Please try again.';
      Alert.alert('Booking Failed', msg);
    } finally {
      setBooking(false);
    }
  };

  const handleConfirmDone = () => {
    setShowConfirm(false);
    router.back();
  };

  // ── Doctor List Screen ──
  if (step === 'list') {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Ionicons name="medical" size={48} color="#fff" />
            <Text style={styles.headerTitle}>{t('bookAppointmentEx')}</Text>
            <Text style={styles.headerSubtitle}>{t('chooseDoctorSchedule')}</Text>
          </View>
        </LinearGradient>

        {loadingDoctors ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#EF4444" />
            <Text style={styles.centerText}>Loading doctors...</Text>
          </View>
        ) : doctorError ? (
          <View style={styles.centerState}>
            <Ionicons name="wifi-outline" size={48} color="#9CA3AF" />
            <Text style={styles.centerText}>{doctorError}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadDoctors}>
              <Text style={styles.retryBtnText}>{t('tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        ) : doctors.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="person-outline" size={48} color="#9CA3AF" />
            <Text style={styles.centerText}>No doctors available at the moment.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadDoctors}>
              <Text style={styles.retryBtnText}>{t('tryAgain')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={doctors}
            keyExtractor={(d) => d.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: doctor }) => (
              <TouchableOpacity
                style={[styles.doctorCard, !doctor.available && styles.doctorCardDisabled]}
                onPress={() => handleSelectDoctor(doctor)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: doctor.avatar }}
                  style={styles.avatar}
                  defaultSource={{ uri: `https://ui-avatars.com/api/?name=Doctor&background=EF4444&color=fff` }}
                />
                <View style={styles.doctorInfo}>
                  <View style={styles.doctorNameRow}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    {!doctor.available && (
                      <View style={styles.unavailableBadge}>
                        <Text style={styles.unavailableText}>{t('unavailable')}</Text>
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
                      <Text style={styles.metaText}>{doctor.rating?.toFixed(1) || '4.8'}</Text>
                    </View>
                    {!!doctor.experience && (
                      <View style={styles.metaItem}>
                        <Ionicons name="briefcase-outline" size={13} color="#6B7280" />
                        <Text style={styles.metaText}>{doctor.experience}</Text>
                      </View>
                    )}
                  </View>
                </View>
                {doctor.available && (
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={{ alignSelf: 'center' }} />
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    );
  }

  // ── Booking Form Screen ──
  const selectedDateObj = freshDates.find(d => d.key === selectedDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.bookingHeader}>
        <TouchableOpacity onPress={() => setStep('list')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bookingHeaderTitle}>{t('selectDateTime')}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Selected Doctor Card */}
        <View style={styles.selectedDoctorCard}>
          <Image source={{ uri: selectedDoctor!.avatar }} style={styles.selectedAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.selectedDoctorName}>{selectedDoctor!.name}</Text>
            <Text style={styles.selectedSpec}>{selectedDoctor!.specialization}</Text>
            <View style={styles.hospitalRow}>
              <Ionicons name="location-outline" size={12} color="#6B7280" />
              <Text style={styles.hospitalText} numberOfLines={2}>{selectedDoctor!.hospital}</Text>
            </View>
          </View>
        </View>

        {/* Patient Info Summary */}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <View style={styles.inputWrapper}>
              <Ionicons name="document-text-outline" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Describe your symptoms / notes..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>
          {user?.citizen_id && (
            <View style={styles.citizenBadge}>
              <Ionicons name="shield-checkmark-outline" size={14} color="#10B981" />
              <Text style={styles.citizenBadgeText}>Citizen ID: {user.citizen_id}</Text>
            </View>
          )}
        </View>


        {/* Date Picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('selectDate')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
            {freshDates.map((d) => (
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
          <Text style={styles.sectionTitle}>{t('selectTimeSlot')}</Text>
          <View style={styles.slotsGrid}>
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]}
                  onPress={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
                >
                  <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noSlotsContainer}>
                <Ionicons name="time-outline" size={24} color="#9CA3AF" />
                <Text style={styles.noSlotsText}>{t('noSlotsAvailableToday') || 'No slots available for today'}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Document Upload Tabs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('uploadDocuments')}</Text>
          <Text style={styles.docSubtitle}>{t('viewableByDoctorNote')}</Text>

          <View style={styles.docTabs}>
            <TouchableOpacity
              style={[styles.docTab, docTab === 'medical' && styles.docTabActive]}
              onPress={() => setDocTab('medical')}
            >
              <Text style={[styles.docTabText, docTab === 'medical' && styles.docTabTextActive]}>{t('medicalReport')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.docTab, docTab === 'prescription' && styles.docTabActive]}
              onPress={() => setDocTab('prescription')}
            >
              <Text style={[styles.docTabText, docTab === 'prescription' && styles.docTabTextActive]}>{t('prescription')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.docTab, docTab === 'imaging' && styles.docTabActive]}
              onPress={() => setDocTab('imaging')}
            >
              <Text style={[styles.docTabText, docTab === 'imaging' && styles.docTabTextActive]}>{t('imaging')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.docTabContent}>
            {/* Show selected files for active tab */}
            {(docTab === 'medical' ? medicalDocs : docTab === 'prescription' ? prescriptionDocs : imagingDocs).map((doc, idx) => (
              <View key={idx} style={styles.fileRow}>
                <View style={styles.fileInfo}>
                  <Ionicons name={doc.mimeType?.includes('pdf') ? 'document-text' : 'image'} size={20} color="#6B7280" />
                  <Text style={styles.fileName} numberOfLines={1}>{doc.name}</Text>
                </View>
                <TouchableOpacity onPress={() => removeDoc(docTab, idx)}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addDocBtn} onPress={handlePickDocument}>
              <Ionicons name="add-circle-outline" size={24} color="#EF4444" />
              <Text style={styles.addDocBtnText}>{t('addDocument')}</Text>
            </TouchableOpacity>
            <Text style={styles.maxFilesHint}>{t('maxFilesNote')}</Text>
          </View>
        </View>


        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Book Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.bookBtn, (!selectedSlot || booking) && styles.bookBtnDisabled]}
          onPress={handleBookAppointment}
          disabled={!selectedSlot || booking}
        >
          <LinearGradient
            colors={selectedSlot && !booking ? ['#EF4444', '#DC2626'] : ['#D1D5DB', '#D1D5DB']}
            style={styles.bookBtnGradient}
          >
            {booking ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="calendar-outline" size={20} color="#fff" />
            )}
            <Text style={styles.bookBtnText}>
              {booking
                ? 'Booking...'
                : selectedSlot
                  ? `${t('bookAppointmentEx')} · ${selectedSlot}`
                  : t('selectATimeSlot')}
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
            <Text style={styles.confirmTitle}>{t('appointmentBooked')}</Text>
            <Text style={styles.confirmSubtitle}>{t('appointmentConfirmed')}</Text>

            <View style={styles.confirmDetails}>
              <ConfirmRow icon="person-outline" label={t('doctor')} value={selectedDoctor!.name} />
              <ConfirmRow icon="medical-outline" label={t('specialization')} value={selectedDoctor!.specialization} />
              <ConfirmRow icon="business-outline" label={t('hospital')} value={selectedDoctor!.hospital} />
              <ConfirmRow
                icon="calendar-outline"
                label={t('date')}
                value={`${selectedDateObj?.day}, ${selectedDateObj?.date} ${selectedDateObj?.month}`}
              />
              <ConfirmRow icon="time-outline" label={t('time')} value={selectedSlot!} />
              {bookedAppointment?.id && (
                <ConfirmRow icon="barcode-outline" label="Appointment ID" value={bookedAppointment.id} />
              )}
            </View>

            <TouchableOpacity style={styles.confirmDoneBtn} onPress={handleConfirmDone}>
              <Text style={styles.confirmDoneText}>{t('close')}</Text>
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

  // Center states (loading / error / empty)
  centerState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32,
  },
  centerText: {
    fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 12,
  },
  retryBtn: {
    marginTop: 20, backgroundColor: '#EF4444', paddingHorizontal: 32,
    paddingVertical: 12, borderRadius: 12,
  },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

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

  // Patient info
  inputGroup: { gap: 10, marginBottom: 10 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  textInput: {
    flex: 1, paddingVertical: 12, fontSize: 14, color: '#1F2937',
  },
  citizenBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F0FDF4', padding: 10, borderRadius: 10,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  citizenBadgeText: { fontSize: 12, color: '#059669', fontWeight: '600' },

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

  // Document Upload Styles
  docSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 12, marginTop: -8 },
  docTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12
  },
  docTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  docTabActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  docTabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  docTabTextActive: { color: '#EF4444' },
  docTabContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  fileInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  fileName: { fontSize: 13, color: '#374151', flex: 1 },
  addDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#FEE2E2',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8
  },
  addDocBtnText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  maxFilesHint: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
  noSlotsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
    width: '100%',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
