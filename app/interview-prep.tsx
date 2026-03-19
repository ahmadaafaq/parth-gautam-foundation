import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';

// ==========================================
// REPLACE THIS WITH YOUR ELEVENLABS AGENT ID
// ==========================================
const ELEVENLABS_AGENT_ID = 'YOUR_AGENT_ID_HERE';

const { width } = Dimensions.get('window');

export default function AIAssistantScreen() {
  const router = useRouter();
  const webviewRef = useRef<WebView>(null);

  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [errorMessage, setErrorMessage] = useState('');
  const [subtitle, setSubtitle] = useState(''); // agent's speech
  const [currentTime, setCurrentTime] = useState('');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Orb animations based on status
  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    if (status === 'connecting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(opacityAnim, { toValue: 0.8, duration: 600, useNativeDriver: true })
        ])
      ).start();
    } else if (status === 'connected') {
      opacityAnim.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      opacityAnim.setValue(0.8);
      pulseAnim.stopAnimation();
      setSubtitle(''); // clear subtitle when disconnected
    }
  }, [status]);

  const handleStartSession = () => {
    if (status !== 'disconnected') {
      handleEndSession();
      return;
    }

    if (ELEVENLABS_AGENT_ID === 'YOUR_AGENT_ID_HERE') {
      Alert.alert("Configuration Needed", "Please hardcode your ElevenLabs Agent ID in the code before starting.");
      return;
    }

    setStatus('connecting');
    setErrorMessage('');
    setSubtitle('');

    webviewRef.current?.injectJavaScript(`
      try {
        window.postMessage(JSON.stringify({ action: 'start', agentId: '${ELEVENLABS_AGENT_ID}' }), '*');
      } catch(e) {}
      true;
    `);
  };

  const handleEndSession = () => {
    webviewRef.current?.injectJavaScript(`
      try {
        window.postMessage(JSON.stringify({ action: 'stop' }), '*');
      } catch(e) {}
      true;
    `);
    setStatus('disconnected');
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'status') {
        setStatus(data.status);
      } else if (data.type === 'error') {
        console.error("ElevenLabs Error:", data.message);
        setErrorMessage(data.message || "An error occurred");
        setStatus('disconnected');
        Alert.alert("Connection Error", data.message || "Failed to connect to the interviewer. Please make sure microphone permissions are granted.");
      } else if (data.type === 'agent_message') {
        // Update subtitle with the agent's speech
        setSubtitle(data.text);
      }
    } catch (e) {
      console.log('Failed to parse webview message', e);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // HTML with ElevenLabs Conversation client – now forwarding agent messages
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body style="background: transparent;">
        <script type="module">
            import { Conversation } from 'https://esm.sh/@elevenlabs/client@0.0.5';

            let conversation = null;

            window.addEventListener('message', async function(event) {
                try {
                    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                    
                    if (data.action === 'start') {
                        // Request mic permission
                        try {
                           await navigator.mediaDevices.getUserMedia({ audio: true });
                        } catch(e) {
                           window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Microphone permission denied' }));
                           return;
                        }
                        
                        conversation = await Conversation.startSession({
                            agentId: data.agentId,
                            onConnect: () => {
                                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'status', status: 'connected' }));
                            },
                            onDisconnect: () => {
                                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'status', status: 'disconnected' }));
                            },
                            onError: (error) => {
                                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: typeof error === 'string' ? error : error.message }));
                            },
                            onMessage: (message) => {
                                // Send agent's spoken text to React Native
                                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'agent_message', text: message }));
                            }
                        });
                    } else if (data.action === 'stop') {
                        if (conversation) {
                            await conversation.endSession();
                            conversation = null;
                        }
                    }
                } catch(e) {
                   window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: e.message || 'Script error' }));
                }
            });
        </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1c1c1f', '#0a0a0c', '#15151a']}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header with time and back button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (status !== 'disconnected') {
              handleEndSession();
            }
            router.back();
          }} style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTime}>{currentTime || '9:41'}</Text>
            <Text style={styles.headerTitle}>AI Assistant</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Main Interactive Area */}
        <TouchableOpacity
          style={styles.contentContainer}
          activeOpacity={1}
          onPress={handleStartSession}
        >
          {/* Orb */}
          <View style={styles.orbWrapper}>
            <Animated.View style={[
              styles.glowBase,
              {
                transform: [{ scale: pulseAnim }],
                opacity: opacityAnim
              }
            ]}>
              <LinearGradient
                colors={status === 'connected' ? ['#00ffaa', '#0099ff', '#ff00aa'] : ['#ff00aa', '#9d00ff', '#00d4ff']}
                style={styles.glowGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>

            <Animated.View style={[
              styles.orbCore,
              { transform: [{ rotate: spin }] }
            ]}>
              <LinearGradient
                colors={status === 'connected' ? ['#00ffaa', '#0099ff', '#1c1c1f'] : ['#ff00aa', '#9d00ff', '#1c1c1f']}
                style={styles.orbGradient}
                start={{ x: 0.2, y: 0.2 }}
                end={{ x: 0.8, y: 0.8 }}
              />
              <View style={styles.orbOverlay} />
            </Animated.View>
          </View>

          {/* Subtitle Area */}
          <View style={styles.textWrapper}>
            {status === 'disconnected' && (
              <Text style={styles.promptText}>
                Tap to start{'\n'}
                <Text style={styles.promptHighlight}>AI conversation</Text>
              </Text>
            )}

            {status === 'connecting' && (
              <Text style={styles.promptText}>
                Connecting...
              </Text>
            )}

            {status === 'connected' && (
              <>
                <Text style={styles.subtitleText}>
                  {subtitle || 'Listening...'}
                </Text>
                <Text style={styles.hintText}>
                  Tap to end
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

        {/* Hidden WebView for ElevenLabs */}
        <View style={{ width: 0, height: 0, opacity: 0, overflow: 'hidden' }}>
          <WebView
            ref={webviewRef}
            source={{ html: htmlContent, baseUrl: 'https://elevenlabs.io' }}
            originWhitelist={['*']}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleWebViewMessage}
            mediaCapturePermissionGrantType="grant"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTime: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    opacity: 0.7,
  },
  headerTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  orbWrapper: {
    width: width * 0.7,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  glowBase: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: width,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1.2 }],
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: width,
    opacity: 0.4,
  },
  orbCore: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: width,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },
  orbGradient: {
    flex: 1,
  },
  orbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: width,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  promptText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: 0.3,
  },
  promptHighlight: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  subtitleText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '400',
  },
});