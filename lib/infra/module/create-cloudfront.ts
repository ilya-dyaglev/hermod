/**
 * create-cloudfront.ts
 * 
 * Creates CloudFront distribution for:
 * - Serving the React UI from S3
 * - Proxying API requests to API Gateway
 */

import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { resourceName } from './create-resource';

export interface CloudFrontConfig {
  uiBucket: s3.Bucket;
  api: apigateway.RestApi;
}

/**
 * Creates CloudFront distribution for UI and API
 */
export function createCloudFrontDistribution(
  scope: Construct,
  config: CloudFrontConfig
): cloudfront.Distribution {
  const { uiBucket, api } = config;

  // Origin Access Identity for S3
  const originAccessIdentity = new cloudfront.OriginAccessIdentity(
    scope,
    'UIOriginAccessIdentity',
    {
      comment: 'OAI for Hermod UI bucket',
    }
  );

  // Grant read access to CloudFront
  uiBucket.grantRead(originAccessIdentity);

  // S3 Origin for UI
  const s3Origin = new origins.S3Origin(uiBucket, {
    originAccessIdentity,
  });

  // API Gateway Origin
  const apiOrigin = new origins.HttpOrigin(
    `${api.restApiId}.execute-api.${cdk.Stack.of(scope).region}.amazonaws.com`,
    {
      originPath: `/${api.deploymentStage.stageName}`,
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
    }
  );

  // Create distribution
  const distribution = new cloudfront.Distribution(scope, 'HermodDistribution', {
    comment: 'Hermod - Predictive Multi-Modal Congestion Avoider',
    defaultRootObject: 'index.html',
    priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    
    // Default behavior - serve UI from S3
    defaultBehavior: {
      origin: s3Origin,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      compress: true,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
    },

    // Additional behaviors
    additionalBehaviors: {
      // API routes
      '/api/*': {
        origin: apiOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      },
      // Static assets with long cache
      '/static/*': {
        origin: s3Origin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: new cloudfront.CachePolicy(scope, 'StaticAssetsCachePolicy', {
          cachePolicyName: resourceName('static-assets-cache'),
          defaultTtl: cdk.Duration.days(30),
          maxTtl: cdk.Duration.days(365),
          minTtl: cdk.Duration.days(1),
          enableAcceptEncodingBrotli: true,
          enableAcceptEncodingGzip: true,
        }),
        compress: true,
      },
    },

    // Error responses - SPA routing
    errorResponses: [
      {
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
        ttl: cdk.Duration.minutes(5),
      },
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html',
        ttl: cdk.Duration.minutes(5),
      },
    ],
  });

  return distribution;
}
