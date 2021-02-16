import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Pipeline from '../lib/pipeline-stack';
import * as Lambda from '../lib/lambda-stack';


test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const lambdaStack = new Lambda.LambdaStack(app, 'IFTTT-DIY-LambdaStack');
    const stack = new Pipeline.PipelineStack(app, 'MyTestStack', {
      lambdaCode: lambdaStack.lambdaCode,
      githubSecretName: 'dpmcgarry-github-oauth',
      githubOwner: 'dpmcgarry',
      githubRepoName: 'ifttt-diy'
    });
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
