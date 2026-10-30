import assert from 'node:assert/strict';
import {RunContext} from '@openai/agents';
import {VideoGen,createVideogenTools} from '../dist/index.js';
const client=new VideoGen({apiKey:'synthetic-test-key'});
let request;
client.account.getMe=async()=>({accountId:'synthetic-account'});
client.workflows.storyboardToVideo=async input=>{request=input;return {workflowRunId:'synthetic-run'};};
client.projects.exportProject=async input=>{request=input;return {exportId:'synthetic-export'};};
client.projects.remixProject=async input=>{request=input;return {remixActionIds:['synthetic-action']};};
const tools=createVideogenTools({client,wait:false});
assert.equal(tools.length,36);
const context=new RunContext();
async function invoke(name,input){const tool=tools.find(t=>t.name===name);assert.ok(tool);assert.equal(tool.type,'function');const result=await tool.invoke(context,JSON.stringify(input));return typeof result==='string'?JSON.parse(result):result;}
assert.deepEqual(await invoke('get_me',{}),{accountId:'synthetic-account'});
const body={scenes:[{prompt:'Product close-up'},{prompt:'Product in use'}],quality:'HIGH',autoExport:true,remixActions:[{type:'ENABLE_CAPTIONS'},{type:'CONVERT_IMAGES_TO_VIDEOS'}]};
assert.deepEqual(await invoke('storyboard_to_video',body),{workflowRunId:'synthetic-run'});assert.deepEqual(request,body);
await invoke('export_project',{projectId:'synthetic-project',quality:'HIGH'});assert.deepEqual(request,{projectId:'synthetic-project',quality:'HIGH'});
const remix={projectId:'synthetic-project',remixActions:[{type:'ENABLE_CAPTIONS'},{type:'CONVERT_IMAGES_TO_VIDEOS'}]};await invoke('remix_project',remix);assert.deepEqual(request,remix);
console.log('OpenAI Agents 0.21: native tool invocation, storyboard, export and remix routing pass without API calls.');
