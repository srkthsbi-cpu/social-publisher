const APP_ID = "27708155402192252";
const GRAPH_VERSION = "v26.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;
const RUPLOAD_HOST = "rupload.facebook.com";

const SESSION_TTL = 48 * 60 * 60; // 48 saat
const OAUTH_TTL = 10 * 60;

const APP_HTML = `<!doctype html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover"><meta name="theme-color" content="#e9eef2"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><link rel="stylesheet" href="/style.css?v=7"><title>Social Publisher</title></head><body class="appBody">
<div class="aurora a1"></div><div class="aurora a2"></div><div class="grain"></div>
<main class="appShell">
<header class="appTop glass">
  <div class="brandBlock"><div class="brandEyebrow">EROL VURAL</div><div class="brandTitle">Social Publisher</div><div class="brandSub">Tek dokunuşla çoklu yayın</div></div>
  <a href="/logout" class="logoutPill touch">Çıkış</a>
</header>

<section id="homeSection" class="screenSection">
  <div class="heroGlass glass">
    <div class="heroOrb"><span>SP</span></div>
    <div><div class="heroKicker">YAYIN MERKEZİ</div><h1>İçeriğini seç.<br><span>Hedeflerini belirle.</span></h1><p>Facebook Sayfaları ve bağlı Instagram hesaplarına tek akıştan yayınla.</p></div>
    <div class="heroStats"><div><b id="heroPageCount">—</b><small>Sayfa</small></div><div><b id="heroIgCount">—</b><small>Instagram</small></div><div><b id="heroSelected">0</b><small>Seçili</small></div></div>
  </div>

  <section class="glass panel" id="targetsPanel">
    <div class="sectionHead"><div><span class="sectionKicker">HEDEFLER</span><h2>Yayın nereye gitsin?</h2></div><span id="count" class="countBubble">0</span></div>
    <div class="segmented glassInner" role="tablist"><button id="fbTarget" class="segment active touch" data-platform="facebook">Facebook</button><button id="igTarget" class="segment touch" data-platform="instagram">Instagram</button></div>
    <div id="igNote" class="softNotice hidden">Instagram listesi yalnızca bağlı ve erişilebilir Professional hesapları gösterir.</div>
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
    <div id="instagramUrlBox" class="hidden"><label class="fieldLabel">Instagram medya URL'si</label><input id="instagramMediaUrl" class="glassInput" placeholder="https://..." inputmode="url"><div class="fieldHint">Meta'nın erişebileceği herkese açık bir medya URL'si.</div></div>
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
</main><script src="/app.js?v=6" defer></script></body></html>`;
const APP_JS = `
let pages=[];let currentType='post';let storyType='photo';let platform='facebook';let jobs=[];let lastPayload=null;const selectedByPlatform={facebook:new Set(),instagram:new Set()};
const CHUNK_SIZE=24*1024*1024;const CONCURRENCY=3;
const $=id=>document.getElementById(id);const qs=s=>document.querySelector(s);const qsa=s=>[...document.querySelectorAll(s)];
async function api(url,options={}){const r=await fetch(url,options);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'İşlem başarısız.');return d}
function xhrApi(url,options={},onProgress){return new Promise((resolve,reject)=>{const x=new XMLHttpRequest();x.open(options.method||'POST',url,true);if(options.headers)Object.entries(options.headers).forEach(([k,v])=>x.setRequestHeader(k,v));x.upload.onprogress=e=>{if(e.lengthComputable&&onProgress)onProgress(e.loaded,e.total)};x.onload=()=>{let d={};try{d=JSON.parse(x.responseText||'{}')}catch{}if(x.status>=200&&x.status<300)resolve(d);else reject(new Error(d.error||('HTTP '+x.status)))};x.onerror=()=>reject(new Error('Ağ bağlantısı başarısız.'));x.onabort=()=>reject(new Error('İşlem iptal edildi.'));x.send(options.body||null)})}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2600)}
function navTo(name){qsa('.navItem').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));qsa('.screenSection').forEach(s=>s.classList.add('hidden'));const map={home:'homeSection',publish:'publishSection',queue:'queueSection',accounts:'accountsSection'};const target=$(map[name]);if(target)target.classList.remove('hidden');const active=qsa('.navItem').find(b=>b.dataset.nav===name);const dock=document.querySelector('.bottomDock');if(active&&dock){const r=active.getBoundingClientRect(),d=dock.getBoundingClientRect();dock.style.setProperty('--glow-left',(r.left-d.left+((r.width-74)/2))+'px')}if(name==='queue'){}}
function bindUI(){qsa('.navItem').forEach(b=>b.addEventListener('click',()=>navTo(b.dataset.nav)));qsa('.liquidButton').forEach(b=>b.addEventListener('pointerdown',()=>{b.classList.add('pressed');setTimeout(()=>b.classList.remove('pressed'),220)}));$('fbTarget').addEventListener('click',()=>setPlatform('facebook'));$('igTarget').addEventListener('click',()=>setPlatform('instagram'));$('selectAllBtn').addEventListener('click',selectAll);$('clearAllBtn').addEventListener('click',clearAll);$('refreshPagesBtn').addEventListener('click',refreshPages);$('search').addEventListener('input',renderPages);qsa('.contentCard').forEach(b=>b.addEventListener('click',()=>setType(b.dataset.type)));qsa('.storyTab').forEach(b=>b.addEventListener('click',()=>setStoryType(b.dataset.story)));$('publishBtn').addEventListener('click',publish);$('retryBtn').addEventListener('click',retryFailed);$('clearQueueBtn').addEventListener('click',clearQueue);}
async function loadPages(){try{const d=await api('/api/pages');pages=d.pages||[];$('heroPageCount').textContent=pages.length;$('heroIgCount').textContent=pages.filter(p=>p.instagramBusinessAccount).length;renderPages();renderAccounts();if(pages.length<12)toast('Meta şu anda '+pages.length+' Facebook Sayfası döndürüyor. Eksik sayfalar için yeniden Meta bağlantısı gerekir.')}catch(e){$('pages').innerHTML='<div class="loadingState">⚠️ '+esc(e.message)+'</div>';toast(e.message)}}
async function refreshPages(){const b=$('refreshPagesBtn');if(b){b.disabled=true;b.textContent='↻ Yenileniyor…'}try{await loadPages();toast(pages.length+' Facebook Sayfası Meta’dan alındı.')}finally{if(b){b.disabled=false;b.textContent='↻ Meta’dan yenile'}}}
function visibleTargets(){const q=($('search').value||'').toLowerCase();return pages.filter(p=>p.name.toLowerCase().includes(q)&&(platform==='facebook'||!!p.instagramBusinessAccount))}
function renderPages(){const list=visibleTargets();const selected=selectedByPlatform[platform];$('pages').innerHTML=list.length?list.map(p=>{const checked=selected.has(String(p.id));return '<label class="pageRow '+(checked?'selected':'')+'"><input class="pageCheck" id="p_'+escAttr(p.id)+'" type="checkbox" value="'+escAttr(p.id)+'" '+(checked?'checked':'')+'><span class="pageName">'+esc(p.name)+'</span>'+(p.instagramBusinessAccount?'<span class="igBadge">Instagram bağlı</span>':'')+'</label>'}).join(''):'<div class="loadingState">Bu hedefte gösterilecek hesap bulunamadı.</div>';qsa('.pageCheck').forEach(x=>x.addEventListener('change',()=>{const id=String(x.value);if(x.checked)selected.add(id);else selected.delete(id);x.closest('.pageRow').classList.toggle('selected',x.checked);updateCount()}));updateCount()}
function selectedIds(){return [...selectedByPlatform[platform]]}
function updateCount(){const n=selectedIds().length;$('count').textContent=n;$('heroSelected').textContent=n;$('publishCount').textContent=n}
function selectAll(){visibleTargets().forEach(p=>selectedByPlatform[platform].add(String(p.id)));renderPages();toast('Görünen hedeflerin tamamı seçildi')}
function clearAll(){selectedByPlatform[platform].clear();renderPages()}
function setPlatform(v){platform=v;$('fbTarget').classList.toggle('active',v==='facebook');$('igTarget').classList.toggle('active',v==='instagram');$('igNote').classList.toggle('hidden',v!=='instagram');renderPages();if(v==='instagram'&&!['photo','reel'].includes(currentType)){setType('photo');toast('Instagram için Fotoğraf veya Reel seçildi')}}
function setType(type){currentType=type;qsa('.contentCard').forEach(b=>b.classList.toggle('active',b.dataset.type===type));$('reelOptions').classList.toggle('hidden',type!=='reel');$('storyOptions').classList.toggle('hidden',type!=='story');$('instagramUrlBox').classList.toggle('hidden',platform!=='instagram'||!['photo','reel'].includes(type));const info={post:'Metin veya bağlantı içeren normal Facebook gönderisi.',photo:'Fotoğraf gönderisi.',video:'Normal Facebook video gönderisi. Büyük videolar parçalara ayrılarak yüklenir.',reel:'Facebook Reel. Yükleme sonrası Meta işleme durumu takip edilir.',story:'Facebook Story.'};$('typeInfo').textContent=info[type];const m=$('mediaBox');if(type==='post')m.innerHTML='';else if(type==='photo')m.innerHTML=fileInput('photoFile','image/*','Fotoğraf seç');else if(type==='video')m.innerHTML=fileInput('videoFile','video/*','Video seç');else if(type==='reel')m.innerHTML=fileInput('reelFile','video/*','Reel videosu seç');else m.innerHTML=fileInput('storyFile',storyType==='photo'?'image/*':'video/*',storyType==='photo'?'Story görseli seç':'Story videosu seç');bindFileEvents()}
function setStoryType(type){storyType=type;qsa('.storyTab').forEach(b=>b.classList.toggle('active',b.dataset.story===type));$('storyHint').textContent=type==='photo'?'Dikey görsel seçin.':'Dikey video seçin.';if(currentType==='story')setType('story')}
function fileInput(id,accept,label){return '<div class="fileBox"><div class="fileLabel"><span>'+label+'</span><label class="fileButton touch" for="'+id+'">Dosya seç</label></div><input class="fileInput" id="'+id+'" type="file" accept="'+accept+'"><div id="'+id+'_name" class="fileName">Henüz dosya seçilmedi</div></div>'}
function bindFileEvents(){const id=currentType==='photo'?'photoFile':currentType==='video'?'videoFile':currentType==='reel'?'reelFile':currentType==='story'?'storyFile':null;const el=id&&$(id);if(!el)return;el.addEventListener('change',()=>{const f=el.files[0];if(!f)return;$(id+'_name').textContent=f.name+' • '+formatBytes(f.size);previewFile(f)})}
function previewFile(file){const box=$('preview');if(!file){box.classList.add('hidden');return}const u=URL.createObjectURL(file);box.classList.remove('hidden');box.innerHTML=file.type.startsWith('image/')?'<img src="'+u+'" alt="Önizleme">':'<video src="'+u+'" controls playsinline></video>'}
async function validateFile(file,type){if(!file)throw new Error('Medya seçin.');if(type==='photo'&&!file.type.startsWith('image/'))throw new Error('Geçerli bir görsel seçin.');if(type==='story'&&storyType==='photo'){if(!file.type.startsWith('image/'))throw new Error('Geçerli bir Story görseli seçin.');if(file.size>4*1024*1024)throw new Error('Facebook Story görseli 4 MB veya daha küçük olmalı.');return}if(['video','reel'].includes(type)|| (type==='story'&&storyType==='video')){if(!file.type.startsWith('video/'))throw new Error('Geçerli bir video seçin.');const m=await videoMeta(file);if(type==='reel'&&(m.duration<3||m.duration>90))throw new Error('Facebook Reel için video süresi 3–90 saniye olmalı.');if(type==='reel'&&(m.width/m.height<0.45||m.width/m.height>1.2))throw new Error('Reel için dikey video kullanın.');if(type==='story'&&storyType==='video'){if(m.duration<3||m.duration>60)throw new Error('Facebook Video Story için video 3–60 saniye olmalı.');if(m.width/m.height<0.45||m.width/m.height>0.75)throw new Error('Video Story için 9:16 civarında dikey video kullanın.');}}}
function videoMeta(file){return new Promise((resolve,reject)=>{const v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>{URL.revokeObjectURL(v.src);resolve({duration:v.duration,width:v.videoWidth,height:v.videoHeight})};v.onerror=()=>reject(new Error('Video bilgisi okunamadı.'));v.src=URL.createObjectURL(file)})}
async function publish(){const ids=selectedIds();if(!ids.length){toast('Önce en az bir hedef seç');return}const message=$('message').value.trim();let file=null;try{if(platform==='instagram'){if(!['photo','reel'].includes(currentType))throw new Error('Instagram için Fotoğraf veya Reel seçin.');if(!$('instagramMediaUrl').value.trim())throw new Error('Instagram medya URL’si gerekli.')}else{const id=currentType==='photo'?'photoFile':currentType==='video'?'videoFile':currentType==='reel'?'reelFile':currentType==='story'?'storyFile':null;file=id?$(id)?.files[0]:null;if(['photo','video','reel','story'].includes(currentType))await validateFile(file,currentType)};setBusy(true);prepareJobs(ids,file);lastPayload={ids,message,file,type:currentType,storyType,platform,mediaUrl:$('instagramMediaUrl')?.value.trim()||''};navTo('queue');if(platform==='instagram')await publishInstagram(ids,message);else await publishFacebook(ids,message,file)}catch(e){if(jobs.length)addSystemError(e.message);else toast(e.message)}finally{setBusy(false);if(jobs.length)finalizeQueue()}}
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
async function publishInstagram(ids,message){const u=$('instagramMediaUrl').value.trim();return runPool(ids,id=>publishInstagramOne(id,message,u))}async function publishInstagramOne(id,message,u){const d=await api('/api/instagram/publish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,type:currentType==='reel'?'reel':'photo',mediaUrl:u,caption:message,shareToFeed:true})});if(!d.success)throw new Error(d.error||'Instagram yayınlanamadı.');setJob(id,{percent:100})}
async function retryFailed(){if(!lastPayload)return;const failed=jobs.filter(j=>j.status==='error').map(j=>j.id);if(!failed.length)return;failed.forEach(id=>{const j=jobs.find(x=>x.id===id);Object.assign(j,{status:'waiting',percent:0,error:null,duration:null})});renderJobs();if(lastPayload.platform==='instagram')await runPool(failed,id=>publishInstagramOne(id,lastPayload.message,lastPayload.mediaUrl));else await publishFacebook(failed,lastPayload.message,lastPayload.file);finalizeQueue()}
function finalizeQueue(){renderJobs();updateSummary();const f=jobs.filter(j=>j.status==='error').length;toast(f?'Bazı hedefler başarısız oldu':'Tüm yayınlar tamamlandı')}
function clearQueue(){jobs=[];$('jobs').innerHTML='';$('queueSection').classList.add('hidden');$('queueSummary').textContent='Hazır'}
function addSystemError(msg){jobs=[{id:'system',name:'Sistem',percent:0,status:'error',error:msg,duration:0,file:'',type:''}];$('queueSection').classList.remove('hidden');renderJobs()}
function setBusy(b){const x=$('publishBtn');x.disabled=b;x.style.opacity=b?0.72:1;x.querySelector('span:nth-child(2)').textContent=b?'Yayınlanıyor…':'Seçilenlerde yayınla'}
function renderAccounts(){$('accountSummary').innerHTML=pages.map(p=>'<div class="accountCard"><b>'+esc(p.name)+'</b><small>'+(p.instagramBusinessAccount?'Instagram bağlı':'Yalnızca Facebook')+'</small></div>').join('')||'<div class="fieldHint">Hesap bulunamadı.</div>'}
function pageName(id){return pages.find(p=>String(p.id)===String(id))?.name||id}function formatBytes(n){if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';if(n<1073741824)return(n/1048576).toFixed(1)+' MB';return(n/1073741824).toFixed(2)+' GB'}function formatTime(ms){return(ms/1000).toFixed(1)+' sn'}function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}function escAttr(v){return esc(v)}
window.addEventListener('DOMContentLoaded',()=>{try{bindUI();setType('post');setPlatform('facebook');navTo('home');loadPages()}catch(e){console.error(e);toast('Arayüz başlatılamadı: '+e.message)}});
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
.bottomDock{position:sticky!important;bottom:10px!important}
.screenSection{scroll-margin-top:20px}
`;

