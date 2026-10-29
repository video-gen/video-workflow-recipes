import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const guarded=spawnSync(process.execPath,['generate-media.mjs'],{encoding:'utf8'});
assert.equal(guarded.status,1);
assert.match(guarded.stderr,/allow-credit-spend/);
process.argv.push('--allow-credit-spend');
process.env.VIDEOGEN_API_KEY='synthetic-test-key';
let calls=0;
globalThis.fetch=async (url,options)=>{
 calls++;
 if(calls===1){
  assert.equal(url,'https://api.videogen.io/v1/workflows/script-to-video');
  const body=JSON.parse(options.body);
  assert.deepEqual(body.aspectRatio,{width:9,height:16});
  assert.equal(body.visualStyle.type,'AI_IMAGE');
  assert.equal(body.quality,'HIGH');assert.equal(body.autoExport,true);
  assert.equal(body.remixActions.length,2);
  return Response.json({workflowRunId:'synthetic-run'});
 }
 if(calls===2){assert.match(url,/synthetic-run$/);return Response.json({status:'succeeded',downloadUrl:'https://example.invalid/demo.mp4'});}
 assert.equal(calls,3);assert.equal(url,'https://example.invalid/demo.mp4');
 return new Response(new Uint8Array([0,0,0,0]));
};
await import('./generate-media.mjs');
