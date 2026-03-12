import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Linking,
  Alert,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { chatAPI } from '../../utils/api';
import * as Speech from 'expo-speech';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Dot animation component ──────────────────────────────────────────────────
const TypingDot = ({ delay }: { delay: number }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: -6, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(600 - delay),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[styles.loadingDot, { transform: [{ translateY: anim }] }]} />
  );
};

// ─── Pulse animation for mic button ───────────────────────────────────────────
const PulseRing = ({ active }: { active: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scale, { toValue: 1.6, duration: 800, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 0.4, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );
      opacity.setValue(0.4);
      loop.start();
      return () => loop.stop();
    } else {
      scale.setValue(1);
      opacity.setValue(0);
    }
  }, [active]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulseRing,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
};

// ─── Main component ────────────────────────────────────────────────────────────
export default function AIAssistantScreen() {
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'whatsapp'>('chat');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const sessionId = useRef(`session-${Date.now()}`);
  const inputRef = useRef<TextInput>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello ${user?.name || 'there'}! 👋\n\nI'm your AI Community Assistant. I can help you with:\n\n• Healthcare services\n• Education opportunities\n• Community programs\n• Citizen card benefits\n\nHow can I assist you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || !user || loading) return;

    const userMessage = { role: 'user', content: inputText.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    scrollToBottom();

    try {
      const response = await chatAPI.sendMessage(user.id, userMessage.content, sessionId.current);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.response, timestamp: new Date() },
      ]);
      scrollToBottom();
    } catch {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    setIsListening(true);
    Speech.speak('Listening. What would you like to know?', {
      language: 'en',
      onDone: () => {
        setTimeout(() => {
          setIsListening(false);
          Alert.alert('Voice Input', 'For this demo, please type your question in the chat tab.', [
            { text: 'Go to Chat', onPress: () => setActiveTab('chat') },
          ]);
        }, 1800);
      },
    });
  };

  const openWhatsApp = () => {
    const phoneNumber = '1234567890';
    const message = encodeURIComponent(
      `Hi! I'm ${user?.name} (Citizen ID: ${user?.citizen_id}). I need assistance with community services.`
    );
    const url = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
    Linking.canOpenURL(url)
      .then((ok) => (ok ? Linking.openURL(url) : Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp to continue.')))
      .catch(() => Alert.alert('Error', 'Could not open WhatsApp'));
  };

  // ── Tab bar ──────────────────────────────────────────────────────────────────
  const TABS = [
    { key: 'chat', label: 'Chat', icon: 'chatbubble-ellipses', activeColor: '#4F6EF7' },
    { key: 'voice', label: 'Voice', icon: 'mic', activeColor: '#4F6EF7' },
    { key: 'whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp', activeColor: '#25D366' },
  ] as const;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFBFF" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.badgeText}>Online</Text>
        </View>
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <Text style={styles.headerSubtitle}>Community Services · Powered by GPT-4</Text>
      </View>

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <View style={styles.tabsWrapper}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.75}
              style={[styles.tab, isActive && { backgroundColor: tab.activeColor + '18' }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={isActive ? tab.activeColor : '#A0AABF'}
              />
              <Text style={[styles.tabLabel, isActive && { color: tab.activeColor }]}>
                {tab.label}
              </Text>
              {isActive && (
                <View style={[styles.tabUnderline, { backgroundColor: tab.activeColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ══════════════════════════════════════════════════════════════════════
          CHAT TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'chat' && (
        <KeyboardAvoidingView
          style={[styles.flex, Platform.OS === 'android' && { marginBottom: keyboardHeight }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={scrollToBottom}
          >
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <View
                  key={i}
                  style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}
                >
                  {!isUser && (
                    <View style={styles.avatar}>
                      <Ionicons name="sparkles" size={14} color="#4F6EF7" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isUser ? styles.bubbleUser : styles.bubbleBot,
                      { maxWidth: SCREEN_WIDTH * 0.78 },
                    ]}
                  >
                    <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              );
            })}

            {loading && (
              <View style={[styles.bubbleRow, styles.bubbleRowBot]}>
                <View style={styles.avatar}>
                  <Ionicons name="sparkles" size={14} color="#4F6EF7" />
                </View>
                <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                  <TypingDot delay={0} />
                  <TypingDot delay={150} />
                  <TypingDot delay={300} />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input bar */}
          <View
            style={[
              styles.inputBar,
              {
                paddingBottom: Platform.OS === 'ios'
                  ? Math.max(insets.bottom, 12)
                  : 12,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Ask me anything…"
              placeholderTextColor="#B0B8CC"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!loading}
              returnKeyType="default"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-up" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          VOICE TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'voice' && (
        <ScrollView
          contentContainerStyle={styles.voiceTabContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero area */}
          <View style={styles.voiceHero}>
            {/* Outer glow rings */}
            <View style={[styles.voiceRing, styles.voiceRingOuter, isListening && styles.voiceRingOuterActive]} />
            <View style={[styles.voiceRing, styles.voiceRingMid, isListening && styles.voiceRingMidActive]} />

            {/* Pulse animation */}
            <PulseRing active={isListening} />

            {/* Mic button */}
            <TouchableOpacity
              style={[styles.micBtn, isListening && styles.micBtnActive]}
              onPress={startVoiceInput}
              disabled={isListening}
              activeOpacity={0.85}
            >
              <Ionicons name={isListening ? 'radio' : 'mic'} size={38} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.voiceTitle}>
            {isListening ? 'Listening…' : 'Voice Assistant'}
          </Text>
          <Text style={styles.voiceHint}>
            {isListening
              ? 'Speak clearly — I\'m here'
              : 'Tap the mic and ask anything'}
          </Text>

          {/* Status pill */}
          <View style={[styles.statusPill, isListening && styles.statusPillActive]}>
            <View style={[styles.statusPillDot, isListening && styles.statusPillDotActive]} />
            <Text style={[styles.statusPillText, isListening && styles.statusPillTextActive]}>
              {isListening ? 'Recording in progress' : 'Ready to listen'}
            </Text>
          </View>

          {/* Suggestions card */}
          <View style={styles.suggestionsCard}>
            <Text style={styles.sectionLabel}>Try asking</Text>
            {[
              { q: 'Where can I get a free health checkup?', icon: 'medkit-outline' },
              { q: 'Show me scholarship programs near me', icon: 'school-outline' },
              { q: 'How do I report a community issue?', icon: 'megaphone-outline' },
            ].map(({ q, icon }) => (
              <TouchableOpacity
                key={q}
                style={styles.suggestionChip}
                onPress={() => {
                  setActiveTab('chat');
                  setInputText(q);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.suggestionIconBox}>
                  <Ionicons name={icon as any} size={15} color="#4F6EF7" />
                </View>
                <Text style={styles.suggestionText}>{q}</Text>
                <Ionicons name="chevron-forward" size={14} color="#C4CAD8" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          WHATSAPP TAB
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'whatsapp' && (
        <ScrollView
          contentContainerStyle={styles.centeredTabContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.waIconWrapper}>
              <Ionicons name="logo-whatsapp" size={52} color="#fff" />
            </View>

            <Text style={styles.cardTitle}>Continue on WhatsApp</Text>
            <Text style={styles.cardSubtitle}>
              Chat with our AI assistant directly on WhatsApp for instant, on-the-go support.
            </Text>

            <TouchableOpacity style={styles.waBtn} onPress={openWhatsApp} activeOpacity={0.85}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
              <Text style={styles.waBtnText}>Open WhatsApp Assistant</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Why WhatsApp?</Text>
            {[
              { icon: 'time-outline', text: '24 / 7 availability, zero wait time' },
              { icon: 'notifications-outline', text: 'Push notifications for updates' },
              { icon: 'attach-outline', text: 'Share photos & documents easily' },
              { icon: 'shield-checkmark-outline', text: 'End-to-end encrypted messages' },
            ].map(({ icon, text }) => (
              <View key={text} style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={icon as any} size={16} color="#25D366" />
                </View>
                <Text style={styles.benefitText}>{text}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFF',
  },
  flex: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    backgroundColor: '#FAFBFF',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F1728',
    letterSpacing: -0.6,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#8892A4',
    fontWeight: '500',
    marginTop: 2,
  },

  // Tabs
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EAECF4',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
    position: 'relative',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A0AABF',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2.5,
    borderRadius: 2,
  },

  // Messages
  messageList: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowBot: { justifyContent: 'flex-start' },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDE2FF',
  },
  bubble: {
    padding: 13,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#4F6EF7',
    borderBottomRightRadius: 5,
  },
  bubbleBot: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: '#EAECF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1A2340',
  },
  bubbleTextUser: { color: '#fff' },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  loadingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#B0B8CC',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EAECF4',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F4F6FB',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: '#0F1728',
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#EAECF4',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F6EF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F6EF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5E0',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Shared card layout for Voice & WhatsApp tabs
  centeredTabContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#EAECF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F1728',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#8892A4',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#EAECF4',
    marginVertical: 22,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A0AABF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  // Voice tab
  voiceTabContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 32,
    backgroundColor: '#F4F6FB',
    alignItems: 'center',
  },
  voiceHero: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  voiceRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  voiceRingOuter: {
    width: 176,
    height: 176,
    borderColor: '#DDE2FF',
    backgroundColor: '#F0F2FF',
  },
  voiceRingOuterActive: {
    borderColor: '#FFCDD2',
    backgroundColor: '#FFF0F0',
  },
  voiceRingMid: {
    width: 136,
    height: 136,
    borderColor: '#C7CFFE',
    backgroundColor: '#E8ECFF',
  },
  voiceRingMidActive: {
    borderColor: '#FFAAA8',
    backgroundColor: '#FFE4E3',
  },
  pulseRing: {
    position: 'absolute',
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: '#EF4444',
  },
  micBtn: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#4F6EF7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F6EF7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  micBtnActive: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  voiceTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F1728',
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  voiceHint: {
    fontSize: 15,
    color: '#8892A4',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#EEF1FF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#DDE2FF',
  },
  statusPillActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusPillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4F6EF7',
  },
  statusPillDotActive: {
    backgroundColor: '#EF4444',
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F6EF7',
  },
  statusPillTextActive: {
    color: '#EF4444',
  },
  suggestionsCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#EAECF4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F9FF',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EAECF4',
  },
  suggestionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionText: {
    fontSize: 14,
    color: '#3A4565',
    flex: 1,
    fontWeight: '500',
    lineHeight: 20,
  },

  // WhatsApp tab
  waIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  waBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#25D366',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 22,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  waBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  benefitIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  benefitText: {
    fontSize: 14,
    color: '#3A4565',
    fontWeight: '500',
    flex: 1,
  },
});