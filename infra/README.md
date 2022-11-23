# Agency Demo infra for AWS

This project helps to setup agency demo to AWS.
The backend is deployed as single-container and frontend via S3 bucket and CloudFront proxy.

Note! "<>" indicates example value, and shouldn't be included in the values you define.

1. Install dependencies

   ```bash
   npm install -g typescript
   npm install -g aws-cdk
   npm install
   ```

1. Install [AWS CLI](https://aws.amazon.com/cli/)

1. Create [codestar connection to GitHub](https://docs.aws.amazon.com/dtconsole/latest/userguide/connections-create-github.html)

1. Define environment variables for initializing AWS pipeline

   ```bash
   # AWS related
   export AWS_DEFAULT_REGION=<AWS_REGION>
   export AWS_ACCESS_KEY_ID=<AWS_ACCESS_KEY>
   export AWS_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY>
   export CDK_DEFAULT_REGION=<AWS_REGION>
   export CDK_DEFAULT_ACCOUNT=<AWS_ACCOUNT_NUMBER>

   # github connection arn
   export GITHUB_CONNECTION_ARN=<arn:aws:codestar-connections:us-east-1:xxx:connection/xxx>
   # app root domain
   export DOMAIN_NAME=<example.com>
   # app sub domain part
   export SUB_DOMAIN_NAME=<agency-demo>
   # agent name
   export BACKEND_AGENCY_USER_NAME=<agent-name>
   # agent key
   export BACKEND_AGENCY_KEY=<agent-key>
   # agency gRPC server port
   export BACKEND_SERVER_PORT=<port>
   # agency auth URL
   export BACKEND_AGENCY_AUTH_URL=<https://agency.example.com>
   # agency auth origin
   export BACKEND_AGENCY_AUTH_ORIGIN=<https://agency.example.com>
   # agent public DID seed
   export BACKEND_AGENCY_PUBLIC_DID_SEED=<seed>
   # agency gRPC server address
   export BACKEND_SERVER_ADDRESS=<agency-api.example.com>
   # wallet URL
   export BACKEND_WALLET_URL=<https://agency.example.com>
   ```

1. Store pipelines parameters to AWS

   ```bash
   ./tools/init.sh
   ```

1. Bootstrap, first synth and store context to AWS params

   ```bash
   cdk bootstrap
   cdk synth
   npm run pipeline:context
   ```

1. Deploy pipeline

   ```bash
   cdk deploy
   ```

1. Open pipelines at AWS console and see that the pipeline succeeds. Following changes
   to the app or infra are deployed automatically by the pipeline.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
