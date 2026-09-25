const APP_ID = "27708155402192252";
const GRAPH_VERSION = "v26.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;
const RUPLOAD_HOST = "rupload.facebook.com";

const SESSION_TTL = 60 * 24 * 60 * 60; // 60 gün
const OAUTH_TTL = 10 * 60;

const APP_HTML = `<!doctype html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover"><meta name="theme-color" content="#e9eef2"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><link rel="manifest" href="/manifest.json"><link rel="apple-touch-icon" href="/pwa-icon-180.png"><link rel="stylesheet" href="/style.css?v=9"><title>Social Publisher</title></head><body class="appBody">
<div class="aurora a1"></div><div class="aurora a2"></div><div class="grain"></div>
<main class="appShell">
<header class="appTop glass">
  <div class="brandBlock"><div class="brandEyebrow">EROL VURAL</div><div class="brandTitle">Social Publisher</div><div class="brandSub">Tek dokunuşla çoklu yayın</div></div>
  <a href="/logout" class="logoutPill touch">Çıkış</a>
</header>

<section id="homeSection" class="screenSection">
  <div class="heroGlass glass">
    <div class="heroOrb"><span>SP</span></div>
    <div><div class="heroKicker">YAYIN MERKEZİ</div><h1>İçeriğini seç.<br><span>Hedeflerini belirle.</span></h1><p>Facebook Sayfalarına tek akıştan yayınla.</p></div>
    <div class="heroStats"><div><b id="heroPageCount">—</b><small>Sayfa</small></div><div><b id="heroSelected">0</b><small>Seçili</small></div></div>
  </div>

  <section class="glass panel" id="targetsPanel">
    <div class="sectionHead"><div><span class="sectionKicker">HEDEFLER</span><h2>Yayın nereye gitsin?</h2></div><span id="count" class="countBubble">0</span></div>
    <div class="segmented glassInner" role="tablist"><button id="fbTarget" class="segment active touch" data-platform="facebook">Facebook</button></div>
    <div class="targetTools"><button id="selectAllBtn" class="miniButton touch">Tümünü seç</button><button id="clearAllBtn" class="miniButton touch">Temizle</button><button id="refreshPagesBtn" class="miniButton touch">↻ Meta'dan yenile</button><div class="searchWrap glassInner"><span>⌕</span><input id="search" placeholder="Sayfa ara..." autocomplete="off"></div></div>
    <div id="pages" class="pageList"><div class="loadingState"><span class="spinner"></span>Sayfalar hazırlanıyor</div></div>
  </section>
</section>

<section id="publishSection" class="screenSection">
  <section class="glass panel">
    <div class="sectionHead"><div><span class="sectionKicker">İÇERİK</span><h2>Ne yayınlayalım?</h2></div><span class="liveDot"><i></i> Hazır</span></div>
    <div class="contentGrid">
      <button class="contentCard active touch" data-type="post"><span class="contentIcon">✎</span><b>Gönderi</b><small>Metin & bağlantı</small></button>
      <button class="contentCard touch" data-type="photo"><span class="contentIcon">◉</span><b>Fotoğraf</b><small>Görsel paylaş</small></button>
      <button class="contentCard touch" data-type="video"><span class="contentIcon">▶</span><b>Video</b><small>Video gönderisi</small></button>
      <button class="contentCard touch" data-type="reel"><span class="contentIcon">◫</span><b>Reel</b><small>Dikey kısa video</small></button>
      <button class="contentCard touch" data-type="story"><span class="contentIcon">▣</span><b>Story</b><small>24 saatlik içerik</small></button>
    </div>
    <div id="typeInfo" class="typeInfo glassInner">Metin veya bağlantı içeren normal Facebook gönderisi.</div>
    <label class="fieldLabel">Açıklama</label>
    <textarea id="message" class="glassInput" placeholder="Ne paylaşmak istiyorsun?" spellcheck="true"></textarea>
    <div id="mediaBox"></div>
    <div id="reelOptions" class="hidden"><label class="fieldLabel">Reel başlığı</label><input id="reelTitle" class="glassInput" placeholder="İsteğe bağlı"></div>
    <div id="storyOptions" class="hidden"><div class="storySwitch"><button class="storyTab active touch" data-story="photo">Foto Story</button><button class="storyTab touch" data-story="video">Video Story</button></div><div id="storyHint" class="fieldHint">Dikey görsel seçin.</div></div>
    <div id="preview" class="previewGlass hidden"></div>
    <button id="publishBtn" class="publishButton touch"><span class="publishIcon">↑</span><span>Seçilenlerde yayınla</span><span class="publishCount" id="publishCount">0</span></button>
  </section>
</section>

<section id="queueSection" class="screenSection hidden">
  <section class="glass panel queuePanel">
    <div class="sectionHead"><div><span class="sectionKicker">CANLI DURUM</span><h2>Yayın akışı</h2></div><span id="queueSummary" class="countBubble">Hazır</span></div>
    <div id="jobs" class="jobs"></div>
    <div class="queueActions"><button id="retryBtn" class="miniButton touch hidden">↻ Başarısızları yeniden dene</button><button id="clearQueueBtn" class="miniButton touch">Kuyruğu temizle</button></div>
  </section>
</section>

<section id="accountsSection" class="screenSection hidden"><section class="glass panel"><div class="sectionHead"><div><span class="sectionKicker">HESAPLAR</span><h2>Bağlı hedefler</h2></div></div><div id="accountSummary" class="accountSummary"></div></section></section>

<nav class="bottomDock glass">
  <button class="navItem active touch" data-nav="home"><span class="navIcon">⌂</span><span>Ana Sayfa</span></button>
  <button class="navItem touch" data-nav="publish"><span class="navIcon">＋</span><span>Yayınla</span></button>
  <button class="navItem touch" data-nav="queue"><span class="navIcon">◌</span><span>Kuyruk</span></button>
  <button class="navItem touch" data-nav="accounts"><span class="navIcon">◎</span><span>Hesaplar</span></button>
</nav>
<div id="toast" class="toastGlass"></div>
</main><script src="/app.js?v=7" defer></script></body></html>`;
const APP_JS = `
if(location.hash==='#_=_'){history.replaceState(null,document.title,location.pathname+location.search)}
let pages=[];let currentType='post';let storyType='photo';let jobs=[];let lastPayload=null;const selected=new Set();
const CHUNK_SIZE=24*1024*1024;const CONCURRENCY=3;
const $=id=>document.getElementById(id);const qs=s=>document.querySelector(s);const qsa=s=>[...document.querySelectorAll(s)];
async function api(url,options={}){const r=await fetch(url,options);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'İşlem başarısız.');return d}
function xhrApi(url,options={},onProgress){return new Promise((resolve,reject)=>{const x=new XMLHttpRequest();x.open(options.method||'POST',url,true);if(options.headers)Object.entries(options.headers).forEach(([k,v])=>x.setRequestHeader(k,v));x.upload.onprogress=e=>{if(e.lengthComputable&&onProgress)onProgress(e.loaded,e.total)};x.onload=()=>{let d={};try{d=JSON.parse(x.responseText||'{}')}catch{}if(x.status>=200&&x.status<300)resolve(d);else reject(new Error(d.error||('HTTP '+x.status)))};x.onerror=()=>reject(new Error('Ağ bağlantısı başarısız.'));x.onabort=()=>reject(new Error('İşlem iptal edildi.'));x.send(options.body||null)})}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2600)}
function navTo(name){qsa('.navItem').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));qsa('.screenSection').forEach(s=>s.classList.add('hidden'));const map={home:'homeSection',publish:'publishSection',queue:'queueSection',accounts:'accountsSection'};const target=$(map[name]);if(target)target.classList.remove('hidden');const active=qsa('.navItem').find(b=>b.dataset.nav===name);const dock=document.querySelector('.bottomDock');if(active&&dock){const r=active.getBoundingClientRect(),d=dock.getBoundingClientRect();dock.style.setProperty('--glow-left',(r.left-d.left+((r.width-74)/2))+'px')}if(name==='queue'){}}
function bindUI(){qsa('.navItem').forEach(b=>b.addEventListener('click',()=>navTo(b.dataset.nav)));qsa('.liquidButton').forEach(b=>b.addEventListener('pointerdown',()=>{b.classList.add('pressed');setTimeout(()=>b.classList.remove('pressed'),220)}));$('fbTarget').addEventListener('click',()=>setPlatform('facebook'));$('selectAllBtn').addEventListener('click',selectAll);$('clearAllBtn').addEventListener('click',clearAll);$('refreshPagesBtn').addEventListener('click',refreshPages);$('search').addEventListener('input',renderPages);qsa('.contentCard').forEach(b=>b.addEventListener('click',()=>setType(b.dataset.type)));qsa('.storyTab').forEach(b=>b.addEventListener('click',()=>setStoryType(b.dataset.story)));$('publishBtn').addEventListener('click',publish);$('retryBtn').addEventListener('click',retryFailed);$('clearQueueBtn').addEventListener('click',clearQueue);}
async function loadPages(){try{const d=await api('/api/pages');pages=d.pages||[];$('heroPageCount').textContent=pages.length;renderPages();renderAccounts();if(!pages.length){$('pages').innerHTML='<div class="loadingState">⚠️ Facebook bağlantısı var ancak erişilebilir Sayfa bulunamadı.<br><br><button class="miniButton touch" id="reauthBtn">Facebook bağlantısını yenile</button></div>';const b=$('reauthBtn');if(b)b.addEventListener('click',()=>location.href='/login')}else if(pages.length<12){toast('Meta '+pages.length+' Facebook Sayfası döndürdü.')} }catch(e){$('pages').innerHTML='<div class="loadingState">⚠️ '+esc(e.message)+'<br><br><button class="miniButton touch" id="reauthBtn">Facebook bağlantısını yenile</button></div>';const b=$('reauthBtn');if(b)b.addEventListener('click',()=>location.href='/login');toast(e.message)}}
async function refreshPages(){const b=$('refreshPagesBtn');if(b){b.disabled=true;b.textContent='↻ Yenileniyor…'}try{await loadPages();toast(pages.length+' Facebook Sayfası Meta’dan alındı.')}finally{if(b){b.disabled=false;b.textContent='↻ Meta’dan yenile'}}}
function visibleTargets(){const q=($('search').value||'').toLowerCase();return pages.filter(p=>p.name.toLowerCase().includes(q))}
function renderPages(){const list=visibleTargets();const selectedSet=selected;$('pages').innerHTML=list.length?list.map(p=>{const checked=selectedSet.has(String(p.id));return '<label class="pageRow '+(checked?'selected':'')+'"><input class="pageCheck" id="p_'+escAttr(p.id)+'" type="checkbox" value="'+escAttr(p.id)+'" '+(checked?'checked':'')+'><span class="pageName">'+esc(p.name)+'</span>'+''+'</label>'}).join(''):'<div class="loadingState">Bu hedefte gösterilecek hesap bulunamadı.</div>';qsa('.pageCheck').forEach(x=>x.addEventListener('change',()=>{const id=String(x.value);if(x.checked)selected.add(id);else selected.delete(id);x.closest('.pageRow').classList.toggle('selected',x.checked);updateCount()}));updateCount()}
function selectedIds(){return [...selected]}
function updateCount(){const n=selectedIds().length;$('count').textContent=n;$('heroSelected').textContent=n;$('publishCount').textContent=n}
function selectAll(){visibleTargets().forEach(p=>selected.add(String(p.id)));renderPages();toast('Görünen hedeflerin tamamı seçildi')}
function clearAll(){selected.clear();renderPages()}
function setPlatform(v){platform='facebook';$('fbTarget').classList.add('active');renderPages()}
function setType(type){currentType=type;qsa('.contentCard').forEach(b=>b.classList.toggle('active',b.dataset.type===type));$('reelOptions').classList.toggle('hidden',type!=='reel');$('storyOptions').classList.toggle('hidden',type!=='story');const info={post:'Metin veya bağlantı içeren normal Facebook gönderisi.',photo:'Fotoğraf gönderisi.',video:'Normal Facebook video gönderisi. Büyük videolar parçalara ayrılarak yüklenir.',reel:'Facebook Reel. Yükleme sonrası Meta işleme durumu takip edilir.',story:'Facebook Story.'};$('typeInfo').textContent=info[type];const m=$('mediaBox');if(type==='post')m.innerHTML='';else if(type==='photo')m.innerHTML=fileInput('photoFile','image/*','Fotoğraf seç');else if(type==='video')m.innerHTML=fileInput('videoFile','video/*','Video seç');else if(type==='reel')m.innerHTML=fileInput('reelFile','video/*','Reel videosu seç');else m.innerHTML=fileInput('storyFile',storyType==='photo'?'image/*':'video/*',storyType==='photo'?'Story görseli seç':'Story videosu seç');bindFileEvents()}
function setStoryType(type){storyType=type;qsa('.storyTab').forEach(b=>b.classList.toggle('active',b.dataset.story===type));$('storyHint').textContent=type==='photo'?'Dikey görsel seçin.':'Dikey video seçin.';if(currentType==='story')setType('story')}
function fileInput(id,accept,label){return '<div class="fileBox"><div class="fileLabel"><span>'+label+'</span><label class="fileButton touch" for="'+id+'">Dosya seç</label></div><input class="fileInput" id="'+id+'" type="file" accept="'+accept+'"><div id="'+id+'_name" class="fileName">Henüz dosya seçilmedi</div></div>'}
function bindFileEvents(){const id=currentType==='photo'?'photoFile':currentType==='video'?'videoFile':currentType==='reel'?'reelFile':currentType==='story'?'storyFile':null;const el=id&&$(id);if(!el)return;el.addEventListener('change',()=>{const f=el.files[0];if(!f)return;$(id+'_name').textContent=f.name+' • '+formatBytes(f.size);previewFile(f)})}
function previewFile(file){const box=$('preview');if(!file){box.classList.add('hidden');return}const u=URL.createObjectURL(file);box.classList.remove('hidden');box.innerHTML=file.type.startsWith('image/')?'<img src="'+u+'" alt="Önizleme">':'<video src="'+u+'" controls playsinline></video>'}
async function validateFile(file,type){if(!file)throw new Error('Medya seçin.');if(type==='photo'&&!file.type.startsWith('image/'))throw new Error('Geçerli bir görsel seçin.');if(type==='story'&&storyType==='photo'){if(!file.type.startsWith('image/'))throw new Error('Geçerli bir Story görseli seçin.');if(file.size>4*1024*1024)throw new Error('Facebook Story görseli 4 MB veya daha küçük olmalı.');return}if(['video','reel'].includes(type)|| (type==='story'&&storyType==='video')){if(!file.type.startsWith('video/'))throw new Error('Geçerli bir video seçin.');const m=await videoMeta(file);if(type==='reel'&&(m.duration<3||m.duration>90))throw new Error('Facebook Reel için video süresi 3–90 saniye olmalı.');if(type==='reel'&&(m.width/m.height<0.45||m.width/m.height>1.2))throw new Error('Reel için dikey video kullanın.');if(type==='story'&&storyType==='video'){if(m.duration<3||m.duration>60)throw new Error('Facebook Video Story için video 3–60 saniye olmalı.');if(m.width/m.height<0.45||m.width/m.height>0.75)throw new Error('Video Story için 9:16 civarında dikey video kullanın.');}}}
function videoMeta(file){return new Promise((resolve,reject)=>{const v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>{URL.revokeObjectURL(v.src);resolve({duration:v.duration,width:v.videoWidth,height:v.videoHeight})};v.onerror=()=>reject(new Error('Video bilgisi okunamadı.'));v.src=URL.createObjectURL(file)})}
async function publish(){const ids=selectedIds();if(!ids.length){toast('Önce en az bir hedef seç');return}const message=$('message').value.trim();let file=null;try{const id=currentType==='photo'?'photoFile':currentType==='video'?'videoFile':currentType==='reel'?'reelFile':currentType==='story'?'storyFile':null;file=id?$(id)?.files[0]:null;if(['photo','video','reel','story'].includes(currentType))await validateFile(file,currentType);setBusy(true);prepareJobs(ids,file);lastPayload={ids,message,file,type:currentType,storyType,platform};navTo('queue');await publishFacebook(ids,message,file)}catch(e){if(jobs.length)addSystemError(e.message);else toast(e.message)}finally{setBusy(false);if(jobs.length)finalizeQueue()}}
function prepareJobs(ids,file){jobs=ids.map(id=>({id,name:pageName(id),percent:0,status:'waiting',started:0,finished:0,duration:null,file:file?file.name:'',type:currentType,error:null}));$('queueSection').classList.remove('hidden');renderJobs();updateSummary();}
function renderJobs(){const sorted=[...jobs].sort((a,b)=>{if(a.duration!=null&&b.duration!=null)return a.duration-b.duration;if(a.duration!=null)return -1;if(b.duration!=null)return 1;return b.percent-a.percent});$('jobs').innerHTML=sorted.map(j=>'<div class="job '+j.status+'" id="job_'+escAttr(j.id)+'"><div class="jobTop"><div><div class="jobTitle">'+statusIcon(j.status)+' '+esc(j.name)+'</div><div class="jobMeta">'+esc(j.file||contentLabel(j.type))+(j.duration!=null?' • '+formatTime(j.duration):'')+'</div></div><div class="jobPercent">'+j.percent+'%</div></div><div class="jobBar"><div style="width:'+j.percent+'%"></div></div><div class="jobState">'+esc(jobState(j))+'</div></div>').join('')}
function statusIcon(s){return s==='done'?'✓':s==='error'?'×':s==='running'?'◌':'·'}function jobState(j){if(j.status==='done')return 'Tamamlandı • '+formatTime(j.duration);if(j.status==='error')return j.error||'Başarısız';if(j.status==='running')return 'Yükleniyor…';return 'Sırada'}function contentLabel(t){return({post:'Gönderi',photo:'Fotoğraf',video:'Video',reel:'Reel',story:'Story'})[t]||t}
function setJob(id,patch){const j=jobs.find(x=>String(x.id)===String(id));if(!j)return;Object.assign(j,patch);renderJobs();updateSummary()}
function updateSummary(){const done=jobs.filter(j=>j.status==='done').length,err=jobs.filter(j=>j.status==='error').length,run=jobs.filter(j=>j.status==='running').length;const total=jobs.length;$('queueSummary').textContent=total?(done+'/'+total+' tamamlandı'):'Hazır';$('retryBtn').classList.toggle('hidden',err===0)}
async function publishFacebook(ids,message,file){if(currentType==='post'||currentType==='photo')return runPool(ids,id=>publishStandardOne(id,message,file));if(currentType==='video')return runPool(ids,id=>publishVideoOne(id,message,file));if(currentType==='reel')return runPool(ids,id=>publishReelOne(id,message,file));return runPool(ids,id=>publishStoryOne(id,message,file))}
async function runPool(ids,worker){let next=0;async function runner(){while(true){const i=next++;if(i>=ids.length)return;const id=ids[i];const j=jobs.find(x=>x.id===id);j.started=performance.now();setJob(id,{status:'running',percent:0});try{await worker(id);j.finished=performance.now();setJob(id,{status:'done',percent:100,duration:j.finished-j.started})}catch(e){j.finished=performance.now();setJob(id,{status:'error',duration:j.finished-j.started,error:e.message})}}}await Promise.all(Array.from({length:Math.min(CONCURRENCY,ids.length)},()=>runner()))}
async function publishStandardOne(id,message,file){const form=new FormData();form.append('pages',JSON.stringify([id]));form.append('message',message);form.append('type',currentType);if(file)form.append('media',file,file.name);const d=await xhrApi('/api/publish',{method:'POST',body:form},(l,t)=>setJob(id,{percent:Math.round(l/t*100)}));const r=d.results?.[0];if(!r?.success)throw new Error(r?.error||'Yayınlanamadı.')}
async function publishVideoOne(id,message,file){const start=await api('/api/video/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,fileSize:file.size})});let off=start.startOffset||0,end=start.endOffset||0;while(off<file.size){const target=Math.min(end||off+CHUNK_SIZE,file.size);const chunk=file.slice(off,target);const form=new FormData();form.append('pageId',id);form.append('uploadSessionId',start.uploadSessionId);form.append('startOffset',String(off));form.append('fileSize',String(file.size));form.append('chunk',chunk,file.name);const part=await xhrApi('/api/video/upload',{method:'POST',body:form},(l,t)=>setJob(id,{percent:Math.round(((off+l/t*(target-off))/file.size)*100)}));off=part.startOffset;end=part.endOffset||Math.min(off+CHUNK_SIZE,file.size)}await api('/api/video/finish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,uploadSessionId:start.uploadSessionId,description:message})});setJob(id,{percent:100})}
async function publishReelOne(id,message,file){const start=await api('/api/reel/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id})});let off=0;while(off<file.size){const target=Math.min(off+CHUNK_SIZE,file.size);const chunk=file.slice(off,target);const form=new FormData();form.append('pageId',id);form.append('videoId',start.videoId);form.append('uploadUrl',start.uploadUrl);form.append('offset',String(off));form.append('fileSize',String(file.size));form.append('chunk',chunk,file.name);await xhrApi('/api/reel/upload',{method:'POST',body:form},(l,t)=>setJob(id,{percent:Math.round(((off+l/t*(target-off))/file.size)*100)}));off=target}for(let i=0;i<120;i++){const st=await api('/api/reel/status?pageId='+encodeURIComponent(id)+'&videoId='+encodeURIComponent(start.videoId));const p=Number(st.status?.processing_progress||0);setJob(id,{percent:Math.max(90,Math.min(99,p||90))});const ps=String(st.status?.video_status||'').toLowerCase();if(ps==='ready'||ps==='complete'||ps==='published'||st.status?.publishing_phase?.status==='complete')break;if(ps==='error'||ps==='failed')throw new Error('Meta Reel işlemesi başarısız.');await new Promise(r=>setTimeout(r,1500))}await api('/api/reel/finish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,videoId:start.videoId,description:message})})}
async function publishStoryOne(id,message,file){
  if(storyType==='photo'){
    const form=new FormData();
    form.append('pageId',id);
    form.append('storyType','photo');
    form.append('caption',message);
    form.append('media',file,file.name);
    const d=await xhrApi('/api/story/finish',{method:'POST',body:form},(l,t)=>setJob(id,{percent:Math.round(l/t*100)}));
    if(!d?.success)throw new Error(d?.error||'Fotoğraf Story yayınlanamadı.');
    setJob(id,{percent:100});
    return;
  }
  const start=await api('/api/story/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,storyType:'video',fileSize:file.size})});
  if(!start?.success||!start.videoId||!start.uploadUrl)throw new Error(start?.error||'Video Story upload oturumu başlatılamadı.');
  let off=0;
  while(off<file.size){
    const target=Math.min(off+CHUNK_SIZE,file.size);
    const chunk=file.slice(off,target);
    const form=new FormData();
    form.append('pageId',id);
    form.append('videoId',start.videoId);
    form.append('uploadUrl',start.uploadUrl);
    form.append('offset',String(off));
    form.append('fileSize',String(file.size));
    form.append('chunk',chunk,file.name);
    const part=await xhrApi('/api/story/upload',{method:'POST',body:form},(l,t)=>setJob(id,{percent:Math.round(((off+l/t*(target-off))/file.size)*100)}));
    off=target;
    if(part?.response?.start_offset!=null && Number(part.response.start_offset)>off) off=Number(part.response.start_offset);
  }
  setJob(id,{percent:95});
  const finish=new FormData();
  finish.append('pageId',id);
  finish.append('storyType','video');
  finish.append('videoId',start.videoId);
  finish.append('caption',message);
  const d=await api('/api/story/finish',{method:'POST',body:finish});
  if(!d?.success)throw new Error(d?.error||'Video Story yayınlanamadı.');
  setJob(id,{percent:100});
}
async function retryFailed(){if(!lastPayload)return;const failed=jobs.filter(j=>j.status==='error').map(j=>j.id);if(!failed.length)return;failed.forEach(id=>{const j=jobs.find(x=>x.id===id);Object.assign(j,{status:'waiting',percent:0,error:null,duration:null})});renderJobs();await publishFacebook(failed,lastPayload.message,lastPayload.file);finalizeQueue()}
function finalizeQueue(){renderJobs();updateSummary();const f=jobs.filter(j=>j.status==='error').length;toast(f?'Bazı hedefler başarısız oldu':'Tüm yayınlar tamamlandı')}
function clearQueue(){jobs=[];$('jobs').innerHTML='';$('queueSection').classList.add('hidden');$('queueSummary').textContent='Hazır'}
function addSystemError(msg){jobs=[{id:'system',name:'Sistem',percent:0,status:'error',error:msg,duration:0,file:'',type:''}];$('queueSection').classList.remove('hidden');renderJobs()}
function setBusy(b){const x=$('publishBtn');x.disabled=b;x.style.opacity=b?0.72:1;x.querySelector('span:nth-child(2)').textContent=b?'Yayınlanıyor…':'Seçilenlerde yayınla'}
function renderAccounts(){$('accountSummary').innerHTML=pages.map(p=>'<div class="accountCard"><b>'+esc(p.name)+'</b><small>'+(p.instagramBusinessAccount?'Instagram bağlı':'Yalnızca Facebook')+'</small></div>').join('')||'<div class="fieldHint">Hesap bulunamadı.</div>'}
function pageName(id){return pages.find(p=>String(p.id)===String(id))?.name||id}function formatBytes(n){if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';if(n<1073741824)return(n/1048576).toFixed(1)+' MB';return(n/1073741824).toFixed(2)+' GB'}function formatTime(ms){return(ms/1000).toFixed(1)+' sn'}function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}function escAttr(v){return esc(v)}
window.addEventListener('DOMContentLoaded',()=>{try{bindUI();setType('post');setPlatform('facebook');navTo('home');loadPages()}catch(e){console.error(e);toast('Arayüz başlatılamadı: '+e.message)}});
if('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(()=>{}));
}
`;
const STYLE_CSS = `

/* v6 compatibility: app markup uses these semantic names */
.appTop{border-radius:26px;padding:15px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.brandBlock{position:relative;z-index:1}.brandEyebrow{font-size:10px;letter-spacing:2.8px;font-weight:900;color:#5e7382}.brandTitle{font-size:25px;font-weight:850;letter-spacing:-.8px}.brandSub{font-size:12px;color:#6c7882;margin-top:2px}.logoutPill{position:relative;z-index:1;text-decoration:none;color:#33424d;font-size:12px;font-weight:800;padding:10px 13px;border-radius:999px;background:rgba(255,255,255,.28);border:1px solid rgba(255,255,255,.65)}.heroGlass{border-radius:30px;padding:22px;margin-bottom:12px;display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center}.heroOrb{width:68px;height:68px;border-radius:22px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(255,255,255,.76),rgba(255,255,255,.32));border:1px solid rgba(255,255,255,.86);box-shadow:inset 0 1px 0 white,0 15px 32px rgba(65,85,100,.11)}.heroOrb span{font-weight:950;font-size:20px;color:#18384d}.heroKicker,.sectionKicker{font-size:10px;letter-spacing:2.4px;font-weight:900;color:#1689e8}.heroGlass h1{font-size:31px;line-height:1.04;letter-spacing:-1.5px;margin:5px 0 9px}.heroGlass h1 span{color:#5c788b}.heroGlass p{font-size:13px;line-height:1.5;color:#6c7882;margin:0}.heroStats{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:2px}.heroStats div{padding:10px 5px;text-align:center;border-radius:16px;background:rgba(255,255,255,.30);border:1px solid rgba(255,255,255,.55)}.heroStats b{display:block;font-size:18px}.heroStats small{font-size:9px;color:#71808a;font-weight:700}.softNotice,.typeInfo{padding:11px 12px;border-radius:16px;background:rgba(255,255,255,.34);border:1px solid rgba(255,255,255,.62);color:#687680;font-size:12px;line-height:1.45;margin:9px 0 12px}.contentIcon{font-size:21px;color:#1689e8;margin-bottom:3px}.liveDot{font-size:10px;color:#5e737f;font-weight:800}.liveDot i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#49ba8a;box-shadow:0 0 0 4px rgba(73,186,138,.10)}.appTop .glass:before{pointer-events:none}.bottomDock{box-shadow:var(--shadow),inset 0 1px 0 rgba(255,255,255,.95)}
.landingBody{background:radial-gradient(600px 420px at 10% 0%,rgba(255,255,255,.95),transparent 62%),linear-gradient(180deg,#f6f8fa 0%,#e7edf1 100%);color:#15212b;min-height:100vh;overflow-x:hidden}.dropAmbient{position:fixed;border-radius:50%;pointer-events:none;filter:blur(20px);background:radial-gradient(circle at 32% 25%,rgba(255,255,255,.95),rgba(255,255,255,.42) 28%,rgba(142,190,220,.20) 55%,transparent 72%);opacity:.9}.dropOne{width:330px;height:330px;left:-130px;top:12%}.dropTwo{width:430px;height:430px;right:-210px;bottom:8%;opacity:.55}.landingShell{min-height:100vh;display:grid;place-items:center;padding:24px}.landingGlass{width:min(460px,100%);border-radius:38px;padding:34px 28px;text-align:center;overflow:hidden}.landingBrand{font-size:10px;letter-spacing:4px;font-weight:900;color:#71818b;margin-bottom:18px}.landingMark{width:76px;height:76px;margin:0 auto 16px;border-radius:25px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(255,255,255,.34));border:1px solid rgba(255,255,255,.9);box-shadow:inset 0 1px 0 white,0 16px 36px rgba(65,85,100,.12)}.landingMark span{font-size:22px;font-weight:950;color:#18384d}.landingKicker{font-size:10px;letter-spacing:2.4px;font-weight:900;color:#1689e8}.landingGlass h1{font-size:39px;line-height:1.03;letter-spacing:-2px;margin:8px 0 12px}.landingGlass h1 span{color:#5c788b}.landingGlass p{font-size:14px;line-height:1.55;color:#6b7881;max-width:350px;margin:0 auto 22px}.landingButton{display:flex;align-items:center;justify-content:center;gap:12px;text-decoration:none;color:#163b55;background:rgba(255,255,255,.68);border:1px solid rgba(255,255,255,.92);border-radius:22px;padding:15px 18px;font-weight:900;box-shadow:0 14px 30px rgba(60,85,105,.12),inset 0 1px 0 white}.landingButton span{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:rgba(24,139,231,.11);color:#1689e8}.landingMeta{display:flex;justify-content:center;flex-wrap:wrap;gap:7px;color:#7c8991;font-size:9px;margin-top:14px}.privacyLink{display:inline-block;margin-top:18px;color:#6d7c86;font-size:11px;text-decoration:none}.appBody .appShell{padding-bottom:130px}.appBody .screenSection{scroll-margin-top:90px}.liquidButton{overflow:hidden;isolation:isolate;position:relative}.liquidButton:before{content:"";position:absolute;width:80px;height:80px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%) scale(.2);background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.95),rgba(255,255,255,.28) 32%,rgba(100,180,235,.10) 58%,transparent 72%);opacity:0;pointer-events:none;transition:transform .45s cubic-bezier(.15,.85,.2,1),opacity .3s}.liquidButton:active:before{transform:translate(-50%,-50%) scale(1.8);opacity:1;transition-duration:.22s}.liquidButton:active{transform:scale(.965)}@media(max-width:560px){.landingShell{padding:16px}.landingGlass{border-radius:30px;padding:28px 20px}.landingGlass h1{font-size:34px}}

:root{--ink:#15212b;--muted:#6c7882;--blue:#1689e8;--line:rgba(255,255,255,.72);--glass:rgba(255,255,255,.48);--glass2:rgba(255,255,255,.34);--shadow:0 18px 55px rgba(72,91,108,.14)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html{scroll-behavior:smooth}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Segoe UI",sans-serif;color:var(--ink);background:#edf2f5;min-height:100vh}button,input,textarea{font:inherit}button{border:0}.hidden{display:none!important}.touch{touch-action:manipulation;user-select:none}.appBody{overflow-x:hidden;background:radial-gradient(800px 450px at 0% 0%,rgba(120,190,230,.23),transparent 62%),radial-gradient(650px 500px at 100% 35%,rgba(180,195,210,.24),transparent 65%),linear-gradient(180deg,#f7f9fa 0%,#e9eef2 100%)}.ambient{position:fixed;width:420px;height:420px;left:-220px;top:25%;border-radius:50%;background:rgba(255,255,255,.6);filter:blur(40px);pointer-events:none}.ambient2{left:auto;right:-250px;top:55%;background:rgba(205,220,232,.5)}
.appShell{position:relative;z-index:2;max-width:720px;margin:auto;padding:12px 12px 110px}.glass{background:linear-gradient(145deg,rgba(255,255,255,.62),rgba(255,255,255,.30));border:1px solid rgba(255,255,255,.82);box-shadow:var(--shadow),inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(140,155,168,.10);backdrop-filter:blur(28px) saturate(135%);-webkit-backdrop-filter:blur(28px) saturate(135%);position:relative;overflow:hidden}.glass:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.30),transparent 34%,transparent 68%,rgba(255,255,255,.18));pointer-events:none}.topbar{border-radius:26px;padding:15px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.brand{position:relative;z-index:1}.eyebrow{font-size:10px;letter-spacing:2.8px;font-weight:900;color:#5e7382}.title{font-size:25px;font-weight:850;letter-spacing:-.8px}.sub{font-size:12px;color:var(--muted);margin-top:2px}.logout{position:relative;z-index:1;text-decoration:none;color:#33424d;font-size:12px;font-weight:800;padding:10px 13px;border-radius:999px}
.hero{border-radius:30px;padding:22px;margin-bottom:12px}.heroText{position:relative;z-index:1}.hero h1{font-size:31px;line-height:1.03;letter-spacing:-1.5px;margin:7px 0 9px}.hero h1 span{color:#4f7b98}.hero p{margin:0;max-width:560px;font-size:13px;line-height:1.5;color:var(--muted)}.stats{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:18px;border-radius:20px;padding:6px}.stats div{padding:10px 5px;text-align:center;border-radius:16px}.stats b{display:block;font-size:18px}.stats span{font-size:9px;color:var(--muted);font-weight:700}.glassInner{background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.65);box-shadow:inset 0 1px 0 rgba(255,255,255,.8),inset 0 -8px 18px rgba(100,120,135,.05);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}.panel{border-radius:28px;padding:17px;margin-bottom:12px}.sectionHead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:13px;position:relative;z-index:1}.sectionHead h2{font-size:21px;margin:3px 0 0;letter-spacing:-.6px}.countBubble{min-width:42px;height:40px;padding:0 12px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.75);box-shadow:inset 0 1px 0 white,0 8px 22px rgba(75,95,110,.10);font-size:12px;font-weight:900}.segmented{display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:18px;margin-bottom:10px}.segment{background:transparent;color:#65727b;border-radius:14px;padding:12px;font-weight:850;position:relative}.segment.active{background:rgba(255,255,255,.68);color:#18384d;box-shadow:0 7px 20px rgba(70,90,105,.11),inset 0 1px 0 white}.targetTools{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:9px}.miniButton{padding:11px 12px;border-radius:15px;background:rgba(255,255,255,.43);border:1px solid rgba(255,255,255,.72);color:#31414c;font-size:12px;font-weight:800;box-shadow:inset 0 1px 0 white,0 8px 18px rgba(60,80,95,.07);position:relative}.searchWrap{grid-column:1/-1;display:flex;align-items:center;gap:7px;border-radius:16px;padding:0 12px}.searchWrap span{font-size:19px;color:#73808a}.searchWrap input{width:100%;padding:12px 0;border:0;outline:0;background:transparent;color:var(--ink);font-size:14px}.searchWrap input::placeholder,.glassInput::placeholder{color:#87929a}.pageList{max-height:380px;overflow:auto;position:relative}.pageRow{display:flex;align-items:center;gap:10px;padding:11px 7px;border-bottom:1px solid rgba(100,115,125,.11);transition:.25s}.pageRow.selected{background:rgba(255,255,255,.42);border-radius:16px;box-shadow:inset 0 1px 0 rgba(255,255,255,.7)}.pageCheck{appearance:none;width:23px;height:23px;border-radius:50%;border:1px solid #bcc7ce;background:rgba(255,255,255,.48);position:relative;flex:0 0 auto}.pageCheck:checked{background:#188be7;border-color:#188be7;box-shadow:0 0 0 4px rgba(24,139,231,.09)}.pageCheck:checked:after{content:"✓";position:absolute;inset:0;display:grid;place-items:center;color:white;font-size:13px;font-weight:900}.pageName{flex:1;font-size:13px;font-weight:750}.igBadge{font-size:9px;font-weight:850;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.48);border:1px solid rgba(255,255,255,.7);color:#687782}.notice,.fieldHint{padding:11px 12px;border-radius:16px;background:rgba(255,255,255,.34);border:1px solid rgba(255,255,255,.62);color:#687680;font-size:12px;line-height:1.45;margin:9px 0 12px}.contentGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.contentCard{min-height:90px;padding:13px;border-radius:20px;text-align:left;background:rgba(255,255,255,.37);border:1px solid rgba(255,255,255,.72);color:#33434e;display:flex;flex-direction:column;gap:3px;position:relative;box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 9px 22px rgba(70,90,105,.06)}.contentCard.active{background:rgba(255,255,255,.68);box-shadow:0 10px 25px rgba(60,90,110,.11),inset 0 1px 0 white}.contentCard .icon{font-size:21px;color:#1689e8}.contentCard b{font-size:14px}.contentCard small{font-size:10px;color:#7a8790}.fieldLabel{display:block;font-size:10px;font-weight:900;letter-spacing:1.5px;color:#697781;margin:14px 2px 7px;text-transform:uppercase}.glassInput{width:100%;border-radius:18px;padding:13px 14px;background:rgba(255,255,255,.43);border:1px solid rgba(255,255,255,.72);color:var(--ink);outline:0;resize:vertical;box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 7px 18px rgba(65,85,100,.05);transition:.25s}.glassInput:focus{background:rgba(255,255,255,.64);border-color:rgba(24,139,231,.35);box-shadow:0 0 0 4px rgba(24,139,231,.08),inset 0 1px 0 white}textarea.glassInput{min-height:135px}.fileBox{border:1px dashed rgba(120,140,152,.45);border-radius:19px;padding:14px;margin-top:10px;background:rgba(255,255,255,.25)}.fileLabel{display:flex;justify-content:space-between;gap:8px;font-size:13px;font-weight:800}.fileButton{padding:9px 11px;border-radius:12px;background:rgba(255,255,255,.56);border:1px solid rgba(255,255,255,.75);font-size:11px}.fileInput{display:none}.fileName{margin-top:8px;font-size:10px;color:#78858e}.storySwitch{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.storyTab{padding:11px;border-radius:14px;background:rgba(255,255,255,.38);color:#65737c;border:1px solid rgba(255,255,255,.7);font-size:12px;font-weight:800}.storyTab.active{background:rgba(255,255,255,.68);color:#18384d}.previewGlass{margin-top:11px;border-radius:20px;overflow:hidden;background:rgba(255,255,255,.3);border:1px solid rgba(255,255,255,.7)}.previewGlass img,.previewGlass video{display:block;width:100%;max-height:400px;object-fit:contain}.publishButton{width:100%;margin-top:15px;padding:14px 15px;border-radius:20px;background:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.86);color:#163b55;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;font-weight:900;box-shadow:0 12px 28px rgba(55,85,105,.12),inset 0 1px 0 white}.publishIcon,.publishCount{display:grid;place-items:center;border-radius:999px;background:rgba(24,139,231,.12);color:#1689e8}.publishIcon{width:27px;height:27px}.publishCount{min-width:25px;height:21px;padding:0 7px;font-size:10px}.ready{font-size:10px;color:#5e737f;font-weight:800}.ready i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#49ba8a;box-shadow:0 0 0 4px rgba(73,186,138,.10)}
.jobs{display:flex;flex-direction:column;gap:8px}.job{padding:13px;border-radius:20px;background:rgba(255,255,255,.43);border:1px solid rgba(255,255,255,.72);box-shadow:inset 0 1px 0 white,0 10px 24px rgba(65,85,100,.07);animation:jobIn .42s cubic-bezier(.2,.9,.2,1) both}.job.running{border-color:rgba(24,139,231,.35)}.job.done{border-color:rgba(73,186,138,.35)}.job.error{border-color:rgba(210,90,100,.35)}.jobTop{display:flex;justify-content:space-between;gap:10px}.jobTitle{font-weight:900;font-size:13px}.jobMeta{font-size:10px;color:#7c8991;margin-top:3px}.jobPercent{font-size:12px;font-weight:900;color:#426176}.jobBar{height:8px;margin:10px 0 7px;border-radius:999px;background:rgba(120,135,145,.16);overflow:hidden;box-shadow:inset 0 1px 2px rgba(70,80,90,.07)}.jobBar div{height:100%;border-radius:999px;background:linear-gradient(90deg,#3aa7ed,#1689e8);box-shadow:0 0 12px rgba(24,139,231,.28);transition:width .16s linear}.jobState{font-size:10px;color:#77848d;min-height:14px}.queueActions{display:flex;gap:7px;margin-top:10px}.accountCard{padding:12px;border-radius:18px;background:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.7);margin-bottom:7px}.accountCard b{display:block;font-size:13px}.accountCard small{color:#78858d;font-size:10px}.loadingState{display:flex;justify-content:center;align-items:center;gap:8px;padding:23px;color:#74828b;font-size:12px}.spinner{width:15px;height:15px;border:2px solid rgba(100,120,135,.18);border-top-color:#1689e8;border-radius:50%;animation:spin .8s linear infinite}
.bottomDock{position:fixed;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:50;width:min(680px,calc(100% - 18px));padding:6px;border-radius:27px;display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.dockGlow{position:absolute;width:74px;height:74px;border-radius:50%;background:rgba(255,255,255,.55);filter:blur(12px);pointer-events:none;left:var(--glow-left,6px);top:2px;transition:left .35s cubic-bezier(.2,.9,.2,1)}.navItem{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:8px 3px;border-radius:21px;background:transparent;color:#7a8790;font-size:9px;font-weight:850;transition:transform .25s cubic-bezier(.2,.9,.2,1),color .25s,background .25s,box-shadow .25s}.navIcon{font-size:19px;line-height:19px}.navItem.active{color:#18384d;background:rgba(255,255,255,.63);box-shadow:inset 0 1px 0 white,0 8px 20px rgba(70,90,105,.10)}.toastGlass{position:fixed;left:50%;bottom:95px;transform:translate(-50%,18px) scale(.96);opacity:0;pointer-events:none;z-index:100;max-width:calc(100% - 30px);padding:11px 14px;border-radius:16px;background:rgba(245,248,250,.82);border:1px solid white;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);color:#243541;font-size:12px;font-weight:800;box-shadow:0 18px 45px rgba(60,80,95,.16);transition:.3s}.toastGlass.show{opacity:1;transform:translate(-50%,0) scale(1)}
.liquidButton{overflow:hidden;isolation:isolate;position:relative}.liquidButton:before{content:"";position:absolute;width:80px;height:80px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%) scale(.2);background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.95),rgba(255,255,255,.28) 32%,rgba(100,180,235,.10) 58%,transparent 72%);opacity:0;pointer-events:none;transition:transform .45s cubic-bezier(.15,.85,.2,1),opacity .3s}.liquidButton:after{content:"";position:absolute;inset:1px;border-radius:inherit;border-top:1px solid rgba(255,255,255,.82);opacity:.8;pointer-events:none}.liquidButton:active:before{transform:translate(-50%,-50%) scale(1.8);opacity:1;transition-duration:.22s}.liquidButton:active{transform:scale(.965)}.navItem:active{transform:scale(.90)}@keyframes spin{to{transform:rotate(360deg)}}@keyframes jobIn{from{opacity:0;transform:translateY(10px) scale(.98);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}
@media(max-width:560px){.appShell{padding:10px 10px 112px}.topbar{border-radius:22px}.title{font-size:23px}.hero{border-radius:25px;padding:19px}.hero h1{font-size:28px}.panel{border-radius:24px;padding:15px}.bottomDock{width:calc(100% - 14px)}.navItem{padding:8px 2px}.contentGrid{gap:7px}}
/* V7.6 visual cleanup */
/* V7.7 professional mobile cleanup */
html{scroll-behavior:auto;}
body{overscroll-behavior-y:auto;}
.appBody{background:#f3f6f8;color:#172733;}
.ambient,.ambient2,.aurora,.grain{display:none!important;}
.appShell{max-width:760px;padding:14px 14px 118px;}
.glass{background:rgba(255,255,255,.94);border:1px solid #e2e8ec;box-shadow:0 8px 24px rgba(33,52,66,.07),inset 0 1px 0 #fff;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);}
.glass:before{display:none;}
.appTop{padding:17px 18px;border-radius:24px;margin-bottom:14px;}
.brandTitle{font-size:24px;letter-spacing:-.7px;color:#142936;}
.brandSub{color:#73808a;margin-top:3px;}
.logoutPill{background:#f7f9fa;border-color:#e1e7eb;color:#40515d;}
.heroGlass{border-radius:26px;padding:20px;margin-bottom:14px;grid-template-columns:64px 1fr;gap:14px;}
.heroOrb{width:64px;height:64px;border-radius:19px;background:#f4f8fa;border-color:#e0e7eb;box-shadow:inset 0 1px 0 #fff,0 8px 18px rgba(50,70,85,.07);}
.heroKicker,.sectionKicker{color:#167fc9;}
.heroGlass h1{font-size:29px;color:#152b38;margin:4px 0 8px;}
.heroGlass h1 span{color:#647d8d;}
.heroGlass p{color:#6f7c85;}
.heroStats{gap:8px;margin-top:16px;}
.heroStats div{background:#f7f9fa;border:1px solid #e2e8ec;padding:11px 5px;}
.panel{border-radius:26px;padding:16px;margin-bottom:14px;}
.sectionHead h2{font-size:20px;color:#172c38;}
.countBubble{background:#f5f8fa;border-color:#e0e6ea;box-shadow:none;}
.segmented{background:#f1f4f6;border:1px solid #e1e7eb;padding:4px;}
.segment{color:#72808a;}
.segment.active{background:#fff;color:#18384d;box-shadow:0 4px 12px rgba(40,60,75,.08);}
.targetTools{gap:8px;}
.miniButton{background:#f7f9fa;border-color:#e0e6ea;box-shadow:none;color:#3c4d58;}
.miniButton:disabled{opacity:.55;}
.searchWrap{background:#f7f9fa;border-color:#e0e6ea;}
.searchWrap input{padding:13px 0;}
.pageList{max-height:440px;border:1px solid #e2e8ec;border-radius:18px;background:#fff;overflow:auto;overscroll-behavior:contain;}
.pageRow{min-height:54px;padding:11px 12px;border-bottom:1px solid #edf1f3;background:#fff;}
.pageRow:last-child{border-bottom:0;}
.pageRow.selected{background:#f0f7fc;border:0;border-radius:0;box-shadow:inset 3px 0 0 #1989d7;}
.pageName{font-size:14px;color:#263a46;font-weight:700;}
.pageCheck{width:22px;height:22px;background:#fff;border-color:#aebbc4;}
.pageCheck:checked{background:#1689e8;border-color:#1689e8;}
.igBadge{background:#f4f7f9;border-color:#e1e7eb;color:#687780;}
.contentCard{background:#f7f9fa;border-color:#e1e7eb;box-shadow:none;}
.contentCard.active{background:#fff;border-color:#cfe2ef;box-shadow:0 6px 16px rgba(40,70,90,.08);}
.glassInput{background:#f8fafb;border-color:#e0e7eb;box-shadow:none;}
.glassInput:focus{background:#fff;}
.publishButton{background:#183f58;color:#fff;border:0;box-shadow:0 10px 22px rgba(24,63,88,.18);}
.publishIcon,.publishCount{background:rgba(255,255,255,.14);color:#fff;}
.bottomDock{background:rgba(255,255,255,.96);border-color:#e1e7eb;box-shadow:0 10px 28px rgba(30,50,65,.14);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}
.navItem{color:#7a8790;}
.navItem.active{background:#eef5f9;color:#17394e;box-shadow:none;}
.toastGlass{background:#fff;border-color:#e1e7eb;box-shadow:0 12px 28px rgba(30,50,65,.13);}
@media(max-width:560px){.appShell{padding:10px 10px 116px}.appTop{border-radius:22px}.heroGlass{grid-template-columns:58px 1fr;padding:17px;border-radius:23px}.heroOrb{width:58px;height:58px}.heroGlass h1{font-size:26px}.panel{border-radius:22px;padding:14px}.pageList{max-height:400px}.bottomDock{width:calc(100% - 16px)}}

.appBody{background:linear-gradient(180deg,#f8fafb 0%,#eef3f6 48%,#e8eef2 100%);}
.glass{background:rgba(250,252,253,.84);border-color:rgba(255,255,255,.96);box-shadow:0 12px 32px rgba(48,67,82,.09),inset 0 1px 0 #fff;backdrop-filter:blur(20px) saturate(115%);-webkit-backdrop-filter:blur(20px) saturate(115%);}
.glass:before{background:linear-gradient(120deg,rgba(255,255,255,.38),transparent 42%);}
.heroGlass,.panel{box-shadow:0 10px 28px rgba(48,67,82,.08),inset 0 1px 0 #fff;}
.heroStats div,.glassInner{background:rgba(246,249,251,.92);border-color:rgba(218,226,232,.9);}
.pageList{max-height:430px;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;}
.pageRow{min-height:52px;padding:10px 9px;border-bottom-color:rgba(90,108,120,.10);}
.pageRow.selected{background:#eef7fd;border:1px solid rgba(24,139,231,.18);}
.pageName{font-size:14px;color:#233642;}
.pageCheck{background:#fff;border-color:#aebbc4;}
.searchWrap{background:#f7f9fa;border-color:#dfe6eb;}
.miniButton,.segment,.contentCard,.storyTab{background:#f7f9fa;border-color:#e0e7eb;}
.segment.active,.contentCard.active,.storyTab.active{background:#fff;border-color:#d7e2e9;box-shadow:0 6px 16px rgba(50,75,92,.08),inset 0 1px 0 #fff;}
.bottomDock{background:rgba(248,250,251,.94);border:1px solid rgba(255,255,255,.98);box-shadow:0 10px 28px rgba(48,67,82,.13),inset 0 1px 0 #fff;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);}
.navItem.active{background:#fff;box-shadow:0 5px 14px rgba(50,75,92,.09),inset 0 1px 0 #fff;}


/* V8 professional cleanup */
:root{--bg:#eef2f5;--card:#ffffff;--line:#dfe5ea;--text:#17232d;--muted:#66737d;--accent:#1877d2;--shadow:0 12px 30px rgba(27,45,58,.08)}
body{background:linear-gradient(180deg,#f7f9fb 0%,#edf1f4 100%);color:var(--text);overflow-x:hidden;overflow-y:auto;-webkit-overflow-scrolling:touch}
.glass,.heroGlass,.landingGlass,.appTop,.bottomDock{background:rgba(255,255,255,.9)!important;border:1px solid rgba(215,222,228,.95)!important;box-shadow:var(--shadow),inset 0 1px 0 rgba(255,255,255,.95)!important;backdrop-filter:blur(18px)!important;-webkit-backdrop-filter:blur(18px)!important}
.pageRow{background:#fff!important;border:1px solid #e1e6eb!important;color:#25333d!important}.pageRow.selected{border-color:#8ebce8!important;background:#f1f7fd!important}
.job{background:#fff!important;border:1px solid #dfe5ea!important}.job.error{border-color:#efb9b9!important}.job.done{border-color:#b8dec9!important}
.typeInfo,.softNotice,.fieldHint{color:#596872!important;background:#f7f9fa!important;border-color:#e3e8ec!important}
.bottomDock{position:fixed!important;bottom:max(10px,env(safe-area-inset-bottom))!important}
.screenSection{scroll-margin-top:20px}
`;

