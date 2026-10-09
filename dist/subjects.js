function examCountdown(subject){
  if(!subject.date)return '尚未设置考试日期';
  const days=Math.round((new Date(subject.date+'T12:00:00')-new Date(today()+'T12:00:00'))/86400000);
  return days<0?'考试日期已过 · 可更新目标':days===0?'今天考试':`距考试 ${days} 天`;
}
function subjectAction(row){
  if(!row.recommendation)return button('添加概念 →','subject-add-lesson',row.subject.id,'outline-btn');
  return button(row.stats.complete?'继续巩固 →':'开始学习 →','subject-study',row.subject.id,'primary-btn');
}
function subjectTask(row){const {subject:s,stats:t,recommendation:r}=row;
  return `<article class="subject-task" data-subject-id="${esc(s.id)}"><div class="subject-task-heading"><b>${esc(s.name)}</b><span class="${t.complete?'goal-done':'muted'}">${t.complete?'✓ 今日目标完成':esc(examCountdown(s))}</span></div><div class="subject-targets"><span>概念 <b>${t.studied} / ${s.lessonGoal}</b></span><span>练习 <b>${t.attempts} / ${s.dailyGoal}</b></span><span>薄弱题 <b>${t.mistakes}</b></span></div><div class="subject-meter" role="progressbar" aria-label="${esc(s.name)}今日目标进度" aria-valuenow="${Math.round(row.completion*100)}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.round(row.completion*100)}%"></i></div><div class="subject-task-bottom"><p>${r?`${esc(r.reason)} · ${esc(r.lesson.title)}`:'添加讲解、例题和关联题，开启这门课的学习。'}${t.lessons.length>0&&s.lessonGoal>t.lessons.length?'<br><span class="muted">当前概念数少于每日目标，可补充内容或调低目标。</span>':''}</p>${subjectAction(row)}</div></article>`;
}
function renderMultiHome(){const rows=C.dailySubjects(state,today()),completed=rows.filter(r=>r.stats.complete).length;
  $('#heroSubtitle').textContent=rows.length?`同时备考 ${rows.length} 个科目 · 今天已有 ${completed} 科完成目标。每科先学懂，再练习。`:'先添加一个备考科目，设置适合自己的学习节奏。';
  $('#nextSteps').innerHTML=rows.length?rows.map(subjectTask).join(''):empty('今天没有安排','在科目管理中添加或恢复一门课。')+button('管理科目 →','settings');
  const exams=[...rows].sort((a,b)=>(a.subject.date||'9999').localeCompare(b.subject.date||'9999'));
  $('#examSummary').innerHTML=exams.map(({subject:s,stats:t})=>`<div class="exam-row"><div><b>${esc(s.name)}</b><p>${esc(s.exam||'独立备考目标')}</p></div><div><strong>${esc(examCountdown(s))}</strong><small>${esc(s.date||'可在科目管理中设置')} · 本轮通过 ${t.passed}/${t.lessons.length}</small></div></div>`).join('')||'<p class="body-copy">每科可以分别设置考试日期、概念数和练习题数。</p>';
}
function renderSubjects(){
  $('#subjectsBody').innerHTML=`<div class="page-heading row-heading"><div><span class="eyebrow">MULTI-SUBJECT STUDY</span><h1>科目管理</h1><p>每门课独立设置目标，所有科目一起安排到今天。</p></div>${button('＋ 添加科目','subject-add')}</div><p class="sample-note">每日安排会兼顾各科完成比例，并参考薄弱点、到期复习和考试日期排序。暂停的科目仍保留全部内容与记录。</p><div class="subject-grid">${state.subjects.map(s=>{
    const t=C.subjectStats(state,s,today());return `<article class="panel subject-card ${s.paused?'subject-paused':''}" data-subject-id="${esc(s.id)}"><div class="card-top"><span class="tag">${s.paused?'已暂停安排':'备考中'}</span>${button('编辑目标','subject-edit',s.id,'text-btn')}</div><h2>${esc(s.name)}</h2><p class="subject-exam">${esc(s.exam||'尚未填写考试名称')} · ${esc(examCountdown(s))}</p><div class="subject-targets"><span>每天 <b>${s.lessonGoal}</b> 个概念</span><span><b>${s.dailyGoal}</b> 道练习</span></div><div class="subject-overview"><div><strong>${t.lessons.length}</strong><span>概念总数</span></div><div><strong>${t.passed}</strong><span>本轮通过</span></div><div><strong>${t.mistakes}</strong><span>薄弱题</span></div></div><p class="body-copy">今日完成：${t.studied} 个概念、${t.attempts} 道题；${t.due} 个概念建议回顾。</p><div class="card-actions">${button('查看学习内容 →','subject-content',s.id,'outline-btn')}${button(s.paused?'恢复安排':'暂停安排','subject-toggle',s.id,'text-btn')}</div></article>`;
  }).join('')||empty('添加你的第一个科目','设置考试日期和目标，再添加对应知识点。')}</div>`;
}
function renderMultiPlan(){const rows=C.dailySubjects(state,today());
  $('#planDate').textContent=dateText();renderTimeBudget();
  $('#planTasks').innerHTML=rows.map(subjectTask).join('')||empty('今天暂无科目安排','可以到科目管理添加或恢复科目。');
  $('#countdown').innerHTML=rows.length?rows.map(({subject:s})=>`<div class="plan-exam"><b>${esc(s.name)}</b><strong>${esc(examCountdown(s))}</strong><span>${esc(s.exam||'考试')} ${esc(s.date)}</span></div>`).join(''):'<p class="body-copy">为每个科目设置自己的考试日期。</p>';
  $('#planView .page-heading p').textContent='每天兼顾多个科目，先理解概念，再练习和回顾。';
}
function openSubjectEditor(id){const form=$('#subjectForm'),s=state.subjects.find(s=>s.id===id);form.reset();$('#subjectDialogTitle').textContent=s?'编辑科目目标':'添加科目';
  for(const name of ['id','name','exam','date'])form.elements[name].value=s?.[name]||'';
  form.elements.lessonGoal.value=s?.lessonGoal??1;form.elements.dailyGoal.value=s?.dailyGoal??5;form.elements.paused.checked=!!s?.paused;$('#subjectDialog').showModal();
}
document.addEventListener('click',event=>{const el=event.target.closest('[data-action]');if(!el)return;const {action,id}=el.dataset;if(!action.startsWith('subject-'))return;
  const s=state.subjects.find(s=>s.id===id);
  if(action==='subject-add'||action==='subject-edit')openSubjectEditor(id);
  if(action==='subject-toggle'&&s){s.paused=!s.paused;persist();renderAll();toast(s.paused?'已暂停每日安排，记录已保留':'已恢复每日安排')}
  if(action==='subject-content'&&s){navigate('library');$('#subjectFilter').value=s.name;renderLibrary()}
  if(action==='subject-add-lesson'&&s){openLessonEditor();$('#lessonForm').elements.subject.value=s.name}
  if(action==='subject-study'&&s){const row=C.dailySubjects(state,today()).find(r=>r.subject.id===id);if(!row?.recommendation)return;const l=row.recommendation.lesson;
    const p=progress(l.id);const stage=row.stats.mistakes||row.stats.due?0:C.eligible(state,l.id)&&row.stats.studied<s.lessonGoal?2:p.stage;
    openLesson(l.id,stage);
  }
});
document.querySelector('#subjectForm').addEventListener('submit',event=>{event.preventDefault();const form=event.target,raw=Object.fromEntries(new FormData(form));try{
  C.updateSubject(state,raw.id,{...raw,paused:form.elements.paused.checked});session=null;activeLesson=null;persist();renderAll();$('#subjectDialog').close();navigate('subjects');toast('科目目标已保存');
}catch(error){toast(error.message)}});
