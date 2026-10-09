import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import worker from '../backend/worker.js';
const env={DEEPSEEK_API_KEY:'test-provider-secret',STUDY_ACCESS_TOKEN:'test-access-token-at-least-24-characters'};
const body={material:{id:'m',title:'温度',subject:'物理'},chunk:0,segments:[{paragraph:1,text:'标准大气压下纯水的沸点是100摄氏度。'}]};
function course(){return {format:'lighthouse-course-v1',title:'沸点',lessons:[{id:'L',subject:'物理',title:'沸点',objective:'解释条件',definition:'标准大气压下纯水的沸点是100摄氏度。',keypoints:['注意气压'],example:'自编例题：标准大气压下纯水沸点？',steps:['检查气压条件','查得100摄氏度'],recall:'需要什么条件？',recallAnswer:'标准大气压、纯水',sourceRefs:[{materialId:'m',paragraph:1,quote:'标准大气压'}],uncertainties:[]}],questions:[{id:'Q1',lessonId:'L',prompt:'气压条件？',answer:'标准大气压',explanation:'见原文'},{id:'Q2',lessonId:'L',prompt:'纯水沸点？',answer:'100摄氏度',explanation:'在标准大气压下'}]}}
function request(path='/generate',data=body,token=env.STUDY_ACCESS_TOKEN,origin='https://yupanke8-blip.github.io'){return new Request('https://test.workers.dev'+path,{method:path==='/health'?'GET':'POST',headers:{Origin:origin,Authorization:'Bearer '+token,'Content-Type':'application/json'},...(path==='/health'?{}:{body:JSON.stringify(data)})})}
function mockModels(t,values){let calls=0;t.mock.method(globalThis,'fetch',async(url,opts)=>{assert.equal(url,'https://api.deepseek.com/chat/completions');assert.equal(opts.headers.Authorization,'Bearer '+env.DEEPSEEK_API_KEY);const payload=JSON.parse(opts.body);assert.equal(payload.response_format.type,'json_object');const value=values[calls++];return value instanceof Response?value:Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]})});return ()=>calls}
test('拒绝错误访问口令及外站请求，且不调用模型',async t=>{const count=mockModels(t,[]);assert.equal((await worker.fetch(request('/generate',body,'wrong'),env)).status,401);assert.equal((await worker.fetch(request('/generate',body,env.STUDY_ACCESS_TOKEN,'https://evil.test'),env)).status,403);assert.equal(count(),0)});
test('后台未配置及健康检查不泄露密钥',async()=>{assert.equal((await worker.fetch(request('/health'),{})).status,503);const res=await worker.fetch(request('/health'),env);assert.equal(res.status,200);assert.equal((await res.text()).includes(env.DEEPSEEK_API_KEY),false)});
test('超长及错误资料在付费调用前拦截',async t=>{const count=mockModels(t,[]);const bad={...body,segments:[{paragraph:1,text:'a'.repeat(9001)}]};assert.equal((await worker.fetch(request('/generate',bad),env)).status,400);assert.equal(count(),0)});
test('正确生成经过独立复核后返回稳定编号',async t=>{const count=mockModels(t,[course(),{passed:true,issues:[]}]);const res=await worker.fetch(request(),env);assert.equal(res.status,200);const data=await res.json();assert.equal(count(),2);assert.equal(data.course.lessons[0].id,'m-ai-v1-0-L0');assert.equal(data.course.lessons[0].reviewedAt,'');assert.equal(data.course.questions[0].lessonId,data.course.lessons[0].id)});
test('伪造引文立即拒绝',async t=>{const c=course();c.lessons[0].sourceRefs[0].quote='不存在的引文';const count=mockModels(t,[c]);assert.equal((await worker.fetch(request(),env)).status,502);assert.equal(count(),1)});
test('二次复核拒绝时不返回课程',async t=>{mockModels(t,[course(),{passed:false,issues:['忽略条件']}]);const res=await worker.fetch(request(),env);assert.equal(res.status,422);const data=await res.json();assert.equal(data.course,undefined);assert.match(data.error,/忽略条件/)});
test('余额不足明确提示且不自动重试',async t=>{const count=mockModels(t,[new Response('',{status:402})]);const res=await worker.fetch(request(),env);assert.match((await res.json()).error,/余额不足/);assert.equal(count(),1)});
test('课程合并保留旧记录，重新载入保留分批标识',async()=>{
 const ctx=vm.createContext({});
 for(const f of ['core.js','study-tools.js'])vm.runInContext(await readFile(new URL('../dist/'+f,import.meta.url),'utf8'),ctx);
 const C=ctx.StudyCore,seed={lessons:[],questions:[]},c=course();
 let s=C.normalize({lessons:[],questions:[],materials:[{...body.material,text:body.segments[0].text}]},seed);
 let preview=C.validateCourse(c,s);s=C.mergeCourse(s,preview,seed);s.learning.L.notes='旧笔记';s.learning.L.recallText='我的答案';
 const next=course();next.lessons[0].id='new';next.lessons[0].aiChunk=0;next.lessons[0].aiMaterialId='m';next.questions.forEach((q,i)=>{q.id='newQ'+i;q.lessonId='new'});
 s=C.mergeCourse(s,C.validateCourse(next,s),seed);s=C.normalize(JSON.parse(JSON.stringify(s)),seed);
 assert.equal(s.learning.L.notes,'旧笔记');assert.equal(s.learning.L.recallText,'我的答案');assert.equal(s.lessons.find(l=>l.id==='new').aiChunk,0);
 assert.throws(()=>C.validateCourse({...c,lessons:[{...c.lessons[0],definition:'冲突改写'}]},s),/冲突|覆盖|相同/);
});
test('前端与解析器脚本语法有效',async()=>{for(const f of ['ai.js','readers.js','learning-tools.js'])new vm.Script(await readFile(new URL('../dist/'+f,import.meta.url),'utf8'))});
