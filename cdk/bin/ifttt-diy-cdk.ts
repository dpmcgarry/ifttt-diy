#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { IFTTTDIYSettings } from './ifttt-diy-settings'
import { PipelineStack } from '../lib/pipeline-stack';
import { LambdaStack } from '../lib/lambda-stack';

const app = new cdk.App();

const lambdaStack = new LambdaStack(app, 'IFTTT-DIY-LambdaStack',{
    rssDDBTableName: IFTTTDIYSettings.rssDDBTableName
});

new PipelineStack(app, 'IFFT-DIY-PipelineStack',{
    lambdaCode: lambdaStack.lambdaCode,
    githubSecretName: IFTTTDIYSettings.githubSecretName,
    githubOwner: IFTTTDIYSettings.githubOwner,
    githubRepoName: IFTTTDIYSettings.githubRepoName,
    githubBranchName: IFTTTDIYSettings.githubBranchName
});
