import { Construct } from 'constructs'

import * as lightsail from 'aws-cdk-lib/aws-lightsail'

interface BackendProps {
  readonly account: string
  readonly region: string
}

export class Backend extends Construct {
  public readonly appUrl: string

  constructor(scope: Construct, id: string, props: BackendProps) {
    super(scope, id)

    new lightsail.CfnContainer(scope, 'FindyAgencyDemoBackend', {
      scale: 1,
      power: 'nano',
      serviceName: 'agency-demo',
      containerServiceDeployment: {
        containers: [
          {
            containerName: 'agency-demo',
            image: `ghcr.io/findy-network/agency-demo:latest`,
            ports: [{ port: '5000', protocol: 'HTTP' }],
            environment: [
              {
                variable: 'AGENCY_AUTH_URL',
                value: process.env.BACKEND_AGENCY_AUTH_URL,
              },
              {
                variable: 'AGENCY_AUTH_ORIGIN',
                value: process.env.BACKEND_AGENCY_AUTH_ORIGIN,
              },
              {
                variable: 'AGENCY_USER_NAME',
                value: process.env.BACKEND_AGENCY_USER_NAME,
              },
              {
                variable: 'AGENCY_PUBLIC_DID_SEED',
                value: process.env.BACKEND_AGENCY_PUBLIC_DID_SEED,
              },
              {
                variable: 'AGENCY_KEY',
                value: process.env.BACKEND_AGENCY_KEY,
              },
              {
                variable: 'SERVER_ADDRESS',
                value: process.env.BACKEND_SERVER_ADDRESS,
              },
              {
                variable: 'SERVER_PORT',
                value: process.env.BACKEND_SERVER_PORT,
              },
              {
                variable: 'WALLET_URL',
                value: process.env.BACKEND_WALLET_URL,
              },
            ],
          },
        ],
        publicEndpoint: {
          containerName: 'agency-demo',
          containerPort: 5000,
        },
      },
    })

    this.appUrl = (process.env.BACKEND_URL || 'example.com').replace('https://', '').replace('/', '') // TODO
  }
}
