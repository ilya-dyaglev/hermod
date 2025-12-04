/**
 * create-resource.ts
 * 
 * Base module for resource creation utilities and shared types
 * used across all Hermod CDK resource creators.
 */

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Common tags applied to all resources
 */
export const getCommonTags = (): Record<string, string> => ({
  Application: 'Hermod',
  ManagedBy: 'CDK',
});

/**
 * Resource naming convention helper
 */
export const resourceName = (baseName: string, suffix?: string): string => {
  const env = process.env.ENVIRONMENT || 'dev';
  return suffix ? `hermod-${env}-${baseName}-${suffix}` : `hermod-${env}-${baseName}`;
};

/**
 * Apply removal policy based on environment
 */
export const getRemovalPolicy = (): cdk.RemovalPolicy => {
  const env = process.env.ENVIRONMENT || 'dev';
  return env === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY;
};

/**
 * Base interface for resource configuration
 */
export interface BaseResourceConfig {
  readonly scope: Construct;
  readonly prefix?: string;
}

/**
 * External API endpoints used by Hermod
 */
export const ExternalApis = {
  // Weather Data
  WEATHER_DAILY_JSON: 'https://wms.inspire.geoportail.lu/geoserver/mf/wfs?SERVICE=wfs&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=MF.PointTimeSeriesObservation_Daily_ASTA_avg_ta200&OUTPUTFORMAT=application/json',
  WEATHER_HOURLY_JSON: 'https://wms.inspire.geoportail.lu/geoserver/mf/wfs?SERVICE=wfs&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=MF.PointTimeSeriesObservation_Hourly_ASTA_avg_ta200&OUTPUTFORMAT=application/json',
  WEATHER_AIRPORT_CSV: 'https://download.data.public.lu/resources/present-weather-condition-at-luxembourg-airport-ellx-decoded-from-metar-message/20251129-233205/data-lux-actual.csv',
  WEATHER_METAR_TAF: 'https://download.data.public.lu/resources/aerodrome-reports-and-forecasts-for-luxembourg-airport-ellx/20251129-233212/data-metar-taf-laf.csv',

  // Transportation Data
  DATA_PUBLIC_LU_API: 'https://data.public.lu/api/1/datasets/',
  FLEX_CARSHARING_PATTERN: 'https://download.data.public.lu/resources/flex-carsharing-by-cfl-1/',

  // Bicycle Mobility
  JCDECAUX_STATIONS: 'https://api.jcdecaux.com/vls/v1/stations?contract=luxembourg',

  // Transit APIs
  CFL_GTFS_RT: 'https://data.public.lu/en/reuses/gtfs-rt/',
  NETEX_DATA: 'https://data.public.lu/en/datasets/horaires-et-arrets-des-transport-publics-netex/',
  SNCF_API: 'https://ressources.data.sncf.com/api/explore/v2.1/console',
  DEUTSCHEBAHN_API: 'https://developers.deutschebahn.com/db-api-marketplace/apis/start',
  IRAIL_API: 'https://docs.irail.be/',
} as const;

/**
 * Type for external API keys
 */
export type ExternalApiKey = keyof typeof ExternalApis;
