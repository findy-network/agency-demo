import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {
    CodeBuildStep,
    CodePipeline,
    CodePipelineSource,
} from "aws-cdk-lib/pipelines";
import { aws_codebuild as codebuild, aws_logs as logs } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

import { InfraPipelineStage } from "./pipeline-stage";
import { NotificationRule } from "aws-cdk-lib/aws-codestarnotifications";
import { Topic } from "aws-cdk-lib/aws-sns";

interface InfraPipelineProperties extends cdk.StackProps {
}

const environmentVariables: Record<string, codebuild.BuildEnvironmentVariable> =
{
    DOMAIN_NAME: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/domain-name",
    },
    SUB_DOMAIN_NAME: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/sub-domain-name",
    },
    // TODO: use secrets
    BACKEND_AGENCY_USER_NAME: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/backend-agency-user-name"
    },
    // TODO: use secrets
    BACKEND_AGENCY_KEY: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/backend-agency-key"
    },
    BACKEND_SERVER_PORT: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/backend-server-port"
    },
    BACKEND_AGENCY_AUTH_URL: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/backend-agency-auth-url"
    },
    BACKEND_AGENCY_AUTH_ORIGIN: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/backend-agency-auth-origin"
    },
    // TODO: use secrets
    BACKEND_AGENCY_PUBLIC_DID_SEED: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/backend-agency-public-did-seed"
    },
    BACKEND_SERVER_ADDRESS: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/backend-server-address"
    },
    BACKEND_WALLET_URL: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/backend-wallet-url"
    },
    BACKEND_URL: {
        type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
        value: "/agency-demo/backend-url"
    },
};

export class InfraPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: InfraPipelineProperties) {
        super(scope, id, props);

        const githubConnectionArn = StringParameter.valueForStringParameter(
            this,
            "/agency-demo/github-connection-arn"
        );
        const source = CodePipelineSource.connection(
            "findy-network/agency-demo",
            "master",
            {
                connectionArn: githubConnectionArn, // Created using the AWS console
            }
        )

        // Create pipeline
        const pipeline = this.createPipeline(source);

        // Add app to pipeline
        const deploy = new InfraPipelineStage(this, "Deploy", {
            env: props.env,
        });
        const deployStage = pipeline.addStage(deploy);

        // Add lightsail application update step
        deployStage.addPost(this.createLightsailUpdateStep(id));

        // Add frontend build step
        const frontBuildStep = this.createFrontendBuildStep();
        deployStage.addPost(frontBuildStep);

        // Add frontend deploy step
        const frontDeployStep = this.createFrontendDeployStep(frontBuildStep);
        deployStage.addPost(frontDeployStep);

        // Add deployment test step
        //deployStage.addPost(this.createPostDeploymentTestStep(frontDeployStep, source));

        // need this to add the notification rule
        pipeline.buildPipeline();

        new NotificationRule(this, "FindyAgencyDemoPipelineNotificationRule", {
            source: pipeline.pipeline,
            events: [
                "codepipeline-pipeline-pipeline-execution-failed",
                "codepipeline-pipeline-pipeline-execution-canceled",
                "codepipeline-pipeline-pipeline-execution-started",
                "codepipeline-pipeline-pipeline-execution-resumed",
                "codepipeline-pipeline-pipeline-execution-succeeded",
            ],
            targets: [new Topic(this, "FindyAgencyDemoPipelineNotificationTopic")],
        });