function assetResponse(body, type) {
  return new Response(body, { headers: { "content-type": type+"; charset=UTF-8", "cache-control": "no-store" } });
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

      if (url.pathname === "/api/instagram/publish" && request.method === "POST") {
        return await apiInstagramPublish(request);
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
    "instagram_basic",
    "instagram_content_publish"
  ].join(",");

  const oauth =
    `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth` +
    `?client_id=${encodeURIComponent(APP_ID)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}` +
    `&response_type=code` +
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

  return redirect("/app", [
    cookie("fb_user_token", data.access_token, SESSION_TTL),
    cookie("oauth_state", "", 0)
  ]);
}

// ============================================================
// PAGE LIST
// ============================================================

async function apiPages(request) {
  const userToken = getUserToken(request);
  if (!userToken) return json({ error: "Oturum süresi dolmuş." }, 401);

  const pages = await getPages(userToken);

  return json({
    success: true,
    sessionHours: 48,
    metaGraphVersion: GRAPH_VERSION,
    pageCount: pages.length,
    pages: pages.map(p => ({
      id: p.id,
      name: p.name,
      tasks: p.tasks || [],
      instagramBusinessAccount: p.instagram_business_account || null
    }))
  });
}

async function getPages(userToken) {
  const fields = "id,name,access_token,tasks,instagram_business_account";
  const basicFields = "id,name,access_token,tasks";

  async function fetchAll(fieldSet) {
    let next = `${GRAPH}/me/accounts?fields=${encodeURIComponent(fieldSet)}&limit=100&access_token=${encodeURIComponent(userToken)}`;
    const all = [];
    let first = true;
    while (next) {
      const r = await fetch(next, { cache: "no-store" });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || data.error) {
        if (first && fieldSet === fields) throw new Error(data?.error?.message || "Facebook Sayfaları alınamadı.");
        throw new Error(data?.error?.message || "Facebook Sayfaları alınamadı.");
      }
      all.push(...(data.data || []));
      next = data?.paging?.next || null;
      first = false;
    }
    return all;
  }

  try {
    return await fetchAll(fields);
  } catch (e) {
    // Instagram alanı yetki nedeniyle hata verirse Facebook Sayfalarını
    // yine de yükle; Instagram bağlantısı ayrı ve isteğe bağlıdır.
    const basic = await fetchAll(basicFields);
    return basic.map(p => ({ ...p, instagram_business_account: null }));
  }
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

