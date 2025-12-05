import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  Stages,
  getCurrentStage,
  isProd,
  getStageConfig,
} from '@infra/config/stages';

describe('stages config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.STAGE;
    delete process.env.AWS_ACCOUNT_ID;
    delete process.env.AWS_REGION;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Stages constant', () => {
    it('has DEV and PROD values', () => {
      expect(Stages.DEV).toBe('dev');
      expect(Stages.PROD).toBe('prod');
    });
  });

  describe('getCurrentStage', () => {
    it('returns dev by default when STAGE is not set', () => {
      expect(getCurrentStage()).toBe(Stages.DEV);
    });

    it('returns dev when STAGE is empty string', () => {
      process.env.STAGE = '';
      expect(getCurrentStage()).toBe(Stages.DEV);
    });

    it('returns dev when STAGE is invalid value', () => {
      process.env.STAGE = 'staging';
      expect(getCurrentStage()).toBe(Stages.DEV);
    });

    it('returns prod when STAGE=prod', () => {
      process.env.STAGE = 'prod';
      expect(getCurrentStage()).toBe(Stages.PROD);
    });
  });

  describe('isProd', () => {
    it('returns false when STAGE is not set', () => {
      expect(isProd()).toBe(false);
    });

    it('returns false when STAGE=dev', () => {
      process.env.STAGE = 'dev';
      expect(isProd()).toBe(false);
    });

    it('returns true when STAGE=prod', () => {
      process.env.STAGE = 'prod';
      expect(isProd()).toBe(true);
    });
  });

  describe('getStageConfig', () => {
    it('throws when AWS_ACCOUNT_ID is not set', () => {
      expect(() => getStageConfig()).toThrow(
        'AWS_ACCOUNT_ID environment variable is required'
      );
    });

    it('throws when AWS_ACCOUNT_ID is empty string', () => {
      process.env.AWS_ACCOUNT_ID = '';
      expect(() => getStageConfig()).toThrow(
        'AWS_ACCOUNT_ID environment variable is required'
      );
    });

    it('returns dev config with defaults', () => {
      process.env.AWS_ACCOUNT_ID = '123456789012';

      const config = getStageConfig();

      expect(config).toEqual({
        stage: 'dev',
        account: '123456789012',
        region: 'eu-central-1',
        stackName: 'dev-hermod',
      });
    });

    it('returns prod config when STAGE=prod', () => {
      process.env.AWS_ACCOUNT_ID = '123456789012';
      process.env.STAGE = 'prod';

      const config = getStageConfig();

      expect(config).toEqual({
        stage: 'prod',
        account: '123456789012',
        region: 'eu-central-1',
        stackName: 'prod-hermod',
      });
    });

    it('uses custom region when AWS_REGION is set', () => {
      process.env.AWS_ACCOUNT_ID = '123456789012';
      process.env.AWS_REGION = 'us-east-1';

      const config = getStageConfig();

      expect(config.region).toBe('us-east-1');
    });
  });
});