function assetResponse(body, type) {
  return new Response(body, { headers: { "content-type": type+"; charset=UTF-8", "cache-control": "no-store" } });
}

const PWA_ICONS = {"180": "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", "192": "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", "512": "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"};

function manifest() {
  return new Response(JSON.stringify({
    name: "Social Publisher",
    short_name: "Social Publisher",
    description: "Erol Vural için manuel çoklu sosyal medya yayınlama",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#e9eef2",
    theme_color: "#e9eef2",
    lang: "tr",
    icons: [
      { src: "/pwa-icon-180.png", sizes: "180x180", type: "image/png", purpose: "any maskable" },
      { src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
    ]
  }), {
    headers: { "content-type": "application/manifest+json; charset=UTF-8", "cache-control": "public, max-age=86400" }
  });
}

function serviceWorker() {
  return new Response(`const CACHE='social-publisher-pwa-v1';
const STATIC=['/style.css','/app.js','/manifest.json','/pwa-icon-180.png','/pwa-icon-192.png','/pwa-icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  const u=new URL(event.request.url);
  if(u.origin!==location.origin || event.request.method!=='GET') return;
  if(u.pathname.startsWith('/api/') || u.pathname==='/login' || u.pathname==='/callback' || u.pathname==='/logout') return;
  if(STATIC.includes(u.pathname)) {
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
  }
});`, { headers: { "content-type": "application/javascript; charset=UTF-8", "cache-control": "no-cache" } });
}

function pwaIconResponse(size) {
  return new Response(PWA_ICONS[String(size)], { headers: { "content-type": "image/png", "cache-control": "public, max-age=31536000, immutable" } });
}


export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/privacy") return privacy();
      if (url.pathname === "/") return home();
      if (url.pathname === "/login") return login(url);
      if (url.pathname === "/callback") return callback(request, url, env);
      if (url.pathname === "/app") return appPage();
      if (url.pathname === "/app.js") return appScript();
      if (url.pathname === "/style.css") return styleSheet();
      if (url.pathname === "/manifest.json") return manifest();
      if (url.pathname === "/sw.js") return serviceWorker();
      if (url.pathname === "/pwa-icon-180.png") return pwaIconResponse(180);
      if (url.pathname === "/pwa-icon-192.png") return pwaIconResponse(192);
      if (url.pathname === "/pwa-icon-512.png") return pwaIconResponse(512);

      if (url.pathname === "/logout") {
        return redirect("/", [
          cookie("fb_user_token", "", 0),
          cookie("oauth_state", "", 0)
        ]);
      }

      if (url.pathname === "/api/pages" && request.method === "GET") {
        return await apiPages(request);
      }

      if (url.pathname === "/api/publish" && request.method === "POST") {
        return await apiPublish(request);
      }

      if (url.pathname === "/api/video/start" && request.method === "POST") {
        return await apiVideoStart(request);
      }

      if (url.pathname === "/api/video/upload" && request.method === "POST") {
        return await apiVideoUpload(request);
      }

      if (url.pathname === "/api/video/finish" && request.method === "POST") {
        return await apiVideoFinish(request);
      }

      if (url.pathname === "/api/reel/start" && request.method === "POST") {
        return await apiReelStart(request);
      }

      if (url.pathname === "/api/reel/upload" && request.method === "POST") {
        return await apiReelUpload(request);
      }

      if (url.pathname === "/api/reel/status" && request.method === "GET") {
        return await apiReelStatus(request, url);
      }

      if (url.pathname === "/api/reel/finish" && request.method === "POST") {
        return await apiReelFinish(request);
      }

      if (url.pathname === "/api/story/start" && request.method === "POST") {
        return await apiStoryStart(request);
      }

      if (url.pathname === "/api/story/upload" && request.method === "POST") {
        return await apiStoryUpload(request);
      }

      if (url.pathname === "/api/story/finish" && request.method === "POST") {
        return await apiStoryFinish(request);
      }

      return new Response("Not Found", { status: 404 });
    } catch (e) {
      return json({
        success: false,
        error: cleanError(e)
      }, 500);
    }
  }
};

