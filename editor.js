(function(){
'use strict';
const CFG=self.APP_CONFIG||{}, U=CFG.SUPABASE_URL, K=CFG.SUPABASE_ANON_KEY, root=document.getElementById('root');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let token=sessionStorage.getItem('adm_token')||'', items=[], dirty=false, cur=null, py=3, pt=1, pc='';
const MATCH=['النوع','الحالة','الحمض','الأفق','نوع المعادن','الكاتيون السائد','النبات','البكتيريا'];
if(!U||!K){root.innerHTML='<div class="box"><div class="msg err">الموقع لسه مش مربوط بقاعدة البيانات (config.js).</div></div>';return;}
if(!token){root.innerHTML='<div class="box"><div class="msg err">لازم تسجّل دخول من لوحة التحكم الأول.</div><p><a class="btn main" href="admin.html">اذهب للوحة التحكم</a></p></div>';return;}
const H=x=>Object.assign({apikey:K,Authorization:'Bearer '+token},x||{});
async function api(p,o){const r=await fetch(U+p,o);if(r.status===401||r.status===403){sessionStorage.removeItem('adm_token');location.href='admin.html';throw new Error('انتهت الجلسة');}return r;}
const fileUrl=p=>U+'/storage/v1/object/public/files/'+p.split('/').map(encodeURIComponent).join('/');
const isCloud=p=>!!p&&p.indexOf('files/')!==0;

async function loadAll(){
  const [ri,rc]=await Promise.all([api('/rest/v1/items?select=*&order=number.asc',{headers:H()}),api('/rest/v1/courses?select=*&order=sort.asc',{headers:H()})]);
  if(!ri.ok) throw new Error('تعذر تحميل القائمة');
  items=await ri.json();
  if(rc.ok){const rows=await rc.json(); if(rows.length) self.COURSES=rows;}
}
/* ---------- picker ---------- */
function picker(){
  if(!COURSES.some(c=>c.id===pc&&c.year===py&&c.term===pt)){const f=COURSES.find(c=>c.year===py&&c.term===pt);pc=f?f.id:'';}
  const cs=COURSES.filter(c=>c.year===py&&c.term===pt);
  const list=items.filter(i=>i.course_id===pc).sort((a,b)=>(a.kind<b.kind?1:a.kind>b.kind?-1:0)||a.number-b.number);
  root.innerHTML=`<div class="box"><div class="row"><div><label>الفرقة</label><select id="py">${YEARS.map(y=>`<option value="${y.n}"${y.n===py?' selected':''}>${esc(y.name)}</option>`).join('')}</select></div>
   <div><label>الترم</label><select id="pt">${TERMS.map(t=>`<option value="${t.n}"${t.n===pt?' selected':''}>${esc(t.name)}</option>`).join('')}</select></div></div>
   <label>المادة</label><select id="pc">${cs.map(c=>`<option value="${c.id}"${c.id===pc?' selected':''}>${esc(c.icon)} ${esc(c.name)}</option>`).join('')||'<option value="">مفيش مواد</option>'}</select></div>
   <div class="box"><h2 style="margin:0 0 6px;font-size:19px">المحتوى المرفوع</h2>${list.length?list.map(i=>`<div class="it"><div class="t"><b>${i.kind==='lecture'?'محاضرة':'سكشن'} ${i.number}:</b> ${esc(i.title||'—')}<br><small class="sm">${i.html_path?(isCloud(i.html_path)?'تفاعلي ✓':'مدمج في الموقع (انقله للسحابة الأول من لوحة التحكم)'):'مفيش ملف تفاعلي'}</small></div>${isCloud(i.html_path)?`<button class="btn main" data-o="${i.id}">✏️ فتح للتعديل</button>`:''}</div>`).join(''):'<span class="sm">مفيش حاجة مرفوعة في المادة دي.</span>'}</div>`;
  document.getElementById('py').onchange=e=>{py=+e.target.value;picker();};
  document.getElementById('pt').onchange=e=>{pt=+e.target.value;picker();};
  document.getElementById('pc').onchange=e=>{pc=e.target.value;picker();};
  root.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>openEditor(items.find(x=>x.id===b.dataset.o)));
}
/* ---------- editor ---------- */
const QA='<div class="qa"><button type="button" class="qdel" contenteditable="false">🗑️ احذف السؤال</button><div class="q">اكتب السؤال هنا</div><div class="a"><p>اكتب الإجابة هنا</p></div></div>';
function prepBody(html){
  const d=document.createElement('div'); d.innerHTML=html;
  d.querySelectorAll('.qa').forEach(q=>{q.classList.remove('open');q.querySelectorAll('.rv').forEach(b=>b.remove());const b=document.createElement('button');b.type='button';b.className='qdel';b.setAttribute('contenteditable','false');b.textContent='🗑️ احذف السؤال';q.insertBefore(b,q.firstChild);});
  return d.innerHTML;
}
function groupHTML(g){
  return `<div class="eg"><div class="eg-bar" contenteditable="false"><span class="egn">•</span><button type="button" class="btn" data-a="up">⬆️</button><button type="button" class="btn" data-a="down">⬇️</button><button type="button" class="btn" data-a="addq">➕ سؤال</button><button type="button" class="btn" data-a="addp">➕ فقرة</button><button type="button" class="btn del" data-a="del">🗑️ احذف القسم</button></div><h2 class="egt" contenteditable="true">${g.t}</h2><div class="egb" contenteditable="true">${prepBody(g.h)}</div></div>`;
}
function renumber(){root.querySelectorAll('.eg').forEach((e,i)=>{e.querySelector('.egn').textContent=i+1;});}
function mark(){dirty=true;const s=document.getElementById('st');if(s&&!s.dataset.k)s.textContent='فيه تعديلات لسه ما اتحفظتش';}
async function openEditor(item){
  root.innerHTML='<div class="msg inf">جاري تحميل المحتوى…</div>';
  try{
    const r=await fetch(fileUrl(item.html_path)); if(!r.ok) throw new Error('تعذر تحميل الملف ('+r.status+')');
    const text=await r.text(), i=text.indexOf('const D='), j=text.indexOf(';const G=D.groups',i);
    if(i<0||j<0) throw new Error('الملف ده مش بنفس شكل ملفات المنصة، مينفعش يتعدل من هنا.');
    cur={item,text,i,j,D:JSON.parse(text.slice(i+8,j))};
    const c=COURSES.find(x=>x.id===item.course_id)||{name:'',icon:''};
    root.innerHTML=`<div class="tb"><button class="btn main" id="sv">💾 حفظ على المنصة</button><button class="btn" id="un">↩️</button><button class="btn" id="re">↪️</button><button class="btn" id="bd"><b>B</b> عريض</button><button class="btn" id="ag">➕ قسم جديد</button><button class="btn" id="bk">← رجوع</button><span class="sm" id="st"></span></div>
    <p style="font-weight:800;margin:10px 0 0">${esc(c.icon)} ${esc(c.name)} — ${item.kind==='lecture'?'محاضرة':'سكشن'} ${item.number}${item.title?': '+esc(item.title):''}</p>
    <p class="sm">اضغط على أي نص واكتب فيه مباشرة زي الوورد. ما تقفلش الصفحة قبل ما تدوس «حفظ».</p>
    ${item.pdf_path?'<label style="display:flex;gap:8px;align-items:center;font-weight:700"><input type="checkbox" id="np" style="width:auto"> امسح الـ PDF القديم (زرار PDF هيطلّع نسخة محدّثة تلقائيا من المحتوى)</label>':''}
    <div id="gs">${cur.D.groups.map(groupHTML).join('')}</div><div id="sm"></div>`;
    renumber(); document.execCommand('defaultParagraphSeparator',false,'p');
    root.addEventListener('input',mark);
    document.getElementById('un').onclick=()=>document.execCommand('undo');
    document.getElementById('re').onclick=()=>document.execCommand('redo');
    document.getElementById('bd').onclick=()=>document.execCommand('bold');
    document.getElementById('ag').onclick=()=>{document.getElementById('gs').insertAdjacentHTML('beforeend',groupHTML({t:'عنوان القسم الجديد',h:'<p>اكتب هنا</p>'}));renumber();mark();};
    document.getElementById('bk').onclick=()=>{if(dirty&&!confirm('فيه تعديلات ما اتحفظتش. تخرج من غير حفظ؟'))return;dirty=false;root.removeEventListener('input',mark);picker();};
    document.getElementById('sv').onclick=save;
    document.getElementById('gs').onclick=onAct;
  }catch(e){root.innerHTML='<div class="msg err">'+esc(e.message)+'</div><p><button class="btn" id="bk2">← رجوع</button></p>';document.getElementById('bk2').onclick=picker;}
}
function onAct(e){
  const q=e.target.closest('.qdel'); if(q){if(confirm('تمسح السؤال ده؟')){q.closest('.qa').remove();mark();}return;}
  const b=e.target.closest('[data-a]'); if(!b) return; const g=b.closest('.eg'), a=b.dataset.a;
  if(a==='up'&&g.previousElementSibling) g.parentNode.insertBefore(g,g.previousElementSibling);
  else if(a==='down'&&g.nextElementSibling) g.parentNode.insertBefore(g.nextElementSibling,g);
  else if(a==='addq') g.querySelector('.egb').insertAdjacentHTML('beforeend',QA);
  else if(a==='addp') g.querySelector('.egb').insertAdjacentHTML('beforeend','<p>اكتب هنا</p>');
  else if(a==='del'){if(!confirm('تمسح القسم ده كله؟'))return;g.remove();}
  renumber(); mark();
}
/* ---------- cleaning + saving ---------- */
function wrapLatin(root_){
  const re=/[A-Za-z][A-Za-z0-9₀-₉\-]*(?:\s+×?\s*[A-Za-z][A-Za-z0-9₀-₉\-.]*)*/g, nodes=[], w=document.createTreeWalker(root_,NodeFilter.SHOW_TEXT);
  while(w.nextNode()){const n=w.currentNode; if(!n.parentElement.closest('bdi,script,style')&&/[A-Za-z]/.test(n.nodeValue)) nodes.push(n);}
  nodes.forEach(n=>{
    const t=n.nodeValue; let last=0, m, frag=document.createDocumentFragment(); re.lastIndex=0;
    while((m=re.exec(t))){ if(m.index>last) frag.appendChild(document.createTextNode(t.slice(last,m.index))); const b=document.createElement('bdi'); b.setAttribute('dir','ltr'); b.textContent=m[0]; frag.appendChild(b); last=m.index+m[0].length; }
    if(last<t.length) frag.appendChild(document.createTextNode(t.slice(last))); n.parentNode.replaceChild(frag,n);
  });
}
function clean(el){
  const c=el.cloneNode(true);
  c.querySelectorAll('.qdel,.eg-bar,script,style,iframe,object,embed,link,meta').forEach(x=>x.remove());
  c.querySelectorAll('*').forEach(n=>{n.removeAttribute('contenteditable');n.removeAttribute('style');[...n.attributes].forEach(a=>{if(/^on/i.test(a.name)||/^\s*javascript:/i.test(a.value)) n.removeAttribute(a.name);});});
  c.querySelectorAll('.qa').forEach(q=>{q.classList.remove('open');q.querySelectorAll('.rv').forEach(b=>b.remove());const a=q.querySelector('.a');if(!a) return;const b=document.createElement('button');b.type='button';b.className='rv';b.textContent='👁️ اعرض الإجابة';q.insertBefore(b,a);});
  wrapLatin(c); return c.innerHTML;
}
const plain=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent.replace(/\s+/g,' ').trim();};
function collect(){
  const groups=[...root.querySelectorAll('.eg')].map(e=>({t:clean(e.querySelector('.egt')),h:clean(e.querySelector('.egb'))}));
  const cards=[],sets=[];
  groups.forEach(g=>{
    const d=document.createElement('div'); d.innerHTML=g.h; const gt=plain(g.t);
    d.querySelectorAll('.qa').forEach(q=>{const qq=q.querySelector('.q'),aa=q.querySelector('.a'); if(qq&&aa) cards.push({q:qq.innerHTML,a:aa.innerHTML,g:gt});});
    d.querySelectorAll('table').forEach(t=>{
      const h0=plain((t.querySelector('th')||{}).innerHTML||''); if(MATCH.indexOf(h0)<0) return;
      const pr=[...t.querySelectorAll('tbody tr')].map(r=>{const c=r.querySelectorAll('td');return c.length>1?[plain(c[0].innerHTML),plain(c[c.length-1].innerHTML)]:null;}).filter(p=>p&&p[0]&&p[1]&&p[1]!=='—');
      if(pr.length>=2) sets.push({g:gt,p:pr});
    });
  });
  return {groups,cards,sets,key:cur.D.key};
}
function xhrUpload(path,body){
  return new Promise((res,rej)=>{const x=new XMLHttpRequest();x.open('POST',U+'/storage/v1/object/files/'+path);x.setRequestHeader('apikey',K);x.setRequestHeader('Authorization','Bearer '+token);x.setRequestHeader('Content-Type','text/html');x.setRequestHeader('x-upsert','true');
    x.onload=()=>x.status<300?res():rej(new Error('فشل رفع الملف ('+x.status+')'));x.onerror=()=>rej(new Error('مشكلة في النت أثناء الرفع'));x.send(body);});
}
async function rm(p){if(p&&isCloud(p)) try{await api('/storage/v1/object/files/'+p,{method:'DELETE',headers:H()});}catch(e){}}
async function save(){
  const btn=document.getElementById('sv'), st=document.getElementById('st'), sm=document.getElementById('sm'); btn.disabled=true; st.dataset.k='1'; st.textContent='جاري الحفظ…'; sm.innerHTML='';
  try{
    const D=collect();
    if(!D.groups.length) throw new Error('مفيش أقسام. ضيف قسم الأول.');
    const json=JSON.stringify(D).replace(/<\//g,'<\\/');
    const text=cur.text.slice(0,cur.i)+'const D='+json+cur.text.slice(cur.j);
    const it=cur.item, np=document.getElementById('np'), dropPdf=np&&np.checked;
    const path=it.course_id+'/'+it.kind+'-'+it.number+'-'+Date.now()+'.html';
    await xhrUpload(path,new Blob([text],{type:'text/html'}));
    const row={course_id:it.course_id,kind:it.kind,number:it.number,title:it.title||'',html_path:path,updated_at:new Date().toISOString()};
    if(dropPdf) row.pdf_path=null;
    const r=await api('/rest/v1/items?on_conflict=course_id,kind,number',{method:'POST',headers:H({'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(row)});
    if(!r.ok) throw new Error('فشل حفظ البيانات ('+r.status+')');
    const oldHtml=it.html_path, oldPdf=it.pdf_path;
    it.html_path=path; if(dropPdf) it.pdf_path=null;
    await rm(oldHtml); if(dropPdf) await rm(oldPdf);
    cur.text=text; cur.i=text.indexOf('const D='); cur.j=text.indexOf(';const G=D.groups',cur.i); cur.D=D; dirty=false; delete st.dataset.k; st.textContent='اتحفظ ✅';
    sm.innerHTML='<div class="msg ok">تم الحفظ ✅ التعديل ظهر على المنصة دلوقتي.'+(it.pdf_path&&!dropPdf?'<br><small>ملحوظة: ملف الـ PDF المرفوع قبل كده لسه بالنسخة القديمة. علّم على «امسح الـ PDF القديم» واحفظ تاني عشان زرار PDF يطلّع نسخة محدّثة.</small>':'')+'</div>';
  }catch(e){delete st.dataset.k;st.textContent='';sm.innerHTML='<div class="msg err">'+esc(e.message)+'</div>';}
  btn.disabled=false;
}
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
(async()=>{try{await loadAll();picker();}catch(e){root.innerHTML='<div class="msg err">'+esc(e.message)+'</div>';}})();
})();
