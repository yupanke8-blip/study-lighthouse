(function(root){
  'use strict';
  const copy=value=>JSON.parse(JSON.stringify(value));
  const string=value=>typeof value==='string'?value:'';
  const list=value=>Array.isArray(value)?value.filter(x=>typeof x==='string'):[];
  const unique=items=>{const seen=new Set();return items.filter(item=>{if(seen.has(item.id))return false;seen.add(item.id);return true})};
  function normalize(raw,seed){
    const fresh=!raw;
    const source=raw||{questions:copy(seed.questions),lessons:copy(seed.lessons)};
    if(!Array.isArray(source.questions))throw new Error('备份缺少题库');
    let lessons=Array.isArray(source.lessons)?source.lessons.filter(l=>l&&typeof l.id==='string'&&typeof l.title==='string').map(l=>({...l,subject:string(l.subject),title:string(l.title),objective:string(l.objective),prerequisite:string(l.prerequisite),definition:string(l.definition),analogy:string(l.analogy),keypoints:list(l.keypoints),pitfall:string(l.pitfall),example:string(l.example),steps:list(l.steps),recall:string(l.recall),recallAnswer:string(l.recallAnswer),minutes:Math.max(1,Math.min(120,Number(l.minutes)||8))})):[];
    let questions=source.questions.filter(q=>q&&['id','subject','topic','prompt','answer'].every(k=>typeof q[k]==='string')).map(q=>{
      const sample=seed.questions.find(s=>s.id===q.id&&s.prompt===q.prompt&&s.answer===q.answer);
      const next={...q,explanation:string(q.explanation)};
      if(!Array.isArray(next.options)&&sample)Object.assign(next,{options:sample.options,correctIndex:sample.correctIndex});
      if(!Array.isArray(next.options)||next.options.length<2||next.options.some(x=>typeof x!=='string')||!Number.isInteger(next.correctIndex)||next.correctIndex<0||next.correctIndex>=next.options.length){delete next.options;delete next.correctIndex}
      let lesson=lessons.find(l=>l.id===q.lessonId)||lessons.find(l=>l.subject===q.subject&&l.title===q.topic);
      if(!lesson){const demo=seed.lessons.find(l=>l.subject===q.subject&&l.title===q.topic);lesson=demo?copy(demo):{id:'legacy-'+lessons.length,subject:q.subject,title:q.topic,objective:'',definition:'',keypoints:[],steps:[],minutes:8};while(lessons.some(l=>l.id===lesson.id))lesson.id+='-new';lessons.push(lesson)}
      next.lessonId=lesson.id;return next;
    });
    lessons=unique(lessons);questions=unique(questions);
    const qIds=new Set(questions.map(q=>q.id));
    const attempts=(Array.isArray(source.attempts)?source.attempts:[]).filter(a=>a&&qIds.has(a.id)&&typeof a.correct==='boolean'&&typeof a.date==='string').map(a=>({...a,response:string(a.response),reason:string(a.reason)}));
    const learning=Object.create(null);
    for(const lesson of lessons){const p=source.learning&&source.learning[lesson.id]||{};learning[lesson.id]={stage:Math.max(0,Math.min(3,Math.floor(Number(p.stage)||0))),exampleShown:Math.max(0,Math.min((lesson.steps||[]).length,Math.floor(Number(p.exampleShown)||0))),recallText:string(p.recallText),recallRevealed:!!p.recallRevealed,recallConfirmed:!!p.recallConfirmed,notes:string(p.notes),lastStudied:string(p.lastStudied),nextReview:string(p.nextReview),studyDates:[...new Set(list(p.studyDates).filter(validDate))]};if(!ready(lesson))learning[lesson.id].recallConfirmed=false}
    return syncSubjects({version:3,subjects:source.subjects,lessons,questions,attempts,mistakes:[...new Set(list(source.mistakes).filter(id=>qIds.has(id)))],learning,exam:string(source.exam),date:/^\d{4}-\d{2}-\d{2}$/.test(string(source.date))?source.date:'',dailyGoal:Math.max(1,Math.min(100,Number(source.dailyGoal)||5)),fresh});
  }
  function ready(l){return !!(l&&l.definition&&l.example&&l.steps&&l.steps.length&&l.recall&&l.recallAnswer)}
  function eligible(state,lessonId){const lesson=state.lessons.find(l=>l.id===lessonId),p=state.learning[lessonId];return ready(lesson)&&p?.stage===3&&!!p.recallConfirmed&&!!p.recallRevealed&&!!p.recallText.trim()}
  function status(state,lessonId){if(root.StudyCore.status!==status)return root.StudyCore.status(state,lessonId);const questions=state.questions.filter(q=>q.lessonId===lessonId);const progress=state.learning[lessonId]||{};const latest=new Map();for(const a of state.attempts)latest.set(a.id,a.correct);const seen=questions.filter(q=>latest.has(q.id)).length;const right=questions.filter(q=>latest.get(q.id)===true).length;const mistakes=questions.filter(q=>state.mistakes.includes(q.id)).length;const passed=eligible(state,lessonId)&&questions.length>0&&seen===questions.length&&right===questions.length;let label=!ready(state.lessons.find(l=>l.id===lessonId))?'待补讲解':!progress.stage&&!progress.lastStudied?'尚未开始':!progress.recallConfirmed?'学习中':!seen?'待练习检验':passed?'本轮通过':'需要巩固';return {label,seen,right,total:questions.length,mistakes,passed}}
  function gradeChoice(question,index){if(!question.options||!Number.isInteger(index)||index<0||index>=question.options.length)throw new Error('请先选择答案');return index===question.correctIndex}
  function addDays(date,days){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function record(state,id,correct,response,date){const q=state.questions.find(q=>q.id===id);if(!q)throw new Error('题目不存在');if(!eligible(state,q.lessonId))throw new Error('请先完成概念学习');const attempt={id,correct:!!correct,response:String(response),date,reason:'',kind:q.options?'choice':'self'};state.attempts.push(attempt);if(correct)state.mistakes=state.mistakes.filter(x=>x!==id);else if(!state.mistakes.includes(id))state.mistakes.push(id);const hasGaps=state.questions.some(item=>item.lessonId===q.lessonId&&state.mistakes.includes(item.id));state.learning[q.lessonId].nextReview=hasGaps?date:addDays(date,1);return attempt}

  function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T12:00:00');return !isNaN(d)&&addDays(value,0)===value}
  function target(value,fallback,min=0){const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(100,Math.floor(n))):fallback}
  function syncSubjects(state){
    const subjects=[],names=new Set(),ids=new Set();
    for(const raw of Array.isArray(state.subjects)?state.subjects:[]){
      const name=string(raw?.name).trim();if(!name||names.has(name))continue;
      let id=string(raw.id)||'subject-'+subjects.length;while(ids.has(id))id+='-new';
      subjects.push({id,name,exam:string(raw.exam),date:validDate(raw.date)?raw.date:'',dailyGoal:target(raw.dailyGoal,5),lessonGoal:target(raw.lessonGoal,1),paused:raw.paused===true});names.add(name);ids.add(id);
    }
    const missing=[...new Set(state.lessons.map(l=>l.subject))].filter(name=>!names.has(name));
    const migrating=!Array.isArray(state.subjects),budget=target(state.dailyGoal,5,1);
    missing.forEach((name,i)=>{let id='subject-'+(subjects.length+1);while(ids.has(id))id+='-new';ids.add(id);subjects.push({id,name,exam:migrating?state.exam:'',date:migrating&&validDate(state.date)?state.date:'',dailyGoal:migrating?Math.floor(budget/missing.length)+(i<budget%missing.length?1:0):5,lessonGoal:1,paused:false})});
    state.subjects=subjects;return state;
  }
  function subjectStats(state,subject,date){
    const lessons=state.lessons.filter(l=>l.subject===subject.name),qIds=new Set(state.questions.filter(q=>lessons.some(l=>l.id===q.lessonId)).map(q=>q.id));
    const attempts=state.attempts.filter(a=>qIds.has(a.id)&&a.date===date);
    const studied=lessons.filter(l=>(state.learning[l.id]?.studyDates||[]).includes(date)).length;
    const mistakes=state.mistakes.filter(id=>qIds.has(id)).length;
    const due=lessons.filter(l=>state.learning[l.id]?.nextReview&&state.learning[l.id].nextReview<=date).length;
    const passed=lessons.filter(l=>status(state,l.id).passed).length;
    return {lessons,studied,attempts:attempts.length,mistakes,due,passed,complete:studied>=subject.lessonGoal&&attempts.length>=subject.dailyGoal};
  }
  function subjectRecommendation(state,subject,date){
    const candidates=state.lessons.filter(l=>l.subject===subject.name&&ready(l)).map(l=>{const p=state.learning[l.id]||{},s=status(state,l.id);let score=0,reason='复习已学概念';
      if(s.mistakes){score=400+s.mistakes;reason='优先补薄弱点'}
      else if(p.nextReview&&p.nextReview<=date){score=300;reason='到期复习'}
      else if(!s.passed){score=200;reason=eligible(state,l.id)?'完成关联练习':'继续概念学习'}
      else if(!(p.studyDates||[]).includes(date)){score=100;reason='回忆巩固'}
      return {lesson:l,score,reason};
    }).sort((a,b)=>b.score-a.score);
    return candidates[0]||null;
  }
  function dailySubjects(state,date){return state.subjects.filter(s=>!s.paused).map(subject=>{const stats=subjectStats(state,subject,date),recommendation=subjectRecommendation(state,subject,date);const days=subject.date?Math.round((new Date(subject.date+'T12:00:00')-new Date(date+'T12:00:00'))/86400000):null;
    const goals=(subject.lessonGoal>0?1:0)+(subject.dailyGoal>0?1:0);
    const completion=goals?((subject.lessonGoal?Math.min(1,stats.studied/subject.lessonGoal):0)+(subject.dailyGoal?Math.min(1,stats.attempts/subject.dailyGoal):0))/goals:1;
    const urgency=days!==null&&days>=0?Math.max(0,30-days)/30:0;
    const rank=(stats.complete?-10000:0)+(1-completion)*1000+(stats.mistakes?50:stats.due?30:0)+urgency*20;
    return {subject,stats,recommendation,days,completion,rank};
  }).sort((a,b)=>b.rank-a.rank)}
  function updateSubject(state,id,values){const subject=state.subjects.find(s=>s.id===id),name=string(values.name).trim();if(!name)throw Error('请输入科目名称');if(state.subjects.some(s=>s.id!==id&&s.name===name))throw Error('已经有同名科目，请使用不同名称');
    const next={id:subject?.id||'subject-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),name,exam:string(values.exam).trim(),date:validDate(values.date)?values.date:'',dailyGoal:target(values.dailyGoal,5),lessonGoal:target(values.lessonGoal,1),paused:values.paused===true};
    if(subject){state.lessons.filter(l=>l.subject===subject.name).forEach(l=>l.subject=name);state.questions.filter(q=>q.subject===subject.name).forEach(q=>q.subject=name);Object.assign(subject,next)}else state.subjects.push(next);return next;
  }
  root.StudyCore={normalize,ready,eligible,status,gradeChoice,addDays,record,copy,syncSubjects,subjectStats,subjectRecommendation,dailySubjects,updateSubject,validDate};
  if(typeof module!=='undefined')module.exports=root.StudyCore;
})(globalThis);
