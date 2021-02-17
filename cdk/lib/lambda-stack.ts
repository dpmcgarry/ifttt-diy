import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as lambda from '@aws-cdk/aws-lambda';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';

import { App, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';
      
export class LambdaStack extends Stack {
  public readonly lambdaCode: lambda.CfnParametersCode;
      
  constructor(app: App, id: string, props?: StackProps) {
    super(app, id, props);

    const ddbtable = new ddb.Table(this, 'ifttt-diy-rsstable', {
      partitionKey: { name: 'feedurl', type: ddb.AttributeType.STRING},
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      encryption: ddb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.SNAPSHOT,
      tableName: 'ifttt-diy-rssfeeds'
    });

    this.lambdaCode = lambda.Code.fromCfnParameters();
      
    const func = new lambda.Function(this, 'Lambda', {
      code: this.lambdaCode,
      handler: 'lambda_function.handler',
      runtime: lambda.Runtime.PYTHON_3_8,
      description: `Function generated on: ${new Date().toISOString()}`,
    });

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