/**
 * create-s3-buckets.ts
 * 
 * Creates S3 buckets for the Hermod application:
 * - UI hosting bucket for static React assets
 * - Data bucket for cached external API responses
 * - ML models bucket for predictive analytics models
 */

import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { resourceName, getRemovalPolicy, getCommonTags } from './create-resource';

export interface S3BucketsOutput {
  readonly uiBucket: s3.Bucket;
  readonly dataBucket: s3.Bucket;
  readonly mlModelsBucket: s3.Bucket;
}

/**
 * Creates all S3 buckets required by the Hermod application
 */
export function createS3Buckets(scope: Construct): S3BucketsOutput {
  const removalPolicy = getRemovalPolicy();

  // UI Bucket - hosts React static assets
  const uiBucket = new s3.Bucket(scope, 'UIBucket', {
    bucketName: resourceName('ui-assets'),
    removalPolicy,
    autoDeleteObjects: removalPolicy === cdk.RemovalPolicy.DESTROY,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    encryption: s3.BucketEncryption.S3_MANAGED,
    versioned: false,
    cors: [
      {
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
        maxAge: 3600,
      },
    ],
  });

  // Data Bucket - stores cached API responses and processed data
  const dataBucket = new s3.Bucket(scope, 'DataBucket', {
    bucketName: resourceName('data'),
    removalPolicy,
    autoDeleteObjects: removalPolicy === cdk.RemovalPolicy.DESTROY,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    encryption: s3.BucketEncryption.S3_MANAGED,
    versioned: true,
    lifecycleRules: [
      {
        id: 'ExpireOldVersions',
        noncurrentVersionExpiration: cdk.Duration.days(30),
        enabled: true,
      },
      {
        id: 'ExpireRawData',
        prefix: 'raw/',
        expiration: cdk.Duration.days(7),
        enabled: true,
      },
    ],
  });

  // ML Models Bucket - stores trained prediction models
  const mlModelsBucket = new s3.Bucket(scope, 'MLModelsBucket', {
    bucketName: resourceName('ml-models'),
    removalPolicy,
    autoDeleteObjects: removalPolicy === cdk.RemovalPolicy.DESTROY,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    encryption: s3.BucketEncryption.S3_MANAGED,
    versioned: true,
  });

  return {
    uiBucket,
    dataBucket,
    mlModelsBucket,
  };
}
