#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { HermodStack } from '../lib/infra/hermod-stack';

/**
 * Hermod - Predictive Multi-Modal Congestion Avoider
 * 
 * An AWS CDK application for Luxembourg cross-border commuters
 * providing real-time transit data, weather integration, and
 * ML-based predictive routing.
 */

const app = new cdk.App();

// Environment configuration
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID,
  region: process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION || 'eu-west-1',
};

// Create the main Hermod stack
new HermodStack(app, 'HermodStack', {
  env,
  description: 'Hermod - Predictive Multi-Modal Congestion Avoider for Luxembourg commuters',
  tags: {
    Application: 'Hermod',
    Environment: process.env.ENVIRONMENT || 'development',
  },
});

app.synth();
