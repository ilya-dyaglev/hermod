/**
 * create-resource.ts
 * 
 * Base module for resource creation utilities.
 * Add helper functions and shared types here.
 */

import * as cdk from 'aws-cdk-lib';

/**
 * Resource naming helper
 */
export const resourceName = (baseName: string): string => {
  const env = process.env.ENVIRONMENT || 'dev';
  return `hermod-${env}-${baseName}`;
};

/**
 * Get removal policy based on environment
 */
export const getRemovalPolicy = (): cdk.RemovalPolicy => {
  return process.env.ENVIRONMENT === 'production'
    ? cdk.RemovalPolicy.RETAIN
    : cdk.RemovalPolicy.DESTROY;
};

/**
 * External API endpoints used by Hermod
 */
export const ExternalApis = {
  // Weather
  WEATHER_DAILY: 'https://wms.inspire.geoportail.lu/geoserver/mf/wfs?SERVICE=wfs&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=MF.PointTimeSeriesObservation_Daily_ASTA_avg_ta200&OUTPUTFORMAT=application/json',
  WEATHER_HOURLY: 'https://wms.inspire.geoportail.lu/geoserver/mf/wfs?SERVICE=wfs&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=MF.PointTimeSeriesObservation_Hourly_ASTA_avg_ta200&OUTPUTFORMAT=application/json',
  
  // Transportation
  DATA_PUBLIC_LU: 'https://data.public.lu/api/1/datasets/',
  JCDECAUX_BIKES: 'https://api.jcdecaux.com/vls/v1/stations?contract=luxembourg',
} as const;
