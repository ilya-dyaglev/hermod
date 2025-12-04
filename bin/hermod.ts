#!/usr/bin/env node
import 'dotenv/config';
import { App } from 'aws-cdk-lib';
import { PipelineStack } from '@/pipeline/pipeline-stack';
import { HermodStack } from '@/hermod-stack';
import { getPipelineConfig } from '@/config/pipeline';
import { getStageConfig } from '@/config/stages';

const app = new App();

/**
 * Two modes:
 *
 * 1. Local development:
 *    AWS_ACCOUNT_ID=xxx npm run deploy
 *    → Deploys dev-hermod directly to your account
 *
 * 2. Pipeline deployment:
 *    Set GITHUB_CONNECTION_ARN, AWS_ACCOUNT_ID, GITHUB_REPO
 *    → Deploys the pipeline (which auto-deploys prod on GitHub push)
 */

const connectionArn = process.env.GITHUB_CONNECTION_ARN;
const isPipelineMode = connectionArn !== undefined && connectionArn !== '';

if (isPipelineMode) {
  const config = getPipelineConfig();

  new PipelineStack(app, 'HermodPipeline', {
    githubRepo: config.githubRepo,
    branch: config.branch,
    connectionArn: config.connectionArn,
    env: {
      account: config.account,
      region: config.region,
    },
    description: 'Hermod CI/CD Pipeline - deploys prod on GitHub push',
  });
} else {
  const config = getStageConfig();

  new HermodStack(app, config.stackName, {
    env: {
      account: config.account,
      region: config.region,
    },
    description: `Hermod (${config.stage}) - Predictive Multi-Modal Congestion Avoider`,
  });
}

app.synth();
