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
  // Bareilly city centre as default
  const BAREILLY_CENTER = [28.367, 79.4304];

  const safe = programs.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
  );

  // Safety fallback – always have pins in Bareilly even if mock data breaks
  const pins =
    safe.length > 0
      ? safe
      : [
          { id: 'fb1', title: 'Health Camp', category: 'healthcare', location: 'Civil Lines', latitude: 28.367, longitude: 79.4304 },
          { id: 'fb2', title: 'Eye Care', category: 'healthcare', location: 'Kutchery Road', latitude: 28.3593, longitude: 79.4147 },
          { id: 'fb3', title: 'Women & Child', category: 'wellness', location: 'Subhash Nagar', latitude: 28.3821, longitude: 79.4162 },
          { id: 'fb4', title: 'Dental Camp', category: 'healthcare', location: 'Rampur Garden', latitude: 28.3509, longitude: 79.4305 },
          { id: 'fb5', title: 'Digital Literacy', category: 'education', location: 'Pilibhit Bypass', latitude: 28.375, longitude: 79.405 },
          { id: 'fb6', title: 'Community Kitchen', category: 'community', location: 'Izatnagar', latitude: 28.3635, longitude: 79.448 },
        ];

  const userLocJson = userLocation ? JSON.stringify(userLocation) : 'null';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden;background:#e0eadf}
#map{position:absolute;top:0;left:0;right:0;bottom:0}
.leaflet-container{font-family:-apple-system,sans-serif}

/* ── Program markers ─────────────────────────────── */
.mw{display:flex;flex-direction:column;align-items:center;cursor:pointer}
.mp{
  width:44px;height:44px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:20px;border:3px solid rgba(255,255,255,0.95);
  box-shadow:0 4px 18px rgba(0,0,0,.32);
  animation:bob 2.6s ease-in-out infinite;
}
.ms{
  width:14px;height:5px;border-radius:50%;
  background:rgba(0,0,0,.2);margin-top:3px;
  animation:shd 2.6s ease-in-out infinite;
}
.ml{
  margin-top:4px;font-size:10px;font-weight:700;color:#1F2937;
  background:rgba(255,255,255,0.9);padding:2px 7px;border-radius:10px;
  box-shadow:0 1px 4px rgba(0,0,0,.15);white-space:nowrap;max-width:110px;
  overflow:hidden;text-overflow:ellipsis;text-align:center;
}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes shd{0%,100%{transform:scaleX(1);opacity:.25}50%{transform:scaleX(.5);opacity:.1}}

/* ── "You are here" pulse marker ─────────────────── */
.you-wrap{display:flex;flex-direction:column;align-items:center}
.you-pulse{
  width:22px;height:22px;border-radius:50%;
  background:#1D4ED8;border:3px solid #fff;
  box-shadow:0 0 0 0 rgba(59,130,246,.7);
  animation:pulse 1.8s ease-out infinite;
}
.you-label{
  margin-top:5px;font-size:10px;font-weight:800;color:#1D4ED8;
  background:rgba(255,255,255,0.95);padding:2px 8px;
  border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.18);
}
@keyframes pulse{
  0%{box-shadow:0 0 0 0 rgba(59,130,246,.7)}
  70%{box-shadow:0 0 0 14px rgba(59,130,246,0)}
  100%{box-shadow:0 0 0 0 rgba(59,130,246,0)}
}

