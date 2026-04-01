import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { healthCampsAPI } from '../../utils/api';
import { useLanguageStore } from '../../store/languageStore';

export interface HealthCamp {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  location: string;
  ward: string;
  date: string;
  seats_available: number;
  image: string;
  created_at: string;
  is_active: boolean;
  registrations_count: number;
  tags: string[];
  contact_info: string;
  latitude: number;
  longitude: number;
}

export default function HealthCampsScreen() {
  const router = useRouter();
  const { t } = useLanguageStore();

  const [programs, setPrograms] = useState<HealthCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await healthCampsAPI.getAll();
      setPrograms(data || []);
    } catch (error) {
      console.error('Error fetching health camps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrograms();
    setRefreshing(false);
  };

  // Derive unique categories from active programs
  const categories = ['All', ...Array.from(new Set(programs.map((p) => p.category).filter(Boolean)))];

  // Filter programs based on search and category
  const filteredPrograms = programs.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      (p.title && p.title.toLowerCase().includes(searchLower)) ||
      (p.location && p.location.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('healthCamps')}</Text>
          <Text style={styles.headerSubtitle}>{t('discoverHealthCamps')}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchHealthCamps')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipSelected
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextSelected
              ]}>
                {cat === 'All' ? t('all') : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>{t('findingHealthCamps')}</Text>
          </View>
        ) : filteredPrograms.length > 0 ? (
          filteredPrograms.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={styles.card}
              onPress={() => router.push(`/health-camps/${program.id}`)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: program.image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80' }}
                style={styles.cardCover}
              />
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>{program.category || t('eventLabel')}</Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>{program.title}</Text>

                <View style={styles.cardRow}>
                  <Ionicons name="location-outline" size={16} color="#4B5563" />
                  <Text style={styles.cardText} numberOfLines={1}>{program.location}</Text>
                </View>

                <View style={styles.cardMetaRow}>
                  <View style={styles.cardRow}>
                    <Ionicons name="calendar-outline" size={16} color="#10B981" />
                    <Text style={styles.cardTextHighlight}>{new Date(program.date || Date.now()).toLocaleDateString()}</Text>
                  </View>

                  {program.seats_available !== undefined && program.seats_available !== null && (
                    <View style={styles.seatsBadge}>
                      <Ionicons name="people-outline" size={14} color="#F59E0B" />
                      <Text style={styles.seatsText}>{program.seats_available} {t('seatsLeft')}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>{t('noHealthCampsFound')}</Text>
            <Text style={styles.emptySubtitle}>{t('adjustSearchFilters')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    paddingHorizontal: 24,
    marginTop: 12,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  categoriesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  categoryChipSelected: {
    backgroundColor: '#10B981',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardCover: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  cardBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 24,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardTextHighlight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  seatsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  seatsText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
