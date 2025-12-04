/**
 * Hermod Stage
 *
 * A CDK Stage that wraps the HermodStack.
 * Used by CDK Pipelines to deploy to different environments.
 */

import { Stage } from 'aws-cdk-lib';
import type { StageProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { HermodStack } from '@/hermod-stack';
import type { Stage as EnvStage } from '@/config/stages';

export interface HermodStageProps extends StageProps {
  stage: EnvStage;
}

export class HermodStage extends Stage {
  constructor(scope: Construct, id: string, props: HermodStageProps) {
    super(scope, id, props);

    new HermodStack(this, 'HermodStack', {
      description: `Hermod (${props.stage}) - Predictive Multi-Modal Congestion Avoider`,
    });
  }
}

