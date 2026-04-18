import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguageStore } from '../../../store/languageStore';

const SUBJECT_DETAILS: Record<string, any> = {
  mathematics: {
    title: 'mathTeacher',
    name: 'Mathematics Expert',
    icon: 'calculator',
    color: '#3B82F6',
  },
  science: {
    title: 'scienceTeacher',
    name: 'Science Expert',
    icon: 'flask',
    color: '#10B981',
  },
  english: {
    title: 'englishTeacher',
    name: 'English Expert',
    icon: 'book',
    color: '#F59E0B',
  },
  humanities: {
    title: 'humanitiesTeacher',
    name: 'Humanities Expert',
    icon: 'earth',
    color: '#8B5CF6',
  },
};

export default function AITutorScreen() {
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const router = useRouter();
  const { t } = useLanguageStore();
  const [isMuted, setIsMuted] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [callDuration, setCallDuration] = useState(0);

  const currentSubject = SUBJECT_DETAILS[subject || 'mathematics'];

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pulsing Voice Animation when not muted
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    
    if (!isMuted) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else {
      Animated.spring(pulseAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [isMuted, pulseAnim]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (callDuration < 2) return t('aiTutorConnecting') || 'Connecting...';
    if (isMuted) return t('aiTutorMuted') || 'Muted';
    if (callDuration % 10 < 5) return t('aiTutorSpeaking') || 'Speaking...';
    return t('aiTutorListening') || 'Listening...';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient 
        colors={['#0F172A', '#1E293B']} 
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Avatar and Animated Ring */}
        <View style={styles.avatarContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                backgroundColor: isMuted ? 'transparent' : currentSubject.color,
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.3],
                  outputRange: [0.4, 0],
                }),
              },
            ]}
          />
          <View style={[styles.avatarBorder, { borderColor: isMuted ? '#475569' : currentSubject.color, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
            <Ionicons name={currentSubject.icon || 'mic'} size={64} color={isMuted ? '#475569' : currentSubject.color} />
          </View>
        </View>

        <Text style={styles.name}>{t(currentSubject.title) || currentSubject.name}</Text>
        <Text style={[styles.status, { color: isMuted ? '#94A3B8' : currentSubject.color }]}>
          {getStatusText()}
        </Text>
        <Text style={styles.timer}>{formatDuration(callDuration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnMuted]}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={() => router.back()}>
          <Ionicons name="call" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="volume-medium" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 16, alignItems: 'flex-start' },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  mainContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  avatarContainer: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  pulseRing: {
    position: 'absolute', width: 140, height: 140, borderRadius: 70,
  },
  avatarBorder: {
    width: 130, height: 130, borderRadius: 65, borderWidth: 4, alignItems: 'center', justifyContent: 'center', zIndex: 2,
  },
  avatar: { width: 122, height: 122, borderRadius: 61 },
  name: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 8, letterSpacing: -0.5 },
  status: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  timer: { fontSize: 16, color: '#94A3B8', fontWeight: '500', fontVariant: ['tabular-nums'] },
  controlsContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32, paddingBottom: 48,
  },
  controlBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  controlBtnMuted: { backgroundColor: 'rgba(255,255,255,0.2)' },
  endCallBtn: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '135deg' }],
    shadowColor: '#EF4444', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8,
  },
});
