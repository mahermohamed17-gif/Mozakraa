(function(){
'use strict';
const CFG=self.APP_CONFIG||{}, REMOTE=!!CFG.SUPABASE_URL, LOCAL=self.LOCAL_ITEMS||[];
const isLocal=p=>!!p&&p.indexOf('files/')===0;
const $app=document.getElementById('app');
let ITEMS=[], blobUrl=null;


const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const course=id=>COURSES.find(c=>c.id===id);
const itemsOf=(cid,k)=>ITEMS.filter(i=>i.course_id===cid&&i.kind===k).sort((a,b)=>a.number-b.number);
const style=c=>`--a:${c.a};--b:${c.b}`;
const fileUrl=p=>isLocal(p)?p:CFG.SUPABASE_URL+'/storage/v1/object/public/files/'+p.split('/').map(encodeURIComponent).join('/');
function pdfLink(it){
  const c=course(it.course_id), name=`${c.name} - ${KINDS[it.kind].one} ${it.number}.pdf`;
  return isLocal(it.pdf_path)?it.pdf_path:fileUrl(it.pdf_path)+'?download='+encodeURIComponent(name);
}

async function loadItems(){
  if(!REMOTE){ITEMS=LOCAL;return;}
  try{
    const r=await fetch(CFG.SUPABASE_URL+'/rest/v1/items?select=*&order=number.asc',{headers:Object.assign({apikey:CFG.SUPABASE_ANON_KEY},CFG.SUPABASE_ANON_KEY.indexOf('eyJ')===0?{Authorization:'Bearer '+CFG.SUPABASE_ANON_KEY}:{})});
    if(!r.ok) throw new Error(r.status);
    const rows=await r.json();
    ITEMS=rows.length?rows:LOCAL;   // لو السحابة فاضية بنعرض الأقسام المدمجة
    try{localStorage.setItem('items_cache',JSON.stringify(rows));}catch(e){}
  }catch(err){
    let c=null; try{c=JSON.parse(localStorage.getItem('items_cache')||'null');}catch(e){}
    ITEMS=(c&&c.length)?c:LOCAL;
  }
}

function home(){
  const cards=COURSES.map((c,i)=>{
    const s=itemsOf(c.id,'section').length,l=itemsOf(c.id,'lecture').length;
    return `<a class="card" style="${style(c)};animation-delay:${i*50}ms" href="#/c/${c.id}"><span class="n">${i+1}</span><span class="ic">${c.icon}</span><h2>${esc(c.name)}</h2><small>${l} محاضرة · ${s} سكشن</small></a>`;
  }).join('');
  return `<header class="hero"><h1>${esc(CFG.SITE_TITLE||'ملخصات الترم الأول')}</h1><p>اختر المادة</p></header>
  <div class="wrap"><div class="grid">${cards}</div>
  <p class="note">الملف اللي تفتحه مرة وانت أونلاين بيفتح بعد كده من غير نت.</p></div>`;
}
function crumb(parts){return `<div class="crumb">${parts.map(p=>p.href?`<a href="${p.href}">${esc(p.t)}</a>`:`<span>${esc(p.t)}</span>`).join('<span>›</span>')}</div>`;}

function coursePage(cid){
  const c=course(cid); if(!c) return notFound();
  const tiles=['lecture','section'].map(k=>`<a class="card" style="${style(c)}" href="#/c/${cid}/${k}"><span class="ic">${KINDS[k].icon}</span><h2>${KINDS[k].many}</h2><small>${itemsOf(cid,k).length} متاح</small></a>`).join('');
  return `<div class="wrap">${crumb([{t:'الرئيسية',href:'#/'}])}<h1 class="title">${c.icon} ${esc(c.name)}</h1><div class="big">${tiles}</div></div>`;
}
function listPage(cid,k){
  const c=course(cid); if(!c||!KINDS[k]) return notFound();
  const list=itemsOf(cid,k);
  const cards=list.map(it=>`<a class="card" style="${style(c)}" href="#/i/${it.id}"><span class="n">${it.number}</span><small>${KINDS[k].one} ${it.number}</small><h2>${esc(it.title||KINDS[k].one+' '+it.number)}</h2><div class="tags">${it.html_path?'<span>تفاعلي</span>':''}${it.pdf_path?'<span>PDF</span>':''}</div></a>`).join('');
  return `<div class="wrap">${crumb([{t:'الرئيسية',href:'#/'},{t:c.name,href:'#/c/'+cid}])}<h1 class="title">${KINDS[k].icon} ${KINDS[k].many} ${esc(c.name)}</h1>
  ${list.length?`<div class="grid">${cards}</div>`:`<div class="empty">لسه مفيش ${KINDS[k].many} هنا. هتنزل قريب.</div>`}</div>`;
}
function itemPage(id){
  const it=ITEMS.find(x=>x.id===id); if(!it) return notFound();
  const c=course(it.course_id), k=KINDS[it.kind], st=style(c);
  return `<div class="wrap" style="${st}">${crumb([{t:'الرئيسية',href:'#/'},{t:c.name,href:'#/c/'+c.id},{t:k.many,href:`#/c/${c.id}/${it.kind}`}])}
  <h1 class="title">${k.one} ${it.number}${it.title?': '+esc(it.title):''}</h1>
  <div class="btns">
   ${it.html_path?`<a class="btn main" href="#/v/${it.id}">🚀 افتح الملف التفاعلي وذاكر</a>`:''}
   ${it.pdf_path?`<a class="btn" href="${esc(pdfLink(it))}" download="${esc(c.name)} - ${k.one} ${it.number}.pdf">⬇️ تنزيل PDF</a>`:''}
   ${(!it.html_path&&!it.pdf_path)?'<div class="empty">الملفات لسه مترفعتش.</div>':''}
  </div></div>`;
}
function notFound(){return `<div class="wrap"><div class="empty">الصفحة دي مش موجودة. <a href="#/" style="text-decoration:underline">ارجع للرئيسية</a></div></div>`;}

async function viewer(id){
  const it=ITEMS.find(x=>x.id===id); if(!it||!it.html_path){$app.innerHTML=notFound();return;}
  const c=course(it.course_id), k=KINDS[it.kind];
  $app.innerHTML=`<div class="viewer" style="${style(c)}"><div class="vbar"><a class="back" href="#/i/${it.id}">→ رجوع</a><b>${esc(c.name)} · ${k.one} ${it.number}</b>${it.pdf_path?`<a href="${esc(pdfLink(it))}" download>PDF ⬇️</a>`:''}</div><div class="vload" id="vl"><div><div class="spin"></div>جاري التحميل…</div></div></div>`;
  const box=$app.querySelector('.viewer'), vl=$app.querySelector('#vl');
  try{
    const f=document.createElement('iframe'); f.title=it.title||'';
    if(isLocal(it.html_path)){ f.src=it.html_path; }
    else{
      const r=await fetch(fileUrl(it.html_path)); if(!r.ok) throw new Error(r.status);
      const html=await r.text();
      if(location.hash!=='#/v/'+id) return;
      blobUrl=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
      f.setAttribute('sandbox','allow-scripts allow-popups allow-modals allow-downloads');
      f.src=blobUrl;
    }
    vl.replaceWith(f);
  }catch(err){
    vl.innerHTML='<div>تعذر فتح الملف. اتأكد من النت (أو افتحه مرة أونلاين الأول).</div>';
  }
}

async function route(){
  if(blobUrl){URL.revokeObjectURL(blobUrl);blobUrl=null;}
  const p=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  window.scrollTo(0,0);
  if(p[0]==='v'&&p[1]) return viewer(p[1]);
  $app.innerHTML=p[0]==='c'&&p[1]&&p[2]?listPage(p[1],p[2]):p[0]==='c'&&p[1]?coursePage(p[1]):p[0]==='i'&&p[1]?itemPage(p[1]):p.length?notFound():home();
}

(async function init(){
  $app.innerHTML='<div class="vload" style="min-height:100vh;color:#a9b9d0"><div><div class="spin"></div>جاري التحميل…</div></div>';
  try{await loadItems();}
  catch(e){$app.innerHTML='<div class="wrap"><div class="empty" style="margin-top:60px">مش قادر أحمّل البيانات. اتأكد من النت وجرب تاني.<br><br><a class="btn" style="--a:#2f7bd9;display:inline-flex" href="javascript:location.reload()">إعادة المحاولة</a></div></div>';return;}
  window.addEventListener('hashchange',route); route();
  if('serviceWorker' in navigator&&location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
})();
