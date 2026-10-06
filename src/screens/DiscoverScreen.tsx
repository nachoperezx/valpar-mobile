import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { useApp } from '../context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const SWIPE_UP_THRESHOLD = 80;

export const DiscoverScreen: React.FC = () => {
  const {
    places,
    isLoadingPlaces,
    isPlacesError,
    placesErrorMessage,
    refetchPlaces,
    favorites,
    toggleFavorite,
    recordSkip,
    setSelectedPlace,
    setActiveTab
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);

  // Animated Position for Top Card
  const position = useRef(new Animated.ValueXY()).current;

  // The PanResponder is created once, so its callbacks read the latest render's
  // handlers through this ref instead of the stale first-render closures.
  const releaseHandlerRef = useRef<(dx: number, dy: number) => void>(() => {});

  // PanResponder for Gesture Handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only claim pan responder if user moved more than 3px to distinguish tap from drag
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        releaseHandlerRef.current(gestureState.dx, gestureState.dy);
      }
    })
  ).current;

  releaseHandlerRef.current = (dx: number, dy: number) => {
    // Check Swipe Right (Favorite)
    if (dx > SWIPE_THRESHOLD) {
      forceSwipe('right');
    }
    // Check Swipe Left (Skip)
    else if (dx < -SWIPE_THRESHOLD) {
      forceSwipe('left');
    }
    // Check Swipe Up (Detail Modal)
    else if (dy < -SWIPE_UP_THRESHOLD && Math.abs(dx) < 50) {
      const target = places[currentIndex];
      if (target) setSelectedPlace(target);
      resetPosition();
    }
    // Snap Back to Center
    else {
      resetPosition();
    }
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false
    }).start();
  };

  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'right' | 'left') => {
    const item = places[currentIndex];
    if (item) {
      if (direction === 'right') {
        if (!favorites.includes(item.id)) {
          toggleFavorite(item.id);
        }
      } else {
        recordSkip(item.id);
      }
    }

    position.setValue({ x: 0, y: 0 });
    setCurrentIndex(prev => prev + 1);
  };

  // Card Interpolation Effects
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const dislikeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  // Loading State
  if (isLoadingPlaces) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>Cargando experiencias de Valparaíso...</Text>
      </View>
    );
  }

  // Error State (Section 5 & 17 - Error Handling without silent fallback)
  if (isPlacesError) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.emptyTitle}>Error de conexión</Text>
        <Text style={styles.emptyText}>
          {placesErrorMessage || 'No pudimos cargar los lugares. Comprueba tu conexión e inténtalo nuevamente.'}
        </Text>
        <TouchableOpacity style={styles.resetButton} onPress={refetchPlaces}>
          <Text style={styles.resetButtonText}>🔄 Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Empty State (Section 9)
  if (currentIndex >= places.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyBadge}>✨</Text>
        <Text style={styles.emptyTitle}>Ya viste todos los lugares disponibles</Text>
        <Text style={styles.emptyText}>
          Estamos buscando nuevas experiencias para ti en la Región de Valparaíso.
        </Text>
        <View style={styles.emptyActionRow}>
          <TouchableOpacity style={styles.resetButton} onPress={() => setCurrentIndex(0)}>
            <Text style={styles.resetButtonText}>↺ Volver a explorar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapNavButton} onPress={() => setActiveTab('map')}>
            <Text style={styles.mapNavButtonText}>🗺️ Explorar mapa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render Stacked Cards (Top card interactive, lower card scaled for depth)
  const renderCards = () => {
    return places
      .map((place, index) => {
        if (index < currentIndex) return null;
        if (index > currentIndex + 2) return null; // Render max 3 cards for performance

        const isTopCard = index === currentIndex;
        const isSecondCard = index === currentIndex + 1;

        // Rating formatting according to Section 4
        const hasReviews = place.rating !== null && place.rating !== undefined && (place.reviewCount ?? 0) > 0;
        const ratingText = hasReviews
          ? `★ ${place.rating?.toFixed(1)} · ${place.reviewCount} reseñas`
          : '✨ Nuevo en VALPAR';

        const isFav = favorites.includes(place.id);

        if (isTopCard) {
          return (
            <Animated.View
              key={place.id}
              style={[
                styles.card,
                styles.topCard,
                {
                  transform: [
                    { translateX: position.x },
                    { translateY: position.y },
                    { rotate }
                  ]
                }
              ]}
              {...panResponder.panHandlers}
            >
              <TouchableOpacity
                activeOpacity={0.95}
                style={styles.cardTouchArea}
                onPress={() => setSelectedPlace(place)}
              >
                <Image
                  source={{ uri: place.coverPhoto || place.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' }}
                  style={styles.cardImage}
                />

                {/* LIKE OVERLAY BADGE (Swipe Right Feedback) */}
                <Animated.View style={[styles.feedbackBadge, styles.likeBadge, { opacity: likeOpacity }]}>
                  <Text style={styles.likeBadgeText}>QUIERO CONOCER 💚</Text>
                </Animated.View>

                {/* DISLIKE OVERLAY BADGE (Swipe Left Feedback) */}
                <Animated.View style={[styles.feedbackBadge, styles.dislikeBadge, { opacity: dislikeOpacity }]}>
                  <Text style={styles.dislikeBadgeText}>NO ME INTERESA ✕</Text>
                </Animated.View>

                {/* Status Overlay Badges */}
                <View style={styles.topBadgeRow}>
                  <Text style={styles.statusPill}>
                    {place.status === 'PARTNER' ? 'NFC Socio' : place.status === 'RECOMMENDED' ? '★ Destacado' : '🔍 Descubierto'}
                  </Text>
                  <Text style={styles.ratingPill}>{ratingText}</Text>
                </View>

                {/* Content Box */}
                <View style={styles.cardContent}>
                  <Text style={styles.zoneText}>
                    {place.location?.district || place.location?.commune || place.location?.city} • {place.priceLevel || '$$'}
                  </Text>
                  <Text style={styles.titleText}>{place.name}</Text>
                  <Text style={styles.taglineText}>
                    {place.tagline || place.shortDescription || place.description || place.location?.address}
                  </Text>

                  <View style={styles.tagRow}>
                    {place.experienceTags?.map((tag, idx) => (
                      <Text key={idx} style={styles.tagPill}>{tag}</Text>
                    ))}
                  </View>
                </View>

                {/* Swipe Up CTA Overlay */}
                <View style={styles.swipeUpBadge}>
                  <Text style={styles.swipeUpText}>↑ Arrastra arriba o toca para ver detalle</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }

        // Background Stack Cards (Visual Depth)
        return (
          <View
            key={place.id}
            style={[
              styles.card,
              styles.backgroundCard,
              {
                top: isSecondCard ? 10 : 20,
                transform: [{ scale: isSecondCard ? 0.95 : 0.9 }]
              }
            ]}
          >
            <Image
              source={{ uri: place.coverPhoto || place.imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' }}
              style={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <Text style={styles.titleText}>{place.name}</Text>
            </View>
          </View>
        );
      })
      .reverse();
  };

  const currentTopPlace = places[currentIndex];
  const isTopFav = currentTopPlace ? favorites.includes(currentTopPlace.id) : false;

  return (
    <View style={styles.container}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>EXPLORACIÓN RÁPIDA</Text>
        <Text style={styles.headerTitle}>Discover Valparaíso</Text>
      </View>

      {/* Stack Container */}
      <View style={styles.stackContainer}>{renderCards()}</View>

      {/* Tinder Style Action Controls */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.passButton}
          onPress={() => forceSwipe('left')}
        >
          <Text style={styles.passButtonText}>✕ No me interesa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => {
            if (currentTopPlace) setSelectedPlace(currentTopPlace);
          }}
        >
          <Text style={styles.infoButtonText}>ℹ️ Detalle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.favButton, isTopFav && styles.activeFavButton]}
          onPress={() => forceSwipe('right')}
        >
          <Text style={styles.favButtonText}>
            {isTopFav ? '❤️ Guardado' : '💚 Quiero conocer'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617', padding: 16, paddingBottom: 100 },
  header: { marginBottom: 10 },
  headerSubtitle: { color: '#f59e0b', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  stackContainer: { flex: 1, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    position: 'absolute'
  },
  topCard: { zIndex: 10 },
  backgroundCard: { zIndex: 1 },
  cardTouchArea: { flex: 1 },
  cardImage: { width: '100%', height: '100%', position: 'absolute' },
  
  // Feedback Overlay Badges
  feedbackBadge: {
    position: 'absolute',
    top: 60,
    zIndex: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2
  },
  likeBadge: { right: 20, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.85)', transform: [{ rotate: '12deg' }] },
  likeBadgeText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  dislikeBadge: { left: 20, borderColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.85)', transform: [{ rotate: '-12deg' }] },
  dislikeBadgeText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },

  topBadgeRow: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 15 },
  statusPill: { backgroundColor: 'rgba(2, 6, 23, 0.85)', color: '#38bdf8', fontSize: 11, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  ratingPill: { backgroundColor: '#f59e0b', color: '#020617', fontSize: 11, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  cardContent: { position: 'absolute', bottom: 40, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(2, 6, 23, 0.9)', zIndex: 15 },
  zoneText: { color: '#34d399', fontSize: 11, fontWeight: '700', marginBottom: 2 },
  titleText: { color: '#ffffff', fontSize: 22, fontWeight: '900', lineHeight: 26 },
  taglineText: { color: '#cbd5e1', fontSize: 12, marginTop: 4, marginBottom: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagPill: { backgroundColor: '#1e293b', color: '#fbbf24', fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  swipeUpBadge: { position: 'absolute', bottom: 8, left: 20, right: 20, backgroundColor: 'rgba(15, 23, 42, 0.9)', paddingVertical: 6, borderRadius: 12, alignItems: 'center', zIndex: 15 },
  swipeUpText: { color: '#94a3b8', fontSize: 10, fontWeight: '700' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 14 },
  passButton: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  passButtonText: { color: '#f43f5e', fontWeight: '800', fontSize: 12 },
  infoButton: { backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  infoButtonText: { color: '#38bdf8', fontWeight: '800', fontSize: 12 },
  favButton: { backgroundColor: '#10b981', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16 },
  activeFavButton: { backgroundColor: '#059669' },
  favButtonText: { color: '#020617', fontWeight: '900', fontSize: 12 },

  emptyContainer: { flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { color: '#94a3b8', fontSize: 14, marginTop: 12, fontWeight: '600' },
  errorIcon: { fontSize: 40, marginBottom: 8 },
  emptyBadge: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  emptyText: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  emptyActionRow: { flexDirection: 'column', gap: 10, width: '100%', alignItems: 'center' },
  resetButton: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, width: '80%', alignItems: 'center' },
  resetButtonText: { color: '#020617', fontWeight: '900', fontSize: 14 },
  mapNavButton: { backgroundColor: '#1e293b', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#38bdf8', width: '80%', alignItems: 'center' },
  mapNavButtonText: { color: '#38bdf8', fontWeight: '800', fontSize: 14 }
});
