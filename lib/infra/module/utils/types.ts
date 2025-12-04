/**
 * types.ts
 * 
 * Shared TypeScript types for the Hermod application
 */

/**
 * Geographic coordinates
 */
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Route segment types
 */
export type TransportMode = 
  | 'walk'
  | 'bike'
  | 'bus'
  | 'train'
  | 'tram'
  | 'car'
  | 'flex'
  | 'veloh';

/**
 * A single segment of a multi-modal route
 */
export interface RouteSegment {
  id: string;
  mode: TransportMode;
  origin: Coordinates & { name: string };
  destination: Coordinates & { name: string };
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  delayMinutes?: number;
  predictedDelayMinutes?: number;
  lineId?: string;
  lineName?: string;
  instructions?: string;
}

/**
 * A complete multi-modal route
 */
export interface Route {
  id: string;
  segments: RouteSegment[];
  totalDurationMinutes: number;
  totalDelayMinutes: number;
  predictedTotalDelayMinutes?: number;
  departureTime: string;
  arrivalTime: string;
  modes: TransportMode[];
  confidence?: number;
  weather?: WeatherCondition;
}

/**
 * Weather conditions
 */
export interface WeatherCondition {
  temperature: number;
  precipitation: 'none' | 'light' | 'moderate' | 'heavy';
  windSpeed: number;
  description: string;
  icon: string;
}

/**
 * Delay prediction
 */
export interface DelayPrediction {
  segmentId: string;
  predictedDelayMinutes: number;
  confidence: number;
  factors: DelayFactor[];
  timestamp: string;
}

/**
 * Factors contributing to predicted delays
 */
export interface DelayFactor {
  type: 'weather' | 'historical' | 'event' | 'congestion' | 'incident';
  impact: number; // -1 to 1, where negative is improvement
  description: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  userId: string;
  defaultOrigin?: Coordinates & { name: string };
  defaultDestination?: Coordinates & { name: string };
  preferredModes: TransportMode[];
  avoidModes: TransportMode[];
  maxWalkingMinutes: number;
  departureBuffer: number; // minutes before meeting
  savedRoutes: SavedRoute[];
  notifications: NotificationPreferences;
}

/**
 * Saved route for quick access
 */
export interface SavedRoute {
  id: string;
  name: string;
  origin: Coordinates & { name: string };
  destination: Coordinates & { name: string };
  preferredModes?: TransportMode[];
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enablePush: boolean;
  enableEmail: boolean;
  delayThresholdMinutes: number;
  notifyBefore: number; // minutes before departure
}

/**
 * Map overlay data
 */
export interface MapOverlayData {
  timestamp: string;
  congestion: CongestionPoint[];
  bikes: BikeStationMarker[];
  flex: FlexStationMarker[];
  weather: WeatherOverlay;
}

/**
 * Congestion point for map display
 */
export interface CongestionPoint {
  coordinates: Coordinates;
  severity: 'low' | 'medium' | 'high' | 'severe';
  delayMinutes: number;
  affectedModes: TransportMode[];
}

/**
 * Bike station marker for map
 */
export interface BikeStationMarker {
  id: string;
  coordinates: Coordinates;
  name: string;
  availableBikes: number;
  totalStands: number;
}

/**
 * FLEX station marker for map
 */
export interface FlexStationMarker {
  id: string;
  coordinates: Coordinates;
  name: string;
  availableCars: number;
}

/**
 * Weather overlay for map
 */
export interface WeatherOverlay {
  condition: WeatherCondition;
  badges: WeatherBadge[];
}

/**
 * Weather badge for specific areas
 */
export interface WeatherBadge {
  coordinates: Coordinates;
  condition: 'rain' | 'snow' | 'wind' | 'fog' | 'clear';
  intensity: 'light' | 'moderate' | 'heavy';
}

/**
 * API request/response types
 */
export interface RouteRequest {
  origin: Coordinates & { name?: string };
  destination: Coordinates & { name?: string };
  departureTime?: string;
  arrivalTime?: string;
  preferredModes?: TransportMode[];
  avoidModes?: TransportMode[];
  userId?: string;
}

export interface RouteResponse {
  routes: Route[];
  weather: WeatherCondition;
  timestamp: string;
}

export interface PredictionRequest {
  routeId?: string;
  segmentId?: string;
  targetTime?: string;
}

export interface PredictionResponse {
  predictions: DelayPrediction[];
  timestamp: string;
}