// ============================================================
// AUTH
// ============================================================

function login(url) {
  const state = crypto.randomUUID();
  const redirectUri = `${url.origin}/callback`;

  const scope = [
    "public_profile",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
  ].join(",");

  const oauth =
    `https://www.facebook.com/dialog/oauth` +
    `?client_id=${encodeURIComponent(APP_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}` +
    `&response_type=code` +
    `&auth_type=rerequest` +
    `&scope=${encodeURIComponent(scope)}`;

  return new Response(null, {
    status: 302,
    headers: {
      "Location": oauth,
      "Set-Cookie": cookieString("oauth_state", state, OAUTH_TTL)
    }
  });
}

// This route is never displayed; the second Location wins only if duplicated,
// so use a direct response instead.
function callbackWait() {
  return new Response("Redirecting…", { status: 302 });
}

async function callback(request, url, env) {
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state || state !== cookies.oauth_state) {
    return new Response("OAuth doğrulaması başarısız.", { status: 400 });
  }

  if (!env.META_APP_SECRET) {
    return new Response("META_APP_SECRET Cloudflare Secret olarak tanımlı değil.", {
      status: 500
    });
  }

  const tokenUrl =
    `${GRAPH}/oauth/access_token` +
    `?client_id=${encodeURIComponent(APP_ID)}` +
    `&client_secret=${encodeURIComponent(env.META_APP_SECRET)}` +
    `&redirect_uri=${encodeURIComponent(`${url.origin}/callback`)}` +
    `&code=${encodeURIComponent(code)}`;

  const response = await fetch(tokenUrl);
  const data = await response.json();

  if (!response.ok || !data.access_token) {
    return json({
      success: false,
      error: data?.error?.message || "Facebook erişim anahtarı alınamadı."
    }, 400);
  }

  // Exchange the short-lived login token for Meta's long-lived user token.
  // The browser cookie alone cannot extend the lifetime of the Meta token.
  let userToken = data.access_token;
  try {
    const longUrl = new URL(`${GRAPH}/oauth/access_token`);
    longUrl.searchParams.set("grant_type", "fb_exchange_token");
    longUrl.searchParams.set("client_id", APP_ID);
    longUrl.searchParams.set("client_secret", env.META_APP_SECRET);
    longUrl.searchParams.set("fb_exchange_token", data.access_token);
    const longResponse = await fetch(longUrl);
    const longData = await longResponse.json();
    if (longResponse.ok && longData.access_token) {
      userToken = longData.access_token;
    }
  } catch (_) {}

  return redirect("/app", [
    cookie("fb_user_token", userToken, SESSION_TTL),
    cookie("oauth_state", "", 0)
  ]);
}

