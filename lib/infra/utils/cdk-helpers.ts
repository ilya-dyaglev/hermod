/**
 * CDK utility helpers
 *
 * Shared utilities for resource naming, policies, and common patterns.
 */

import { RemovalPolicy } from 'aws-cdk-lib';
import { getCurrentStage, isProd } from '@/config/stages';

/**
 * Generate consistent resource names with environment prefix
 */
export const resourceName = (baseName: string): string => {
  return `hermod-${getCurrentStage()}-${baseName}`;
};

/**
 * Get removal policy based on environment
 * - Prod: RETAIN (prevent accidental deletion)
 * - Other: DESTROY (clean up resources)
 */
export const getRemovalPolicy = (): RemovalPolicy => {
  return isProd() ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY;
};
