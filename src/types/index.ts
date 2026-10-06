export type PlaceStatus = 'DISCOVERED' | 'RECOMMENDED' | 'PARTNER';

export interface Location {
  address: string;
  city: string;
  district: string;
  commune?: string;
  latitude: number;
  longitude: number;
  zone: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
}

export interface Place {
  id: string;
  partnerId?: string;
  status: PlaceStatus;
  publicationStatus?: 'DRAFT' | 'PUBLISHED' | 'PAUSED' | 'ARCHIVED';
  verificationStatus?: 'UNVERIFIED' | 'REVIEWED' | 'VERIFIED';
  dataSource?: string;
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  shortDescription?: string;
  category: string;
  subCategory?: string;
  categories: string[];
  imageUrl?: string;
  coverPhoto?: string;
  gallery: string[];
  rating?: number | null;
  editorialScore?: number | null;
  reviewCount: number;
  verifiedVisits: number;
  priceLevel?: string;
  location: Location;
  openingHours?: string;
  phone?: string;
  publicEmail?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
  nfcActive?: boolean;
  nfcTagId?: string;
  isFeatured?: boolean;
  isRecommended?: boolean;
  currentOffer?: string;
  experienceTags?: string[];
  menu?: Product[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  points: number;
  visitedPlacesCount: number;
  passportLevel: string;
}

export interface CheckIn {
  id: string;
  userId: string;
  placeId: string;
  nfcTagId: string;
  timestamp: string;
  status: 'verified' | 'flagged' | 'rejected';
  pointsAwarded: number;
}

export interface Visit {
  id: string;
  checkInId: string;
  userId: string;
  placeId: string;
  placeName: string;
  date: string;
  status: 'active' | 'completed';
  isFirstVisit: boolean;
  pointsEarned: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'FIRST_VISIT' | 'RETURN_VISIT' | 'DISH_RECOMMENDATION' | 'PHOTO_UPLOAD' | 'ROUTE_COMPLETED' | 'FRIEND_INVITE' | 'REWARD_REDEEM';
  createdAt: string;
  referenceType?: string;
  referenceId?: string;
}

export interface CustomerConsent {
  whatsappMarketing: boolean;
  birthdayOffers: boolean;
  personalizedRecommendations: boolean;
  visitTracking: boolean;
  acceptedAt: string;
  source: string;
}
