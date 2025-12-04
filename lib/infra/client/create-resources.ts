/**
 * Client Stack
 *
 * S3 + CloudFront for hosting the React frontend.
 */

import { CfnOutput, NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import type { NestedStackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import {
  Distribution,
  OriginAccessIdentity,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { join } from 'path';
import { existsSync } from 'fs';
import { isProd } from '@/config/stages';

export class ClientStack extends NestedStack {
  public readonly distributionUrl: string;
  public readonly bucket: Bucket;
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    // S3 bucket for static website assets
    this.bucket = new Bucket(this, 'WebsiteBucket', {
      removalPolicy: isProd() ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd(),
      blockPublicAccess: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
    });

    // Origin Access Identity for CloudFront
    const originAccessIdentity = new OriginAccessIdentity(this, 'OAI', {
      comment: 'OAI for Hermod website',
    });

    this.bucket.grantRead(originAccessIdentity);

    // CloudFront distribution
    this.distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessIdentity(this.bucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html', // SPA routing
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html', // SPA routing
        },
      ],
    });

    this.distributionUrl = `https://${this.distribution.distributionDomainName}`;

    // Deploy UI assets if dist folder exists
    const uiDistPath = join(process.cwd(), 'lib/ui/dist');
    if (existsSync(uiDistPath)) {
      new BucketDeployment(this, 'DeployWebsite', {
        sources: [Source.asset(uiDistPath)],
        destinationBucket: this.bucket,
        distribution: this.distribution,
        distributionPaths: ['/*'],
      });
    }

    // Output the CloudFront URL
    new CfnOutput(this, 'WebsiteUrl', {
      value: this.distributionUrl,
      description: 'Hermod website URL',
    });
  }
}

