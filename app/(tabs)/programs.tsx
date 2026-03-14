import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { programsAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';

export default function ProgramsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { t } = useLanguageStore();
  const [programs, setPrograms] = useState<any>({
    healthcare: [],
    education: [],
    community: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const loadPrograms = async () => {
    try {
      const [healthcare, education, community] = await Promise.all([
        programsAPI.getAll('Healthcare'),
        programsAPI.getAll('Education'),
        programsAPI.getAll('Community'),
      ]);
      setPrograms({ healthcare, education, community });
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  useEffect(() => {
    loadPrograms();

    // Refresh every 15 seconds for realtime feel
    const interval = setInterval(loadPrograms, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrograms();
    setRefreshing(false);
  };

  const handlePillarPress = (pillarId: string, route: string) => {
    // Set selected pillar for visual feedback
    setSelectedPillar(pillarId);

    // Navigate after a small delay to show feedback
    setTimeout(() => {
      router.push(route as any);
      // Reset selected pillar after navigation
      setSelectedPillar(null);
    }, 100);
  };

  const pillars: {
    id: string;
    title: string;
    icon: string;
    color: string;
    gradient: readonly [string, string, ...string[]];
    description: string;
    route: string;
  }[] = [
      {
        id: 'healthcare',
        title: t('healthcare'),
        icon: 'medical',
        color: '#EF4444',
        gradient: ['#EF4444', '#DC2626'],
        description: t('healthcareServices'),
        route: '/healthcare',
      },
      {
        id: 'education',
        title: t('education'),
        icon: 'school',
        color: '#F59E0B',
        gradient: ['#F59E0B', '#D97706'],
        description: t('educationServices'),
        route: '/education',
      },
      {
        id: 'community',
        title: t('community'),
        icon: 'people',
        color: '#8B5CF6',
        gradient: ['#8B5CF6', '#7C3AED'],
        description: t('communityImpact'),
        route: '/community',
      },
    ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('programsHub')}</Text>
          <Text style={styles.headerSubtitle}>{t('exploreOpportunities')}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.pillarsContainer}>
          {pillars.map((pillar) => (
            <TouchableOpacity
              key={pillar.id}
              style={[
                styles.pillarCard,
                selectedPillar === pillar.id && styles.pillarCardPressed
              ]}
              onPress={() => handlePillarPress(pillar.id, pillar.route)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={pillar.gradient}
                style={styles.pillarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.pillarIcon}>
                  <Ionicons name={pillar.icon as any} size={40} color="#fff" />
                </View>
                <Text style={styles.pillarTitle}>{pillar.title}</Text>
                <Text style={styles.pillarDescription}>{pillar.description}</Text>

                <View style={styles.pillarStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>
                      {programs[pillar.id]?.length || 0}
                    </Text>
                    <Text style={styles.statLabel}>{t('programs')}</Text>
                  </View>
                </View>

                <View style={styles.exploreButton}>
                  <Text style={styles.exploreButtonText}>{t('explore')} {pillar.title}</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Programs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('recentPrograms')}</Text>
          {Object.values(programs).flat().length > 0 ? (
            Object.values(programs)
              .flat()
              .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
              .slice(0, 8)
              .map((program: any) => (
                <View key={program.id} style={styles.programCard}>
                  <View style={styles.programHeader}>
                    <View
                      style={[
                        styles.programIcon,
                        {
                          backgroundColor:
                            program.category === 'healthcare'
                              ? '#FEE2E2'
                              : program.category === 'education'
                                ? '#FEF3C7'
                                : '#EDE9FE',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          program.category === 'healthcare'
                            ? 'medical'
                            : program.category === 'education'
                              ? 'school'
                              : 'people'
                        }
                        size={24}
                        color={
                          program.category === 'healthcare'
                            ? '#EF4444'
                            : program.category === 'education'
                              ? '#F59E0B'
                              : '#8B5CF6'
                        }
                      />
                    </View>
                    <View style={styles.programInfo}>
                      <Text style={styles.programTitle}>{program.title}</Text>
                      <Text style={styles.programLocation} numberOfLines={1}>
                        <Ionicons name="location" size={12} color="#6B7280" /> {program.location}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.programFooter}>
                    {program.date && (
                      <View style={styles.programDateBadge}>
                        <Ionicons name="calendar" size={12} color="#3B82F6" />
                        <Text style={styles.programDate}>{program.date}</Text>
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => router.push(`/${program.category}?id=${program.id}` as any)}
                    >
                      <Text style={styles.detailsButtonText}>{t('viewCard')}</Text>
                      <Ionicons name="chevron-forward" size={14} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>{t('noProgramsAvailable')}</Text>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
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
  scrollView: {
    flex: 1,
  },
  pillarsContainer: {
    padding: 16,
    gap: 16,
  },
  pillarCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pillarCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  pillarGradient: {
    padding: 24,
  },
  pillarIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  pillarTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  pillarDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 20,
  },
  pillarStats: {
    marginBottom: 20,
  },
  stat: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
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
  programCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  programHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  programIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  programLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  programFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  programDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  programDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
});