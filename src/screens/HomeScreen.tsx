import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { useApp } from '../context/AppContext';
import { Place } from '../types';

export const HomeScreen: React.FC = () => {
  const { places, isLoadingPlaces, isPlacesError, placesErrorMessage, refetchPlaces, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, selectedCity, setSelectedCity, setSelectedPlace } = useApp();

  const categories = [
    { id: 'all', label: '✨ Todos' },
    { id: 'cafe', label: '☕ Café con vista' },
    { id: 'comer', label: '🍽️ Gastronomía' },
    { id: 'noche', label: '🍷 Bares & Noche' },
    { id: 'playas', label: '🌊 Borde Costero' },
    { id: 'cultura', label: '🏛️ Patrimonio' },
    { id: 'naturaleza', label: '🌿 Naturaleza' }
  ];

  if (isLoadingPlaces) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '800' }}>Cargando catálogo VALPAR...</Text>
      </View>
    );
  }

  if (isPlacesError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ color: '#f43f5e', fontSize: 20, fontWeight: '900', marginBottom: 8 }}>⚠️ Error de conexión</Text>
        <Text style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 20 }}>{placesErrorMessage || 'No pudimos cargar los lugares. Comprueba tu conexión e inténtalo nuevamente.'}</Text>
        <TouchableOpacity style={{ backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 }} onPress={refetchPlaces}>
          <Text style={{ color: '#020617', fontWeight: '900', fontSize: 14 }}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategory === 'all' || place.categories?.includes(selectedCategory) || place.category === selectedCategory;
    const matchesCity = selectedCity === 'all' || (place.location?.city && place.location.city.toLowerCase() === selectedCity.toLowerCase());
    const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (place.description && place.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesCity && matchesSearch;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Banner */}
      <View style={styles.heroCard}>
        <Text style={styles.heroSubtitle}>Valpar Mobile B2C • Valparaíso</Text>
        <Text style={styles.heroTitle}>Descubre lugares que no conocías.</Text>
        <Text style={styles.heroText}>Cafeterías de cerro, miradores, picadas marinas y tesoros locales.</Text>

        {/* Search Input */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar café, mirador, mariscos..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Pills Slider */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillSlider}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[styles.pill, selectedCategory === cat.id && styles.activePill]}
          >
            <Text style={[styles.pillText, selectedCategory === cat.id && styles.activePillText]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Carousels: Tendencias */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Experiencias Destacadas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalSlider}>
          {filteredPlaces.slice(0, 5).map(place => {
            const hasReviews = place.rating !== null && place.rating !== undefined && (place.reviewCount ?? 0) > 0;
            const ratingBadgeText = hasReviews ? `★ ${place.rating?.toFixed(1)}` : '✨ Nuevo';
            return (
              <TouchableOpacity
                key={`card-${place.id}`}
                style={styles.card}
                onPress={() => setSelectedPlace(place)}
              >
                <Image source={{ uri: place.coverPhoto || place.imageUrl }} style={styles.cardImage} />
                <View style={styles.cardBadgeContainer}>
                  <Text style={styles.statusBadge}>
                    {place.status === 'PARTNER' ? 'NFC Socio' : place.status === 'RECOMMENDED' ? '★ Destacado' : '🔍 Descubierto'}
                  </Text>
                  <Text style={styles.ratingBadge}>{ratingBadgeText}</Text>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.cardZone}>{place.location?.zone || place.location?.district}</Text>
                  <Text style={styles.cardTitle}>{place.name}</Text>
                  <Text style={styles.cardTagline} numberOfLines={1}>{place.tagline || place.shortDescription}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Full Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Todos los Locales ({filteredPlaces.length})</Text>
        {filteredPlaces.map(place => (
          <TouchableOpacity
            key={`list-${place.id}`}
            style={styles.listItem}
            onPress={() => setSelectedPlace(place)}
          >
            <Image source={{ uri: place.imageUrl }} style={styles.listImage} />
            <View style={styles.listInfo}>
              <Text style={styles.cardZone}>{place.location.zone} • {place.priceLevel}</Text>
              <Text style={styles.cardTitle}>{place.name}</Text>
              <Text style={styles.cardTagline} numberOfLines={2}>{place.description}</Text>
              <View style={styles.tagRow}>
                {place.experienceTags?.map((tag, idx) => (
                  <Text key={idx} style={styles.tagPill}>{tag}</Text>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 100 },
  heroCard: { backgroundColor: '#0f172a', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#1e293b', marginBottom: 16 },
  heroSubtitle: { color: '#34d399', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  heroTitle: { color: '#ffffff', fontSize: 24, fontWeight: '900', lineHeight: 30, marginBottom: 8 },
  heroText: { color: '#94a3b8', fontSize: 13, marginBottom: 16 },
  searchRow: { flexDirection: 'row' },
  searchInput: { flex: 1, backgroundColor: '#1e293b', color: '#ffffff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  pillSlider: { marginBottom: 20 },
  pill: { backgroundColor: '#0f172a', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, marginRight: 8, borderWidth: 1, borderColor: '#1e293b' },
  activePill: { backgroundColor: '#10b981', borderColor: '#34d399' },
  pillText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  activePillText: { color: '#020617', fontWeight: '800' },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  horizontalSlider: { flexGrow: 0 },
  card: { width: 220, backgroundColor: '#0f172a', borderRadius: 20, marginRight: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b' },
  cardImage: { width: '100%', height: 130 },
  cardBadgeContainer: { position: 'absolute', top: 10, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between' },
  statusBadge: { backgroundColor: 'rgba(15, 23, 42, 0.85)', color: '#38bdf8', fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingBadge: { backgroundColor: '#f59e0b', color: '#020617', fontSize: 10, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cardBody: { padding: 12 },
  cardZone: { color: '#34d399', fontSize: 10, fontWeight: '700', marginBottom: 2 },
  cardTitle: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  cardTagline: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
  listItem: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 20, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  listImage: { width: 90, height: 90, borderRadius: 14, marginRight: 12 },
  listInfo: { flex: 1, justifyContent: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 4 },
  tagPill: { backgroundColor: '#1e293b', color: '#fbbf24', fontSize: 9, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }
});
