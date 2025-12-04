/**
 * create-api-gateway.ts
 * 
 * Creates the API Gateway for the Hermod application
 * with REST endpoints for routes, predictions, and user preferences.
 */

import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { resourceName, getRemovalPolicy } from './create-resource';
import { LambdaFunctionsOutput } from './create-lambda-functions';

export interface ApiGatewayConfig {
  lambdas: LambdaFunctionsOutput;
}

/**
 * Creates the API Gateway with all REST endpoints
 */
export function createApiGateway(
  scope: Construct,
  config: ApiGatewayConfig
): apigateway.RestApi {
  const { lambdas } = config;

  // Access logs
  const accessLogGroup = new logs.LogGroup(scope, 'ApiAccessLogs', {
    logGroupName: `/aws/apigateway/${resourceName('api')}/access-logs`,
    retention: logs.RetentionDays.ONE_MONTH,
    removalPolicy: getRemovalPolicy(),
  });

  // Create REST API
  const api = new apigateway.RestApi(scope, 'HermodApi', {
    restApiName: resourceName('api'),
    description: 'Hermod - Predictive Multi-Modal Congestion Avoider API',
    deployOptions: {
      stageName: 'v1',
      tracingEnabled: true,
      accessLogDestination: new apigateway.LogGroupLogDestination(accessLogGroup),
      accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
        caller: true,
        httpMethod: true,
        ip: true,
        protocol: true,
        requestTime: true,
        resourcePath: true,
        responseLength: true,
        status: true,
        user: true,
      }),
      throttlingBurstLimit: 100,
      throttlingRateLimit: 50,
    },
    defaultCorsPreflightOptions: {
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowMethods: apigateway.Cors.ALL_METHODS,
      allowHeaders: [
        'Content-Type',
        'X-Amz-Date',
        'Authorization',
        'X-Api-Key',
        'X-Amz-Security-Token',
      ],
      maxAge: cdk.Duration.days(1),
    },
  });

  // =========================================================================
  // Routes Endpoints
  // =========================================================================
  const routesResource = api.root.addResource('routes');

  // POST /routes - Compute a new route
  routesResource.addMethod(
    'POST',
    new apigateway.LambdaIntegration(lambdas.computeRoute, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
    }),
    {
      operationName: 'ComputeRoute',
      methodResponses: [{ statusCode: '200' }, { statusCode: '400' }, { statusCode: '500' }],
    }
  );

  // GET /routes/{routeId} - Get a specific route
  const routeByIdResource = routesResource.addResource('{routeId}');
  routeByIdResource.addMethod(
    'GET',
    new apigateway.LambdaIntegration(lambdas.computeRoute),
    { operationName: 'GetRoute' }
  );

  // =========================================================================
  // Predictions Endpoints
  // =========================================================================
  const predictionsResource = api.root.addResource('predictions');

  // GET /predictions - Get predictions for a route segment
  predictionsResource.addMethod(
    'GET',
    new apigateway.LambdaIntegration(lambdas.getPrediction),
    { operationName: 'GetPredictions' }
  );

  // GET /predictions/{routeSegment} - Get predictions for a specific segment
  const predictionBySegmentResource = predictionsResource.addResource('{routeSegment}');
  predictionBySegmentResource.addMethod(
    'GET',
    new apigateway.LambdaIntegration(lambdas.getPrediction),
    { operationName: 'GetSegmentPrediction' }
  );

  // =========================================================================
  // Real-time Data Endpoints
  // =========================================================================
  const dataResource = api.root.addResource('data');

  // Weather data
  const weatherResource = dataResource.addResource('weather');
  weatherResource.addMethod(
    'GET',
    new apigateway.LambdaIntegration(lambdas.fetchWeatherData),
    { operationName: 'GetWeatherData' }
  );

  // Transit data
  const transitResource = dataResource.addResource('transit');
  transitResource.addMethod(
    'GET',
    new apigateway.LambdaIntegration(lambdas.fetchTransitData),
    { operationName: 'GetTransitData' }
  );

  // Bike availability
  const bikesResource = dataResource.addResource('bikes');
  bikesResource.addMethod(
    'GET',
    new apigateway.LambdaIntegration(lambdas.fetchBikeAvailability),
    { operationName: 'GetBikeAvailability' }
  );

  // FLEX carsharing
  const flexResource = dataResource.addResource('flex');
  flexResource.addMethod(
    'GET',
    new apigateway.LambdaIntegration(lambdas.fetchFlexCarsharing),
    { operationName: 'GetFlexAvailability' }
  );

  // =========================================================================
  // Map Overlay Endpoint
  // =========================================================================
  const mapResource = api.root.addResource('map');
  const overlayResource = mapResource.addResource('overlay');

  overlayResource.addMethod(
    'GET',
    new apigateway.LambdaIntegration(lambdas.getMapOverlay),
    { operationName: 'GetMapOverlay' }
  );

  // =========================================================================
  // User Preferences Endpoints
  // =========================================================================
  const usersResource = api.root.addResource('users');
  const userByIdResource = usersResource.addResource('{userId}');
  const preferencesResource = userByIdResource.addResource('preferences');

  // GET /users/{userId}/preferences
  preferencesResource.addMethod(
    'GET',
    new apigateway.LambdaIntegration(lambdas.getUserPreferences),
    { operationName: 'GetUserPreferences' }
  );

  // PUT /users/{userId}/preferences
  preferencesResource.addMethod(
    'PUT',
    new apigateway.LambdaIntegration(lambdas.updateUserPreferences),
    { operationName: 'UpdateUserPreferences' }
  );

  // =========================================================================
  // Health Check
  // =========================================================================
  const healthResource = api.root.addResource('health');
  healthResource.addMethod(
    'GET',
    new apigateway.MockIntegration({
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': JSON.stringify({
              status: 'healthy',
              service: 'hermod-api',
              timestamp: '$context.requestTime',
            }),
          },
        },
      ],
      requestTemplates: {
        'application/json': '{ "statusCode": 200 }',
      },
    }),
    {
      operationName: 'HealthCheck',
      methodResponses: [{ statusCode: '200' }],
    }
  );

  return api;
}