// ============================================================
// PAGE LIST
// ============================================================

async function apiPages(request) {
  const userToken = getUserToken(request);
  if (!userToken) return json({ error: "Oturum süresi dolmuş." }, 401);

  let pages;
  try {
    pages = await getPages(userToken);
  } catch (e) {
    return json({
      success: false,
      error: cleanError(e),
      reauth: true,
      pages: []
    }, 400);
  }

  return json({
    success: true,
    sessionHours: 1440,
    metaGraphVersion: GRAPH_VERSION,
    pageCount: pages.length,
    pages: pages.map(p => ({
      id: p.id,
      name: p.name,
      tasks: p.tasks || [],
    })),
    notice: pages.length === 0
      ? "Facebook bağlantısı başarılı ancak bu kullanıcı için erişilebilir Sayfa döndürülmedi."
      : null
  });
}

async function getPages(userToken) {
  const fields = "id,name,access_token,tasks";
  async function fetchAll() {
    let next = `${GRAPH}/me/accounts?fields=${encodeURIComponent(fields)}&limit=100&access_token=${encodeURIComponent(userToken)}`;
    const all = [];
    while (next) {
      const r = await fetch(next, { cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.error) throw new Error(data?.error?.message || "Facebook Sayfaları alınamadı.");
      all.push(...(data.data || []));
      next = data?.paging?.next || null;
    }
    return all;
  }

  return await fetchAll();
}

async function getPageToken(request, pageId) {
  const userToken = getUserToken(request);
  if (!userToken) throw new Error("Oturum süresi dolmuş.");

  const pages = await getPages(userToken);
  const page = pages.find(p => String(p.id) === String(pageId));

  if (!page) throw new Error("Bu Sayfa için yetkiniz bulunamadı.");

  return {
    page,
    token: page.access_token
  };
}

// ============================================================
// STANDARD POST / PHOTO
// ============================================================

async function apiPublish(request) {
  const form = await request.formData();

  const pages = parseJSON(form.get("pages"), []);
  const message = String(form.get("message") || "").trim();
  const type = String(form.get("type") || "post");
  const media = form.get("media");

  if (!pages.length) {
    return json({ error: "En az bir Sayfa seçin." }, 400);
  }

  if (!["post", "photo"].includes(type)) {
    return json({ error: "Bu endpoint yalnızca Gönderi/Fotograf içindir." }, 400);
  }

  if (!message && (!media || typeof media === "string")) {
    return json({ error: "Açıklama veya medya gerekli." }, 400);
  }

  const results = [];

  for (const pageId of pages) {
    try {
      const { page, token } = await getPageToken(request, pageId);

      let result;

      if (type === "photo" && media && typeof media !== "string") {
        validateImage(media);
        result = await publishPhoto(page.id, token, message, media);
      } else {
        result = await publishText(page.id, token, message);
      }

      results.push({
        pageId: page.id,
        page: page.name,
        success: true,
        result
      });
    } catch (e) {
      results.push({
        pageId,
        success: false,
        error: cleanError(e)
      });
    }
  }

  return json({ success: true, results });
}

async function publishText(pageId, token, message) {
  const body = new URLSearchParams();
  body.set("message", message);
  body.set("access_token", token);

  const r = await fetch(`${GRAPH}/${pageId}/feed`, {
    method: "POST",
    body
  });

  const data = await r.json();
  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || "Gönderi yayınlanamadı.");
  }

  return data;
}

