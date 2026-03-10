import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { chatAPI } from '../../utils/api';
import * as Speech from 'expo-speech';

export default function AIAssistantScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('chat'); // chat, voice, whatsapp
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const sessionId = useRef(`session-${Date.now()}`);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `Hello ${user?.name || 'there'}! I'm your AI Community Assistant. I can help you with:\n\n• Healthcare services\n• Education opportunities\n• Community programs\n• Citizen card benefits\n\nHow can I assist you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || !user) return;

    const userMessage = {
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(user.id, inputText, sessionId.current);
      
      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    setIsListening(true);
    Speech.speak('Listening... What would you like to know?', {
      language: 'en',
      onDone: () => {
        setTimeout(() => {
          setIsListening(false);
          Alert.alert(
            'Voice Input',
            'Voice input is available! For this demo, please type your question instead.',
            [{ text: 'OK', onPress: () => setActiveTab('chat') }]
          );
        }, 2000);
      },
    });
  };

  const openWhatsApp = () => {
    const phoneNumber = '1234567890'; // Replace with actual WhatsApp Business number
    const message = encodeURIComponent(
      `Hi! I'm ${user?.name} (Citizen ID: ${user?.citizen_id}). I need assistance with community services.`
    );
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert('WhatsApp Not Installed', 'Please install WhatsApp to continue.');
        }
      })
      .catch(() => Alert.alert('Error', 'Could not open WhatsApp'));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Community Assistant</Text>
        <Text style={styles.headerSubtitle}>Powered by GPT-4</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Ionicons
            name="chatbubble"
            size={20}
            color={activeTab === 'chat' ? '#3B82F6' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'voice' && styles.tabActive]}
          onPress={() => setActiveTab('voice')}
        >
          <Ionicons
            name="mic"
            size={20}
            color={activeTab === 'voice' ? '#3B82F6' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'voice' && styles.tabTextActive]}>
            Voice
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'whatsapp' && styles.tabActive]}
          onPress={() => setActiveTab('whatsapp')}
        >
          <Ionicons
            name="logo-whatsapp"
            size={20}
            color={activeTab === 'whatsapp' ? '#25D366' : '#9CA3AF'}
          />
          <Text style={[styles.tabText, activeTab === 'whatsapp' && styles.tabTextActive]}>
            WhatsApp
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' && (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
          >
            {messages.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userMessage : styles.assistantMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' && styles.userMessageText,
                  ]}
                >
                  {message.content}
                </Text>
              </View>
            ))}
            {loading && (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingDot} />
                <View style={styles.loadingDot} />
                <View style={styles.loadingDot} />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask your question..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
            >
              <Ionicons name="send" size={20} color={inputText.trim() ? '#fff' : '#9CA3AF'} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {activeTab === 'voice' && (
        <View style={styles.voiceContainer}>
          <View style={styles.voiceContent}>
            <Ionicons name="mic-circle" size={120} color={isListening ? '#EF4444' : '#3B82F6'} />
            <Text style={styles.voiceTitle}>
              {isListening ? 'Listening...' : 'Voice Assistant'}
            </Text>
            <Text style={styles.voiceSubtitle}>
              {isListening
                ? 'Speak your question clearly'
                : 'Tap the button to start speaking'}
            </Text>

            <TouchableOpacity
              style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
              onPress={startVoiceInput}
              disabled={isListening}
            >
              <Ionicons name="mic" size={32} color="#fff" />
            </TouchableOpacity>

            <View style={styles.exampleQuestions}>
              <Text style={styles.exampleTitle}>Example questions:</Text>
              <Text style={styles.exampleText}>• Where can I get free health checkup?</Text>
              <Text style={styles.exampleText}>• Show me scholarship programs</Text>
              <Text style={styles.exampleText}>• How to report a community issue?</Text>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'whatsapp' && (
        <View style={styles.whatsappContainer}>
          <View style={styles.whatsappContent}>
            <Ionicons name="logo-whatsapp" size={120} color="#25D366" />
            <Text style={styles.whatsappTitle}>Continue on WhatsApp</Text>
            <Text style={styles.whatsappSubtitle}>
              Chat with our AI assistant on WhatsApp for instant responses
            </Text>

            <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
              <Ionicons name="logo-whatsapp" size={24} color="#fff" />
              <Text style={styles.whatsappButtonText}>Open WhatsApp Assistant</Text>
            </TouchableOpacity>

            <View style={styles.benefitsContainer}>
              <View style={styles.benefit}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.benefitText}>24/7 availability</Text>
              </View>
              <View style={styles.benefit}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.benefitText}>Instant notifications</Text>
              </View>
              <View style={styles.benefit}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.benefitText}>Share documents easily</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#EFF6FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#3B82F6',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 6,
    padding: 16,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  voiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceContent: {
    alignItems: 'center',
    padding: 32,
  },
  voiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  voiceSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#EF4444',
  },
  exampleQuestions: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  whatsappContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsappContent: {
    alignItems: 'center',
    padding: 32,
  },
  whatsappTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 8,
  },
  whatsappSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#25D366',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsContainer: {
    width: '100%',
    gap: 12,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#1F2937',
  },
});
