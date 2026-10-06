import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { AuthScreen } from './AuthScreen';
import { DevInspectorScreen } from './DevInspectorScreen';

export const ProfileScreen: React.FC = () => {
  const { user, logout, places, favorites, visitedPlaceIds, consents, updateConsent, setSelectedPlace } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'favorites' | 'visited' | 'passport' | 'settings'>('favorites');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDevInspector, setShowDevInspector] = useState(false);

  const favoritePlaces = places.filter(p => favorites.includes(p.id));
  const visitedPlaces = places.filter(p => visitedPlaceIds.includes(p.id));

  if (!user) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestTitle}>¡Bienvenido a VALPAR!</Text>
        <Text style={styles.guestSub}>Inicia sesión o regístrate para acceder a tu pasaporte digital, guardar tus lugares favoritos y acumular puntos reales.</Text>
        <TouchableOpacity style={styles.authBtn} onPress={() => setShowAuthModal(true)}>
          <Text style={styles.authBtnText}>Iniciar Sesión / Crear Cuenta</Text>
        </TouchableOpacity>

        {__DEV__ && (
          <TouchableOpacity style={[styles.authBtn, { backgroundColor: '#1e293b', marginTop: 16, borderWidth: 1, borderColor: '#10b981' }]} onPress={() => setShowDevInspector(true)}>
            <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '800' }}>🛠️ Abrir Dev Inspector (Modo Dev)</Text>
          </TouchableOpacity>
        )}

        <Modal visible={showAuthModal} animationType="slide">
          <AuthScreen onClose={() => setShowAuthModal(false)} />
        </Modal>

        <Modal visible={showDevInspector} animationType="slide">
          <DevInspectorScreen onClose={() => setShowDevInspector(false)} />
        </Modal>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header — Pasaporte del Explorador */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}
          style={styles.avatar}
        />
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>

        <View style={styles.passportBadge}>
          <Text style={styles.passportBadgeText}>🎫 {user.passportLevel || 'Explorador Porteño'}</Text>
        </View>

        {/* Real Metric Counters (Honest Data: 0 if zero - Section 40) */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>{user.points || 0}</Text>
            <Text style={styles.metricLabel}>Puntos</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>{visitedPlaces.length}</Text>
            <Text style={styles.metricLabel}>Visitados</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricNumber}>{favoritePlaces.length}</Text>
            <Text style={styles.metricLabel}>Guardados</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Navigation Tabs (Section 39) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
        <TouchableOpacity
          style={[styles.tab, activeSubTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveSubTab('favorites')}
        >
          <Text style={[styles.tabText, activeSubTab === 'favorites' && styles.activeTabText]}>
            📌 Mis Favoritos ({favoritePlaces.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSubTab === 'visited' && styles.activeTab]}
          onPress={() => setActiveSubTab('visited')}
        >
          <Text style={[styles.tabText, activeSubTab === 'visited' && styles.activeTabText]}>
            👣 Visitados ({visitedPlaces.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSubTab === 'passport' && styles.activeTab]}
          onPress={() => setActiveSubTab('passport')}
        >
          <Text style={[styles.tabText, activeSubTab === 'passport' && styles.activeTabText]}>
            🏆 Pasaporte & Logros
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeSubTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveSubTab('settings')}
        >
          <Text style={[styles.tabText, activeSubTab === 'settings' && styles.activeTabText]}>
            ⚙️ Privacidad
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Tab Content */}
      {activeSubTab === 'favorites' && (
        <View style={styles.section}>
          {favoritePlaces.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Todavía no guardas lugares</Text>
              <Text style={styles.emptySub}>Usa la vista Discover (match de tarjetas) o el Mapa para guardar lugares que quieras conocer.</Text>
            </View>
          ) : (
            favoritePlaces.map(place => (
              <TouchableOpacity key={place.id} style={styles.placeCard} onPress={() => setSelectedPlace(place)}>
                <Image source={{ uri: place.coverPhoto || place.imageUrl }} style={styles.placeImage} />
                <View style={styles.placeInfo}>
                  <Text style={styles.zoneText}>{place.location.district || place.location.city}</Text>
                  <Text style={styles.titleText}>{place.name}</Text>
                  <Text style={styles.taglineText} numberOfLines={1}>{place.tagline || place.shortDescription || place.location.address}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {activeSubTab === 'visited' && (
        <View style={styles.section}>
          {visitedPlaces.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Todavía no registras visitas</Text>
              <Text style={styles.emptySub}>Visita restaurantes socios e interactúa con el tótem o etiqueta NFC para registrar tu primera visita.</Text>
            </View>
          ) : (
            visitedPlaces.map(place => (
              <TouchableOpacity key={place.id} style={styles.placeCard} onPress={() => setSelectedPlace(place)}>
                <Image source={{ uri: place.coverPhoto || place.imageUrl }} style={styles.placeImage} />
                <View style={styles.placeInfo}>
                  <Text style={styles.zoneText}>✓ Visita Verificada</Text>
                  <Text style={styles.titleText}>{place.name}</Text>
                  <Text style={styles.taglineText} numberOfLines={1}>{place.tagline || place.location.address}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {activeSubTab === 'passport' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Logros & Recompensas</Text>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementBadge}>⚓</Text>
            <View style={styles.achievementTextCol}>
              <Text style={styles.achievementTitle}>Primer Paso Porteño</Text>
              <Text style={styles.achievementSub}>Registra tu primera visita en la Región de Valparaíso.</Text>
            </View>
          </View>

          <View style={styles.achievementCard}>
            <Text style={styles.achievementBadge}>☕</Text>
            <View style={styles.achievementTextCol}>
              <Text style={styles.achievementTitle}>Ruta de Cafés de Especialidad</Text>
              <Text style={styles.achievementSub}>Descubre 3 cafeterías con vista en Cerros Alegre o Concepción.</Text>
            </View>
          </View>
        </View>
      )}

      {activeSubTab === 'settings' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 Consentimientos Granulares de Privacidad</Text>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchLabel}>WhatsApp Marketing</Text>
              <Text style={styles.switchSub}>Recibir avisos de restaurantes socios.</Text>
            </View>
            <Switch
              value={consents.whatsappMarketing}
              onValueChange={v => updateConsent('whatsappMarketing', v)}
              trackColor={{ false: '#334155', true: '#10b981' }}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchTextCol}>
              <Text style={styles.switchLabel}>Recomendaciones Personalizadas</Text>
              <Text style={styles.switchSub}>Personalizar el feed según tus gustos gastronómicos.</Text>
            </View>
            <Switch
              value={consents.personalizedRecommendations}
              onValueChange={v => updateConsent('personalizedRecommendations', v)}
              trackColor={{ false: '#334155', true: '#10b981' }}
            />
          </View>

          <Text style={styles.consentMeta}>Origen de registro: {consents.source} • Aceptado: {consents.acceptedAt}</Text>

          {/* Development Section (Section 4 - Only visible in DEV mode) */}
          {__DEV__ && (
            <View style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderColor: '#1e293b' }}>
              <Text style={{ color: '#10b981', fontSize: 14, fontWeight: '900', marginBottom: 12 }}>
                🛠️ Herramientas de Desarrollo (VALPAR Dev)
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: '#1e293b', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#10b981', alignItems: 'center' }}
                onPress={() => setShowDevInspector(true)}
              >
                <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '900' }}>
                  ⚡ Abrir Dev Inspector (Diagnóstico API / PostgreSQL)
                </Text>
                <Text style={{ color: '#94a3b8', fontSize: 10, marginTop: 4 }}>
                  Comprueba datos en vivo desde Express & PostgreSQL
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Dev Inspector Modal */}
      <Modal visible={showDevInspector} animationType="slide">
        <DevInspectorScreen onClose={() => setShowDevInspector(false)} />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 100 },
  guestContainer: { flex: 1, backgroundColor: '#020617', padding: 24, justifyContent: 'center', alignItems: 'center' },
  guestTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  guestSub: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  authBtn: { backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 16 },
  authBtnText: { color: '#020617', fontSize: 14, fontWeight: '900' },
  profileHeader: { alignItems: 'center', marginVertical: 12 },
  avatar: { width: 80, height: 80, borderRadius: 24, borderWidth: 2, borderColor: '#10b981', marginBottom: 8 },
  userName: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  userEmail: { color: '#94a3b8', fontSize: 12, marginBottom: 6 },
  passportBadge: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, borderBottomWidth: 1, borderColor: '#334155', marginBottom: 16 },
  passportBadgeText: { color: '#fbbf24', fontSize: 11, fontWeight: '800' },
  metricsRow: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 20, borderWidth: 1, borderColor: '#1e293b', width: '100%', justifyContent: 'space-around', marginBottom: 16 },
  metricItem: { alignItems: 'center' },
  metricNumber: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  metricLabel: { color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', marginTop: 2, fontWeight: '700' },
  metricDivider: { width: 1, height: 30, backgroundColor: '#1e293b' },
  logoutBtn: { backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  logoutBtnText: { color: '#f43f5e', fontSize: 11, fontWeight: '800' },
  tabScrollView: { marginVertical: 12 },
  tab: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 14, backgroundColor: '#0f172a', marginRight: 8, borderWidth: 1, borderColor: '#1e293b' },
  activeTab: { backgroundColor: '#10b981', borderColor: '#10b981' },
  tabText: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  activeTabText: { color: '#020617', fontWeight: '900' },
  section: { marginTop: 8 },
  sectionTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 16 },
  emptyCard: { backgroundColor: '#0f172a', borderRadius: 18, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  emptyTitle: { color: '#ffffff', fontSize: 15, fontWeight: '800', marginBottom: 4 },
  emptySub: { color: '#94a3b8', fontSize: 12, textAlign: 'center', lineHeight: 18 },
  placeCard: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 18, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  placeImage: { width: 70, height: 70, borderRadius: 12, marginRight: 12 },
  placeInfo: { flex: 1, justifyContent: 'center' },
  zoneText: { color: '#34d399', fontSize: 10, fontWeight: '700' },
  titleText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  taglineText: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  achievementCard: { flexDirection: 'row', backgroundColor: '#0f172a', padding: 14, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b', alignItems: 'center' },
  achievementBadge: { fontSize: 24, marginRight: 12 },
  achievementTextCol: { flex: 1 },
  achievementTitle: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  achievementSub: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e293b' },
  switchTextCol: { flex: 1, paddingRight: 12 },
  switchLabel: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  switchSub: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  consentMeta: { color: '#64748b', fontSize: 10, textAlign: 'center', marginTop: 12 }
});
