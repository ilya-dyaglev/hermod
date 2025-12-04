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

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'hermod-pipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection(props.githubRepo, props.branch, {
          connectionArn: props.connectionArn,
        }),
        commands: [
          'npm ci',
          'npm run lint',
          'npm run build',
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
