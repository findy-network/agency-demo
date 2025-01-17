import { RemovalPolicy, Duration } from 'aws-cdk-lib'
import { Bucket, BlockPublicAccess } from 'aws-cdk-lib/aws-s3'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import {
  OriginAccessIdentity,
  OriginProtocolPolicy,
  CloudFrontWebDistribution,
  SSLMethod,
  SecurityPolicyProtocol,
  CloudFrontAllowedMethods,
} from 'aws-cdk-lib/aws-cloudfront'
import { DnsValidatedCertificate } from 'aws-cdk-lib/aws-certificatemanager'
import { ARecord, RecordTarget, HostedZone } from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Construct } from 'constructs'

interface FrontendProps {
  rootDomainName: string
  appDomainPrefix: string
  backendUrl: string
  apiPaths: string[]
}

export class Frontend extends Construct {
  constructor(scope: Construct, id: string, props: FrontendProps) {
    super(scope, id)

    const { rootDomainName: domainName, appDomainPrefix: subDomainName } = props
    const bucketName = `${subDomainName}.${domainName}`

    // Create S3 bucket for frontend deployment
    const bucket = new Bucket(this, `${id}-bucket`, {
      bucketName: bucketName,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    })

    // Allow access only from cloudfront
    const bucketOriginAccessIdentity = new OriginAccessIdentity(this, `${id}-origin-access-identity`, {
      comment: `Access bucket ${bucketName} only from Cloudfront`,
    })
    const policyStatement = new PolicyStatement()
    policyStatement.addActions('s3:GetObject*')
    policyStatement.addResources(`${bucket.bucketArn}/*`)
    policyStatement.addCanonicalUserPrincipal(
      bucketOriginAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
    )
    bucket.addToResourcePolicy(policyStatement)
    const listPolicyStatement = new PolicyStatement()
    listPolicyStatement.addActions('s3:ListBucket')
    listPolicyStatement.addResources(bucket.bucketArn)
    listPolicyStatement.addCanonicalUserPrincipal(
      bucketOriginAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId
    )
    bucket.addToResourcePolicy(listPolicyStatement)

    const s3Origin = {
      s3BucketSource: bucket,
      originAccessIdentity: bucketOriginAccessIdentity,
    }

    const zone = HostedZone.fromLookup(this, `${id}-hosted-zone`, {
      domainName: domainName,
    })

    // To use an ACM certificate with Amazon CloudFront, you must request or import the certificate
    // in the US East (N. Virginia) region. ACM certificates in this region that are associated
    // with a CloudFront distribution are distributed to all the geographic locations configured for that distribution.
    const certificateArn = new DnsValidatedCertificate(this, `${id}-certificate`, {
      domainName: bucketName,
      hostedZone: zone,
      region: 'us-east-1',
    }).certificateArn

    // CloudFront distribution with forward logic to backend
    const distribution = new CloudFrontWebDistribution(this, `${id}-distribution`, {
      viewerCertificate: {
        props: {
          acmCertificateArn: certificateArn,
          minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
          sslSupportMethod: SSLMethod.SNI,
        },
        aliases: [bucketName],
      },
      errorConfigurations: [
        {
          errorCode: 404,
          responsePagePath: '/index.html',
          responseCode: 200,
          errorCachingMinTtl: 0,
        },
      ],
      originConfigs: [
        {
          s3OriginSource: s3Origin,
          behaviors: [
            {
              isDefaultBehavior: true,
            },
            {
              pathPattern: '/index.html',
              maxTtl: Duration.seconds(0),
              minTtl: Duration.seconds(0),
              defaultTtl: Duration.seconds(0),
            },
            {
              pathPattern: '/version.txt',
              maxTtl: Duration.seconds(0),
              minTtl: Duration.seconds(0),
              defaultTtl: Duration.seconds(0),
            },
          ],
        },
        {
          customOriginSource: {
            domainName: props.backendUrl,
            originProtocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
            originReadTimeout: Duration.seconds(60),
            originKeepaliveTimeout: Duration.seconds(60),
          },
          behaviors: props.apiPaths.map((item: string) => ({
            pathPattern: item,
            allowedMethods: CloudFrontAllowedMethods.ALL,
            forwardedValues: {
              cookies: {
                forward: 'all',
              },
              headers: ['*'],
              queryString: true,
            },
          })),
        },
      ],
    })

    // Add CloudFront distribution to domain routing
    new ARecord(this, `${id}-a-record`, {
      recordName: bucketName,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone,
    })
  }
}