async function publishPhoto(pageId, token, caption, file) {
  const body = new FormData();
  body.append("source", file, file.name || "photo.jpg");
  if (caption) body.append("caption", caption);
  body.append("access_token", token);

  const r = await fetch(`${GRAPH}/${pageId}/photos`, {
    method: "POST",
    body
  });

  const data = await r.json();
  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || "Fotoğraf yayınlanamadı.");
  }

  return data;
}

// ============================================================
// FEED VIDEO - RESUMABLE
// ============================================================

async function apiVideoStart(request) {
  const body = await request.json();
  const pageId = String(body.pageId || "");
  if (!pageId) return json({ error: "pageId gerekli." }, 400);

  const { page, token } = await getPageToken(request, pageId);

  const params = new URLSearchParams();
  params.set("upload_phase", "start");
  params.set("file_size", String(body.fileSize || 0));
  params.set("access_token", token);

  const r = await fetch(`${GRAPH}/${page.id}/videos`, {
    method: "POST",
    body: params
  });

  const data = await r.json();

  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || "Video upload oturumu başlatılamadı.");
  }

  return json({
    success: true,
    pageId: page.id,
    page: page.name,
    uploadSessionId: data.upload_session_id,
    startOffset: Number(data.start_offset || 0),
    endOffset: Number(data.end_offset || 0)
  });
}

