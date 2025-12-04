/**
 * create-eventbridge.ts
 * 
 * Creates EventBridge rules for scheduled data fetching:
 * - Weather data updates every 15 minutes
 * - Transit data updates every 5 minutes
 * - Bike/FLEX availability updates every 2 minutes
 */

import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { resourceName } from './create-resource';
import { LambdaFunctionsOutput } from './create-lambda-functions';

export interface EventBridgeConfig {
  lambdas: LambdaFunctionsOutput;
}

/**
 * Creates EventBridge rules for scheduled data fetching
 */
export function createEventBridgeRules(
  scope: Construct,
  config: EventBridgeConfig
): void {
  const { lambdas } = config;

  // Weather data - every 15 minutes
  new events.Rule(scope, 'FetchWeatherSchedule', {
    ruleName: resourceName('fetch-weather-schedule'),
    description: 'Triggers weather data fetching every 15 minutes',
    schedule: events.Schedule.rate(cdk.Duration.minutes(15)),
    targets: [
      new targets.LambdaFunction(lambdas.fetchWeatherData, {
        event: events.RuleTargetInput.fromObject({
          source: 'scheduled',
          type: 'weather',
        }),
      }),
    ],
  });

  // Transit data - every 5 minutes (for real-time updates)
  new events.Rule(scope, 'FetchTransitSchedule', {
    ruleName: resourceName('fetch-transit-schedule'),
    description: 'Triggers transit data fetching every 5 minutes',
    schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
    targets: [
      new targets.LambdaFunction(lambdas.fetchTransitData, {
        event: events.RuleTargetInput.fromObject({
          source: 'scheduled',
          type: 'transit',
        }),
      }),
    ],
  });

  // Bike availability - every 2 minutes (high frequency for real-time)
  new events.Rule(scope, 'FetchBikeSchedule', {
    ruleName: resourceName('fetch-bike-schedule'),
    description: 'Triggers bike availability fetching every 2 minutes',
    schedule: events.Schedule.rate(cdk.Duration.minutes(2)),
    targets: [
      new targets.LambdaFunction(lambdas.fetchBikeAvailability, {
        event: events.RuleTargetInput.fromObject({
          source: 'scheduled',
          type: 'bikes',
        }),
      }),
    ],
  });

  // FLEX carsharing - every 2 minutes
  new events.Rule(scope, 'FetchFlexSchedule', {
    ruleName: resourceName('fetch-flex-schedule'),
    description: 'Triggers FLEX carsharing data fetching every 2 minutes',
    schedule: events.Schedule.rate(cdk.Duration.minutes(2)),
    targets: [
      new targets.LambdaFunction(lambdas.fetchFlexCarsharing, {
        event: events.RuleTargetInput.fromObject({
          source: 'scheduled',
          type: 'flex',
        }),
      }),
    ],
  });
}

// Import cdk for Duration
import * as cdk from 'aws-cdk-lib';
