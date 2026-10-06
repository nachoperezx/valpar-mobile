import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Place } from '../types';
import { useApp } from '../context/AppContext';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose }) => {
  const { triggerNfcCheckIn, favorites, toggleFavorite } = useApp();
  const [loadingNfc, setLoadingNfc] = useState(false);

  if (!place) return null;

  const isFav = favorites.includes(place.id);

  const handleNfcScan = async () => {
    setLoadingNfc(true);
    const res = await triggerNfcCheckIn(place.id);
    setLoadingNfc(false);
    Alert.alert('Confirmación NFC Post-Pago', res.message);
  };

  return (
    <Modal visible={!!place} animationType="slide" transparent={false}>
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Hero Image */}
          <Image source={{ uri: place.imageUrl }} style={styles.heroImage} />

          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          {/* Content Body */}
          <View style={styles.body}>
            <View style={styles.headerRow}>
              <View style={styles.badgeCol}>
                <Text style={styles.statusPill}>
                  {place.status === 'PARTNER' ? 'NFC Socio' : place.status === 'RECOMMENDED' ? '★ Destacado' : '🔍 Descubierto'}
                </Text>
                <Text style={styles.zoneText}>{place.location.zone}, {place.location.city}</Text>
              </View>
              <Text style={styles.ratingText}>
                {place.rating !== null && place.rating !== undefined && (place.reviewCount ?? 0) > 0
                  ? `★ ${place.rating.toFixed(1)} (${place.reviewCount})`
                  : '✨ Nuevo en VALPAR'}
              </Text>
            </View>

            <Text style={styles.nameText}>{place.name}</Text>
            <Text style={styles.taglineText}>"{place.tagline}"</Text>
            <Text style={styles.descText}>{place.description}</Text>

            {/* Experience Tags */}
            <View style={styles.tagRow}>
              {place.experienceTags?.map((tag, idx) => (
                <Text key={idx} style={styles.tagPill}>{tag}</Text>
              ))}
            </View>

            {/* NFC Visit Action Banner (If PARTNER or ACTIVE NFC) */}
            {place.status === 'PARTNER' && (
              <View style={styles.nfcBanner}>
                <Text style={styles.nfcTitle}>📲 Visita Verificada NFC</Text>
                <Text style={styles.nfcSub}>Al finalizar tu consumo, acerca tu smartphone al Tag NFC del local para validar tu visita y ganar puntos.</Text>
                <TouchableOpacity style={styles.nfcButton} onPress={handleNfcScan} disabled={loadingNfc}>
                  <Text style={styles.nfcButtonText}>{loadingNfc ? 'Validando GPS & Token...' : 'Escanear NFC de Agradecimiento'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Menu Items */}
            {place.menu && place.menu.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🍽️ Platos & Carta Destacada</Text>
                {place.menu.map(item => (
                  <View key={item.id} style={styles.menuCard}>
                    <Image source={{ uri: item.imageUrl }} style={styles.menuImage} />
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuTitle}>{item.name}</Text>
                      <Text style={styles.menuDesc}>{item.description}</Text>
                      <Text style={styles.menuPrice}>${item.price.toLocaleString()}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Details & Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📍 Información Práctica</Text>
              <Text style={styles.infoText}>📍 Dirección: {place.location.address}</Text>
              <Text style={styles.infoText}>🕒 Horarios: {place.openingHours}</Text>
              <Text style={styles.infoText}>📞 Teléfono: {place.phone}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.favBtn, isFav && styles.activeFavBtn]}
            onPress={() => toggleFavorite(place.id)}
          >
            <Text style={[styles.favBtnText, isFav && styles.activeFavBtnText]}>
              {isFav ? '❤️ Guardado' : '📌 Quiero conocer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { paddingBottom: 100 },
  heroImage: { width: '100%', height: 260 },
  closeBtn: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(2, 6, 23, 0.8)', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  body: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  badgeCol: { flex: 1 },
  statusPill: { backgroundColor: '#7c3aed', color: '#ffffff', fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
  zoneText: { color: '#34d399', fontSize: 11, fontWeight: '700' },
  ratingText: { backgroundColor: '#f59e0b', color: '#020617', fontSize: 12, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  nameText: { color: '#ffffff', fontSize: 24, fontWeight: '900', lineHeight: 30, marginBottom: 4 },
  taglineText: { color: '#fbbf24', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  descText: { color: '#cbd5e1', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  tagPill: { backgroundColor: '#0f172a', color: '#38bdf8', fontSize: 11, fontWeight: '700', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b' },
  nfcBanner: { backgroundColor: '#0f172a', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#10b981', marginBottom: 24 },
  nfcTitle: { color: '#34d399', fontSize: 15, fontWeight: '900', marginBottom: 4 },
  nfcSub: { color: '#94a3b8', fontSize: 12, marginBottom: 12, lineHeight: 18 },
  nfcButton: { backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  nfcButtonText: { color: '#020617', fontSize: 13, fontWeight: '900' },
  section: { marginTop: 12, marginBottom: 20 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  menuCard: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 16, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1e293b' },
  menuImage: { width: 64, height: 64, borderRadius: 12, marginRight: 12 },
  menuInfo: { flex: 1, justifyContent: 'center' },
  menuTitle: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  menuDesc: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  menuPrice: { color: '#34d399', fontSize: 13, fontWeight: '900', marginTop: 4 },
  infoText: { color: '#cbd5e1', fontSize: 13, marginBottom: 6 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(2, 6, 23, 0.95)', padding: 16, borderTopWidth: 1, borderColor: '#1e293b' },
  favBtn: { backgroundColor: '#1e293b', paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  activeFavBtn: { backgroundColor: '#10b981' },
  favBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  activeFavBtnText: { color: '#020617' }
});
