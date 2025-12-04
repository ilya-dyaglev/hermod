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

    if (!props.env?.account) {
      throw new Error('PipelineStack requires props.env.account');
    }

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'hermod-pipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(props.githubRepo, props.branch, {
          connectionArn: props.connectionArn,
        }),
        env: {
          GITHUB_CONNECTION_ARN: props.connectionArn,
          AWS_ACCOUNT_ID: props.env.account,
          GITHUB_REPO: props.githubRepo,
          GITHUB_BRANCH: props.branch,
          AWS_REGION: props.env.region ?? 'eu-central-1',
        },
        commands: [
          'npm ci',
          'npm run lint',
          'npm run build',
          'npm run ui:build',
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
