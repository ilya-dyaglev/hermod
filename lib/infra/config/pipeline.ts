/**
 * Pipeline configuration
 *
 * All sensitive values come from environment variables.
 */

export interface PipelineConfig {
  githubRepo: string;
  branch: string;
  connectionArn: string;
  account: string;
  region: string;
}

export const getPipelineConfig = (): PipelineConfig => {
  const connectionArn = process.env.GITHUB_CONNECTION_ARN;
  const account = process.env.AWS_ACCOUNT_ID;
  const githubRepo = process.env.GITHUB_REPO;

  if (connectionArn === undefined || connectionArn === '') {
    throw new Error('GITHUB_CONNECTION_ARN environment variable is required');
  }

  if (account === undefined || account === '') {
    throw new Error('AWS_ACCOUNT_ID environment variable is required');
  }

  if (githubRepo === undefined || githubRepo === '') {
    throw new Error('GITHUB_REPO environment variable is required (format: owner/repo)');
  }

  return {
    githubRepo,
    branch: process.env.GITHUB_BRANCH ?? 'main',
    connectionArn,
    account,
    region: process.env.AWS_REGION ?? 'eu-central-1',
  };
};