async function apiVideoUpload(request) {
  const form = await request.formData();

  const pageId = String(form.get("pageId") || "");
  const sessionId = String(form.get("uploadSessionId") || "");
  const startOffset = String(form.get("startOffset") || "0");
  const fileSize = String(form.get("fileSize") || "0");
  const chunk = form.get("chunk");

  if (!pageId || !sessionId || !chunk || typeof chunk === "string") {
    return json({ error: "Video yükleme bilgileri eksik." }, 400);
  }

  const { page, token } = await getPageToken(request, pageId);

  const body = new FormData();
  body.append("upload_phase", "transfer");
  body.append("upload_session_id", sessionId);
  body.append("start_offset", startOffset);
  body.append("video_file_chunk", chunk, "chunk.bin");
  body.append("access_token", token);

  const r = await fetch(`${GRAPH}/${page.id}/videos`, {
    method: "POST",
    body
  });

  const data = await r.json();

  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || "Video parçası yüklenemedi.");
  }

  return json({
    success: true,
    startOffset: Number(data.start_offset || 0),
    endOffset: Number(data.end_offset || 0),
    fileSize: Number(fileSize)
  });
}

async function apiVideoFinish(request) {
  const body = await request.json();

  const pageId = String(body.pageId || "");
  const sessionId = String(body.uploadSessionId || "");
  const title = String(body.title || "");
  const description = String(body.description || "");

  if (!pageId || !sessionId) {
    return json({ error: "Video yayınlama bilgileri eksik." }, 400);
  }

  const { page, token } = await getPageToken(request, pageId);

  const params = new URLSearchParams();
  params.set("upload_phase", "finish");
  params.set("upload_session_id", sessionId);
  params.set("access_token", token);

  if (title) params.set("title", title);
  if (description) params.set("description", description);

  const r = await fetch(`${GRAPH}/${page.id}/videos`, {
    method: "POST",
    body: params
  });

  const data = await r.json();

  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || "Video yayınlanamadı.");
  }

  return json({
    success: true,
    pageId: page.id,
    page: page.name,
    result: data
  });
}

