/**
 * Hermod CI/CD Pipeline
 *
 * GitHub push → Build → Deploy to Prod
 */

import { Stack } from 'aws-cdk-lib';
import type { StackProps } from 'aws-cdk-lib';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import type { Construct } from 'constructs';
import { HermodStage } from './hermod-stage';
import { Stages } from '@/config/stages';

export interface PipelineStackProps extends StackProps {
  /**
   * GitHub repository in format: owner/repo
   */
  githubRepo: string;

  /**
   * Branch to deploy from
   */
  branch: string;

  /**
   * CodeStar Connection ARN for GitHub
   * Create this in AWS Console: Developer Tools > Connections
   */
  connectionArn: string;
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);

    if (props.env?.account === undefined || props.env.account === '') {
      throw new Error('PipelineStack requires props.env.account');
    }

    const region: string = props.env.region ?? 'eu-central-1';

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'hermod-pipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(props.githubRepo, props.branch, {
          connectionArn: props.connectionArn,
        }),
        env: {
          AWS_REGION: region,
        },
        commands: [
          'npm ci',
          'npm run lint',
          'npm run build',
          'npm run ui:build',
          // Fetch config from SSM Parameter Store
          'export AWS_ACCOUNT_ID=$(aws ssm get-parameter --name /hermod/config/account-id --query Parameter.Value --output text --region $AWS_REGION)',
          'export GITHUB_CONNECTION_ARN=$(aws ssm get-parameter --name /hermod/config/github-connection-arn --query Parameter.Value --output text --region $AWS_REGION)',
          'export GITHUB_REPO=$(aws ssm get-parameter --name /hermod/config/github-repo --query Parameter.Value --output text --region $AWS_REGION)',
          'export GITHUB_BRANCH=$(aws ssm get-parameter --name /hermod/config/github-branch --query Parameter.Value --output text --region $AWS_REGION)',
          // Validate SSM parameters were fetched (fail fast if missing)
          '[ -n "$AWS_ACCOUNT_ID" ] || { echo "ERROR: Failed to fetch AWS_ACCOUNT_ID from SSM"; exit 1; }',
          '[ -n "$GITHUB_CONNECTION_ARN" ] || { echo "ERROR: Failed to fetch GITHUB_CONNECTION_ARN from SSM"; exit 1; }',
          '[ -n "$GITHUB_REPO" ] || { echo "ERROR: Failed to fetch GITHUB_REPO from SSM"; exit 1; }',
          '[ -n "$GITHUB_BRANCH" ] || { echo "ERROR: Failed to fetch GITHUB_BRANCH from SSM"; exit 1; }',
          'npx cdk synth',
        ],
      }),
    });

    // Prod stage - deploys automatically on GitHub push
    const prodStage = new HermodStage(this, 'Prod', {
      stage: Stages.PROD,
      env: props.env,
    });
    pipeline.addStage(prodStage);
  }
}
