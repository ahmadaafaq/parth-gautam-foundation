import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { programsAPI } from '../../utils/api';
import { useAuthStore } from '../../store/authStore';

// Only import native modules on mobile
let MapView: any = null;
let Marker: any = null;
let Location: any = null;

if (Platform.OS !== 'web') {
  MapView = require('react-native-maps').default;
  Marker = require('react-native-maps').Marker;
  Location = require('expo-location');
}

export default function CityMapScreen() {
  const { user } = useAuthStore();
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string | null>(null);
  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    loadPrograms();
    requestLocationPermission();
  }, [filter]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'web' || !Location) return;
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.log('Location permission denied');
    }
  };

  const loadPrograms = async () => {
    try {
      const data = await programsAPI.getAll(filter || undefined);
      setPrograms(data);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const filters = [
    { id: null, label: 'All', icon: 'apps' },
    { id: 'healthcare', label: 'Healthcare', icon: 'medical' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'community', label: 'Community', icon: 'people' },
  ];

  const getMarkerColor = (category: string) => {
    switch (category) {
      case 'healthcare':
        return '#EF4444';
      case 'education':
        return '#F59E0B';
      case 'community':
        return '#8B5CF6';
      default:
        return '#3B82F6';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>City Map</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search programs or locations"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        style={styles.filtersContainer}
        showsHorizontalScrollIndicator={false}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id || 'all'}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Ionicons
              name={f.icon as any}
              size={16}
              color={filter === f.id ? '#fff' : '#6B7280'}
            />
            <Text
              style={[styles.filterText, filter === f.id && styles.filterTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {Platform.OS === 'web' ? (
        <View style={styles.webMapPlaceholder}>
          <Ionicons name="map" size={64} color="#9CA3AF" />
          <Text style={styles.webMapText}>Map View</Text>
          <Text style={styles.webMapSubtext}>
            Please use Expo Go on mobile to see the interactive map
          </Text>
          <ScrollView style={styles.programsList}>
            {programs.map((program: any) => (
              <TouchableOpacity
                key={program.id}
                style={styles.programListItem}
                onPress={() => setSelectedProgram(program)}
              >
                <View
                  style={[
                    styles.programListIcon,
                    { backgroundColor: getMarkerColor(program.category) },
                  ]}
                />
                <View style={styles.programListContent}>
                  <Text style={styles.programListTitle}>{program.title}</Text>
                  <Text style={styles.programListLocation}>{program.location}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : MapView ? (
        <MapView style={styles.map} region={region} onRegionChangeComplete={setRegion}>
          {programs.map((program: any) => (
            <Marker
              key={program.id}
              coordinate={{
                latitude: program.latitude || 28.6139,
                longitude: program.longitude || 77.209,
              }}
              pinColor={getMarkerColor(program.category)}
              onPress={() => setSelectedProgram(program)}
            />
          ))}
        </MapView>
      ) : (
        <View style={styles.webMapPlaceholder}>
          <Text style={styles.webMapText}>Loading map...</Text>
        </View>
      )}

      {selectedProgram && (
        <View style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedProgram(null)}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.sheetContent}>
            <View
              style={[
                styles.programBadge,
                {
                  backgroundColor:
                    selectedProgram.category === 'healthcare'
                      ? '#FEE2E2'
                      : selectedProgram.category === 'education'
                      ? '#FEF3C7'
                      : '#EDE9FE',
                },
              ]}
            >
              <Ionicons
                name={
                  selectedProgram.category === 'healthcare'
                    ? 'medical'
                    : selectedProgram.category === 'education'
                    ? 'school'
                    : 'people'
                }
                size={24}
                color={getMarkerColor(selectedProgram.category)}
              />
            </View>

            <Text style={styles.sheetTitle}>{selectedProgram.title}</Text>
            <Text style={styles.sheetDescription}>{selectedProgram.description}</Text>

            <View style={styles.sheetInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color="#6B7280" />
                <Text style={styles.infoText}>{selectedProgram.location}</Text>
              </View>
              {selectedProgram.date && (
                <View style={styles.infoRow}>
                  <Ionicons name="calendar" size={16} color="#6B7280" />
                  <Text style={styles.infoText}>{selectedProgram.date}</Text>
                </View>
              )}
            </View>

            <View style={styles.sheetButtons}>
              <TouchableOpacity
                style={styles.directionButton}
                onPress={() => Alert.alert('Directions', 'Opening map directions...')}
              >
                <Ionicons name="navigate" size={20} color="#3B82F6" />
                <Text style={styles.directionButtonText}>Get Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => Alert.alert('Register', 'Registration successful!')}
              >
                <Text style={styles.registerButtonText}>Register</Text>
              </TouchableOpacity>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 24,
  },
  webMapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  webMapSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  programsList: {
    width: '100%',
    maxWidth: 600,
  },
  programListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  programListIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  programListContent: {
    flex: 1,
  },
  programListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  programListLocation: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  sheetContent: {
    paddingTop: 8,
  },
  programBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  sheetDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  sheetInfo: {
    marginBottom: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1F2937',
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  directionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 12,
  },
  directionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  registerButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