// ============================================================
// REELS
// ============================================================

async function apiReelStart(request) {
  const body = await request.json();
  const pageId = String(body.pageId || "");

  if (!pageId) return json({ error: "pageId gerekli." }, 400);

  const { page, token } = await getPageToken(request, pageId);

  const r = await fetch(
    `${GRAPH}/${page.id}/video_reels` +
    `?upload_phase=start` +
    `&access_token=${encodeURIComponent(token)}`,
    { method: "POST" }
  );

  const data = await r.json();

  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || "Reels upload oturumu başlatılamadı.");
  }

  return json({
    success: true,
    pageId: page.id,
    page: page.name,
    videoId: data.video_id,
    uploadUrl: data.upload_url
  });
}

async function apiReelUpload(request) {
  const form = await request.formData();

  const pageId = String(form.get("pageId") || "");
  const videoId = String(form.get("videoId") || "");
  const uploadUrl = String(form.get("uploadUrl") || "");
  const offset = Number(form.get("offset") || 0);
  const fileSize = Number(form.get("fileSize") || 0);
  const chunk = form.get("chunk");

  if (!pageId || !videoId || !uploadUrl || !chunk || typeof chunk === "string") {
    return json({ error: "Reels upload bilgileri eksik." }, 400);
  }

  validateRupload(uploadUrl, videoId);

  const { token } = await getPageToken(request, pageId);

  const r = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `OAuth ${token}`,
      "offset": String(offset),
      "file_size": String(fileSize),
      "Content-Type": "application/octet-stream"
    },
    body: chunk
  });

  const text = await r.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || `Reels video yükleme hatası (${r.status}).`);
  }

  return json({
    success: true,
    response: data
  });
}

async function apiReelStatus(request, url) {
  const pageId = url.searchParams.get("pageId");
  const videoId = url.searchParams.get("videoId");

  if (!pageId || !videoId) {
    return json({ error: "pageId ve videoId gerekli." }, 400);
  }

  const { token } = await getPageToken(request, pageId);

  const r = await fetch(
    `${GRAPH}/${videoId}/?fields=status` +
    `&access_token=${encodeURIComponent(token)}`
  );

  const data = await r.json();

  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || "Reels durumu alınamadı.");
  }

  return json({ success: true, status: data.status || data });
}

async function apiReelFinish(request) {
  const body = await request.json();

  const pageId = String(body.pageId || "");
  const videoId = String(body.videoId || "");
  const description = String(body.description || "");
  const title = String(body.title || "");

  if (!pageId || !videoId) {
    return json({ error: "Reels yayınlama bilgileri eksik." }, 400);
  }

  const { page, token } = await getPageToken(request, pageId);

  const params = new URLSearchParams();
  params.set("upload_phase", "finish");
  params.set("video_id", videoId);
  params.set("video_state", "PUBLISHED");
  params.set("access_token", token);
  if (description) params.set("description", description);
  if (title) params.set("title", title);

  const r = await fetch(`${GRAPH}/${page.id}/video_reels`, {
    method: "POST",
    body: params
  });

  const data = await r.json();

  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || "Reels yayınlanamadı.");
  }

  return json({
    success: true,
    pageId: page.id,
    page: page.name,
    result: data
  });
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// ============================================================
// STORIES
// ============================================================

