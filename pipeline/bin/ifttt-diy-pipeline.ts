#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { IFTTT_DIY_PipelineStack } from '../lib/ifttt-diy-pipeline-stack';

const app = new cdk.App();
new IFTTT_DIY_PipelineStack(app, 'IFFT-DIY-PipelineStack');
