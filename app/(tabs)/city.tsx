import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { MOCK_HEALTH_CAMPS } from '../../utils/mockHealthCamps';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UserLocation {
  latitude: number;
  longitude: number;
}

type LocationStatus = 'requesting' | 'granted' | 'denied';

// ─── Build Leaflet HTML ───────────────────────────────────────────────────────
function buildMapHtml(programs: any[], userLocation: UserLocation | null) {
  const BAREILLY_CENTER = [28.367, 79.4304];
  const safe = programs.filter(p => typeof p.latitude === 'number');
  const pins = safe.length > 0 ? safe : MOCK_HEALTH_CAMPS;
  const userLocJson = userLocation ? JSON.stringify(userLocation) : 'null';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:#f3f4f6}
#map{position:absolute;top:0;left:0;right:0;bottom:0}
.leaflet-container{font-family:system-ui,-apple-system,sans-serif}

/* --- Premium Markers --- */
.marker-pin {
  display: flex; flex-direction: column; align-items: center;
}
.pin-circle {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  font-size: 18px; color: #fff;
  animation: bounce 2s ease-in-out infinite;
}
.pin-label {
  margin-top: 4px; background: rgba(255,255,255,0.95);
  padding: 2px 8px; border-radius: 12px; font-weight: 700;
  font-size: 10px; color: #1f2937; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  white-space: nowrap; max-width: 100px; overflow: hidden; text-overflow: ellipsis;
}
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

/* --- User Pulse --- */
.user-pulse {
  width: 22px; height: 22px; border-radius: 50%;
  background: #3b82f6; border: 3px solid #fff;
  box-shadow: 0 0 0 rgba(59,130,246,0.7);
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.7); } 70% { box-shadow: 0 0 0 15px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } }

/* --- Popup Styles --- */
.leaflet-popup-content-wrapper { border-radius: 16px; padding: 0; overflow: hidden; }
.leaflet-popup-content { margin: 0; width: 220px !important; }
.popup-box { padding: 15px; }
.popup-title { font-weight: 800; font-size: 15px; color: #111827; margin-bottom: 4px; }
.popup-loc { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
.popup-btn { 
  display: block; width: 100%; background: #3b82f6; color: #fff; 
  text-align: center; padding: 10px; border-radius: 10px; 
  text-decoration: none; font-weight: 700; font-size: 13px;
}
</style>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css"/>
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>
</head>
<body>
<div id="map"></div>
<script>
var map = L.map('map', {zoomControl: false}).setView([${BAREILLY_CENTER[0]}, ${BAREILLY_CENTER[1]}], 13);
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

var cats = {
  healthcare: { color: '#ef4444', icon: '✚' },
  wellness: { color: '#10b981', icon: '♡' },
  education: { color: '#f59e0b', icon: '★' },
  community: { color: '#8b5cf6', icon: '♥' }
};

var pins = ${JSON.stringify(pins)};
pins.forEach(p => {
  var cfg = cats[p.category.toLowerCase()] || { color: '#3b82f6', icon: '●' };
  var icon = L.divIcon({
    className: '',
    html: \`<div class="marker-pin"><div class="pin-circle" style="background:\${cfg.color}">\${cfg.icon}</div><div class="pin-label">\${p.title}</div></div>\`,
    iconSize: [100, 70], iconAnchor: [50, 60]
  });

  var popup = \`
    <div class="popup-box">
      <div class="popup-title">\${p.title}</div>
      <div class="popup-loc">📍 \${p.location}</div>
      <a href="javascript:void(0)" class="popup-btn" onclick="reg('\${p.id}')">Register Now</a>
    </div>
  \`;

  L.marker([p.latitude, p.longitude], {icon: icon}).addTo(map).bindPopup(popup);
});

var userLoc = ${userLocJson};
if(userLoc) {
  var userIcon = L.divIcon({ className: '', html: '<div class="user-pulse"></div>', iconSize: [22, 22] });
  L.marker([userLoc.latitude, userLoc.longitude], {icon: userIcon}).addTo(map).bindPopup("You are here");
}

function reg(id) { window.ReactNativeWebView.postMessage(JSON.stringify({id: id})) }
</script>
</body>
</html>`;
}

export default function CityMapScreen() {
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('requesting');
  const [mapReady, setMapReady] = useState(false);
  const webViewRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // const pos = await Location.getCurrentPositionAsync({});
        // setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocationStatus('granted');
      } else {
        setLocationStatus('denied');
      }
    })();
  }, []);

  const filteredPrograms = MOCK_HEALTH_CAMPS.filter((p) => {
    const matchesCategory = !filter || p.category.toLowerCase() === filter.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const onMessage = (event: any) => {
    const { id } = JSON.parse(event.nativeEvent.data);
    const prog = MOCK_HEALTH_CAMPS.find(p => p.id === id);
    Alert.alert("Register", `Join "${prog?.title}"?`, [
      { text: "Cancel" },
      { text: "Register", onPress: () => Alert.alert("Success", "Registered!") }
    ]);
  };

  const filters = [
    { id: null, label: 'All', icon: 'apps' },
    { id: 'healthcare', label: 'Healthcare', icon: 'medical' },
    { id: 'wellness', label: 'Wellness', icon: 'heart' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'community', label: 'Community', icon: 'people' },
  ];

  return (
    <View style={s.root}>
      {/* Search Bar */}
      <View style={s.header}>
        <View style={s.searchRow}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            placeholder="Search programs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={s.filterContent}>
        {filters.map((f) => (
          <TouchableOpacity key={f.id ?? 'all'} style={[s.chip, filter === f.id && s.chipOn]} onPress={() => setFilter(f.id)}>
            <Ionicons name={f.icon as any} size={14} color={filter === f.id ? '#fff' : '#6B7280'} />
            <Text style={[s.chipTxt, filter === f.id && s.chipTxtOn]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map Content */}
      <View style={s.mapWrap}>
        <WebView
          ref={webViewRef}
          source={{ html: buildMapHtml(filteredPrograms, userLocation) }}
          style={StyleSheet.absoluteFill}
          onMessage={onMessage}
          onLoadEnd={() => setMapReady(true)}
        />
        {!mapReady && (
          <View style={s.loader}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={s.loaderTxt}>Loading Map...</Text>
          </View>
        )}
      </View>

      {/* Bottom Pills */}
      <View style={s.pills}>
        <View style={s.pill}>
          <Ionicons name="location" size={14} color="#3b82f6" />
          <Text style={s.pillText}>{filteredPrograms.length} Locations</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, paddingTop: Platform.OS === 'ios' ? 60 : 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#e5e7eb' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1f2937' },
  filterBar: { maxHeight: 50 },
  filterContent: { paddingHorizontal: 16, gap: 8, height: 50, alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb', gap: 6 },
  chipOn: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  chipTxt: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  chipTxtOn: { color: '#fff' },
  mapWrap: { flex: 1 },
  loader: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  loaderTxt: { marginTop: 10, fontSize: 14, color: '#6b7280' },
  pills: { position: 'absolute', bottom: 20, width: '100%', alignItems: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, gap: 6 },
  pillText: { fontSize: 13, fontWeight: '700', color: '#374151' }
});