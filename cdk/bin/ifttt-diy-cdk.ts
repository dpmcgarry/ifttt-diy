#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PipelineStack } from '../lib/pipeline-stack';
import { LambdaStack } from '../lib/lambda-stack';

const app = new cdk.App();

const lambdaStack = new LambdaStack(app, 'IFTTT-DIY-LambdaStack');
new PipelineStack(app, 'IFFT-DIY-PipelineStack',{
    lambdaCode: lambdaStack.lambdaCode,
    githubSecretName: 'dpmcgarry-github-oauth',
    githubOwner: 'dpmcgarry',
    githubRepoName: 'ifttt-diy',
    githubBranchName: 'main'
});
