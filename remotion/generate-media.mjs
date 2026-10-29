// Optional paid generation; never invoked by a render command.
import {writeFile} from 'node:fs/promises';
if (!process.argv.includes('--allow-credit-spend')) {
 console.error('This creates a paid VideoGen workflow. Add --allow-credit-spend to opt in.'); process.exit(1);
}
const key=process.env.VIDEOGEN_API_KEY;
if (!key) {console.error('Set VIDEOGEN_API_KEY.');process.exit(1);}
async function request(path,body) {
 const response=await fetch(`https://api.videogen.io${path}`,{method:body==null?'GET':'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},...(body==null?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(60000)});
 if (!response.ok) {console.error(`VideoGen HTTP ${response.status}. Workflow creation is not retried.`);process.exit(1);}
 return response.json();
}
const existing=process.argv.find(arg=>arg.startsWith('--resume='));
const run=existing?{workflowRunId:existing.slice('--resume='.length)}:await request('/v1/workflows/script-to-video',{
 script:'A reusable water bottle for an everyday routine. Bring less. Do more.',aspectRatio:{width:9,height:16},
 visualStyle:{type:'AI_IMAGE',aiStyle:'Clean product photography with soft studio lighting and a neutral background. One uncluttered reusable bottle centered in the middle half of the frame with generous empty margins. No on-image text, captions, charts, diagrams or other products.'},
 quality:'HIGH',autoExport:true,remixActions:[{type:'ENABLE_CAPTIONS'},{type:'CONVERT_IMAGES_TO_VIDEOS'}],
});
console.log(`Run: ${run.workflowRunId}. Resume with --resume=${run.workflowRunId} --allow-credit-spend`);
const deadline=Date.now()+30*60*1000;
while(Date.now()<deadline) {
 const result=await request(`/v1/workflows/runs/${encodeURIComponent(run.workflowRunId)}`);
 if(result.status==='failed'){console.error('Workflow failed:',result.error);process.exit(1);}
 if(result.status==='succeeded'&&result.downloadUrl){
  const media=await fetch(result.downloadUrl,{signal:AbortSignal.timeout(120000)});
  if(!media.ok){console.error(`Download HTTP ${media.status}`);process.exit(1);}
  await writeFile(new URL('public/generated.mp4',import.meta.url),new Uint8Array(await media.arrayBuffer()));
  console.log('Saved public/generated.mp4');process.exit(0);
 }
 await new Promise(resolve=>setTimeout(resolve,10000));
}
console.error('Polling timed out. Resume the existing run; do not create it again.');process.exit(1);
