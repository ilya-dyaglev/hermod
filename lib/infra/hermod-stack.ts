import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

// Module imports - resource creators
import { createApiGateway } from './module/create-api-gateway';
import { createDynamoDbTables } from './module/create-dynamodb-tables';
import { createLambdaFunctions } from './module/create-lambda-functions';
import { createS3Buckets } from './module/create-s3-buckets';
import { createCloudFrontDistribution } from './module/create-cloudfront';
import { createEventBridgeRules } from './module/create-eventbridge';

/**
 * HermodStack - Main CDK Stack for the Hermod application
 * 
 * This stack provisions all AWS resources required for the
 * Predictive Multi-Modal Congestion Avoider application:
 * 
 * - API Gateway for REST API endpoints
 * - Lambda functions for data processing and business logic
 * - DynamoDB tables for data storage
 * - S3 buckets for static assets and data storage
 * - CloudFront for UI distribution
 * - EventBridge for scheduled data fetching
 */
export class HermodStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // =========================================================================
    // S3 Buckets
    // =========================================================================
    const buckets = createS3Buckets(this);

    // =========================================================================
    // DynamoDB Tables
    // =========================================================================
    const tables = createDynamoDbTables(this);

    // =========================================================================
    // Lambda Functions
    // =========================================================================
    const lambdas = createLambdaFunctions(this, {
      tables,
      buckets,
    });

    // =========================================================================
    // API Gateway
    // =========================================================================
    const api = createApiGateway(this, {
      lambdas,
    });

    // =========================================================================
    // EventBridge Rules (Scheduled Data Fetching)
    // =========================================================================
    createEventBridgeRules(this, {
      lambdas,
    });

    // =========================================================================
    // CloudFront Distribution (UI Hosting)
    // =========================================================================
    const distribution = createCloudFrontDistribution(this, {
      uiBucket: buckets.uiBucket,
      api,
    });

    // =========================================================================
    // Stack Outputs
    // =========================================================================
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'Hermod API Gateway endpoint URL',
      exportName: 'HermodApiEndpoint',
    });

    new cdk.CfnOutput(this, 'WebAppUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'Hermod Web Application URL',
      exportName: 'HermodWebAppUrl',
    });

    new cdk.CfnOutput(this, 'UIBucketName', {
      value: buckets.uiBucket.bucketName,
      description: 'S3 bucket for UI static assets',
      exportName: 'HermodUIBucketName',
    });
  }
}
