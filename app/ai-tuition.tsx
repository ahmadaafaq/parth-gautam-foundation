import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function AITuitionScreen() {
  const router = useRouter();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.aiModalHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.aiModalClose}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.aiModalTitle}>AI Voice Tutor</Text>
        <View style={{ width: 40 }} />
      </View>
      
      {/* Main Interface */}
      <View style={styles.aiModalBody}>
         <View style={styles.aiAvatarContainer}>
           <Animated.View style={[styles.aiPulseCircle, { transform: [{ scale: pulseAnim }] }]} />
           <LinearGradient colors={['#10B981', '#059669']} style={styles.aiAvatar}>
             <Ionicons name="school" size={48} color="#fff" />
           </LinearGradient>
         </View>

         <Text style={styles.aiStatusText}>Connecting to AI Tutor...</Text>
         <Text style={styles.aiInstructionText}>
           YOUR AI TUTOR READY
           {'\n\n'}
           Ask anything about your subjects, practice concepts, or get help with your homework through real-time conversation.
         </Text>
      </View>

      {/* Footer / End Session */}
      <View style={styles.aiModalFooter}>
         <TouchableOpacity style={styles.aiEndButton} onPress={() => router.back()}>
           <Ionicons name="call" size={32} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
         </TouchableOpacity>
         <Text style={styles.aiEndText}>End Tuition Session</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  
  // repurposed styles
  aiModalHeader: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#fff' 
  },
  aiModalClose: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', 
    alignItems: 'center', justifyContent: 'center' 
  },
  aiModalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  aiModalBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  aiAvatarContainer: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  aiPulseCircle: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(16, 185, 129, 0.2)' },
  aiAvatar: { 
    width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 
  },
  aiStatusText: { fontSize: 24, fontWeight: '800', color: '#1F2937', marginBottom: 16 },
  aiInstructionText: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 26, paddingHorizontal: 20 },
  aiModalFooter: { 
    padding: 32, alignItems: 'center', paddingBottom: 60, backgroundColor: '#fff', 
    borderTopWidth: 1, borderTopColor: '#E5E7EB' 
  },
  aiEndButton: { 
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EF4444', 
    alignItems: 'center', justifyContent: 'center', shadowColor: '#EF4444', 
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8, marginBottom: 16 
  },
  aiEndText: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
});
