import { Stack } from 'aws-cdk-lib';
import type { StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { ClientStack } from '@/client';

/**
 * HermodStack - Main CDK Stack
 *
 * Predictive Multi-Modal Congestion Avoider for Luxembourg cross-border commuters.
 *
 * Features (to be implemented):
 * - Predictive Congestion Router (ML-predicted routes using GTFS-RT and weather)
 * - Weather-Impact Mode Switcher (pivot suggestions based on weather)
 * - Real-Time Multi-Modal Map (GTFS-RT delays + Vel'OH/FLEX availability)
 * - Personalized Delay Insights (historical pattern reports)
 *
 * Data Sources:
 * - CFL GTFS-RT, NeTEx
 * - Luxembourg Weather APIs (Geoportail)
 * - JCDecaux Vel'OH API
 * - FLEX Carsharing (data.public.lu)
 * - SNCF, Deutsche Bahn, iRail APIs
 */
export class HermodStack extends Stack {
  public readonly clientStack: ClientStack;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    // Client (React frontend) - S3 + CloudFront
    this.clientStack = new ClientStack(this, 'Client');
  }
}
