import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { useApp } from '../context/AppContext';
import { APP_CONFIG } from '../config';

interface DiagnosticResult {
  step: string;
  success: boolean;
  status?: number;
  latencyMs?: number;
  message?: string;
}

export const DevInspectorScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { authToken, user, refetchPlaces } = useApp();

  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Test Place State
  const [testPlaceCount, setTestPlaceCount] = useState<number>(0);
  const [testPlaceInfo, setTestPlaceInfo] = useState<any | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

  // 1. Connection & Health State
  const [healthStatus, setHealthStatus] = useState<{
    connected: boolean;
    statusText: string;
    statusCode: number;
    latencyMs: number;
    dbStatus: string;
    version: string;
  }>({
    connected: false,
    statusText: 'No comprobado',
    statusCode: 0,
    latencyMs: 0,
    dbStatus: 'Desconocido',
    version: 'Unknown'
  });

  // 2. Auth / Session State
  const [sessionInfo, setSessionInfo] = useState<{
    active: boolean;
    userId: string | null;
    email: string | null;
    name: string | null;
    role: string | null;
    tokenPresent: boolean;
  }>({
    active: false,
    userId: null,
    email: null,
    name: null,
    role: null,
    tokenPresent: !!authToken
  });

  // 3. Catalog Places State
  const [publicPlaces, setPublicPlaces] = useState<any[]>([]);
  const [adminPlaces, setAdminPlaces] = useState<any[]>([]);
  const [selectedPlaceDetail, setSelectedPlaceDetail] = useState<any | null>(null);

  // 4. Discovery State
  const [discoveryPlaces, setDiscoveryPlaces] = useState<any[]>([]);

  // 5. Nearby State
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);

  // 6. Favorites & Skipped State
  const [favoritesList, setFavoritesList] = useState<any[]>([]);

  // 7. Diagnostic Test Suite Results
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [runningDiag, setRunningDiag] = useState(false);

  useEffect(() => {
    fetchAllDevData();
  }, []);

  const fetchAllDevData = async () => {
    setLoading(true);
    const startTime = Date.now();

    // 1. Test Health
    try {
      const hStart = Date.now();
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/health`);
      const latency = Date.now() - hStart;
      const data = await res.json();
      setHealthStatus({
        connected: res.status === 200,
        statusText: `${res.status} OK`,
        statusCode: res.status,
        latencyMs: latency,
        dbStatus: data.database || 'En línea',
        version: data.version || '0.4.1'
      });
    } catch {
      setHealthStatus({
        connected: false,
        statusText: 'ERROR CONEXIÓN',
        statusCode: 0,
        latencyMs: Date.now() - startTime,
        dbStatus: 'Desconectado',
        version: 'Unknown'
      });
    }

    // 2. Test Auth Session /me
    if (authToken) {
      try {
        const res = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (data.success && data.user) {
          setSessionInfo({
            active: true,
            userId: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role || 'CONSUMER',
            tokenPresent: true
          });
        }
      } catch {
        setSessionInfo(prev => ({ ...prev, active: false }));
      }
    } else {
      setSessionInfo({
        active: !!user,
        userId: user?.id || null,
        email: user?.email || null,
        name: user?.name || null,
        role: 'CONSUMER',
        tokenPresent: false
      });
    }

    // 3. Test Public Places
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/places`);
      const data = await res.json();
      if (data.success && Array.isArray(data.places)) {
        setPublicPlaces(data.places);
      }
    } catch {
      setPublicPlaces([]);
    }

    // 3b. Test Admin Places (if authenticated)
    if (authToken) {
      try {
        const res = await fetch(`${APP_CONFIG.API_BASE_URL}/admin/places`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.places)) {
          setAdminPlaces(data.places);
        }
      } catch {
        setAdminPlaces([]);
      }
    }

    // 4. Test Discovery
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/places/discovery`);
      const data = await res.json();
      if (data.success && Array.isArray(data.places)) {
        setDiscoveryPlaces(data.places);
      }
    } catch {
      setDiscoveryPlaces([]);
    }

    // 5. Test Nearby
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/places/nearby?lat=-33.0472&lng=-71.6127&radius=50`);
      const data = await res.json();
      if (data.success && Array.isArray(data.places)) {
        setNearbyPlaces(data.places);
      }
    } catch {
      setNearbyPlaces([]);
    }

    // 6. Test Favorites
    if (authToken) {
      try {
        const res = await fetch(`${APP_CONFIG.API_BASE_URL}/places/favorites/me`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.places)) {
          setFavoritesList(data.places);
        }
      } catch {
        setFavoritesList([]);
      }
    }

    // 0. Test Place Check
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/dev/test-place`);
      const data = await res.json();
      if (data.success) {
        setTestPlaceCount(data.count || 0);
        setTestPlaceInfo(data.places?.[0] || null);
      }
    } catch {
      setTestPlaceCount(0);
      setTestPlaceInfo(null);
    }

    setLastUpdated(new Date().toLocaleTimeString());
    setLoading(false);
  };

  const handleCreateTestPlace = async () => {
    setIsActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/dev/test-place`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('✅ Restaurante de prueba creado correctamente en PostgreSQL.');
        await refetchPlaces();
        await fetchAllDevData();
      } else {
        setActionMessage(`❌ Error: ${data.message}`);
      }
    } catch (err: any) {
      setActionMessage(`❌ Error de conexión: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmDeleteTestPlace = () => {
    if (Platform.OS === 'web') {
      const confirmWeb = window.confirm(
        '¿Eliminar los datos de prueba de VALPAR?\n\nNo se eliminarán lugares reales. Se borrarán únicamente los registros con dataSource = SEED_DEVELOPMENT en PostgreSQL.'
      );
      if (confirmWeb) executeDeleteTestPlace();
    } else {
      Alert.alert(
        '¿Eliminar los datos de prueba de VALPAR?',
        'No se eliminarán lugares reales. Se borrarán únicamente los registros con dataSource = SEED_DEVELOPMENT en PostgreSQL.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: executeDeleteTestPlace }
        ]
      );
    }
  };

  const executeDeleteTestPlace = async () => {
    setIsActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/dev/test-place`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('✅ Datos de prueba eliminados correctamente.');
        await refetchPlaces();
        await fetchAllDevData();
      } else {
        setActionMessage(`❌ Error: ${data.message}`);
      }
    } catch (err: any) {
      setActionMessage(`❌ Error de conexión: ${err.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const runFullDiagnostics = async () => {
    setRunningDiag(true);
    const results: DiagnosticResult[] = [];

    // Step 1: Health
    try {
      const s = Date.now();
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/health`);
      const lat = Date.now() - s;
      results.push({
        step: '1. API Health (/api/health)',
        success: res.status === 200,
        status: res.status,
        latencyMs: lat,
        message: res.status === 200 ? '200 OK - Backend en línea' : `Status ${res.status}`
      });
    } catch (err: any) {
      results.push({ step: '1. API Health (/api/health)', success: false, message: err.message });
    }

    // Step 2: Auth Me
    try {
      const s = Date.now();
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/me`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      const lat = Date.now() - s;
      results.push({
        step: '2. Auth Session (/api/auth/me)',
        success: res.status === 200,
        status: res.status,
        latencyMs: lat,
        message: res.status === 200 ? 'Sesión verificada' : `Status ${res.status} (No autenticado)`
      });
    } catch (err: any) {
      results.push({ step: '2. Auth Session (/api/auth/me)', success: false, message: err.message });
    }

    // Step 3: Places
    try {
      const s = Date.now();
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/places`);
      const lat = Date.now() - s;
      const data = await res.json();
      results.push({
        step: '3. Public Places (/api/places)',
        success: res.status === 200 && data.success,
        status: res.status,
        latencyMs: lat,
        message: `${data.count || data.places?.length || 0} lugares recibidos`
      });
    } catch (err: any) {
      results.push({ step: '3. Public Places (/api/places)', success: false, message: err.message });
    }

    // Step 4: Discovery
    try {
      const s = Date.now();
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/places/discovery`);
      const lat = Date.now() - s;
      const data = await res.json();
      results.push({
        step: '4. Discovery Feed (/api/places/discovery)',
        success: res.status === 200 && data.success,
        status: res.status,
        latencyMs: lat,
        message: `${data.places?.length || 0} tarjetas cargadas`
      });
    } catch (err: any) {
      results.push({ step: '4. Discovery Feed (/api/places/discovery)', success: false, message: err.message });
    }

    // Step 5: Nearby
    try {
      const s = Date.now();
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/places/nearby?lat=-33.0472&lng=-71.6127&radius=50`);
      const lat = Date.now() - s;
      const data = await res.json();
      results.push({
        step: '5. Geospatial Nearby (/api/places/nearby)',
        success: res.status === 200 && data.success,
        status: res.status,
        latencyMs: lat,
        message: `${data.places?.length || 0} marcadores con Haversine`
      });
    } catch (err: any) {
      results.push({ step: '5. Geospatial Nearby (/api/places/nearby)', success: false, message: err.message });
    }

    setDiagnosticResults(results);
    setRunningDiag(false);
  };

  const activePlacesList = adminPlaces.length > 0 ? adminPlaces : publicPlaces;

  const publishedCount = activePlacesList.filter(p => p.publicationStatus === 'PUBLISHED').length;
  const draftCount = activePlacesList.filter(p => p.publicationStatus === 'DRAFT').length;
  const pausedCount = activePlacesList.filter(p => p.publicationStatus === 'PAUSED').length;
  const archivedCount = activePlacesList.filter(p => p.publicationStatus === 'ARCHIVED').length;

  return (
    <View style={styles.container}>
      {/* Dev Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose}>
          <Text style={styles.backBtnText}>← Cerrar</Text>
        </TouchableOpacity>
        <Text style={styles.topHeaderTitle}>🛠️ DEV INSPECTOR</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAllDevData}>
          <Text style={styles.refreshBtnText}>🔄 {lastUpdated || 'Actualizar'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Consultando backend Express & PostgreSQL...</Text>
          </View>
        ) : (
          <>
            {/* 1. ENVIRONMENT & PLATFORM (Section 20) */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>📱 ENTORNO DE DESARROLLO</Text>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>Modo Dev:</Text>
                <Text style={styles.valText}>{__DEV__ ? 'true (__DEV__ activo)' : 'false'}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>Versión App:</Text>
                <Text style={styles.valText}>{APP_CONFIG.VERSION} ({APP_CONFIG.STATUS})</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>Plataforma OS:</Text>
                <Text style={styles.valText}>{Platform.OS} (v{Platform.Version})</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>Base API URL:</Text>
                <Text style={[styles.valText, styles.highlightUrl]}>{APP_CONFIG.API_BASE_URL}</Text>
              </View>
            </View>

            {/* 1b. CONTROLLED TEST DATA (Section 2 & 3) */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>🧪 DATOS DE PRUEBA CONTROLADOS (POSTGRESQL)</Text>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>Estado actual:</Text>
                <Text style={[styles.valText, testPlaceCount > 0 ? styles.textGreen : styles.textGray]}>
                  {testPlaceCount === 0 ? '0 datos de prueba' : `${testPlaceCount} dato de prueba creado`}
                </Text>
              </View>

              {testPlaceInfo && (
                <View style={styles.testPlaceBox}>
                  <Text style={styles.testPlaceTitle}>{testPlaceInfo.name}</Text>
                  <Text style={styles.testPlaceMeta}>
                    Status: {testPlaceInfo.publicationStatus} | dataSource: {testPlaceInfo.dataSource}
                  </Text>
                  <Text style={styles.testPlaceMeta}>
                    Comuna: {testPlaceInfo.commune || testPlaceInfo.city} | Lat: {testPlaceInfo.latitude}, Lng: {testPlaceInfo.longitude}
                  </Text>
                </View>
              )}

              <View style={styles.testBtnRow}>
                <TouchableOpacity
                  style={[styles.testBtn, styles.testBtnCreate, isActionLoading && styles.testBtnDisabled]}
                  onPress={handleCreateTestPlace}
                  disabled={isActionLoading}
                >
                  <Text style={styles.testBtnCreateText}>+ Crear restaurante de prueba</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.testBtn, styles.testBtnDelete, (isActionLoading || testPlaceCount === 0) && styles.testBtnDisabled]}
                  onPress={confirmDeleteTestPlace}
                  disabled={isActionLoading || testPlaceCount === 0}
                >
                  <Text style={styles.testBtnDeleteText}>🗑️ Eliminar datos de prueba</Text>
                </TouchableOpacity>
              </View>

              {actionMessage && (
                <Text style={styles.actionMessageText}>{actionMessage}</Text>
              )}
            </View>

            {/* 2. API CONNECTION & HEALTH (Section 6) */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>🌐 ESTADO DE CONEXIÓN API REST</Text>
              <View style={styles.statusBadgeRow}>
                <View style={[styles.statusDot, healthStatus.connected ? styles.dotGreen : styles.dotRed]} />
                <Text style={[styles.statusTitle, healthStatus.connected ? styles.textGreen : styles.textRed]}>
                  API {healthStatus.connected ? '● CONECTADA' : '● DESCONECTADA / ERROR'}
                </Text>
              </View>

              <View style={styles.kvRow}>
                <Text style={styles.keyText}>HTTP Status:</Text>
                <Text style={styles.valText}>{healthStatus.statusText}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>Latencia de Red:</Text>
                <Text style={styles.valText}>{healthStatus.latencyMs} ms</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>PostgreSQL DB:</Text>
                <Text style={styles.valText}>{healthStatus.dbStatus}</Text>
              </View>
            </View>

            {/* 3. SESSION & AUTH INFO (Section 7) */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>👤 INFORMACIÓN DE SESIÓN (JWT)</Text>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>Estado Sesión:</Text>
                <Text style={[styles.valText, sessionInfo.active ? styles.textGreen : styles.textGray]}>
                  {sessionInfo.active ? '● ACTIVA' : '● NO AUTENTICADA'}
                </Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>User ID:</Text>
                <Text style={styles.valText}>{sessionInfo.userId || 'NULL'}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>Nombre:</Text>
                <Text style={styles.valText}>{sessionInfo.name || 'NULL'}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>Email:</Text>
                <Text style={styles.valText}>{sessionInfo.email || 'NULL'}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>Rol:</Text>
                <Text style={styles.valText}>{sessionInfo.role || 'NULL'}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.keyText}>JWT Token:</Text>
                <Text style={styles.valText}>{sessionInfo.tokenPresent ? '● Presente' : '● Ausente'}</Text>
              </View>
            </View>

            {/* 4. CATALOG INSPECTOR (Section 8 & 9) */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>📊 INSPECTOR DE CATÁLOGO (POSTGRESQL)</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricBox}>
                  <Text style={styles.metricVal}>{activePlacesList.length}</Text>
                  <Text style={styles.metricLbl}>Recibidos</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricVal, styles.textGreen]}>{publishedCount}</Text>
                  <Text style={styles.metricLbl}>PUBLISHED</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricVal, styles.textYellow]}>{draftCount}</Text>
                  <Text style={styles.metricLbl}>DRAFT</Text>
                </View>
                <View style={styles.metricBox}>
                  <Text style={[styles.metricVal, styles.textGray]}>{pausedCount + archivedCount}</Text>
                  <Text style={styles.metricLbl}>OTRO</Text>
                </View>
              </View>

              <Text style={styles.subHeader}>Places recibidos de API ({activePlacesList.length}):</Text>
              {activePlacesList.map((p, idx) => (
                <TouchableOpacity
                  key={p.id || idx}
                  style={styles.placeCompactRow}
                  onPress={() => setSelectedPlaceDetail(p)}
                >
                  <View style={styles.placeCompactInfo}>
                    <Text style={styles.placeCompactName}>{p.name}</Text>
                    <Text style={styles.placeCompactMeta}>
                      {p.category} • {p.city || p.commune || 'Valparaíso'}
                    </Text>
                  </View>
                  <View style={styles.placeCompactBadgeCol}>
                    <Text style={[styles.statusBadgePill, p.publicationStatus === 'PUBLISHED' ? styles.badgeGreen : styles.badgeYellow]}>
                      {p.publicationStatus || 'DRAFT'}
                    </Text>
                    <Text style={styles.ratingNullBadge}>
                      {p.rating !== null && p.rating !== undefined && p.reviewCount > 0 ? `★ ${p.rating}` : 'rating: NULL'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* 5. DISCOVERY INSPECTOR (Section 11) */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>🔥 DISCOVERY INSPECTOR (/api/places/discovery)</Text>
              <Text style={styles.subHeader}>Lugares retornados por Discovery ({discoveryPlaces.length}):</Text>
              {discoveryPlaces.slice(0, 5).map((p, i) => (
                <View key={`disc-${p.id || i}`} style={styles.miniRow}>
                  <Text style={styles.miniRowNum}>#{i + 1}</Text>
                  <Text style={styles.miniRowName}>{p.name}</Text>
                  <Text style={styles.miniRowMeta}>
                    Rating: {p.rating !== null ? p.rating : 'NULL'} | Reviews: {p.reviewCount ?? 0}
                  </Text>
                </View>
              ))}
            </View>

            {/* 6. NEARBY INSPECTOR (Section 12) */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>📍 NEARBY INSPECTOR (/api/places/nearby)</Text>
              <Text style={styles.subHeader}>Lugares geo-ordenados por Haversine ({nearbyPlaces.length}):</Text>
              {nearbyPlaces.slice(0, 5).map((p, i) => (
                <View key={`near-${p.id || i}`} style={styles.miniRow}>
                  <Text style={styles.miniRowNum}>#{i + 1}</Text>
                  <Text style={styles.miniRowName}>{p.name}</Text>
                  <Text style={styles.miniRowMeta}>
                    Distancia: {p.distanceKm !== undefined ? `${p.distanceKm} km` : 'Sin dist'}
                  </Text>
                </View>
              ))}
            </View>

            {/* 7. FAVORITES & SKIPPED INSPECTOR (Section 13 & 14) */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>❤️ FAVORITOS PERSISTIDOS ({favoritesList.length})</Text>
              {favoritesList.length === 0 ? (
                <Text style={styles.emptyText}>No hay favoritos persistidos para este usuario.</Text>
              ) : (
                favoritesList.map((f, i) => (
                  <View key={`fav-${f.id || i}`} style={styles.miniRow}>
                    <Text style={styles.miniRowName}>• {f.name}</Text>
                    <Text style={styles.miniRowMeta}>{f.category}</Text>
                  </View>
                ))
              )}
            </View>

            {/* 8. DIAGNOSTIC END-TO-END SUITE (Section 15) */}
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>🧪 DIAGNÓSTICO END-TO-END EN VIVO</Text>
              <TouchableOpacity
                style={styles.diagButton}
                onPress={runFullDiagnostics}
                disabled={runningDiag}
              >
                <Text style={styles.diagButtonText}>
                  {runningDiag ? 'Ejecutando pruebas HTTP...' : '▶ Ejecutar Diagnóstico de Conexión'}
                </Text>
              </TouchableOpacity>

              {diagnosticResults.map((r, i) => (
                <View key={i} style={styles.diagResultRow}>
                  <Text style={r.success ? styles.textGreen : styles.textRed}>
                    {r.success ? '✓' : '✗'} {r.step}
                  </Text>
                  <Text style={styles.diagResultSub}>{r.message} ({r.latencyMs || 0} ms)</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* PLACE DETAILS RAW INSPECTOR MODAL (Section 10 - Shows exact NULL values) */}
      <Modal visible={!!selectedPlaceDetail} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>RAW PLACE INSPECTOR</Text>
              <TouchableOpacity onPress={() => setSelectedPlaceDetail(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedPlaceDetail && (
              <ScrollView style={styles.modalScroll}>
                {Object.entries(selectedPlaceDetail).map(([k, v]) => {
                  if (typeof v === 'object' && v !== null) {
                    v = JSON.stringify(v);
                  }
                  const isNull = v === null || v === undefined;
                  return (
                    <View key={k} style={styles.rawKvRow}>
                      <Text style={styles.rawKey}>{k}:</Text>
                      <Text style={[styles.rawVal, isNull && styles.rawNull]}>
                        {isNull ? 'NULL' : String(v)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 44, paddingBottom: 12, backgroundColor: '#0f172a', borderBottomWidth: 1, borderColor: '#1e293b' },
  backBtn: { backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  backBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  topHeaderTitle: { color: '#10b981', fontSize: 16, fontWeight: '900' },
  refreshBtn: { backgroundColor: '#10b98120', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#10b981' },
  refreshBtnText: { color: '#10b981', fontSize: 11, fontWeight: '800' },

  scrollContent: { padding: 16, paddingBottom: 100 },
  loadingBox: { padding: 40, alignItems: 'center' },
  loadingText: { color: '#94a3b8', marginTop: 12, fontSize: 13, fontWeight: '600' },

  card: { backgroundColor: '#0f172a', borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#1e293b' },
  sectionHeader: { color: '#38bdf8', fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  subHeader: { color: '#cbd5e1', fontSize: 12, fontWeight: '800', marginTop: 8, marginBottom: 8 },

  kvRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  keyText: { color: '#94a3b8', fontSize: 12, fontWeight: '600' },
  valText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  highlightUrl: { color: '#fbbf24' },

  statusBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  dotGreen: { backgroundColor: '#10b981' },
  dotRed: { backgroundColor: '#f43f5e' },
  statusTitle: { fontSize: 14, fontWeight: '900' },
  textGreen: { color: '#10b981' },
  textRed: { color: '#f43f5e' },
  textYellow: { color: '#fbbf24' },
  textGray: { color: '#64748b' },

  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  metricBox: { backgroundColor: '#1e293b', padding: 10, borderRadius: 12, flex: 1, marginHorizontal: 3, alignItems: 'center' },
  metricVal: { color: '#ffffff', fontSize: 16, fontWeight: '900' },
  metricLbl: { color: '#94a3b8', fontSize: 9, fontWeight: '800', marginTop: 2 },

  placeCompactRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#1e293b' },
  placeCompactInfo: { flex: 1, paddingRight: 8 },
  placeCompactName: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  placeCompactMeta: { color: '#94a3b8', fontSize: 10 },
  placeCompactBadgeCol: { alignItems: 'flex-end' },
  statusBadgePill: { fontSize: 9, fontWeight: '800', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  badgeGreen: { backgroundColor: '#10b98120', color: '#10b981' },
  badgeYellow: { backgroundColor: '#fbbf2420', color: '#fbbf24' },
  ratingNullBadge: { color: '#64748b', fontSize: 10, marginTop: 2, fontWeight: '700' },

  miniRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  miniRowNum: { color: '#64748b', fontSize: 11, marginRight: 6, fontWeight: '700' },
  miniRowName: { color: '#ffffff', fontSize: 12, fontWeight: '700', flex: 1 },
  miniRowMeta: { color: '#fbbf24', fontSize: 11, fontWeight: '600' },
  emptyText: { color: '#64748b', fontSize: 12 },

  diagButton: { backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  diagButtonText: { color: '#020617', fontSize: 13, fontWeight: '900' },
  diagResultRow: { backgroundColor: '#020617', padding: 10, borderRadius: 10, marginBottom: 6 },
  diagResultSub: { color: '#94a3b8', fontSize: 10, marginTop: 2 },

  modalBg: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.85)', justifyContent: 'center', padding: 16 },
  modalBox: { backgroundColor: '#0f172a', borderRadius: 20, padding: 16, maxHeight: '80%', borderWidth: 1, borderColor: '#10b981' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderColor: '#1e293b', paddingBottom: 8 },
  modalTitle: { color: '#10b981', fontSize: 14, fontWeight: '900' },
  modalClose: { color: '#ffffff', fontSize: 16, fontWeight: '800' },
  modalScroll: { flex: 1 },
  rawKvRow: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderColor: '#1e293b' },
  rawKey: { color: '#38bdf8', fontSize: 11, fontWeight: '800', width: 130 },
  rawVal: { color: '#ffffff', fontSize: 11, flex: 1, fontWeight: '600' },
  rawNull: { color: '#f43f5e', fontWeight: '900' },

  testPlaceBox: { backgroundColor: '#1e293b', padding: 10, borderRadius: 12, marginVertical: 8, borderWidth: 1, borderColor: '#10b98140' },
  testPlaceTitle: { color: '#10b981', fontSize: 13, fontWeight: '800' },
  testPlaceMeta: { color: '#94a3b8', fontSize: 10, marginTop: 2 },

  testBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  testBtn: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center', marginHorizontal: 3 },
  testBtnCreate: { backgroundColor: '#10b981' },
  testBtnDelete: { backgroundColor: '#f43f5e20', borderWidth: 1, borderColor: '#f43f5e' },
  testBtnDisabled: { opacity: 0.4 },
  testBtnCreateText: { color: '#020617', fontSize: 11, fontWeight: '900' },
  testBtnDeleteText: { color: '#f43f5e', fontSize: 11, fontWeight: '900' },
  actionMessageText: { color: '#fbbf24', fontSize: 11, fontWeight: '700', marginTop: 8, textAlign: 'center' }
});
