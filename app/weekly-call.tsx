import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export default function WeeklyCallScreen() {
  const router = useRouter();
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Background with blur to give iOS call aesthetic */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#111827' }]} />

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPulse}>
            <Ionicons name="business" size={64} color="#fff" />
          </View>
        </View>

        <Text style={styles.callerName}>PG Foundation Support</Text>
        <Text style={styles.callStatus}>{formatTime(callDuration)}</Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={28} color={isMuted ? '#111827' : '#fff'} />
            <Text style={styles.controlLabel}>mute</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="keypad" size={28} color="#fff" />
            <Text style={styles.controlLabel}>keypad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
            onPress={() => setIsSpeaker(!isSpeaker)}
          >
            <Ionicons name={isSpeaker ? 'volume-high' : 'volume-medium'} size={28} color={isSpeaker ? '#111827' : '#fff'} />
            <Text style={styles.controlLabel}>speaker</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <Ionicons name="call" size={36} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  avatarContainer: {
    marginBottom: 32,
  },
  avatarPulse: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  callerName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  callStatus: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  controlsContainer: {
    paddingBottom: 48,
    paddingHorizontal: 32,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 48,
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#fff',
  },
  controlLabel: {
    position: 'absolute',
    bottom: -24,
    color: '#9CA3AF',
    fontSize: 12,
  },
  endCallButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EF4444',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
