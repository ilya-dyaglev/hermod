import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { getPipelineConfig } from '@infra/config/pipeline';

describe('pipeline config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.GITHUB_CONNECTION_ARN;
    delete process.env.AWS_ACCOUNT_ID;
    delete process.env.GITHUB_REPO;
    delete process.env.GITHUB_BRANCH;
    delete process.env.AWS_REGION;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getPipelineConfig', () => {
    it('throws when GITHUB_CONNECTION_ARN is not set', () => {
      process.env.AWS_ACCOUNT_ID = '123456789012';
      process.env.GITHUB_REPO = 'owner/repo';

      expect(() => getPipelineConfig()).toThrow(
        'GITHUB_CONNECTION_ARN environment variable is required'
      );
    });

    it('throws when GITHUB_CONNECTION_ARN is empty', () => {
      process.env.AWS_ACCOUNT_ID = '123456789012';
      process.env.GITHUB_REPO = 'owner/repo';
      process.env.GITHUB_CONNECTION_ARN = '';

      expect(() => getPipelineConfig()).toThrow(
        'GITHUB_CONNECTION_ARN environment variable is required'
      );
    });

    it('throws when AWS_ACCOUNT_ID is not set', () => {
      process.env.GITHUB_CONNECTION_ARN = 'arn:aws:codestar-connections:...';
      process.env.GITHUB_REPO = 'owner/repo';

      expect(() => getPipelineConfig()).toThrow(
        'AWS_ACCOUNT_ID environment variable is required'
      );
    });

    it('throws when AWS_ACCOUNT_ID is empty', () => {
      process.env.GITHUB_CONNECTION_ARN = 'arn:aws:codestar-connections:...';
      process.env.GITHUB_REPO = 'owner/repo';
      process.env.AWS_ACCOUNT_ID = '';

      expect(() => getPipelineConfig()).toThrow(
        'AWS_ACCOUNT_ID environment variable is required'
      );
    });

    it('throws when GITHUB_REPO is not set', () => {
      process.env.GITHUB_CONNECTION_ARN = 'arn:aws:codestar-connections:...';
      process.env.AWS_ACCOUNT_ID = '123456789012';

      expect(() => getPipelineConfig()).toThrow(
        'GITHUB_REPO environment variable is required (format: owner/repo)'
      );
    });

    it('throws when GITHUB_REPO is empty', () => {
      process.env.GITHUB_CONNECTION_ARN = 'arn:aws:codestar-connections:...';
      process.env.AWS_ACCOUNT_ID = '123456789012';
      process.env.GITHUB_REPO = '';

      expect(() => getPipelineConfig()).toThrow(
        'GITHUB_REPO environment variable is required (format: owner/repo)'
      );
    });

    it('returns config with defaults', () => {
      process.env.GITHUB_CONNECTION_ARN = 'arn:aws:codestar-connections:eu-central-1:123456789012:connection/abc';
      process.env.AWS_ACCOUNT_ID = '123456789012';
      process.env.GITHUB_REPO = 'myorg/myrepo';

      const config = getPipelineConfig();

      expect(config).toEqual({
        githubRepo: 'myorg/myrepo',
        branch: 'main',
        connectionArn: 'arn:aws:codestar-connections:eu-central-1:123456789012:connection/abc',
        account: '123456789012',
        region: 'eu-central-1',
      });
    });

    it('uses custom branch when GITHUB_BRANCH is set', () => {
      process.env.GITHUB_CONNECTION_ARN = 'arn:aws:codestar-connections:eu-central-1:123456789012:connection/abc';
      process.env.AWS_ACCOUNT_ID = '123456789012';
      process.env.GITHUB_REPO = 'myorg/myrepo';
      process.env.GITHUB_BRANCH = 'develop';

      const config = getPipelineConfig();

      expect(config.branch).toBe('develop');
    });

    it('uses custom region when AWS_REGION is set', () => {
      process.env.GITHUB_CONNECTION_ARN = 'arn:aws:codestar-connections:us-east-1:123456789012:connection/abc';
      process.env.AWS_ACCOUNT_ID = '123456789012';
      process.env.GITHUB_REPO = 'myorg/myrepo';
      process.env.AWS_REGION = 'us-east-1';

      const config = getPipelineConfig();

      expect(config.region).toBe('us-east-1');
    });
  });
});