async function apiStoryStart(request) {
  const body = await request.json();
  const pageId = String(body.pageId || "");
  const storyType = String(body.storyType || "");

  if (!pageId || !["photo", "video"].includes(storyType)) {
    return json({ error: "Story türü veya Sayfa eksik." }, 400);
  }

  const { page, token } = await getPageToken(request, pageId);

  if (storyType === "photo") {
    return json({
      success: true,
      mode: "photo",
      pageId: page.id,
      page: page.name
    });
  }

  const startParams = new URLSearchParams();
  startParams.set("upload_phase", "start");
  if (body.fileSize) startParams.set("file_size", String(body.fileSize));
  startParams.set("access_token", token);

  const r = await fetch(`${GRAPH}/${page.id}/video_stories`, {
    method: "POST",
    body: startParams
  });

  const data = await r.json();

  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || "Video Story upload oturumu başlatılamadı.");
  }

  return json({
    success: true,
    mode: "video",
    pageId: page.id,
    page: page.name,
    videoId: data.video_id,
    uploadUrl: data.upload_url
  });
}

async function apiStoryUpload(request) {
  const form = await request.formData();

  const pageId = String(form.get("pageId") || "");
  const videoId = String(form.get("videoId") || "");
  const uploadUrl = String(form.get("uploadUrl") || "");
  const fileSize = Number(form.get("fileSize") || 0);
  const offset = Number(form.get("offset") || 0);
  const chunk = form.get("chunk");

  if (!pageId || !videoId || !uploadUrl || !chunk || typeof chunk === "string") {
    return json({ error: "Story video yükleme bilgileri eksik." }, 400);
  }

  validateRupload(uploadUrl, videoId);

  const { token } = await getPageToken(request, pageId);

  const r = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Authorization": `OAuth ${token}`,
      "offset": String(offset),
      "file_size": String(fileSize),
      "Content-Type": "application/octet-stream"
    },
    body: chunk
  });

  const text = await r.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || `Story video yükleme hatası (${r.status}).`);
  }

  return json({ success: true, response: data });
}

async function apiStoryFinish(request) {
  const form = await request.formData();

  const pageId = String(form.get("pageId") || "");
  const storyType = String(form.get("storyType") || "");
  const caption = String(form.get("caption") || "");
  const media = form.get("media");
  const videoId = String(form.get("videoId") || "");

  if (!pageId || !["photo", "video"].includes(storyType)) {
    return json({ error: "Story bilgileri eksik." }, 400);
  }

  const { page, token } = await getPageToken(request, pageId);

  if (storyType === "photo") {
    if (!media || typeof media === "string") {
      return json({ error: "Story fotoğrafı gerekli." }, 400);
    }

    validateImage(media);

    const uploadBody = new FormData();
    uploadBody.append("source", media, media.name || "story.jpg");
    uploadBody.append("published", "false");
    uploadBody.append("access_token", token);

    const photoResponse = await fetch(`${GRAPH}/${page.id}/photos`, {
      method: "POST",
      body: uploadBody
    });

    const photoData = await photoResponse.json();

    if (!photoResponse.ok || photoData.error || !photoData.id) {
      throw new Error(photoData?.error?.message || "Story fotoğrafı yüklenemedi.");
    }

    const storyParams = new URLSearchParams();
    storyParams.set("photo_id", photoData.id);
    storyParams.set("access_token", token);

    const storyResponse = await fetch(`${GRAPH}/${page.id}/photo_stories`, {
      method: "POST",
      body: storyParams
    });

    const storyData = await storyResponse.json();

    if (!storyResponse.ok || storyData.error) {
      throw new Error(storyData?.error?.message || "Fotoğraf Story yayınlanamadı.");
    }

    return json({
      success: true,
      pageId: page.id,
      page: page.name,
      result: storyData
    });
  }

  if (!videoId) {
    return json({ error: "Video Story videoId eksik." }, 400);
  }

  const params = new URLSearchParams();
  params.set("upload_phase", "finish");
  params.set("video_id", videoId);
  params.set("video_state", "PUBLISHED");
  params.set("description", caption);
  params.set("access_token", token);

  const r = await fetch(`${GRAPH}/${page.id}/video_stories`, {
    method: "POST",
    body: params
  });

  const data = await r.json();

  if (!r.ok || data.error) {
    throw new Error(data?.error?.message || "Video Story yayınlanamadı.");
  }

  return json({
    success: true,
    pageId: page.id,
    page: page.name,
    result: data
  });
}

// ============================================================
// UI
// ============================================================

function home() {
  return html(`<!doctype html>
<html lang="tr">
<head>${baseHead("Social Publisher")}</head>
<body class="landingBody">
<div class="dropAmbient dropOne"></div><div class="dropAmbient dropTwo"></div>
<main class="landingShell">
  <section class="landingGlass glass">
    <div class="landingBrand">EROL VURAL</div>
    <div class="landingMark"><span>SP</span></div>
    <div class="landingKicker">SOCIAL PUBLISHER</div>
    <h1>Tek dokunuşla<br><span>çoklu yayın.</span></h1>
    <p>Facebook Sayfalarını tek merkezden yönet.</p>
    <a class="landingButton liquidButton" href="/login">Facebook ile Bağlan <span>→</span></a>
    <div class="landingMeta"><span>60 günlük oturum</span><span>•</span><span>Arşiv yok</span><span>•</span><span>R2/KV/D1 yok</span></div>
    <a href="/privacy" class="privacyLink">Gizlilik Politikası</a>
  </section>
</main>
</body></html>`);
}

function appPage() { return assetResponse(APP_HTML, "text/html"); }

function appScript() { return assetResponse(APP_JS, "application/javascript"); }

// ============================================================
// HTML / CSS
// ============================================================

function styleSheet() { return assetResponse(STYLE_CSS, "text/css"); }

function baseHead(title) { return `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#e9eef2">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/pwa-icon-180.png">
<link rel="stylesheet" href="/style.css?v=9">
<title>${title}</title>`; }

// ============================================================
// SECURITY / HELPERS
// ============================================================

function validateImage(file) {
  if (!file || typeof file === "string") throw new Error("Fotoğraf gerekli.");
  if (!file.type.startsWith("image/")) throw new Error("Geçerli bir görsel seçin.");
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Fotoğraf 10 MB sınırını aşmamalı.");
  }
}

function validateRupload(uploadUrl, videoId) {
  let u;
  try {
    u = new URL(uploadUrl);
  } catch {
    throw new Error("Geçersiz Meta upload URL.");
  }

  if (u.hostname !== RUPLOAD_HOST) {
    throw new Error("Geçersiz upload sunucusu.");
  }

  if (!u.pathname.includes("/video-upload/")) {
    throw new Error("Geçersiz upload yolu.");
  }

  if (videoId && !u.pathname.endsWith("/" + videoId)) {
    throw new Error("Upload oturumu ile video ID eşleşmiyor.");
  }
}

function getUserToken(request) {
  return parseCookies(request.headers.get("Cookie") || "").fb_user_token || null;
}

function parseCookies(header) {
  const out = {};
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0,i).trim();
    const v = part.slice(i+1).trim();
    try { out[k] = decodeURIComponent(v); }
    catch { out[k] = v; }
  }
  return out;
}

function cookieString(name, value, maxAge) {
  return `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

function cookie(name, value, maxAge) {
  return cookieString(name, value, maxAge);
}
function redirect(location, extraHeaders=[]) {
  const h = new Headers({ Location: location, "Cache-Control": "no-store" });
  for (const item of extraHeaders) {
    if (item.name === "Set-Cookie") h.append(item.name, item.value);
    else h.set(item.name, item.value);
  }
  return new Response(null, { status: 302, headers: h });
}

function html(body) {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

function json(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

function parseJSON(value, fallback) {
  try { return JSON.parse(String(value || "")); }
  catch { return fallback; }
}

function cleanError(e) {
  return String(e?.message || e || "Bilinmeyen hata")
    .replaceAll("META_APP_SECRET","[REDACTED]");
}

function privacy() {
  return html(`<!doctype html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gizlilik Politikası</title><style>body{font-family:Arial;max-width:800px;margin:40px auto;padding:20px;line-height:1.7;color:#222}h1,h2{color:#005082}
/* V8.1 mobile layout fix */
html,body{width:100%;min-height:100%;overflow-x:hidden!important;}
body{overflow-y:auto!important;}
.appShell{padding-bottom:150px!important;}
.pageList{max-height:none!important;overflow:visible!important;}
.bottomDock{position:fixed!important;left:50%!important;right:auto!important;bottom:max(10px,env(safe-area-inset-bottom))!important;transform:translateX(-50%)!important;width:calc(100% - 16px)!important;max-width:680px!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;z-index:999!important;}
.navItem{min-width:0!important;width:100%!important;}
@media(max-width:560px){.appShell{padding-bottom:155px!important}.pageList{max-height:none!important}.bottomDock{width:calc(100% - 16px)!important;bottom:max(8px,env(safe-area-inset-bottom))!important;border-radius:24px!important;}}
</style></head><body><h1>Gizlilik Politikası</h1><p><strong>Son güncelleme:</strong> 23 Eylül 2026</p><p>Social Publisher, kullanıcının yetkili olduğu Facebook Sayfalarında içerik yayınlamasını kolaylaştırmak amacıyla geliştirilmiştir.</p><h2>Verilerin kullanımı</h2><p>Facebook hesap ve Sayfa bilgileri yalnızca yetkili yayınlama işlemleri için kullanılır.</p><h2>Saklama</h2><p>Uygulama kendi veritabanında içerik, fotoğraf veya video arşivi oluşturmaz. R2, KV ve D1 kullanılmaz. Medya yayınlama sırasında geçici olarak işlenir ve uygulama tarafından kalıcı olarak arşivlenmez.</p><h2>Oturum</h2><p>Uygulama oturumu 60 günlük HttpOnly güvenli cookie ile yönetilir. Facebook erişim yetkisinin gerçek geçerlilik süresi Meta tarafından belirlenir.</p><h2>İletişim</h2><p>qasimm2012@gmail.com</p></body></html>`);
}
