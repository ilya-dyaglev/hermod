import { describe, it, expect } from 'vitest';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { PipelineStack } from '@infra/pipeline/pipeline-stack';

describe('PipelineStack', () => {
  it('matches snapshot', () => {
    const app = new App();

    const stack = new PipelineStack(app, 'TestPipelineStack', {
      githubRepo: 'test-owner/test-repo',
      branch: 'main',
      connectionArn: 'arn:aws:codestar-connections:eu-central-1:123456789012:connection/test-connection-id',
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    });

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
