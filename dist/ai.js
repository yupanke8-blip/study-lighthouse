/* DeepSeek connection; provider secrets exist only in the Worker. */
(function(){
 let lastNotice='',activeMaterial='',busy=false,access='',endpoint='https://study-lighthouse.yupanke8.workers.dev';
 try{endpoint=localStorage.getItem('lighthouse-ai-endpoint')||endpoint}catch{}
 const notice=(s)=>{
  lastNotice=s;
  const el=document.getElementById('aiStatus');if(el)el.textContent=s;
  document.querySelectorAll('[data-action="ai-generate"]').forEach(b=>{
   if(b.dataset.id!==activeMaterial)return;
   let feedback=b.parentElement.querySelector('[data-ai-feedback]');
   if(!feedback){feedback=document.createElement('p');feedback.setAttribute('data-ai-feedback','');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');feedback.style.cssText='flex-basis:100%;width:100%;white-space:normal;overflow-wrap:anywhere;color:#30334b;padding:12px;background:#f3f1ff;border-radius:10px';b.parentElement.append(feedback)}
   feedback.textContent=s;
  });
 };
 function updateButtons(){
  document.querySelectorAll('[data-action="ai-generate"]').forEach(b=>{
   b.disabled=busy;
   b.textContent=busy&&b.dataset.id===activeMaterial?'正在生成并复核…':'自动生成课程 / 继续';
  });
 }
 function batches(m){
  const out=[];let batch=[],count=0;
  C.paragraphs(m.text).forEach((p,i)=>{
   if(p.length>9000)throw Error('第 '+(i+1)+' 段超过 9000 字符，请分段后另存资料，以保留准确引用');
   if(batch.length&&(count+p.length>9000||batch.length>=500)){out.push(batch);batch=[];count=0}
   batch.push({paragraph:i+1,text:p});count+=p.length;
  });
  if(batch.length)out.push(batch);return out;
 }
 function url(){
  const u=new URL(endpoint);
  if(u.protocol!=='https:'||!u.hostname.endsWith('.workers.dev')||u.username||u.password||u.search||u.hash)throw Error('请填写自己的 https://名称.子域.workers.dev 后台地址');
  return u.origin;
 }
 async function api(path,data){
  if(!endpoint||!access)throw Error('请先填写后台地址和学习访问口令');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),200000);
  try{
   const response=await fetch(url()+path,{method:data?'POST':'GET',headers:{'Content-Type':'application/json',Authorization:'Bearer '+access},...(data?{body:JSON.stringify(data)}:{}),signal:controller.signal});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||'后台请求失败');
   return result;
  }catch(e){if(e.name==='AbortError')throw Error('等待超时，已停止。稍后可继续；重试本批可能再次产生费用');if(e instanceof TypeError)throw Error('无法连接后台，请检查地址、网络或后台部署状态');throw e}finally{clearTimeout(timer)}
 }
 const oldRender=renderMaterials;
 renderMaterials=function(){
  oldRender();
  const body=document.getElementById('materialsBody');
  const panel=document.createElement('section');panel.className='panel';panel.style.marginBottom='20px';
  panel.innerHTML='<h3>DeepSeek 自动课程</h3><p class="body-copy">上传资料并保存后，点击「自动生成课程」。正文会发送给你配置的后台和 DeepSeek，生成讲解、例题和练习，并进行第二次 AI 复核。每批约两次模型调用，按用量收费；复核仍可能漏错。</p><details><summary>连接设置</summary><label>云端后台地址<input id="aiEndpoint" type="url" placeholder="https://study-lighthouse-api.xxx.workers.dev"></label><label>学习访问口令（后台 STUDY_ACCESS_TOKEN，不是 DeepSeek 密钥）<input id="aiAccess" type="password" autocomplete="off" placeholder="你在后台设置的至少 24 位口令"></label><p class="muted">口令只在当前页面内存保存，刷新后重新填写。</p><button class="outline-btn" id="aiTest" type="button">保存地址并检查连接</button></details><p id="aiStatus" role="status" aria-live="polite"></p>';
  body.prepend(panel);
  document.getElementById('aiEndpoint').value=endpoint;document.getElementById('aiAccess').value=access;
  document.getElementById('aiTest').onclick=async()=>{
   endpoint=document.getElementById('aiEndpoint').value.trim();access=document.getElementById('aiAccess').value.trim();
   try{url();localStorage.setItem('lighthouse-ai-endpoint',endpoint);notice('正在检查…');await api('/health');notice('后台配置检查通过。首次生成将检验 DeepSeek 密钥和余额。')}catch(e){notice(e.message)}
  };
  if(lastNotice)notice(lastNotice);
  updateButtons();
  for(const id of ['aiEndpoint','aiAccess']){const input=document.getElementById(id);input.style.cssText='display:block;width:100%;box-sizing:border-box;min-height:44px;margin:8px 0 16px';input.parentElement.style.display='block';input.addEventListener('input',()=>{if(id==='aiEndpoint')endpoint=input.value.trim();else access=input.value.trim()})}
 };
 document.addEventListener('click',async e=>{
  const btn=e.target.closest('[data-action="ai-generate"]');if(!btn)return;if(busy){toast('正在生成并复核，请稍候；无需重复点击');return}
  activeMaterial=btn.dataset.id;
  const m=state.materials.find(m=>m.id===btn.dataset.id);if(!m){notice('资料未找到，请返回资料列表重新选择');toast('资料未找到');return}
  endpoint=document.getElementById('aiEndpoint')?.value.trim()||endpoint;access=document.getElementById('aiAccess')?.value.trim()||access;
  if(!endpoint||!access){toast('请先填写连接设置中的学习访问口令');notice('请展开连接设置，填写后台地址和学习访问口令');document.querySelector('#materialsBody details')?.setAttribute('open','');return}
  busy=true;updateButtons();
  notice('已开始处理资料，正在准备生成…');toast('已开始生成课程，请保持页面打开');
  btn.parentElement.querySelector('[data-ai-feedback]')?.scrollIntoView({block:'nearest',behavior:'smooth'});
  try{
   url();const parts=batches(m);let added=0;
   if(!persist())throw Error('本机保存失败，请先导出备份并解决存储问题');
   for(let i=0;i<parts.length;i++){
    if(state.lessons.some(l=>l.aiMaterialId===m.id&&l.aiChunk===i))continue;
    notice('正在生成并复核第 '+(i+1)+' / '+parts.length+' 批；已完成的批次会保留。');
    const result=await api('/generate',{material:{id:m.id,title:m.title,subject:m.subject},segments:parts[i],chunk:i});
    if(!state.materials.some(x=>x.id===m.id&&x.text===m.text))throw Error('当前资料发生变化，已停止合并');
    const preview=C.validateCourse(result.course,state);
    state=C.mergeCourse(state,preview,StudySeed);added+=preview.lessons.length;
    if(!persist())throw Error('生成完成但本机保存失败，已停止后续调用；请立即导出完整备份');
   }
   renderAll();notice('完成：新增 '+added+' 个概念。进入「概念课堂」开始学习；AI 复核不代表教材级准确保证。');
  }catch(e){notice(e.message+'。已成功保存的课程保留，点击同一资料的按钮可继续。')}
  finally{busy=false;updateButtons()}
 });
 document.addEventListener('DOMContentLoaded',()=>{
  const hero=document.getElementById('heroStart');const add=document.createElement('button');add.className='outline-btn';add.textContent='上传资料，生成课程';add.style.margin='12px';add.onclick=()=>navigate('materials');hero.after(add);
 });
})();
