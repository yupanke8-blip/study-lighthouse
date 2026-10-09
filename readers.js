const readerScripts=new Map();
function loadReaderScript(path){if(!readerScripts.has(path))readerScripts.set(path,new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=path;script.onload=resolve;script.onerror=()=>{readerScripts.delete(path);reject(Error('读取组件没有加载，请确认压缩包已全部解压'))};document.head.append(script)}));return readerScripts.get(path)}
async function readStudyFile(file){
 if(file.size>20*1024*1024)throw Error('文件超过 20 MB，请按章节拆分后导入');
 const ext=file.name.split('.').pop().toLowerCase();
 if(['txt','md'].includes(ext))return file.text();
 if(ext==='docx'){
  await loadReaderScript('./vendor/jszip.min.js');const zip=await JSZip.loadAsync(await file.arrayBuffer());const doc=zip.file('word/document.xml');
  if(!doc||doc._data?.uncompressedSize>20*1024*1024)throw Error('Word 正文缺失或过大，请先导出为文本');
  const xml=new DOMParser().parseFromString(await doc.async('string'),'application/xml');if(xml.querySelector('parsererror'))throw Error('Word 正文格式无法解析');
  return [...xml.getElementsByTagNameNS('*','p')].map(p=>[...p.getElementsByTagNameNS('*','t')].map(t=>t.textContent).join('')).filter(Boolean).join('\n\n');
 }
 if(ext==='pptx'){
  await loadReaderScript('./vendor/jszip.min.js');
  const zip=await JSZip.loadAsync(await file.arrayBuffer());
  async function xmlAt(path){
   const f=zip.file(path);if(!f||f._data?.uncompressedSize>5*1024*1024)throw Error('PPTX 内容缺失或过大');
   const d=new DOMParser().parseFromString(await f.async('string'),'application/xml');
   if(d.getElementsByTagName('parsererror').length)throw Error('PPTX XML 无法解析');return d;
  }
  const presentation=await xmlAt('ppt/presentation.xml'),rels=await xmlAt('ppt/_rels/presentation.xml.rels');
  const byId=new Map([...rels.getElementsByTagNameNS('*','Relationship')].filter(r=>r.getAttribute('TargetMode')!=='External').map(r=>[r.getAttribute('Id'),r.getAttribute('Target')]));
  const ids=[...presentation.getElementsByTagNameNS('*','sldId')];
  if(!ids.length||ids.length>150)throw Error('PPTX 无幻灯片或超过 150 页，请拆分');
  const pages=[];let total=0;
  for(let i=0;i<ids.length;i++){
   const rid=ids[i].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships','id'),target=byId.get(rid);
   if(!target)throw Error('PPTX 幻灯片引用缺失');
   const path=new URL(target,'https://local.invalid/ppt/presentation.xml').pathname.slice(1);
   if(!path.startsWith('ppt/slides/'))throw Error('PPTX 幻灯片路径无效');
   const doc=await xmlAt(path);
   const paragraphs=[...doc.getElementsByTagNameNS('*','p')].map(p=>[...p.getElementsByTagNameNS('*','t')].map(t=>t.textContent).join('')).filter(Boolean);
   const missing=doc.getElementsByTagNameNS('*','pic').length||doc.getElementsByTagNameNS('*','chart').length||doc.getElementsByTagNameNS('*','oMath').length;
   pages.push('[PPT 第 '+(i+1)+' 页]\n'+(paragraphs.join('\n')||'本页未提取到文字。')+(missing?'\n[本页含图片、图表或公式，尚未识别；依赖这些内容的结论需要补充原文。]':''));
   total+=pages[pages.length-1].length;if(total>80000)throw Error('正文超过 8 万字，请按章节拆分');
  }
  return pages.join('\n\n');
 }
 if(ext==='pdf'){
  await loadReaderScript('./vendor/pdf.worker.js');await loadReaderScript('./vendor/pdf.js');await loadReaderScript('./vendor/pdf-cmaps.js');
  class LocalCMaps{async fetch({name}){const source=lighthouseCMaps[name];if(!source)throw Error('无法读取 PDF 的字符映射');return {cMapData:Uint8Array.from(atob(source),x=>x.charCodeAt(0)),compressionType:1}}}
  const task=pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer()),CMapReaderFactory:LocalCMaps,useWasm:false,isEvalSupported:false,useSystemFonts:true,verbosity:0});
  let doc;try{doc=await task.promise;if(doc.numPages>150)throw Error('PDF 超过 150 页，请先按章节拆分');const pages=[];let total=0;
   for(let i=1;i<=doc.numPages;i++){const page=await doc.getPage(i),content=await page.getTextContent();const text=content.items.map(item=>item.str+(item.hasEOL?'\n':' ')).join('').trim();if(text){pages.push(`[PDF 第 ${i} 页]\n${text}`);total+=text.length}else pages.push(`[PDF 第 ${i} 页未提取到文字，可能是扫描页或空白页，需对照原文件补充。]`);if(total>80000)throw Error('提取内容超过 8 万字，请按章节拆分')}
   if(!total)throw Error('未提取到文字，可能是扫描 PDF。请先识别文字后粘贴，或在聊天中提供资料。');return pages.join('\n\n');
  }finally{if(doc)await doc.destroy();else await task.destroy()}
 }
 throw Error('请选择 TXT、Markdown、DOCX、PPTX 或含文字的 PDF 文件（旧版 DOC/PPT 请另存为 DOCX/PPTX）');
}
