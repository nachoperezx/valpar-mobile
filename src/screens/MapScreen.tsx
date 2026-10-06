import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useApp } from '../context/AppContext';
import { Place } from '../types';
import { APP_CONFIG, calculateHaversineDistance, getDistanceLabel } from '../config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default regional center: Plaza Sotomayor, Valparaíso
const DEFAULT_REGION = {
  latitude: -33.0472,
  longitude: -71.6127,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08
};

export const MapScreen: React.FC = () => {
  const { setSelectedPlace } = useApp();

  // User GPS & Permission State
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'loading' | 'granted' | 'denied'>('loading');
  
  // Nearby Places & Loading State
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState<boolean>(true);
  const [isNearbyError, setIsNearbyError] = useState<boolean>(false);
  const [nearbyErrorMessage, setNearbyErrorMessage] = useState<string | null>(null);

  // Selected Marker Bottom Sheet State
  const [selectedMarkerPlace, setSelectedMarkerPlace] = useState<Place | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const mapRef = useRef<MapView | null>(null);

  const categories = [
    { id: 'all', label: '✨ Todos' },
    { id: 'cafe', label: '☕ Café' },
    { id: 'comer', label: '🍽️ Gastronomía' },
    { id: 'noche', label: '🍷 Bares & Noche' },
    { id: 'playas', label: '🌊 Playas & Costero' },
    { id: 'cultura', label: '🏛️ Cultura' },
    { id: 'naturaleza', label: '🌿 Naturaleza' }
  ];

  // Request GPS Permissions on Mount (Section 17)
  useEffect(() => {
    fetchUserLocationAndNearby();
  }, []);

  const fetchUserLocationAndNearby = async () => {
    setIsLoadingNearby(true);
    setIsNearbyError(false);
    setNearbyErrorMessage(null);

    let activeLat = DEFAULT_REGION.latitude;
    let activeLng = DEFAULT_REGION.longitude;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermissionStatus('granted');
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        activeLat = loc.coords.latitude;
        activeLng = loc.coords.longitude;
        setUserLocation({ latitude: activeLat, longitude: activeLng });
        // initialRegion only applies on first render, so move the map once GPS resolves
        mapRef.current?.animateToRegion({
          latitude: activeLat,
          longitude: activeLng,
          latitudeDelta: DEFAULT_REGION.latitudeDelta,
          longitudeDelta: DEFAULT_REGION.longitudeDelta
        }, 800);
      } else {
        setPermissionStatus('denied');
        setUserLocation(null);
      }
    } catch {
      setPermissionStatus('denied');
      setUserLocation(null);
    }

    // Fetch Nearby Places from API (Section 13 & 18)
    await loadNearbyFromAPI(activeLat, activeLng);
  };

  const loadNearbyFromAPI = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/places/nearby?lat=${lat}&lng=${lng}&radius=50`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.places)) {
        setNearbyPlaces(data.places);
        setIsNearbyError(false);
      } else {
        setNearbyPlaces([]);
        setIsNearbyError(true);
        setNearbyErrorMessage(data?.message || 'No pudimos cargar los lugares cercanos.');
      }
    } catch {
      setNearbyPlaces([]);
      setIsNearbyError(true);
      setNearbyErrorMessage('No pudimos conectar con la API de geolocalización. Comprueba tu conexión.');
    } finally {
      setIsLoadingNearby(false);
    }
  };

  const activeLat = userLocation?.latitude || DEFAULT_REGION.latitude;
  const activeLng = userLocation?.longitude || DEFAULT_REGION.longitude;

  // Filter nearby places by selected category
  const filteredPlaces = nearbyPlaces.filter(p => {
    if (selectedCategory === 'all') return true;
    if (p.categories && Array.isArray(p.categories)) {
      return p.categories.includes(selectedCategory);
    }
    return p.category === selectedCategory;
  });

  // Calculate distance info
  const placesWithDist = filteredPlaces.map(p => {
    const dKm = calculateHaversineDistance(
      activeLat,
      activeLng,
      p.location?.latitude ?? DEFAULT_REGION.latitude,
      p.location?.longitude ?? DEFAULT_REGION.longitude
    );
    const dInfo = getDistanceLabel(dKm);
    return { ...p, distanceKm: dKm, distanceInfo: dInfo };
  });

  const centerMapOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04
      }, 800);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'cafe':
      case 'cafetería': return '☕';
      case 'comer':
      case 'restaurante': return '🍽️';
      case 'noche':
      case 'bar & rooftop': return '🍷';
      case 'playas': return '🌊';
      case 'cultura':
      case 'experiencia': return '🏛️';
      case 'naturaleza': return '🌿';
      default: return '📍';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Floating Control Panel */}
      <View style={styles.topBar}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerSubtitle}>GEOLOCALIZACIÓN Y ENTORNO</Text>
          <Text style={styles.headerTitle}>Mapa Interactivo</Text>
        </View>

        {/* GPS Permission Status Indicator */}
        <View style={styles.gpsStatusBadge}>
          {permissionStatus === 'loading' ? (
            <ActivityIndicator size="small" color="#10b981" />
          ) : permissionStatus === 'granted' ? (
            <TouchableOpacity onPress={centerMapOnUser} style={styles.gpsActivePill}>
              <Text style={styles.gpsActiveText}>📍 GPS Activo</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.gpsDeniedText}>🌐 Región Valparaíso</Text>
          )}
        </View>
      </View>

      {/* Category Filter Chips Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipSlider}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => {
              setSelectedCategory(cat.id);
              setSelectedMarkerPlace(null);
            }}
            style={[styles.chip, selectedCategory === cat.id && styles.activeChip]}
          >
            <Text style={[styles.chipText, selectedCategory === cat.id && styles.activeChipText]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Error State Banner if API fails */}
      {isNearbyError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>
            ⚠️ {nearbyErrorMessage || 'No pudimos cargar los lugares cercanos.'}
          </Text>
          <TouchableOpacity style={styles.errorRetryBtn} onPress={fetchUserLocationAndNearby}>
            <Text style={styles.errorRetryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REAL INTERACTIVE GEOGRAPHICAL MAP */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: activeLat,
            longitude: activeLng,
            latitudeDelta: DEFAULT_REGION.latitudeDelta,
            longitudeDelta: DEFAULT_REGION.longitudeDelta
          }}
          showsUserLocation={permissionStatus === 'granted'}
          showsMyLocationButton={false}
          showsCompass={true}
        >
          {/* User Marker Pin if GPS granted */}
          {userLocation && (
            <Marker
              coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
              title="Mi Posición"
              description="Ubicación GPS actual"
            >
              <View style={styles.userMarkerPin}>
                <View style={styles.userDotPulse} />
                <Text style={styles.userPinText}>◎ Mi Posición</Text>
              </View>
            </Marker>
          )}

          {/* Place Map Markers (Section 13 & 14 Compact Labels) */}
          {placesWithDist.map(place => {
            const lat = place.location?.latitude ?? DEFAULT_REGION.latitude;
            const lng = place.location?.longitude ?? DEFAULT_REGION.longitude;
            const isSelected = selectedMarkerPlace?.id === place.id;
            const icon = getCategoryIcon(place.category);

            return (
              <Marker
                key={place.id}
                coordinate={{ latitude: lat, longitude: lng }}
                onPress={() => setSelectedMarkerPlace(place)}
              >
                <View style={[styles.markerBadge, isSelected && styles.selectedMarkerBadge]}>
                  <Text style={styles.markerIcon}>{icon}</Text>
                  <Text style={styles.markerLabel} numberOfLines={1}>{place.name}</Text>
                </View>
              </Marker>
            );
          })}
        </MapView>

        {/* Center My Location Floating Action Button */}
        {permissionStatus === 'granted' && (
          <TouchableOpacity style={styles.centerLocationFab} onPress={centerMapOnUser}>
            <Text style={styles.fabIcon}>🎯</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* TAPPED MARKER BOTTOM SHEET PREVIEW (Section 16) */}
      {selectedMarkerPlace && (
        <View style={styles.bottomSheetCard}>
          <Image
            source={{ uri: selectedMarkerPlace.coverPhoto || selectedMarkerPlace.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' }}
            style={styles.sheetImage}
          />
          <View style={styles.sheetInfo}>
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetZone}>
                {selectedMarkerPlace.location?.district || selectedMarkerPlace.location?.commune || selectedMarkerPlace.location?.city}
              </Text>
              <Text style={styles.sheetRatingPill}>
                {selectedMarkerPlace.rating !== null && selectedMarkerPlace.rating !== undefined && (selectedMarkerPlace.reviewCount ?? 0) > 0
                  ? `★ ${selectedMarkerPlace.rating.toFixed(1)}`
                  : '✨ Nuevo en VALPAR'}
              </Text>
            </View>

            <Text style={styles.sheetTitle}>{selectedMarkerPlace.name}</Text>
            <Text style={styles.sheetSubtitle} numberOfLines={1}>
              {selectedMarkerPlace.tagline || selectedMarkerPlace.shortDescription || selectedMarkerPlace.location?.address}
            </Text>

            <View style={styles.sheetActionRow}>
              <TouchableOpacity
                style={styles.viewPlaceBtn}
                onPress={() => {
                  setSelectedPlace(selectedMarkerPlace);
                }}
              >
                <Text style={styles.viewPlaceBtnText}>Ver lugar completo →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Close Bottom Sheet Button */}
          <TouchableOpacity
            style={styles.closeSheetBtn}
            onPress={() => setSelectedMarkerPlace(null)}
          >
            <Text style={styles.closeSheetText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 16, paddingBottom: 90 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitleCol: { flex: 1 },
  headerSubtitle: { color: '#38bdf8', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  gpsStatusBadge: { backgroundColor: '#0f172a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  gpsActivePill: { backgroundColor: '#10b98120', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  gpsActiveText: { color: '#10b981', fontSize: 11, fontWeight: '800' },
  gpsDeniedText: { color: '#fbbf24', fontSize: 11, fontWeight: '800' },
  
  chipSlider: { maxHeight: 44, marginBottom: 12 },
  chip: { backgroundColor: '#0f172a', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, marginRight: 8, borderWidth: 1, borderColor: '#1e293b' },
  activeChip: { backgroundColor: '#10b981', borderColor: '#34d399' },
  chipText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  activeChipText: { color: '#020617', fontWeight: '900' },

  errorBanner: { backgroundColor: '#f43f5e20', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: '#f43f5e', marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  errorBannerText: { color: '#f43f5e', fontSize: 11, fontWeight: '700', flex: 1, marginRight: 8 },
  errorRetryBtn: { backgroundColor: '#f43f5e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  errorRetryBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },

  mapContainer: { flex: 1, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b', position: 'relative' },
  map: { width: '100%', height: '100%' },

  // User Marker Pin
  userMarkerPin: { backgroundColor: '#020617', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 2, borderColor: '#10b981', flexDirection: 'row', alignItems: 'center' },
  userDotPulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981', marginRight: 6 },
  userPinText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },

  // Compact Marker Badges (Section 14)
  markerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(2, 6, 23, 0.9)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, borderWidth: 1.5, borderColor: '#38bdf8', maxWidth: 140 },
  selectedMarkerBadge: { backgroundColor: '#10b981', borderColor: '#ffffff', transform: [{ scale: 1.1 }] },
  markerIcon: { fontSize: 12, marginRight: 4 },
  markerLabel: { color: '#ffffff', fontSize: 11, fontWeight: '800' },

  centerLocationFab: { position: 'absolute', bottom: 16, right: 16, backgroundColor: '#0f172a', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#10b981' },
  fabIcon: { fontSize: 20 },

  // Bottom Sheet Preview Card (Section 16)
  bottomSheetCard: { position: 'absolute', bottom: 100, left: 16, right: 16, backgroundColor: '#0f172a', borderRadius: 22, padding: 14, flexDirection: 'row', borderWidth: 1.5, borderColor: '#10b981', zIndex: 100, elevation: 10 },
  sheetImage: { width: 90, height: 90, borderRadius: 16, marginRight: 12 },
  sheetInfo: { flex: 1, justifyContent: 'space-between' },
  sheetHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sheetZone: { color: '#34d399', fontSize: 11, fontWeight: '700' },
  sheetRatingPill: { backgroundColor: '#f59e0b', color: '#020617', fontSize: 10, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  sheetTitle: { color: '#ffffff', fontSize: 16, fontWeight: '900', marginTop: 2 },
  sheetSubtitle: { color: '#cbd5e1', fontSize: 11, marginBottom: 8 },
  sheetActionRow: { flexDirection: 'row' },
  viewPlaceBtn: { backgroundColor: '#10b981', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12 },
  viewPlaceBtnText: { color: '#020617', fontSize: 12, fontWeight: '900' },
  closeSheetBtn: { position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 13, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  closeSheetText: { color: '#ffffff', fontSize: 12, fontWeight: '800' }
});
