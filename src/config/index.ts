/**
 * VALPAR MOBILE v0.3.0 — CONFIGURACIÓN CENTRALIZADA DE ARQUITECTURA
 */

import Constants from 'expo-constants';

// `localhost` only resolves on the dev machine itself; a phone or Android emulator
// must reach the backend through the LAN IP the Expo dev server is running on.
function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${devHost || 'localhost'}:3001/api`;
}

export const APP_CONFIG = {
  VERSION: '0.3.0',
  STATUS: 'Development / Pre-release',
  IS_PRODUCTION: false,

  // API Backend REST
  API_BASE_URL: resolveApiBaseUrl(),

  // Distance Radius Centralized Configuration (Parte 8)
  DISTANCE_THRESHOLDS: {
    MUY_CERCA_KM: 1.0,      // < 1 km
    CERCA_KM: 3.0,          // 1 - 3 km
    EN_LA_ZONA_KM: 10.0     // 3 - 10 km
    // > 10 km: Fuera del radio cercano
  },

  // OAuth Configuration Notice
  GOOGLE_OAUTH: {
    CLIENT_ID_EXPO: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || null,
    CLIENT_ID_IOS: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || null,
    CLIENT_ID_ANDROID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || null
  }
};

export function getDistanceLabel(distanceKm: number): { label: string; badgeColor: string } {
  if (distanceKm < APP_CONFIG.DISTANCE_THRESHOLDS.MUY_CERCA_KM) {
    return { label: `⚡ Muy cerca (${(distanceKm * 1000).toFixed(0)}m)`, badgeColor: '#10b981' };
  } else if (distanceKm <= APP_CONFIG.DISTANCE_THRESHOLDS.CERCA_KM) {
    return { label: `📍 Cerca (${distanceKm.toFixed(1)} km)`, badgeColor: '#38bdf8' };
  } else if (distanceKm <= APP_CONFIG.DISTANCE_THRESHOLDS.EN_LA_ZONA_KM) {
    return { label: `🚗 En la zona (${distanceKm.toFixed(1)} km)`, badgeColor: '#fbbf24' };
  } else {
    return { label: `🗺️ Fuera del radio (${distanceKm.toFixed(1)} km)`, badgeColor: '#94a3b8' };
  }
}

// Calculate distance using Haversine formula (km)
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
