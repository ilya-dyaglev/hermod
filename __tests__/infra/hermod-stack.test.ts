import { describe, it, expect } from 'vitest';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { HermodStack } from '@infra/hermod-stack';

describe('HermodStack', () => {
  it('matches snapshot', () => {
    const app = new App();

    const stack = new HermodStack(app, 'TestHermodStack', {
      env: {
        account: '123456789012',
        region: 'eu-central-1',
      },
    });

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});