/* ── Popups ───────────────────────────────────────── */
.leaflet-popup-content-wrapper{
  border-radius:18px!important;padding:0!important;
  box-shadow:0 10px 32px rgba(0,0,0,.18)!important;
  overflow:hidden;border:none!important;min-width:240px;
}
.leaflet-popup-content{margin:0!important}
.leaflet-popup-tip-container{display:none}
.ph{padding:14px 16px 10px}
.pt{font-size:15px;font-weight:700;color:#111827;margin-bottom:4px}
.pl{font-size:12px;color:#6B7280;margin-bottom:6px}
.pb{display:inline-block;font-size:11px;font-weight:700;
    padding:3px 12px;border-radius:20px;text-transform:capitalize}
.pf{padding:10px 16px 14px;border-top:1px solid #F3F4F6;display:flex;gap:8px}
.btn{flex:1;padding:9px 0;border-radius:10px;font-size:13px;font-weight:700;
     text-align:center;border:none;cursor:pointer;font-family:inherit}
.bp{background:#3B82F6;color:#fff}
</style>
</head>
<body>
<div id="map"></div>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css"/>
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"></script>
<script>
var pins = ${JSON.stringify(pins)};
var userLoc = ${userLocJson};
var BAREILLY = [${BAREILLY_CENTER[0]}, ${BAREILLY_CENTER[1]}];

var CAT = {
  healthcare:{color:'#EF4444',bg:'#FEE2E2',tx:'#991B1B',icon:'✚'},
  education: {color:'#F59E0B',bg:'#FEF3C7',tx:'#92400E',icon:'★'},
  wellness:  {color:'#10B981',bg:'#D1FAE5',tx:'#065F46',icon:'♡'},
  community: {color:'#8B5CF6',bg:'#EDE9FE',tx:'#5B21B6',icon:'♥'},
};
var D = {color:'#3B82F6',bg:'#DBEAFE',tx:'#1D4ED8',icon:'●'};

// Initialise map – centre on Bareilly
var map = L.map('map',{zoomControl:false,attributionControl:true})
           .setView(BAREILLY, 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{
  attribution:'© <a href="https://openstreetmap.org">OSM</a> © <a href="https://carto.com">CARTO</a>',
  subdomains:'abcd',
  maxZoom:19,
}).addTo(map);

L.control.zoom({position:'bottomright'}).addTo(map);

// ── Program markers ────────────────────────────────
pins.forEach(function(p,i){
  var cat = (p.category||'').toLowerCase();
  var c = CAT[cat] || D;
  var del = ((i*0.42)%2.6).toFixed(2);
  var shortTitle = (p.title||'Program').substring(0,20);

  var html =
    '<div class="mw">'+
      '<div class="mp" style="background:'+c.color+';animation-delay:'+del+'s">'+c.icon+'</div>'+
      '<div class="ms" style="animation-delay:'+del+'s"></div>'+
      '<div class="ml">'+shortTitle+'</div>'+
    '</div>';

  var icon = L.divIcon({
    className:'',html:html,
    iconSize:[110,76],iconAnchor:[55,62],popupAnchor:[0,-68],
  });

  var popup =
    '<div class="ph">'+
      '<div class="pt">'+(p.title||'Program')+'</div>'+
      '<div class="pl">📍 '+(p.location||'Bareilly')+'</div>'+
      '<span class="pb" style="background:'+c.bg+';color:'+c.tx+'">'+(p.category||'general')+'</span>'+
    '</div>'+
    '<div class="pf">'+
      '<button class="btn bp" onclick="rn(\'reg\',\''+p.id+'\')">Register</button>'+
    '</div>';

  L.marker([p.latitude,p.longitude],{icon:icon})
   .addTo(map)
   .bindPopup(popup,{maxWidth:290,closeButton:false});
});

// ── User location marker ───────────────────────────
if(userLoc && typeof userLoc.latitude === 'number'){
  var youHtml =
    '<div class="you-wrap">'+
      '<div class="you-pulse"></div>'+
      '<div class="you-label">You are here</div>'+
    '</div>';

  var youIcon = L.divIcon({
    className:'',html:youHtml,
    iconSize:[90,52],iconAnchor:[45,20],popupAnchor:[0,-24],
  });

  L.marker([userLoc.latitude,userLoc.longitude],{icon:youIcon})
   .addTo(map)
   .bindPopup('<div style="padding:8px 12px;font-weight:700;font-size:13px">📍 Your current location</div>',
              {closeButton:false});
}

// ── Fit bounds to include all markers + user ───────
var allCoords = pins.map(function(p){return[p.latitude,p.longitude]});
if(userLoc && typeof userLoc.latitude === 'number'){
  allCoords.push([userLoc.latitude, userLoc.longitude]);
}
if(allCoords.length > 1){
  map.fitBounds(allCoords,{padding:[60,60],maxZoom:14});
} else {
  map.setView(BAREILLY,13);
}

function rn(action,id){
  try{window.ReactNativeWebView.postMessage(JSON.stringify({action:action,id:id}))}catch(e){}
}
</script>
</body>
</html>`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CityMapScreen() {
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapKey, setMapKey] = useState(0);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('requesting');
  const [mapReady, setMapReady] = useState(false);
  const webViewRef = useRef<any>(null);

  // ── Request location on mount ──────────────────
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setLocationStatus('granted');
        } else {
          setLocationStatus('denied');
        }
      } catch (e) {
        console.warn('Location error:', e);
        setLocationStatus('denied');
      }
    })();
  }, []);

  // ── Filter mock data ──────────────────────────
  const filteredPrograms = MOCK_HEALTH_CAMPS.filter((p) => {
    const matchesCategory =
      filter === null || p.category.toLowerCase() === filter.toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // Remount WebView whenever visible data or location changes
  useEffect(() => {
    setMapReady(false);
    setMapKey((k) => k + 1);
  }, [filteredPrograms.length, filter, searchQuery, userLocation]);

  const onWebMessage = (e: any) => {
    try {
      const { action, id } = JSON.parse(e.nativeEvent.data);
      const prog = MOCK_HEALTH_CAMPS.find((p) => String(p.id) === String(id));
      if (action === 'reg') {
        Alert.alert(
          'Register',
          `Register for "${prog?.title || id}"?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Register',
              onPress: () => Alert.alert('Success', 'You have been registered successfully!'),
            },
          ]
        );
      }
    } catch {}
  };

  const filters = [
    { id: null, label: 'All', icon: 'apps' },
    { id: 'healthcare', label: 'Healthcare', icon: 'medical' },
    { id: 'wellness', label: 'Wellness', icon: 'heart' },
    { id: 'education', label: 'Education', icon: 'school' },
    { id: 'community', label: 'Community', icon: 'people' },
  ];

  const mapHtml = buildMapHtml(filteredPrograms, userLocation);

  // ── Location pill text ────────────────────────
  const locationPill =
    locationStatus === 'requesting'
      ? { icon: 'locate', color: '#F59E0B', text: 'Locating…' }
      : locationStatus === 'granted'
      ? { icon: 'radio-button-on', color: '#10B981', text: 'Using your location' }
      : { icon: 'location-outline', color: '#9CA3AF', text: 'Location disabled' };

  return (
    <View style={s.root}>

      {/* ── Search ───────────────────────────────── */}
      <View style={s.header}>
        <View style={s.searchRow}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={s.searchInput}
            placeholder="Search programs or locations…"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Category filters ─────────────────────── */}
      <ScrollView
        horizontal
        style={s.filterBar}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterContent}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.id ?? 'all'}
            style={[s.chip, filter === f.id && s.chipOn]}
            onPress={() => setFilter(f.id)}
          >
            <Ionicons name={f.icon as any} size={14} color={filter === f.id ? '#fff' : '#6B7280'} />
            <Text style={[s.chipTxt, filter === f.id && s.chipTxtOn]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── WebView Map ──────────────────────────── */}
      <View style={s.mapWrap}>
        <WebView
          key={mapKey}
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={StyleSheet.absoluteFill}
          onMessage={onWebMessage}
          onLoadEnd={() => setMapReady(true)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={['*']}
          mixedContentMode="always"
          allowsInlineMediaPlayback={true}
          allowFileAccess={true}
          allowUniversalAccessFromFileURLs={true}
          scrollEnabled={false}
          bounces={false}
          onShouldStartLoadWithRequest={() => true}
          setSupportMultipleWindows={false}
          androidLayerType="hardware"
        />
        {/* Loading overlay */}
        {!mapReady && (
          <View style={s.mapLoader}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={s.mapLoaderTxt}>Loading map…</Text>
          </View>
        )}
      </View>

      {/* ── Bottom pills ─────────────────────────── */}
      <View style={s.pillsRow} pointerEvents="none">
        {/* Location status pill */}
        <View style={s.pill}>
          <Ionicons name={locationPill.icon as any} size={13} color={locationPill.color} />
          <Text style={[s.pillTxt, { color: locationPill.color }]}>{locationPill.text}</Text>
        </View>
        {/* Program count pill */}
        <View style={s.pill}>
          <Ionicons name="location" size={13} color="#3B82F6" />
          <Text style={s.pillTxt}>
            {filteredPrograms.length} program{filteredPrograms.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 8 : 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    zIndex: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 11 : 7,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937', padding: 0 },

  filterBar: {
    backgroundColor: '#fff',
    maxHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 13,
    backgroundColor: '#F9FAFB',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipOn: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  chipTxt: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  chipTxtOn: { color: '#fff' },

  mapWrap: { flex: 1, overflow: 'hidden' },

  mapLoader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 5,
  },
  mapLoaderTxt: { fontSize: 14, fontWeight: '600', color: '#6B7280' },

  pillsRow: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  pillTxt: { fontSize: 13, fontWeight: '600', color: '#374151' },
});