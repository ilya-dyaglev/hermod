/**
 * create-dynamodb-tables.ts
 * 
 * Creates DynamoDB tables for the Hermod application:
 * - Routes table for storing computed routes
 * - TransitData table for real-time transit information
 * - WeatherData table for weather observations
 * - UserPreferences table for personalized settings
 * - Predictions table for ML prediction results
 */

import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { resourceName, getRemovalPolicy } from './create-resource';

export interface DynamoDbTablesOutput {
  readonly routesTable: dynamodb.Table;
  readonly transitDataTable: dynamodb.Table;
  readonly weatherDataTable: dynamodb.Table;
  readonly userPreferencesTable: dynamodb.Table;
  readonly predictionsTable: dynamodb.Table;
}

/**
 * Creates all DynamoDB tables required by the Hermod application
 */
export function createDynamoDbTables(scope: Construct): DynamoDbTablesOutput {
  const removalPolicy = getRemovalPolicy();

  // Routes Table - stores computed multi-modal routes
  const routesTable = new dynamodb.Table(scope, 'RoutesTable', {
    tableName: resourceName('routes'),
    partitionKey: { name: 'routeId', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy,
    timeToLiveAttribute: 'ttl',
    pointInTimeRecovery: true,
  });

  routesTable.addGlobalSecondaryIndex({
    indexName: 'ByOriginDestination',
    partitionKey: { name: 'origin', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'destination', type: dynamodb.AttributeType.STRING },
    projectionType: dynamodb.ProjectionType.ALL,
  });

  // Transit Data Table - stores real-time transit information
  const transitDataTable = new dynamodb.Table(scope, 'TransitDataTable', {
    tableName: resourceName('transit-data'),
    partitionKey: { name: 'dataType', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy,
    timeToLiveAttribute: 'ttl',
  });

  transitDataTable.addGlobalSecondaryIndex({
    indexName: 'ByStopId',
    partitionKey: { name: 'stopId', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'timestamp', type: dynamodb.AttributeType.NUMBER },
    projectionType: dynamodb.ProjectionType.ALL,
  });

  // Weather Data Table - stores weather observations and forecasts
  const weatherDataTable = new dynamodb.Table(scope, 'WeatherDataTable', {
    tableName: resourceName('weather-data'),
    partitionKey: { name: 'stationId', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'observationTime', type: dynamodb.AttributeType.NUMBER },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy,
    timeToLiveAttribute: 'ttl',
  });

  // User Preferences Table - stores personalized user settings
  const userPreferencesTable = new dynamodb.Table(scope, 'UserPreferencesTable', {
    tableName: resourceName('user-preferences'),
    partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy,
    pointInTimeRecovery: true,
  });

  // Predictions Table - stores ML prediction results
  const predictionsTable = new dynamodb.Table(scope, 'PredictionsTable', {
    tableName: resourceName('predictions'),
    partitionKey: { name: 'predictionId', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'targetTime', type: dynamodb.AttributeType.NUMBER },
    billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    removalPolicy,
    timeToLiveAttribute: 'ttl',
  });

  predictionsTable.addGlobalSecondaryIndex({
    indexName: 'ByRouteSegment',
    partitionKey: { name: 'routeSegment', type: dynamodb.AttributeType.STRING },
    sortKey: { name: 'targetTime', type: dynamodb.AttributeType.NUMBER },
    projectionType: dynamodb.ProjectionType.ALL,
  });

  return {
    routesTable,
    transitDataTable,
    weatherDataTable,
    userPreferencesTable,
    predictionsTable,
  };
}
