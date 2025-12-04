/**
 * Deployment stages
 */

export const Stages = {
  DEV: 'dev',
  PROD: 'prod',
} as const;

export type Stage = (typeof Stages)[keyof typeof Stages];

/**
 * Get current stage from environment variable
 */
export const getCurrentStage = (): Stage => {
  const env = process.env.STAGE;
  if (env === Stages.PROD) {
    return Stages.PROD;
  }
  return Stages.DEV;
};

/**
 * Check if current stage is production
 */
export const isProd = (): boolean => getCurrentStage() === Stages.PROD;

/**
 * Stage configuration
 * Account ID must be set via AWS_ACCOUNT_ID environment variable
 */
export interface StageConfig {
  stage: Stage;
  account: string;
  region: string;
  stackName: string;
}

export const getStageConfig = (): StageConfig => {
  const stage = getCurrentStage();
  const account = process.env.AWS_ACCOUNT_ID;

  if (account === undefined || account === '') {
    throw new Error('AWS_ACCOUNT_ID environment variable is required');
  }

  return {
    stage,
    account,
    region: process.env.AWS_REGION ?? 'eu-central-1',
    stackName: `${stage}-hermod`,
  };
};
