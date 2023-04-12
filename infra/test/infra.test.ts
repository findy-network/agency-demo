import * as cdk from 'aws-cdk-lib'
import { Stack } from 'aws-cdk-lib'
import { Template, Match } from 'aws-cdk-lib/assertions'
import * as Infra from '../lib/infra-stack'

test('Infra Stack Created', () => {
  const app = new cdk.App()
  const stack = new Infra.InfraStack(app, 'MyTestStack', {
    env: { account: '123456789012', region: 'us-east-1' },
  })
  const template = Template.fromStack(stack)

  expect(template).toMatchSnapshot()

  template.resourceCountIs('AWS::Lightsail::Container', 1)
  template.resourceCountIs('AWS::CloudFront::Distribution', 1)
  template.resourceCountIs('AWS::CloudFront::CloudFrontOriginAccessIdentity', 1)
  template.resourceCountIs('AWS::S3::Bucket', 1)
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: 'example.example.com',
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  })
  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: {
      Aliases: ['example.example.com'],
    },
  })
})
