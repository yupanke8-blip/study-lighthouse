import {webkit,devices} from 'playwright';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const server=createServer(async(req,res)=>{
 try{const path=new URL(req.url,'http://localhost').pathname;const file=path==='/'?'index.html':path.slice(1);
 if(file.includes('..')){res.writeHead(403);res.end();return}
 const data=await readFile(new URL('../dist/'+file,import.meta.url));
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data);
 }catch{res.writeHead(404);res.end()}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
let browser;
try{
 browser=await webkit.launch();
 const page=await browser.newPage({...devices['iPad (gen 7)']});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let calls=0,release;
 await page.route('https://study-lighthouse.yupanke8.workers.dev/**',async route=>{
  if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'authorization,content-type','access-control-allow-methods':'GET,POST,OPTIONS'}});return}
  if(route.request().url().endsWith('/generate')){calls++;await new Promise(r=>release=r);await route.fulfill({status:502,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({error:'DeepSeek 余额不足，请在开放平台充值'})})}
  else await route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":true}'});
 });
 await page.goto('http://127.0.0.1:'+server.address().port);
 await page.locator('[data-view="materials"]').first().click();
 await page.locator('[data-action="material-add"]').click();
 await page.locator('#materialForm [name="title"]').fill('Spatial Planning_Week 3_1_Sigrid.pdf');
 await page.locator('#materialForm [name="subject"]').fill('spatial planning');
 await page.locator('#materialText').fill(Array.from({length:39},(_,i)=>'段落'+i+'。'+'空间规划需要依据教材分析。'.repeat(25)).join('\n\n'));
 await page.locator('#materialForm button[type="submit"]').click();
 const btn=page.locator('[data-action="ai-generate"]').last();
 await btn.tap();
 await page.waitForFunction(()=>document.querySelector('[data-ai-feedback]')?.textContent.includes('访问口令'));
 assert.equal(calls,0);
 await page.locator('#aiAccess').fill('test-access-token-at-least-24-characters');
 await page.locator('#aiTest').click();
 await page.waitForFunction(()=>document.querySelector('#aiStatus')?.textContent.includes('后台配置检查通过'));
 await btn.tap();
 await page.waitForFunction(()=>document.querySelector('[data-action="ai-generate"]').disabled);
 assert.match(await btn.textContent(),/正在生成/);
 for(let i=0;i<100&&!release;i++)await new Promise(r=>setTimeout(r,50));
 assert.ok(release,'generate request must be sent');
 assert.equal(calls,1);
 release();
 await page.waitForFunction(()=>document.querySelector('[data-ai-feedback]')?.textContent.includes('余额不足'));
 assert.equal(await btn.isDisabled(),false);
 assert.equal(calls,1,'no automatic paid retries');
 assert.deepEqual(errors,[]);
 console.log('PASS: full-page iPad WebKit touch, missing credentials, immediate progress, quota error, unlock, no automatic retry');
}finally{await browser?.close();await new Promise(r=>server.close(r))}
