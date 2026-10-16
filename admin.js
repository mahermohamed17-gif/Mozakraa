(function(){
'use strict';
const CFG=self.APP_CONFIG||{}, URL_=CFG.SUPABASE_URL, KEY=CFG.SUPABASE_ANON_KEY;
const root=document.getElementById('root');
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let token=sessionStorage.getItem('adm_token')||'', items=[], editing=null;

if(!URL_||!KEY){
  root.innerHTML='<div class="box"><div class="msg err">لسه ما ربطتش الموقع بقاعدة البيانات، فلوحة الرفع مش هتشتغل.</div><p>اعمل الخطوات 1 إلى 3 في ملف <b>اقرأني.txt</b> (حوالي 10 دقايق)، وبعدها حط الرابط والمفتاح في <b>config.js</b> وارفع الموقع تاني، ورجّع افتح الصفحة دي.</p><p class="hint">لحد وقتها الموقع شغال بالأقسام المدمجة (تغذية نبات: سكاشن 1 إلى 4).</p></div>';
  return;
}
const H=(x)=>Object.assign({apikey:KEY},(token||KEY.indexOf('eyJ')===0)?{Authorization:'Bearer '+(token||KEY)}:{},x||{});
async function api(path,opt){
  const r=await fetch(URL_+path,opt);
  if(r.status===401||r.status===403){ if(path.startsWith('/auth/')===false){ logout(true); throw new Error('انتهت الجلسة، سجّل دخول تاني'); } }
  return r;
}
function logout(expired){sessionStorage.removeItem('adm_token');token='';showLogin(expired?'انتهت الجلسة، سجّل دخول تاني':'');}

function showLogin(m){
  root.innerHTML=`<div class="box"><label>الإيميل</label><input id="em" type="email" autocomplete="username"><label>الباسورد</label><input id="pw" type="password" autocomplete="current-password"><button class="btn" id="go">دخول</button><div id="m">${m?`<div class="msg err">${esc(m)}</div>`:''}</div></div>`;
  const go=async()=>{
    const m=document.getElementById('m'); m.innerHTML='<div class="msg inf">جاري الدخول…</div>';
    try{
      const r=await fetch(URL_+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({email:document.getElementById('em').value.trim(),password:document.getElementById('pw').value})});
      const j=await r.json(); if(!r.ok||!j.access_token) throw new Error('الإيميل أو الباسورد غلط');
      token=j.access_token; sessionStorage.setItem('adm_token',token); await load(); showPanel();
    }catch(e){m.innerHTML=`<div class="msg err">${esc(e.message)}</div>`;}
  };
  document.getElementById('go').onclick=go;
  document.getElementById('pw').onkeydown=e=>{if(e.key==='Enter')go();};
}
async function load(){
  const r=await api('/rest/v1/items?select=*&order=number.asc',{headers:H()});
  if(!r.ok) throw new Error('تعذر تحميل القائمة');
  items=await r.json();
}
const cur=()=>({c:document.getElementById('co').value,k:document.getElementById('kd').value});
function nextNum(){const {c,k}=cur();return items.filter(i=>i.course_id===c&&i.kind===k).reduce((m,i)=>Math.max(m,i.number),0)+1;}

function showPanel(){
  root.innerHTML=`<div class="top"><span>مسجّل دخول ✅</span><button class="btn sec" id="out" style="width:auto;margin:0;padding:6px 16px;font-size:14px">خروج</button></div>
  <div class="box"><h2 style="margin:0">رفع / تعديل ملف</h2>
   <div class="row"><div><label>المادة</label><select id="co">${COURSES.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></div>
   <div><label>النوع</label><select id="kd"><option value="lecture">محاضرة</option><option value="section">سكشن</option></select></div></div>
   <div class="row"><div><label>الرقم</label><input id="nm" type="number" min="1" inputmode="numeric"><p class="hint" id="nh"></p></div>
   <div><label>العنوان</label><input id="ti" placeholder="مثال: عناصر النيتروجين"></div></div>
   <label>الملف التفاعلي (HTML)</label><input id="fh" type="file" accept=".html,.htm,text/html">
   <label>ملف PDF</label><input id="fp" type="file" accept=".pdf,application/pdf">
   <p class="hint">لو الرقم موجود قبل كده هيتبدل (والملف اللي مش مختاره بيفضل زي ما هو).</p>
   <button class="btn" id="sv">💾 حفظ</button><div id="st"></div></div>
  <div class="box"><h2 style="margin:0 0 6px">اللي مرفوع</h2><div id="ls"></div></div>
  <div class="box" id="mg" style="display:none"><h2 style="margin:0 0 6px">الأقسام المدمجة في الموقع</h2><p class="hint" id="mgt"></p><button class="btn sec" id="mgb">⬆️ انقلها للسحابة عشان تقدر تبدّلها وتمسحها من هنا</button><div id="mgs"></div></div>`;
  document.getElementById('out').onclick=()=>logout();
  const refresh=()=>{document.getElementById('nm').value=nextNum();hint();renderList();};
  document.getElementById('co').onchange=document.getElementById('kd').onchange=()=>{editing=null;document.getElementById('ti').value='';refresh();};
  document.getElementById('nm').oninput=hint;
  document.getElementById('sv').onclick=save;
  document.getElementById('mgb').onclick=migrate;
  refresh();
}
function pending(){const L=self.LOCAL_ITEMS||[];return L.filter(l=>!items.some(i=>i.course_id===l.course_id&&i.kind===l.kind&&i.number===l.number));}
function hint(){
  const {c,k}=cur(), n=+document.getElementById('nm').value;
  const ex=items.find(i=>i.course_id===c&&i.kind===k&&i.number===n);
  document.getElementById('nh').textContent=ex?'⚠️ موجود: هيتبدل':'جديد';
  if(ex&&!document.getElementById('ti').value) document.getElementById('ti').value=ex.title||'';
}
function renderMigrate(){
  const p=pending(), box=document.getElementById('mg'), st=document.getElementById('mgs');
  box.style.display=(p.length||st.innerHTML)?'block':'none';
  document.getElementById('mgb').style.display=p.length?'block':'none';
  document.getElementById('mgt').textContent=p.length?('في '+p.length+' ملفات (سكاشن/محاضرات) جاية مع الموقع نفسه. لحد ما تنقلها هتفضل ظاهرة للطلبة، بس مش هتقدر تمسحها من اللوحة دي.'):'';
}
async function migrate(){
  const p=pending(), btn=document.getElementById('mgb'), st=document.getElementById('mgs'); btn.disabled=true;
  try{
    for(const l of p){
      st.innerHTML='<div class="msg inf">جاري نقل '+(l.kind==='lecture'?'محاضرة':'سكشن')+' '+l.number+'…</div>';
      const base=l.course_id+'/'+l.kind+'-'+l.number+'-'+Date.now(), row={course_id:l.course_id,kind:l.kind,number:l.number,title:l.title||'',updated_at:new Date().toISOString()};
      for(const [k,ext,type] of [['html_path','html','text/html'],['pdf_path','pdf','application/pdf']]){
        if(!l[k]) continue;
        const r=await fetch(l[k]); if(!r.ok) throw new Error('مش لاقي الملف '+l[k]);
        await upload(base+'.'+ext,await r.blob(),type); row[k.replace('_path','_path')]=base+'.'+ext;
      }
      const r=await api('/rest/v1/items?on_conflict=course_id,kind,number',{method:'POST',headers:H({'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(row)});
      if(!r.ok) throw new Error('فشل حفظ البيانات ('+r.status+')');
    }
    await load(); st.innerHTML='<div class="msg ok">تم النقل ✅ دلوقتي تقدر تبدّل أو تمسح أي حاجة من الأعلى.</div>'; renderList(); renderMigrate();
  }catch(e){st.innerHTML='<div class="msg err">'+esc(e.message)+'</div>';}
  btn.disabled=false;
}
function renderList(){
  const {c,k}=cur(), l=items.filter(i=>i.course_id===c&&i.kind===k).sort((a,b)=>a.number-b.number);
  renderMigrate();
  document.getElementById('ls').innerHTML=l.length?l.map(i=>`<div class="it"><div class="t"><b>${i.number}.</b> ${esc(i.title||'—')}<br><small>${i.html_path?'تفاعلي ✓':'تفاعلي ✗'} · ${i.pdf_path?'PDF ✓':'PDF ✗'}</small></div><button class="btn sec" style="width:auto;margin:0;font-size:14px;padding:6px 14px" data-e="${i.id}">تعديل</button><button class="btn del" data-d="${i.id}">حذف</button></div>`).join(''):'<small>مفيش حاجة لسه.</small>';
  document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{const i=items.find(x=>x.id===b.dataset.e);document.getElementById('nm').value=i.number;document.getElementById('ti').value=i.title||'';hint();window.scrollTo(0,0);});
  document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>del(b.dataset.d));
}
const say=(t,c)=>{document.getElementById('st').innerHTML=`<div class="msg ${c}">${esc(t)}</div>`;};
function upload(path,file,type,onp){
  return new Promise((res,rej)=>{
    const x=new XMLHttpRequest();
    x.open('POST',URL_+'/storage/v1/object/files/'+path);
    x.setRequestHeader('apikey',KEY);x.setRequestHeader('Authorization','Bearer '+token);
    x.setRequestHeader('Content-Type',type);x.setRequestHeader('x-upsert','true');
    x.upload.onprogress=e=>{if(onp&&e.lengthComputable)onp(e.loaded/e.total);};
    x.onload=()=>x.status<300?res():rej(new Error(x.status===401||x.status===403?'انتهت الجلسة أو مفيش صلاحية، سجّل دخول تاني':'فشل رفع '+(file.name||path)+' ('+x.status+')'));
    x.onerror=()=>rej(new Error('مشكلة في النت أثناء الرفع'));
    x.send(file);
  });
}
async function rmFile(p){ if(p) try{await api('/storage/v1/object/files/'+p,{method:'DELETE',headers:H()});}catch(e){} }
async function save(){
  const {c,k}=cur(), n=parseInt(document.getElementById('nm').value,10), title=document.getElementById('ti').value.trim();
  const fh=document.getElementById('fh').files[0], fp=document.getElementById('fp').files[0];
  const old=items.find(i=>i.course_id===c&&i.kind===k&&i.number===n);
  if(!(n>0)) return say('اكتب رقم صحيح','err');
  if(!old&&!fh&&!fp) return say('اختار ملف واحد على الأقل','err');
  const btn=document.getElementById('sv'); btn.disabled=true; say('جاري الرفع… متقفلش الصفحة','inf');
  try{
    const ts=Date.now(), base=`${c}/${k}-${n}-${ts}`, row={course_id:c,kind:k,number:n,title,updated_at:new Date().toISOString()};
    if(fh){await upload(base+'.html',fh,'text/html',p=>say('جاري رفع الملف التفاعلي… '+Math.round(p*100)+'٪','inf'));row.html_path=base+'.html';}
    if(fp){await upload(base+'.pdf',fp,'application/pdf',p=>say('جاري رفع الـ PDF… '+Math.round(p*100)+'٪','inf'));row.pdf_path=base+'.pdf';}
    const r=await api('/rest/v1/items?on_conflict=course_id,kind,number',{method:'POST',headers:H({'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(row)});
    if(!r.ok) throw new Error('فشل حفظ البيانات ('+r.status+')');
    if(old){ if(fh) await rmFile(old.html_path); if(fp) await rmFile(old.pdf_path); }
    await load(); document.getElementById('fh').value='';document.getElementById('fp').value='';
    say(`تم الحفظ ✅ (${k==='lecture'?'محاضرة':'سكشن'} ${n})`,'ok');
    document.getElementById('nm').value=nextNum(); document.getElementById('ti').value=''; hint(); renderList();
  }catch(e){say(e.message,'err');}
  btn.disabled=false;
}
async function del(id){
  const i=items.find(x=>x.id===id); if(!i||!confirm('تحذف '+(i.title||('رقم '+i.number))+'؟ مفيش رجوع.')) return;
  try{
    const r=await api('/rest/v1/items?id=eq.'+encodeURIComponent(id),{method:'DELETE',headers:H()});
    if(!r.ok) throw new Error('فشل الحذف ('+r.status+')');
    await rmFile(i.html_path); await rmFile(i.pdf_path);
    await load(); renderList(); say('تم الحذف','ok');
  }catch(e){say(e.message,'err');}
}

(async()=>{ if(token){try{await load();showPanel();return;}catch(e){} } showLogin(); })();
})();
