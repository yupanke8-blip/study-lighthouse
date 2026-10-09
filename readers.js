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
 if(ext==='pdf'){
  await loadReaderScript('./vendor/pdf.worker.js');await loadReaderScript('./vendor/pdf.js');await loadReaderScript('./vendor/pdf-cmaps.js');
  class LocalCMaps{async fetch({name}){const source=lighthouseCMaps[name];if(!source)throw Error('无法读取 PDF 的字符映射');return {cMapData:Uint8Array.from(atob(source),x=>x.charCodeAt(0)),compressionType:1}}}
  const task=pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer()),CMapReaderFactory:LocalCMaps,useWasm:false,isEvalSupported:false,useSystemFonts:true,verbosity:0});
  let doc;try{doc=await task.promise;if(doc.numPages>150)throw Error('PDF 超过 150 页，请先按章节拆分');const pages=[];let total=0;
   for(let i=1;i<=doc.numPages;i++){const page=await doc.getPage(i),content=await page.getTextContent();const text=content.items.map(item=>item.str+(item.hasEOL?'\n':' ')).join('').trim();if(text){pages.push(`[PDF 第 ${i} 页]\n${text}`);total+=text.length}else pages.push(`[PDF 第 ${i} 页未提取到文字，可能是扫描页或空白页，需对照原文件补充。]`);if(total>80000)throw Error('提取内容超过 8 万字，请按章节拆分')}
   if(!total)throw Error('未提取到文字，可能是扫描 PDF。请先识别文字后粘贴，或在聊天中提供资料。');return pages.join('\n\n');
  }finally{if(doc)await doc.destroy();else await task.destroy()}
 }
 throw Error('请选择 TXT、Markdown、DOCX 或含文字的 PDF 文件');
}
