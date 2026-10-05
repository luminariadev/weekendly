export type UserRole = 'guest' | 'user' | 'merchant' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeLabel: string;
}

export interface CityLocation {
  name: string;
  displayName: string;
  lat: number;
  lng: number;
}

export interface DayForecast {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  weatherCode: number;
  weatherDescription: string;
  isRainy: boolean;
  recommendationMode: 'OUTDOOR' | 'INDOOR' | 'MIXED';
}

export interface WeekendWeather {
  saturday: DayForecast;
  sunday: DayForecast;
  summary: string;
}

export interface PlaceReview {
  id: string;
  placeId: string;
  authorName: string;
  authorRole: UserRole;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface PlacePOI {
  id: string;
  name: string;
  category: string;
  type: 'OUTDOOR' | 'INDOOR';
  description: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  weatherFitBadge: string;
  rating?: number;
  address?: string;
  imageUrl?: string;
  // RBAC & Merchant Fields
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  promoText?: string;
  submittedBy?: string;
  submittedByName?: string;
  reviews?: PlaceReview[];
}

export interface SmartOutingResult {
  city: CityLocation;
  weather: WeekendWeather;
  places: PlacePOI[];
}
