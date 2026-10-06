import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal } from 'react-native';
import { useApp } from '../context/AppContext';
import { AuthScreen } from './AuthScreen';

export const PassportScreen: React.FC = () => {
  const { user } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const rules = [
    { action: 'Primera Visita NFC', pts: '+100 pts' },
    { action: 'Visita Recurrente', pts: '+50 pts' },
    { action: 'Recomendar Plato', pts: '+30 pts' },
    { action: 'Subir Foto Verificada', pts: '+20 pts' },
    { action: 'Ruta Completada', pts: '+300 pts' },
    { action: 'Invitar Amigos', pts: '+150 pts' }
  ];

  const currentUser = user || {
    id: 'GUEST-00',
    name: 'Explorador Invitado',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    points: 0,
    visitedPlacesCount: 0,
    passportLevel: 'Nivel Inicial'
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>TARJETA DE SOCIO DIGITAL</Text>
        <Text style={styles.headerTitle}>Pasaporte Valpar</Text>
      </View>

      {/* Passport Digital Card */}
      <View style={styles.passportCard}>
        <View style={styles.passportHeader}>
          <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{currentUser.name}</Text>
            <Text style={styles.userLevel}>🏆 {currentUser.passportLevel}</Text>
            <Text style={styles.userId}>ID: VALPO-PASS-{currentUser.id}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{currentUser.visitedPlacesCount}</Text>
            <Text style={styles.statLabel}>Visitas Verificadas</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumAmber}>{currentUser.points}</Text>
            <Text style={styles.statLabel}>Puntos Valpar</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumGreen}>4</Text>
            <Text style={styles.statLabel}>Racha Semanas</Text>
          </View>
        </View>
      </View>

      {!user && (
        <View style={styles.guestBanner}>
          <Text style={styles.guestBannerTitle}>Activa tu Pasaporte Valpar</Text>
          <Text style={styles.guestBannerSub}>Inicia sesión para acumular puntos reales en tus visitas.</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => setShowAuthModal(true)}>
            <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reglas de Acumulación */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Sistema de Puntos Valpar</Text>
        <View style={styles.rulesGrid}>
          {rules.map((item, idx) => (
            <View key={idx} style={styles.ruleItem}>
              <Text style={styles.rulePts}>{item.pts}</Text>
              <Text style={styles.ruleAction}>{item.action}</Text>
            </View>
          ))}
        </View>
      </View>

      <Modal visible={showAuthModal} animationType="slide">
        <AuthScreen onClose={() => setShowAuthModal(false)} />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { padding: 16, paddingBottom: 100 },
  header: { marginBottom: 16 },
  headerSubtitle: { color: '#34d399', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  passportCard: { backgroundColor: '#0f172a', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#34d399', marginBottom: 16 },
  passportHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 64, height: 64, borderRadius: 20, marginRight: 14, borderWidth: 2, borderColor: '#34d399' },
  userInfo: { flex: 1 },
  userName: { color: '#ffffff', fontSize: 18, fontWeight: '900' },
  userLevel: { color: '#fbbf24', fontSize: 12, fontWeight: '800', marginTop: 2 },
  userId: { color: '#94a3b8', fontSize: 10, marginTop: 2 },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderColor: '#1e293b', paddingTop: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { color: '#ffffff', fontSize: 20, fontWeight: '900' },
  statNumAmber: { color: '#fbbf24', fontSize: 20, fontWeight: '900' },
  statNumGreen: { color: '#34d399', fontSize: 20, fontWeight: '900' },
  statLabel: { color: '#94a3b8', fontSize: 9, marginTop: 2, textAlign: 'center' },
  guestBanner: { backgroundColor: '#0f172a', padding: 16, borderRadius: 18, borderWidth: 1, borderColor: '#10b981', marginBottom: 20, alignItems: 'center' },
  guestBannerTitle: { color: '#ffffff', fontSize: 15, fontWeight: '900', marginBottom: 4 },
  guestBannerSub: { color: '#94a3b8', fontSize: 12, textAlign: 'center', marginBottom: 12 },
  loginBtn: { backgroundColor: '#10b981', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  loginBtnText: { color: '#020617', fontWeight: '900', fontSize: 13 },
  section: { marginTop: 4 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 12 },
  rulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  ruleItem: { width: '48%', backgroundColor: '#0f172a', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#1e293b' },
  rulePts: { color: '#34d399', fontSize: 14, fontWeight: '900' },
  ruleAction: { color: '#cbd5e1', fontSize: 11, marginTop: 4 }
});
