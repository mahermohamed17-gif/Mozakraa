// يخلّي الموقع والملفات اللي اتفتحت قبل كده تشتغل بدون نت
importScripts('config.js');
const SHELL='shell-v1', DATA='data-v1';
const BASE=(self.APP_CONFIG&&self.APP_CONFIG.SUPABASE_URL)||'';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(SHELL).then(c=>c.addAll(['./','index.html','style.css','app.js','config.js','courses.js','items.js','manifest.webmanifest','icon.svg']).catch(()=>{})));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==SHELL&&k!==DATA).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
async function netFirst(req,name){
  const cache=await caches.open(name);
  try{
    const res=await fetch(req);
    if(res&&res.ok&&(res.type==='basic'||res.type==='cors')) cache.put(req,res.clone());
    return res;
  }catch(err){
    const hit=await cache.match(req,{ignoreVary:true,ignoreSearch:false});
    if(hit) return hit;
    throw err;
  }
}
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    if(u.pathname.endsWith('/admin.html')||u.pathname.endsWith('/admin.js')) return;
    e.respondWith(netFirst(r,u.pathname.includes('/files/')?DATA:SHELL));
  }else if(BASE&&r.url.startsWith(BASE)){
    e.respondWith(netFirst(r,DATA));
  }
});