        // manually adjust logs retention
        // this.node.findAll().forEach((construct, index) => {
        //     if (construct instanceof codebuild.Project) {
        //         new logs.LogRetention(this, `LogRetention${index}`, {
        //             logGroupName: `/aws/codebuild/${construct.projectName}`,
        //             retention: logs.RetentionDays.ONE_MONTH,
        //         });
        //     }
        // });
    }

    createPipeline(source: CodePipelineSource) {
        const pipeline = new CodePipeline(this, "Pipeline", {
            pipelineName: "FindyAgencyDemoPipeline",
            synth: new CodeBuildStep("SynthStep", {
                input: source,
                installCommands: ["npm install -g aws-cdk"],
                buildEnvironment: {
                    environmentVariables: {
                        CDK_CONTEXT_JSON: {
                            type: codebuild.BuildEnvironmentVariableType.PARAMETER_STORE,
                            value: "/agency-demo/cdk-context",
                        },
                    },
                },
                commands: [
                    "cd infra",
                    `echo "$CDK_CONTEXT_JSON" > cdk.context.json`,
                    "cat cdk.context.json",
                    "npm ci",
                    "npm run build",
                    "npx cdk synth",
                    "npm run pipeline:context",
                ],
                rolePolicyStatements: [
                    new PolicyStatement({
                        actions: ["ssm:PutParameter"],
                        resources: [
                            `arn:aws:ssm:${this.region}:${this.account}:parameter/agency-demo*`,
                        ],
                    }),
                ],
                primaryOutputDirectory: "infra/cdk.out",
            }),
            codeBuildDefaults: {
                buildEnvironment: {
                    environmentVariables: {
                        ...environmentVariables,
                    },
                },
            },
        });

        return pipeline;
    }

    createLightsailUpdateStep(id: string) {
        const deployRole = new Role(this, `${id}-deploy-role`, {
            assumedBy: new ServicePrincipal("codebuild.amazonaws.com"),
        });

        const lightsailPolicy = new PolicyStatement();
        lightsailPolicy.addActions(
            "lightsail:*",
            "ssm:*"
        );
        lightsailPolicy.addResources("*");
        deployRole.addToPolicy(lightsailPolicy);

        return new CodeBuildStep("FindyAgencyDemoDeployBackendStep", {
            projectName: "FindyAgencyDemoDeployBackendStep",
            commands: [
                //`VERSION="$(./tools/version.sh ./)-$(date +%s)"`,
                //`aws lightsail update-container-service --service-name "agency-demo"`,
                `URL=$(aws lightsail get-container-services --service-name agency-demo --output json | jq '.containerServices[0].url')`,
                `aws ssm put-parameter --overwrite --name \"/agency-demo/backend-url\" --value \"$URL\" --type String`
            ],
            role: deployRole,
        });
    }

    createFrontendBuildStep() {
        return new CodeBuildStep("FindyAgencyDemoBuildFrontendStep", {
            projectName: "FindyAgencyDemoBuildFrontend",
            commands: [
                "apk add bash",
                "yarn install",
                "yarn client:build"
            ],
            buildEnvironment: {
                buildImage: codebuild.LinuxBuildImage.fromDockerRegistry(
                    "node:16.18-alpine3.16"
                ),
                environmentVariables: {
                    REACT_APP_HOST_BACKEND: {
                        value: `https://${process.env.SUB_DOMAIN_NAME}.${process.env.DOMAIN_NAME}`,
                    },
                    REACT_APP_HOST_WEBSOCKET: {
                        value: `wss://${process.env.SUB_DOMAIN_NAME}.${process.env.DOMAIN_NAME}`,
                    },
                },
            },
            primaryOutputDirectory: "client/build",
        });
    }

    createFrontendDeployStep(frontBuildStep: CodeBuildStep) {
        return new CodeBuildStep("FindyAgencyDemoDeployFrontendStep", {
            input: frontBuildStep.primaryOutput,
            projectName: "FindyAgencyDemoDeployFrontend",
            commands: [
                `V1=$(curl https://$SUB_DOMAIN_NAME.$DOMAIN_NAME/version.txt)`,
                `V2=$(cat ./version.txt)`,
                `if [ "$V1" != "$V2" ]; then aws s3 sync --delete . s3://$SUB_DOMAIN_NAME.$DOMAIN_NAME; fi`,
            ],
            rolePolicyStatements: [
                new PolicyStatement({
                    actions: ["s3:Put*", "s3:Delete*", "s3:Get*", "s3:List*"],
                    resources: ["*"],
                }),
            ],
            primaryOutputDirectory: ".",
        });
    }

    // createPostDeploymentTestStep(frontDeployStep: CodeBuildStep, source: CodePipelineSource) {
    //     return new CodeBuildStep("FindyAgencyDemoDeploymentTest", {
    //         input: source,
    //         additionalInputs: { out: frontDeployStep.primaryOutput! },
    //         projectName: "FindyAgencyDemoDeploymentTest",
    //         // TODO: make more extensive tests
    //         commands: [
    //             `curl -sI https://$SUB_DOMAIN_NAME.$DOMAIN_NAME/version.txt | grep "HTTP/2 200"`,
    //             `./infra/tools/wait-for-ready.sh`,
    //         ],
    //     });
    // }
}
