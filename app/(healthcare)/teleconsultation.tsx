import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Linking, Alert, TextInput } from 'react-native';
import { hospitalAPI, HOSPITAL_BASE_URL } from '../../utils/api';
import * as DocumentPicker from 'expo-document-picker';
import { FlashList } from '@shopify/flash-list';

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

const getInitialAge = (group?: string) => {
  if (!group) return '25';
  const normalizedGroup = group.replace('–', '-');
  if (normalizedGroup.includes('18')) return '21';
  if (normalizedGroup.includes('25')) return '30';
  if (normalizedGroup.includes('35')) return '40';
  if (normalizedGroup.includes('45')) return '52';
  if (normalizedGroup.includes('60')) return '65';
  return '25';
};




// Top-level constant was removed to prevent staleness across midnight


// ─── Doctor Type ─────────────────────────────────────────────────────────────
interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  experience: string;
  rating: number;
  avatar: string;
  online: boolean;
}

// ─── Mock Video Call Screen ───────────────────────────────────────────────────
function VideoCallScreen({ doctor, onEnd }: { doctor: Doctor; onEnd: () => void }) {
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
  const { t } = useLanguageStore();
  const { user } = useAuthStore();

  // ── State ──
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  // Step: 'list' | 'mode' | 'schedule' | 'videocall'
  const [step, setStep] = useState<'list' | 'mode' | 'schedule' | 'videocall'>('list');
  // ── Date Generation ──
  const freshDates = React.useMemo(() => getNextDays(7), []);

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState(freshDates[0].key);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  // ── Dynamic Slot Generation ──
  const availableSlots = React.useMemo(() => {
    const slots = [];
    // From 9:00 AM (540 mins) to 5:00 PM (1020 mins)
    for (let minutes = 540; minutes <= 1020; minutes += 15) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      const period = h >= 12 ? 'PM' : 'AM';
      let displayH = h > 12 ? h - 12 : h;
      if (displayH === 0) displayH = 12;
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

  const [fetchingAppts, setFetchingAppts] = useState(false);
  const [booking, setBooking] = useState(false);
  const [notes, setNotes] = useState('');

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

  // ── Sync Selected Date (Defensive Fix for midnight staleness) ──
  useEffect(() => {
    // If current selectedDate is NOT in the new freshDates array, reset it to TODAY
    if (freshDates.length > 0 && !freshDates.some(d => d.key === selectedDate)) {
      setSelectedDate(freshDates[0].key);
    }
  }, [freshDates, selectedDate]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showCallEnded, setShowCallEnded] = useState(false);

  useEffect(() => {
    fetchDoctors();
    if (user) {
      fetchUserAppointments();
    }
  }, [user]);

  const fetchUserAppointments = async () => {
    try {
      setFetchingAppts(true);
      const data = await hospitalAPI.getMyAppointments(user!.citizen_id);
      setUserAppointments(data || []);
    } catch (err) {
      console.error('Error fetching user appointments:', err);
    } finally {
      setFetchingAppts(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await hospitalAPI.getDoctors();
      const mapped: Doctor[] = data.map((d: any) => ({
        id: d.id,
        name: d.name,
        specialization: d.specialties?.name || d.specialty || 'General Physician',
        hospital: d.hospital || 'Mission Hospital, Civil Lines, Bareilly',
        experience: d.experience || '10+ years',
        rating: d.rating || 4.8,
        avatar: d.image ? (d.image.startsWith('http') ? d.image : `${HOSPITAL_BASE_URL}${d.image.startsWith('/') ? '' : '/'}${d.image}`) : d.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name)}&background=10B981&color=fff`,
        online: d.online ?? true,
      }));

      setDoctors(mapped);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(freshDates[0].key);
    setSelectedSlot(null);
    setStep('schedule');
  };

  const handleInstant = () => setStep('videocall');
  const handleSchedule = () => setStep('schedule');

  const handleBook = async () => {
    if (!selectedSlot || !selectedDoctor || !user) return;

    try {
      setBooking(true);

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
        patientName: user.name.trim(),
        citizenId: user.citizen_id,
        phone: user.phone.trim(),
        age: getInitialAge(user.age_group),
        gender: (user as any).gender || 'Others',
        address: (user as any).address || (user.ward ? `Ward: ${user.ward}` : 'PGF Area'),
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        specialty: selectedDoctor.specialization,
        date: selectedDate,
        time: selectedSlot,
        appointmentType: 'Online Consultation',
        notes: notes.trim() || 'Online appointment',
        medicalReports: mUrls,
        prescriptions: pUrls,
        imaging: iUrls,
      });

      if (!result.success) throw new Error(result.message || 'Booking failed');

      setBookedAppointment(result.appointment);
      fetchUserAppointments(); // Refresh list
      setShowConfirm(true);
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      const serverError = err?.response?.data;
      const msg = serverError?.message || err.message || 'Failed to book appointment. Please try again.';
      const detail = serverError?.details ? `\n\nDetails: ${serverError.details}` : '';
      Alert.alert('Booking Failed', msg + detail);
    } finally {
      setBooking(false);
    }
  };

  const handleJoinCall = (appointmentId: string) => {
    const url = `https://meet.jit.si/ParthGautamFoundation-${appointmentId}`;
    Linking.openURL(url).catch(err => {
      console.error('Error opening Jitsi URL:', err);
      Alert.alert('Error', 'Could not open video call link.');
    });
  };

  const handleConfirmDone = () => {
    setShowConfirm(false);
    router.replace('/(tabs)');
  };

  const handleEndCall = () => {
    setShowCallEnded(true);
  };

  const handleCallEndedDone = () => {
    setShowCallEnded(false);
    router.replace('/(tabs)');
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
              <Text style={styles.confirmTitle}>{t('callEnded')}</Text>
              <Text style={styles.confirmSubtitle}>{t('teleconsultationEnded')}</Text>
              <View style={styles.confirmDetails}>
                <ConfirmRow icon="person-outline" label={t('doctor')} value={selectedDoctor!.name} />
                <ConfirmRow icon="medical-outline" label={t('specialization')} value={selectedDoctor!.specialization} />
                <ConfirmRow icon="time-outline" label={t('type')} value={t('instantConsultation')} />
              </View>
              <TouchableOpacity style={styles.confirmDoneBtn} onPress={handleCallEndedDone}>
                <Text style={styles.confirmDoneText}>{t('close')}</Text>
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
            <Text style={styles.headerTitle}>{t('teleconsultation')}</Text>
            <Text style={styles.headerSubtitle}>{t('consultDoctorAnywhere')}</Text>
          </View>
        </LinearGradient>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={{ marginTop: 10, color: '#666' }}>{t('loading')}...</Text>
          </View>
        ) : (
          <FlashList
            data={doctors}
            keyExtractor={(d) => d.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: doctor }) => (
              <TouchableOpacity
                style={styles.doctorCard}
                onPress={() => handleSelectDoctor(doctor)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: doctor.avatar }}
                  style={styles.avatar}
                  defaultSource={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=10B981&color=fff` }}
                  onError={(e) => {
                    console.warn(`[ImageLoadError] Failed to load avatar for ${doctor.name}:`, doctor.avatar);
                  }}
                />
                <View style={styles.doctorInfo}>
                  <View style={styles.doctorNameRow}>
                    <Text style={styles.doctorName}>{doctor.name}</Text>
                    <View style={[styles.onlineBadge, !doctor.online && styles.offlineBadge]}>
                      <View style={[styles.onlineDot, !doctor.online && styles.offlineDot]} />
                      <Text style={[styles.onlineText, !doctor.online && styles.offlineText]}>
                        {doctor.online ? t('online') : t('offline')}
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
            ListHeaderComponent={() => (
              <>
                {userAppointments.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t('myUpcomingConsultations') || 'Upcoming Consultations'}</Text>
                    {userAppointments.map((appt) => {
                      // Always enable Join button for current time being
                      const enabled = true;
                      return (
                        <View key={appt.id} style={styles.myApptCard}>
                          <View style={styles.myApptInfo}>
                            <Text style={styles.myApptDoctor}>{appt.doctor}</Text>
                            <Text style={styles.myApptTime}>{appt.date} | {appt.time}</Text>
                          </View>
                          <TouchableOpacity
                            style={styles.joinBtn}
                            onPress={() => handleJoinCall(appt.id)}
                          >
                            <Ionicons name="videocam" size={18} color="#fff" />
                            <Text style={styles.joinBtnText}>Join Video</Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                )}
                <View style={[styles.section, { marginTop: 10 }]}>
                  <Text style={styles.sectionTitle}>{t('selectDoctorToBook') || 'Book New Consultation'}</Text>
                </View>
              </>
            )}
          />
        )}
      </SafeAreaView>
    );
  }




  // ── Schedule Form ──
  const selectedDateObj = freshDates.find(d => d.key === selectedDate);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.bookingHeader}>
        <TouchableOpacity onPress={() => setStep('list')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bookingHeaderTitle}>{t('selectDateTime')}</Text>
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

        {/* Symptoms Section */}
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
                  style={[styles.slotChip, selectedSlot === slot && styles.slotChipActiveGreen]}
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
              <Ionicons name="add-circle-outline" size={24} color="#10B981" />
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
          onPress={handleBook}
          disabled={!selectedSlot || booking}
        >
          <LinearGradient
            colors={selectedSlot ? ['#10B981', '#059669'] : ['#D1D5DB', '#D1D5DB']}
            style={styles.bookBtnGradient}
          >
            {booking ? (
              <ActivityIndicator color="#fff" size="small" animating={true} style={{ marginRight: 6 }} />
            ) : (
              <Ionicons name="videocam-outline" size={20} color="#fff" />
            )}
            <Text style={styles.bookBtnText}>
              {booking
                ? 'Booking...'
                : selectedSlot
                  ? `${t('bookAppointmentEx')} ${selectedSlot}`
                  : t('selectATimeSlot')}
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
            <Text style={styles.confirmTitle}>{t('appointmentScheduled')}</Text>
            <Text style={styles.confirmSubtitle}>{t('onlineConsultationBooked')}</Text>
            <View style={styles.confirmDetails}>
              <ConfirmRow icon="person-outline" label={t('doctor')} value={selectedDoctor!.name} />
              <ConfirmRow icon="medical-outline" label={t('specialization')} value={selectedDoctor!.specialization} />
              <ConfirmRow icon="videocam-outline" label={t('type')} value={t('onlineConsultation')} />
              <ConfirmRow
                icon="calendar-outline"
                label={t('date') || 'Date'}
                value={`${selectedDateObj?.day}, ${selectedDateObj?.date} ${selectedDateObj?.month}`}
              />
              <ConfirmRow icon="time-outline" label={t('time') || 'Time'} value={selectedSlot!} />
              {bookedAppointment && (
                <ConfirmRow
                  icon="barcode-outline"
                  label={t('id') || 'Appointment ID'}
                  value={bookedAppointment.id}
                />
              )}
            </View>
            <TouchableOpacity
              style={[styles.confirmDoneBtn, { backgroundColor: '#10B981', marginBottom: 12 }]}
              onPress={() => {
                setShowConfirm(false);
                // In a real app we'd redirect to "My Appointments", 
                // but for now let's just go back to home.
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.confirmDoneText}>{t('success') || 'Done'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmDoneBtn, { backgroundColor: '#4F46E5' }]}
              onPress={() => {
                // Find the just-created appointment if we had the ID stored in state
                // For simplicity, we can pass a generic join or just close
                setShowConfirm(false);
                router.replace('/(tabs)');
              }}
            >
              <Text style={styles.confirmDoneText}>{t('home') || 'Go to Home'}</Text>
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

  inputGroup: { marginBottom: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputIcon: { marginTop: 2, marginRight: 8 },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    padding: 0,
  },
  citizenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  citizenBadgeText: { fontSize: 11, fontWeight: '700', color: '#10B981' },

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

  myApptCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  myApptInfo: { flex: 1 },
  myApptDoctor: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  myApptTime: { fontSize: 12, color: '#6B7280' },
  joinBtn: {
    backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10,
  },
  joinBtnDisabled: { backgroundColor: '#9CA3AF', opacity: 0.8 },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
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

  docSubtitle: { fontSize: 12, color: '#6B7280', marginBottom: 12, marginTop: -8 },
  docTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  docTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  docTabActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  docTabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  docTabTextActive: { color: '#10B981' },
  docListContainer: { marginBottom: 16 },
  docTabContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
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
    borderColor: '#F3F4F6',
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
    borderColor: '#D1FAE5',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginTop: 8,
  },
  addDocBtnText: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  maxFilesHint: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
});

// FileRow component was removed as it's now integrated directly to match the exact OPD Booking structure.

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
