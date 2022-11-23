import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { Frontend } from "./frontend";
import { Backend } from "./backend";


export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const backend = new Backend(this, `${id}-backend`, {
      account: this.account,
      region: this.region
    });

    const apiPaths = [
      "/agent*",
      "/oob*",
      "/connections*",
      "/credentials*",
      "/proofs*",
      "/demo*",
      "/server*",
      "/public*",
      "/ws*",
    ];
    const backendUrl = backend.appUrl;
    new Frontend(this, `${id}-frontend`, {
      rootDomainName: process.env.DOMAIN_NAME || "example.com",
      appDomainPrefix: process.env.SUB_DOMAIN_NAME || "example",
      apiPaths,
      backendUrl,
    });
  }
}
