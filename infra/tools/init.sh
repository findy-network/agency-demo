#!/bin/bash

# Stores parameters needed for pipeline to run successfully

if [ -z "$GITHUB_CONNECTION_ARN" ]; then
  echo "ERROR: Define env variable GITHUB_CONNECTION_ARN"
  exit 1
fi

if [ -z "$DOMAIN_NAME" ]; then
  echo "ERROR: Define env variable DOMAIN_NAME"
  exit 1
fi

if [ -z "$SUB_DOMAIN_NAME" ]; then
  echo "ERROR: Define env variable SUB_DOMAIN_NAME"
  exit 1
fi

if [ -z "$BACKEND_AGENCY_USER_NAME" ]; then
  echo "ERROR: Define env variable BACKEND_AGENCY_USER_NAME"
  exit 1
fi

if [ -z "$BACKEND_AGENCY_KEY" ]; then
  echo "ERROR: Define env variable BACKEND_AGENCY_KEY"
  exit 1
fi

if [ -z "$BACKEND_SERVER_PORT" ]; then
  echo "ERROR: Define env variable BACKEND_SERVER_PORT"
  exit 1
fi

if [ -z "$BACKEND_AGENCY_AUTH_URL" ]; then
  echo "ERROR: Define env variable BACKEND_AGENCY_AUTH_URL"
  exit 1
fi

if [ -z "$BACKEND_AGENCY_AUTH_ORIGIN" ]; then
  echo "ERROR: Define env variable BACKEND_AGENCY_AUTH_ORIGIN"
  exit 1
fi

if [ -z "$BACKEND_AGENCY_PUBLIC_DID_SEED" ]; then
  echo "ERROR: Define env variable BACKEND_AGENCY_PUBLIC_DID_SEED"
  exit 1
fi

if [ -z "$BACKEND_SERVER_ADDRESS" ]; then
  echo "ERROR: Define env variable BACKEND_SERVER_ADDRESS"
  exit 1
fi

if [ -z "$BACKEND_WALLET_URL" ]; then
  echo "ERROR: Define env variable BACKEND_WALLET_URL"
  exit 1
fi


aws ssm put-parameter --name "/agency-demo/github-connection-arn" --value "$GITHUB_CONNECTION_ARN" --type String
aws ssm put-parameter --name "/agency-demo/domain-name" --value "$DOMAIN_NAME" --type String
aws ssm put-parameter --name "/agency-demo/sub-domain-name" --value "$SUB_DOMAIN_NAME" --type String
aws ssm put-parameter --name "/agency-demo/backend-agency-user-name" --value "$BACKEND_AGENCY_USER_NAME" --type String
aws ssm put-parameter --name "/agency-demo/backend-agency-key" --value "$BACKEND_AGENCY_KEY" --type String
aws ssm put-parameter --name "/agency-demo/backend-server-port" --value "$BACKEND_SERVER_PORT" --type String
aws ssm put-parameter --name "/agency-demo/backend-agency-auth-url" --value "$BACKEND_AGENCY_AUTH_URL" --type String
aws ssm put-parameter --name "/agency-demo/backend-agency-auth-origin" --value "$BACKEND_AGENCY_AUTH_ORIGIN" --type String
aws ssm put-parameter --name "/agency-demo/backend-agency-public-did-seed" --value "$BACKEND_AGENCY_PUBLIC_DID_SEED" --type String
aws ssm put-parameter --name "/agency-demo/backend-server-address" --value "$BACKEND_SERVER_ADDRESS" --type String
aws ssm put-parameter --name "/agency-demo/backend-wallet-url" --value "$BACKEND_WALLET_URL" --type String
aws ssm put-parameter --name "/agency-demo/backend-url" --value "example.com" --type String
