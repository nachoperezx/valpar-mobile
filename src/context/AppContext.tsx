import React, { createContext, useContext, useState, useEffect } from 'react';
import { Place, User, Visit, CustomerConsent } from '../types';
import { PLACES_DATA } from '../data/places';
import { APP_CONFIG } from '../config';

export type ActiveTab = 'home' | 'discover' | 'map' | 'passport' | 'profile';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  authToken: string | null;
  isAuthenticated: boolean;
  
  // Auth Actions
  login: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (googleToken: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;

  places: Place[];
  isLoadingPlaces: boolean;
  isPlacesError: boolean;
  placesErrorMessage: string | null;
  refetchPlaces: () => Promise<void>;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPlace: Place | null;
  setSelectedPlace: (place: Place | null) => void;

  // Favorites & Discover Skips
  favorites: string[];
  toggleFavorite: (placeId: string) => Promise<void>;
  recordSkip: (placeId: string) => Promise<void>;
  visitedPlaceIds: string[];
  markVisited: (placeId: string) => void;

  // CheckIns & Visits
  visits: Visit[];
  triggerNfcCheckIn: (placeId: string) => Promise<{ success: boolean; message: string; isFirstVisit?: boolean }>;

  // Privacy & Consents
  consents: CustomerConsent;
  updateConsent: (key: keyof CustomerConsent, value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState<boolean>(true);
  const [isPlacesError, setIsPlacesError] = useState<boolean>(false);
  const [placesErrorMessage, setPlacesErrorMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // User & Auth State (Starts null for real authentication)
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [visitedPlaceIds, setVisitedPlaceIds] = useState<string[]>([]);

  const [visits, setVisits] = useState<Visit[]>([]);

  const [consents, setConsents] = useState<CustomerConsent>({
    whatsappMarketing: true,
    birthdayOffers: true,
    personalizedRecommendations: true,
    visitTracking: true,
    acceptedAt: '2026-06-12 10:00',
    source: 'VALPAR_MOBILE_APP'
  });

  // Sync API Places on Mount (GET /api/places/discovery) - Explicit Error Handling (Section 5 & 17)
  const fetchAPIPlaces = async () => {
    setIsLoadingPlaces(true);
    setIsPlacesError(false);
    setPlacesErrorMessage(null);
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/places/discovery`);
      const data = await res.json();
      if (data && data.success && Array.isArray(data.places)) {
        setPlaces(data.places);
        setIsPlacesError(false);
      } else {
        setPlaces([]);
        setIsPlacesError(true);
        setPlacesErrorMessage(data?.message || 'No pudimos cargar los lugares. Comprueba tu conexión e inténtalo nuevamente.');
      }
    } catch {
      setPlaces([]);
      setIsPlacesError(true);
      setPlacesErrorMessage('No pudimos cargar los lugares. Comprueba tu conexión e inténtalo nuevamente.');
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  useEffect(() => {
    fetchAPIPlaces();
  }, []);

  // Login Handler
  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        setAuthToken(data.token);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Error al iniciar sesión.' };
    } catch {
      return { success: false, message: 'Error al conectar con la API de autenticación.' };
    }
  };

  // Register Handler
  const register = async (name: string, email: string, pass: string, phone?: string) => {
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass, phone })
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        setAuthToken(data.token);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Error al registrar usuario.' };
    } catch {
      return { success: false, message: 'Error de red al conectar con el servidor.' };
    }
  };

  // Google OAuth Handler
  const loginWithGoogle = async (googleToken: string) => {
    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: googleToken })
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        setAuthToken(data.token);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Error de Google OAuth.' };
    } catch {
      return { success: false, message: 'Error de red durante Google OAuth.' };
    }
  };

  // Logout Handler
  const logout = () => {
    setUser(null);
    setAuthToken(null);
    setFavorites([]);
    setVisitedPlaceIds([]);
    setVisits([]);
  };

  const toggleFavorite = async (placeId: string) => {
    const isFav = favorites.includes(placeId);
    setFavorites(prev => isFav ? prev.filter(id => id !== placeId) : [...prev, placeId]);

    // POST /api/places/favorites toggles server-side, so sync both add and remove
    if (authToken) {
      try {
        await fetch(`${APP_CONFIG.API_BASE_URL}/places/favorites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ placeId })
        });
      } catch {
        // Silent persistence fallback
      }
    }
  };

  const recordSkip = async (placeId: string) => {
    if (authToken) {
      try {
        await fetch(`${APP_CONFIG.API_BASE_URL}/places/skipped`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({ placeId })
        });
      } catch {
        // Silent persistence fallback
      }
    }
  };

  const markVisited = (placeId: string) => {
    if (!visitedPlaceIds.includes(placeId)) {
      setVisitedPlaceIds(prev => [...prev, placeId]);
    }
  };

  const updateConsent = (key: keyof CustomerConsent, value: boolean) => {
    setConsents(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const triggerNfcCheckIn = async (placeId: string) => {
    const target = places.find(p => p.id === placeId);
    if (!target) return { success: false, message: 'Lugar no encontrado.' };
    if (!user) return { success: false, message: 'Inicia sesión para registrar tu visita y acumular puntos.' };

    try {
      const res = await fetch(`${APP_CONFIG.API_BASE_URL}/checkins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          placeId,
          userId: user.id,
          userLat: target.location.latitude,
          userLng: target.location.longitude
        })
      });

      const data = await res.json();
      if (data.success && data.visit) {
        setVisits(prev => [data.visit, ...prev]);
        markVisited(placeId);
        const pointsAwarded = Number(data.pointsAwarded) || 0;
        setUser(prev => prev ? ({
          ...prev,
          points: (prev.points || 0) + pointsAwarded,
          visitedPlacesCount: (prev.visitedPlacesCount || 0) + (data.isFirstVisit ? 1 : 0)
        }) : null);

        return {
          success: true,
          message: data.message,
          isFirstVisit: data.isFirstVisit
        };
      }
      return { success: false, message: data.message || 'Error al validar NFC.' };
    } catch {
      // Never award points offline: the visit must be validated by the backend
      return { success: false, message: 'No pudimos conectar con el servidor para validar tu visita. Inténtalo nuevamente.' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        user,
        setUser,
        authToken,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,

        places,
        isLoadingPlaces,
        isPlacesError,
        placesErrorMessage,
        refetchPlaces: fetchAPIPlaces,
        selectedCategory,
        setSelectedCategory,
        selectedCity,
        setSelectedCity,
        searchQuery,
        setSearchQuery,
        selectedPlace,
        setSelectedPlace,

        favorites,
        toggleFavorite,
        recordSkip,
        visitedPlaceIds,
        markVisited,

        visits,
        triggerNfcCheckIn,

        consents,
        updateConsent
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
