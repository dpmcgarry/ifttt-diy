import * as cdk from '@aws-cdk/core';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as iam from '@aws-cdk/aws-iam';
import * as targets from '@aws-cdk/aws-events-targets';
import { Duration } from '@aws-cdk/core';

export interface LambdaStackProps extends cdk.StackProps {
  readonly rssDDBTableName: string;
}
      
export class LambdaStack extends cdk.Stack {
  public readonly lambdaCode: lambda.CfnParametersCode;
      
  constructor(app: cdk.App, id: string, props: LambdaStackProps) {
    super(app, id, props);

    const ddbtable = new ddb.Table(this, 'ifttt-diy-rsstable', {
      partitionKey: { name: 'feedurl', type: ddb.AttributeType.STRING},
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      encryption: ddb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      tableName: props.rssDDBTableName
    });

    this.lambdaCode = lambda.Code.fromCfnParameters();
      
    const func = new lambda.Function(this, 'Lambda', {
      code: this.lambdaCode,
      handler: 'lambda_function.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      description: `Function generated on: ${new Date().toISOString()}`,
      environment: { 
        LOGGING_LEVEL: 'INFO',
        TABLE_NAME: props.rssDDBTableName
      },
      timeout: Duration.minutes(5),
      memorySize: 256
    });



    const lambdaDDBTablePolicy = new iam.PolicyStatement({
      actions:[
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:UpdateTimeToLive",
        "dynamodb:ConditionCheckItem",
        "dynamodb:UntagResource",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:PartiQLUpdate",
        "dynamodb:Scan",
        "dynamodb:ListTagsOfResource",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:DescribeTimeToLive",
        "dynamodb:TagResource",
        "dynamodb:PartiQLSelect",
        "dynamodb:DescribeTable",
        "dynamodb:PartiQLInsert",
        "dynamodb:GetItem",
        "dynamodb:UpdateTable",
        "dynamodb:PartiQLDelete",
        "dynamodb:DescribeTableReplicaAutoScaling"],
      resources:[
        ddbtable.tableArn,
        ddbtable.tableArn + "/index/*"
      ]
    });

    func.addToRolePolicy(lambdaDDBTablePolicy);

    const lambdaDDBPolicy = new iam.PolicyStatement({
      actions:[
        "dynamodb:DescribeReservedCapacityOfferings",
        "dynamodb:ListTables",
        "dynamodb:DescribeReservedCapacity",
        "dynamodb:DescribeLimits"
      ],
      resources: [
        "*"
      ]
    });

    func.addToRolePolicy(lambdaDDBPolicy);

    const eventrule = new events.Rule(this, 'rss-lambda-cron-rule', {
      schedule: events.Schedule.expression('rate(5 minutes)')
    });

    eventrule.addTarget(new targets.LambdaFunction(func));
      
    const alias = new lambda.Alias(this, 'LambdaAlias', {
      aliasName: 'Prod',
      version: func.currentVersion,
    });
      
    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.ALL_AT_ONCE,
    });
  }
}