// ============================================================
// INSTAGRAM (optional; public media URL mode)
// ============================================================

async function apiInstagramPublish(request) {
  const body = await request.json();
  const pageId = String(body.pageId || "");
  const type = String(body.type || "");
  const mediaUrl = String(body.mediaUrl || "").trim();
  const caption = String(body.caption || "");
  const shareToFeed = body.shareToFeed !== false;

  if (!pageId || !["photo", "reel"].includes(type) || !mediaUrl) {
    return json({ error: "Instagram için Sayfa, tür ve herkese açık medya URL'si gerekli." }, 400);
  }

  let parsed;
  try { parsed = new URL(mediaUrl); } catch { throw new Error("Geçersiz medya URL'si."); }
  if (!/^https?:$/.test(parsed.protocol)) throw new Error("Medya URL'si http/https olmalı.");

  const { page, token } = await getPageToken(request, pageId);
  const ig = page.instagram_business_account;
  if (!ig?.id) throw new Error("Bu Facebook Sayfasına bağlı Instagram Professional hesabı bulunamadı.");

  const igUserId = ig.id;

  if (type === "photo") {
    const create = new URLSearchParams();
    create.set("image_url", mediaUrl);
    create.set("caption", caption);
    create.set("access_token", token);

    const r = await fetch(`${GRAPH}/${igUserId}/media`, { method: "POST", body: create });
    const data = await r.json();
    if (!r.ok || data.error || !data.id) throw new Error(data?.error?.message || "Instagram fotoğraf kapsayıcısı oluşturulamadı.");

    const publish = new URLSearchParams();
    publish.set("creation_id", data.id);
    publish.set("access_token", token);
    const pr = await fetch(`${GRAPH}/${igUserId}/media_publish`, { method: "POST", body: publish });
    const pd = await pr.json();
    if (!pr.ok || pd.error) throw new Error(pd?.error?.message || "Instagram fotoğrafı yayınlanamadı.");

    return json({ success: true, pageId, page: page.name, platform: "instagram", mediaId: pd.id });
  }

  const create = new URLSearchParams();
  create.set("media_type", "REELS");
  create.set("video_url", mediaUrl);
  create.set("caption", caption);
  create.set("share_to_feed", shareToFeed ? "true" : "false");
  create.set("access_token", token);

  const r = await fetch(`${GRAPH}/${igUserId}/media`, { method: "POST", body: create });
  const data = await r.json();
  if (!r.ok || data.error || !data.id) throw new Error(data?.error?.message || "Instagram Reel kapsayıcısı oluşturulamadı.");

  const containerId = data.id;
  const deadline = Date.now() + 10 * 60 * 1000;
  let status = null;
  while (Date.now() < deadline) {
    const sr = await fetch(`${GRAPH}/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(token)}`);
    const sd = await sr.json();
    if (!sr.ok || sd.error) throw new Error(sd?.error?.message || "Instagram Reel durumu alınamadı.");
    status = sd;
    if (sd.status_code === "FINISHED") break;
    if (["ERROR", "EXPIRED"].includes(sd.status_code)) throw new Error(sd.status || `Instagram Reel durumu: ${sd.status_code}`);
    await sleep(2500);
  }

  if (!status || status.status_code !== "FINISHED") throw new Error("Instagram Reel işlenmesi zaman aşımına uğradı.");

  const publish = new URLSearchParams();
  publish.set("creation_id", containerId);
  publish.set("access_token", token);
  const pr = await fetch(`${GRAPH}/${igUserId}/media_publish`, { method: "POST", body: publish });
  const pd = await pr.json();
  if (!pr.ok || pd.error) throw new Error(pd?.error?.message || "Instagram Reel yayınlanamadı.");

  return json({ success: true, pageId, page: page.name, platform: "instagram", mediaId: pd.id });
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
    <p>Facebook Sayfalarını ve bağlı Instagram hesaplarını tek merkezden yönet.</p>
    <a class="landingButton liquidButton" href="/login">Facebook ile Bağlan <span>→</span></a>
    <div class="landingMeta"><span>48 saatlik oturum</span><span>•</span><span>Arşiv yok</span><span>•</span><span>R2/KV/D1 yok</span></div>
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
<link rel="stylesheet" href="/style.css?v=6">
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
  return html(`<!doctype html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gizlilik Politikası</title><style>body{font-family:Arial;max-width:800px;margin:40px auto;padding:20px;line-height:1.7;color:#222}h1,h2{color:#005082}</style></head><body><h1>Gizlilik Politikası</h1><p><strong>Son güncelleme:</strong> 23 Eylül 2026</p><p>Social Publisher, kullanıcının yetkili olduğu Facebook Sayfalarında içerik yayınlamasını kolaylaştırmak amacıyla geliştirilmiştir.</p><h2>Verilerin kullanımı</h2><p>Facebook hesap ve Sayfa bilgileri yalnızca yetkili yayınlama işlemleri için kullanılır.</p><h2>Saklama</h2><p>Uygulama kendi veritabanında içerik, fotoğraf veya video arşivi oluşturmaz. R2, KV ve D1 kullanılmaz. Medya yayınlama sırasında geçici olarak işlenir ve uygulama tarafından kalıcı olarak arşivlenmez.</p><h2>Oturum</h2><p>Uygulama oturumu 48 saatlik HttpOnly güvenli cookie ile yönetilir. Facebook erişim yetkisinin gerçek geçerlilik süresi Meta tarafından belirlenir.</p><h2>İletişim</h2><p>qasimm2012@gmail.com</p></body></html>`);
}
