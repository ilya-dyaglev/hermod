#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { HermodStack } from '../lib/infra/hermod-stack';

const app = new cdk.App();

new HermodStack(app, 'HermodStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'eu-west-1',
  },
  description: 'Hermod - Predictive Multi-Modal Congestion Avoider',
});

app.synth();
