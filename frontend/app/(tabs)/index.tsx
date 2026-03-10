import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { suggestionsAPI, updatesAPI } from '../../utils/api';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [suggestions, setSuggestions] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadData = async () => {
    if (!user) return;
    
    try {
      const [suggestionsData, updatesData] = await Promise.all([
        suggestionsAPI.getForUser(user.id),
        updatesAPI.getAll(user.ward),
      ]);
      setSuggestions(suggestionsData);
      setUpdates(updatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'doctor',
      title: 'Book Doctor',
      icon: 'medical',
      color: '#EF4444',
      onPress: () => router.push('/healthcare'),
    },
    {
      id: 'scholarship',
      title: 'Apply Scholarship',
      icon: 'school',
      color: '#F59E0B',
      onPress: () => router.push('/education'),
    },
    {
      id: 'issue',
      title: 'Report Issue',
      icon: 'alert-circle',
      color: '#8B5CF6',
      onPress: () => router.push('/community'),
    },
    {
      id: 'course',
      title: 'Join Skill Course',
      icon: 'book',
      color: '#10B981',
      onPress: () => router.push('/education'),
    },
  ];

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user.name}</Text>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.statusText}>Citizen Member • Ward {user.ward}</Text>
          </View>
        </LinearGradient>

        {/* Citizen Card Mini Widget */}
        <View style={styles.cardWidget}>
          <View style={styles.cardWidgetContent}>
            <View>
              <Text style={styles.cardWidgetLabel}>Citizen ID</Text>
              <Text style={styles.cardWidgetId}>{user.citizen_id}</Text>
              <Text style={styles.cardWidgetMember}>
                Member Since {new Date().getFullYear()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.viewCardButton}
              onPress={() => router.push('/(tabs)/card')}
            >
              <Text style={styles.viewCardButtonText}>View Card</Text>
              <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.onPress}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon as any} size={24} color={action.color} />
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestions.map((program: any) => (
                <TouchableOpacity key={program.id} style={styles.suggestionCard}>
                  <View style={styles.suggestionHeader}>
                    <Ionicons
                      name={
                        program.category === 'healthcare'
                          ? 'medical'
                          : program.category === 'education'
                          ? 'school'
                          : 'people'
                      }
                      size={24}
                      color="#3B82F6"
                    />
                  </View>
                  <Text style={styles.suggestionTitle} numberOfLines={2}>
                    {program.title}
                  </Text>
                  <Text style={styles.suggestionLocation} numberOfLines={1}>
                    <Ionicons name="location" size={12} color="#6B7280" /> {program.location}
                  </Text>
                  {program.date && (
                    <Text style={styles.suggestionDate}>{program.date}</Text>
                  )}
                  <TouchableOpacity style={styles.registerButton}>
                    <Text style={styles.registerButtonText}>Register Now</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Community Updates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Updates</Text>
          {updates.length > 0 ? (
            updates.map((update: any) => (
              <View key={update.id} style={styles.updateCard}>
                <View style={styles.updateIcon}>
                  <Ionicons
                    name={update.type === 'resolved_issue' ? 'checkmark-circle' : 'calendar'}
                    size={20}
                    color={update.type === 'resolved_issue' ? '#10B981' : '#3B82F6'}
                  />
                </View>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>{update.title}</Text>
                  <Text style={styles.updateDate}>{update.date}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent updates</Text>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  greeting: {
    fontSize: 16,
    color: '#E0F2FE',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardWidget: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardWidgetContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardWidgetLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardWidgetId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardWidgetMember: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewCardButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  suggestionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionHeader: {
    width: 48,
    height: 48,
    backgroundColor: '#EFF6FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  suggestionLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  suggestionDate: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  updateCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  updateIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    padding: 24,
  },
});
