/**
 * api-client.ts
 * 
 * Utility functions for fetching data from external APIs
 * Used by Lambda functions to retrieve weather, transit, and mobility data.
 */

import { ExternalApis } from '../create-resource';

/**
 * Response type for API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

/**
 * Fetches JSON data from a URL
 */
export async function fetchJson<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as T;
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Fetches CSV data from a URL and parses it
 */
export async function fetchCsv(url: string): Promise<ApiResponse<string[][]>> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    const rows = text.split('\n').map((row) => row.split(','));

    return {
      success: true,
      data: rows,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Fetches the current FLEX carsharing URL dynamically
 * The URL changes with timestamps, so we need to discover it
 */
export async function getFlexCarsharingUrl(): Promise<string | null> {
  try {
    const response = await fetch(ExternalApis.DATA_PUBLIC_LU_API);
    const data = await response.json();
    
    // Parse the response to find the FLEX carsharing resource URL
    const pattern = /https:\/\/download\.data\.public\.lu\/resources\/flex-carsharing-by-cfl-1\/\d+-\d+\/stations-disponibles\.csv/;
    const jsonString = JSON.stringify(data);
    const match = jsonString.match(pattern);
    
    return match ? match[0] : null;
  } catch (error) {
    console.error('Failed to discover FLEX carsharing URL:', error);
    return null;
  }
}

/**
 * Weather data types
 */
export interface WeatherObservation {
  stationId: string;
  temperature: number;
  humidity?: number;
  precipitation?: number;
  windSpeed?: number;
  observationTime: string;
}

/**
 * Bike station data types
 */
export interface BikeStation {
  stationId: string;
  name: string;
  latitude: number;
  longitude: number;
  availableBikes: number;
  availableStands: number;
  lastUpdate: string;
}

/**
 * FLEX carsharing station types
 */
export interface FlexStation {
  stationId: string;
  name: string;
  availableCars: number;
  latitude?: number;
  longitude?: number;
}

/**
 * Transit delay information
 */
export interface TransitDelay {
  routeId: string;
  stopId: string;
  delaySeconds: number;
  timestamp: string;
  source: 'gtfs-rt' | 'api' | 'computed';
}
