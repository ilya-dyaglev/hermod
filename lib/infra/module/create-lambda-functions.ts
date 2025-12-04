/**
 * create-lambda-functions.ts
 * 
 * Creates Lambda functions for the Hermod application:
 * - Data fetchers for external APIs (weather, transit, bikes)
 * - Route computation and prediction handlers
 * - User preference handlers
 */

import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { resourceName, ExternalApis } from './create-resource';
import { DynamoDbTablesOutput } from './create-dynamodb-tables';
import { S3BucketsOutput } from './create-s3-buckets';

export interface LambdaFunctionsConfig {
  tables: DynamoDbTablesOutput;
  buckets: S3BucketsOutput;
}

export interface LambdaFunctionsOutput {
  // Data Fetchers
  readonly fetchWeatherData: lambda.Function;
  readonly fetchTransitData: lambda.Function;
  readonly fetchBikeAvailability: lambda.Function;
  readonly fetchFlexCarsharing: lambda.Function;

  // Route Handlers
  readonly computeRoute: lambda.Function;
  readonly getPrediction: lambda.Function;

  // User Handlers
  readonly getUserPreferences: lambda.Function;
  readonly updateUserPreferences: lambda.Function;

  // Map Data
  readonly getMapOverlay: lambda.Function;
}

/**
 * Common Lambda configuration
 */
const commonLambdaProps: Partial<lambda.FunctionProps> = {
  runtime: lambda.Runtime.NODEJS_20_X,
  memorySize: 256,
  timeout: cdk.Duration.seconds(30),
  architecture: lambda.Architecture.ARM_64,
  tracing: lambda.Tracing.ACTIVE,
};

/**
 * Creates all Lambda functions required by the Hermod application
 */
export function createLambdaFunctions(
  scope: Construct,
  config: LambdaFunctionsConfig
): LambdaFunctionsOutput {
  const { tables, buckets } = config;

  // Common environment variables
  const commonEnv = {
    ROUTES_TABLE: tables.routesTable.tableName,
    TRANSIT_DATA_TABLE: tables.transitDataTable.tableName,
    WEATHER_DATA_TABLE: tables.weatherDataTable.tableName,
    USER_PREFERENCES_TABLE: tables.userPreferencesTable.tableName,
    PREDICTIONS_TABLE: tables.predictionsTable.tableName,
    DATA_BUCKET: buckets.dataBucket.bucketName,
    ML_MODELS_BUCKET: buckets.mlModelsBucket.bucketName,
  };

  // API endpoints environment
  const apiEnv = {
    WEATHER_DAILY_URL: ExternalApis.WEATHER_DAILY_JSON,
    WEATHER_HOURLY_URL: ExternalApis.WEATHER_HOURLY_JSON,
    WEATHER_AIRPORT_URL: ExternalApis.WEATHER_AIRPORT_CSV,
    DATA_PUBLIC_LU_API: ExternalApis.DATA_PUBLIC_LU_API,
    JCDECAUX_API: ExternalApis.JCDECAUX_STATIONS,
  };

  // =========================================================================
  // Data Fetchers
  // =========================================================================

  const fetchWeatherData = new lambda.Function(scope, 'FetchWeatherDataLambda', {
    ...commonLambdaProps,
    functionName: resourceName('fetch-weather-data'),
    handler: 'index.handler',
    code: lambda.Code.fromInline(getLambdaPlaceholder('fetchWeatherData')),
    description: 'Fetches weather data from Luxembourg weather APIs',
    environment: {
      ...commonEnv,
      ...apiEnv,
    },
  });

  const fetchTransitData = new lambda.Function(scope, 'FetchTransitDataLambda', {
    ...commonLambdaProps,
    functionName: resourceName('fetch-transit-data'),
    handler: 'index.handler',
    code: lambda.Code.fromInline(getLambdaPlaceholder('fetchTransitData')),
    description: 'Fetches real-time transit data from GTFS-RT and other sources',
    timeout: cdk.Duration.seconds(60),
    environment: {
      ...commonEnv,
      ...apiEnv,
    },
  });

  const fetchBikeAvailability = new lambda.Function(scope, 'FetchBikeAvailabilityLambda', {
    ...commonLambdaProps,
    functionName: resourceName('fetch-bike-availability'),
    handler: 'index.handler',
    code: lambda.Code.fromInline(getLambdaPlaceholder('fetchBikeAvailability')),
    description: 'Fetches Vel\'OH bike availability from JCDecaux API',
    environment: {
      ...commonEnv,
      JCDECAUX_API_KEY: '{{resolve:ssm:/hermod/jcdecaux-api-key:1}}',
    },
  });

  const fetchFlexCarsharing = new lambda.Function(scope, 'FetchFlexCarsharingLambda', {
    ...commonLambdaProps,
    functionName: resourceName('fetch-flex-carsharing'),
    handler: 'index.handler',
    code: lambda.Code.fromInline(getLambdaPlaceholder('fetchFlexCarsharing')),
    description: 'Fetches FLEX carsharing availability from CFL',
    environment: {
      ...commonEnv,
      ...apiEnv,
    },
  });

  // =========================================================================
  // Route Handlers
  // =========================================================================

  const computeRoute = new lambda.Function(scope, 'ComputeRouteLambda', {
    ...commonLambdaProps,
    functionName: resourceName('compute-route'),
    handler: 'index.handler',
    code: lambda.Code.fromInline(getLambdaPlaceholder('computeRoute')),
    description: 'Computes optimal multi-modal routes with predictions',
    memorySize: 512,
    timeout: cdk.Duration.seconds(60),
    environment: commonEnv,
  });

  const getPrediction = new lambda.Function(scope, 'GetPredictionLambda', {
    ...commonLambdaProps,
    functionName: resourceName('get-prediction'),
    handler: 'index.handler',
    code: lambda.Code.fromInline(getLambdaPlaceholder('getPrediction')),
    description: 'Retrieves ML-based delay predictions for routes',
    memorySize: 512,
    environment: commonEnv,
  });

  // =========================================================================
  // User Handlers
  // =========================================================================

  const getUserPreferences = new lambda.Function(scope, 'GetUserPreferencesLambda', {
    ...commonLambdaProps,
    functionName: resourceName('get-user-preferences'),
    handler: 'index.handler',
    code: lambda.Code.fromInline(getLambdaPlaceholder('getUserPreferences')),
    description: 'Retrieves user preferences and saved routes',
    environment: commonEnv,
  });

  const updateUserPreferences = new lambda.Function(scope, 'UpdateUserPreferencesLambda', {
    ...commonLambdaProps,
    functionName: resourceName('update-user-preferences'),
    handler: 'index.handler',
    code: lambda.Code.fromInline(getLambdaPlaceholder('updateUserPreferences')),
    description: 'Updates user preferences and saved routes',
    environment: commonEnv,
  });

  // =========================================================================
  // Map Data
  // =========================================================================

  const getMapOverlay = new lambda.Function(scope, 'GetMapOverlayLambda', {
    ...commonLambdaProps,
    functionName: resourceName('get-map-overlay'),
    handler: 'index.handler',
    code: lambda.Code.fromInline(getLambdaPlaceholder('getMapOverlay')),
    description: 'Provides real-time map overlay data for congestion visualization',
    environment: commonEnv,
  });

  // =========================================================================
  // Grant Permissions
  // =========================================================================

  // Grant table access to all functions
  const allFunctions = [
    fetchWeatherData,
    fetchTransitData,
    fetchBikeAvailability,
    fetchFlexCarsharing,
    computeRoute,
    getPrediction,
    getUserPreferences,
    updateUserPreferences,
    getMapOverlay,
  ];

  allFunctions.forEach((fn) => {
    tables.routesTable.grantReadWriteData(fn);
    tables.transitDataTable.grantReadWriteData(fn);
    tables.weatherDataTable.grantReadWriteData(fn);
    tables.predictionsTable.grantReadWriteData(fn);
    buckets.dataBucket.grantReadWrite(fn);
  });

  // User preferences table only for user handlers
  tables.userPreferencesTable.grantReadData(getUserPreferences);
  tables.userPreferencesTable.grantReadWriteData(updateUserPreferences);

  // ML models bucket access for prediction
  buckets.mlModelsBucket.grantRead(getPrediction);
  buckets.mlModelsBucket.grantRead(computeRoute);

  return {
    fetchWeatherData,
    fetchTransitData,
    fetchBikeAvailability,
    fetchFlexCarsharing,
    computeRoute,
    getPrediction,
    getUserPreferences,
    updateUserPreferences,
    getMapOverlay,
  };
}

/**
 * Returns placeholder Lambda code
 * TODO: Replace with actual Lambda code from lib/infra/module/lambdas/
 */
function getLambdaPlaceholder(functionName: string): string {
  return `
    exports.handler = async (event) => {
      console.log('${functionName} invoked', JSON.stringify(event, null, 2));
      return {
        statusCode: 501,
        body: JSON.stringify({
          message: '${functionName} not yet implemented',
          timestamp: new Date().toISOString(),
        }),
      };
    };
  `;
}
