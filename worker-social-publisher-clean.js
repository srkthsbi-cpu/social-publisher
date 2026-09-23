const APP_ID = "27708155402192252";
const GRAPH = "https://graph.facebook.com";
const GRAPH_VERSION = "v23.0";
const SESSION_SECONDS = 172800;
const OAUTH_SECONDS = 600;
const CHUNK_SIZE = 8 * 1024 * 1024;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/") return home();
      if (url.pathname === "/privacy") return privacy();
      if (url.pathname === "/login") return login(url);
      if (url.pathname === "/callback") return callback(request, url, env);
      if (url.pathname === "/app") return app(request);
      if (url.pathname === "/logout") return logout();

      if (url.pathname === "/api/pages") return pagesAPI(request);
      if (url.pathname === "/api/publish") return publishAPI(request);

      if (url.pathname === "/api/video/start") return videoStart(request);
      if (url.pathname === "/api/video/upload") return videoUpload(request);
      if (url.pathname === "/api/video/finish") return videoFinish(request);

      if (url.pathname === "/api/reel/start") return reelStart(request);
      if (url.pathname === "/api/reel/upload") return reelUpload(request);
      if (url.pathname === "/api/reel/finish") return reelFinish(request);

      if (url.pathname === "/api/story/photo") return storyPhoto(request);
      if (url.pathname === "/api/story/video/start") return storyVideoStart(request);
      if (url.pathname === "/api/story/video/upload") return storyVideoUpload(request);
      if (url.pathname === "/api/story/video/finish") return storyVideoFinish(request);

      // PWA static assets
      if (env.ASSETS && (url.pathname === "/manifest.json" || url.pathname === "/sw.js" || url.pathname === "/icon-192.png" || url.pathname === "/icon-512.png" || url.pathname === "/apple-touch-icon.png")) {
        return env.ASSETS.fetch(request);
      }

      return text("Not Found", 404);
    } catch (error) {
      return json({ success: false, error: cleanError(error) }, 500);
    }
  }
};

/* ---------------- AUTH ---------------- */

function login(url) {
  const state = crypto.randomUUID();
  const redirectUri = url.origin + "/callback";

  const params = new URLSearchParams({
    client_id: APP_ID,
    redirect_uri: redirectUri,
    state: state,
    response_type: "code",
    scope: "public_profile,pages_show_list,pages_read_engagement,pages_manage_posts"
  });

  const location =
    "https://www.facebook.com/" +
    GRAPH_VERSION +
    "/dialog/oauth?" +
    params.toString();

  return redirect(location, [
    cookie("oauth_state", state, OAUTH_SECONDS)
  ]);
}

async function callback(request, url, env) {
  const cookies = readCookies(request.headers.get("Cookie") || "");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state || state !== cookies.oauth_state) {
    return text("OAuth doğrulaması başarısız.", 400);
  }

  if (!env.META_APP_SECRET) {
    return text("META_APP_SECRET Cloudflare Secret eksik.", 500);
  }

  const params = new URLSearchParams({
    client_id: APP_ID,
    client_secret: env.META_APP_SECRET,
    redirect_uri: url.origin + "/callback",
    code: code
  });

  const response = await fetch(
    GRAPH + "/oauth/access_token?" + params.toString()
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    return json({
      success: false,
      error: data?.error?.message || "Facebook erişim anahtarı alınamadı."
    }, 400);
  }

  return redirect("/app", [
    cookie("fb_user_token", data.access_token, SESSION_SECONDS),
    cookie("oauth_state", "", 0)
  ]);
}

function logout() {
  return redirect("/", [
    cookie("fb_user_token", "", 0),
    cookie("oauth_state", "", 0)
  ]);
}

/* ---------------- FACEBOOK PAGES ---------------- */

function getUserToken(request) {
  const cookies = readCookies(request.headers.get("Cookie") || "");
  return cookies.fb_user_token || null;
}

async function getPages(request) {
  const token = getUserToken(request);

  if (!token) {
    throw new Error("Oturum süresi dolmuş. Facebook ile tekrar bağlanın.");
  }

  const params = new URLSearchParams({
    fields: "id,name,access_token,tasks",
    access_token: token
  });

  const response = await fetch(
    GRAPH + "/me/accounts?" + params.toString()
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Facebook Sayfaları alınamadı."
    );
  }

  return data.data || [];
}

async function getPage(request, pageId) {
  const pages = await getPages(request);
  const page = pages.find(function (item) {
    return String(item.id) === String(pageId);
  });

  if (!page || !page.access_token) {
    throw new Error("Sayfa bulunamadı veya yayınlama yetkisi yok.");
  }

  return page;
}

async function pagesAPI(request) {
  const pages = await getPages(request);

  return json({
    success: true,
    sessionHours: 48,
    pages: pages.map(function (page) {
      return {
        id: page.id,
        name: page.name
      };
    })
  });
}

/* ---------------- NORMAL POSTS / PHOTOS ---------------- */

async function publishAPI(request) {
  const form = await request.formData();
  const ids = parseJSON(form.get("pages"), []);
  const type = String(form.get("type") || "post");
  const message = String(form.get("message") || "").trim();
  const media = form.get("media");

  if (!ids.length) {
    return json({ success: false, error: "En az bir Sayfa seçin." }, 400);
  }

  const results = [];

  for (const pageId of ids) {
    try {
      const page = await getPage(request, pageId);
      let result;

      if (type === "photo" && media && typeof media !== "string") {
        result = await publishPhoto(page, message, media);
      } else {
        if (!message) throw new Error("Gönderi metni boş.");
        result = await publishText(page, message);
      }

      results.push({
        pageId: page.id,
        page: page.name,
        success: true,
        result: result
      });
    } catch (error) {
      results.push({
        pageId: pageId,
        page: String(pageId),
        success: false,
        error: cleanError(error)
      });
    }
  }

  return json({ success: true, results: results });
}

async function publishText(page, message) {
  const body = new URLSearchParams({
    message: message,
    access_token: page.access_token
  });

  const response = await fetch(
    GRAPH + "/" + page.id + "/feed",
    { method: "POST", body: body }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Gönderi yayınlanamadı."
    );
  }

  return data;
}

async function publishPhoto(page, message, file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Geçerli bir fotoğraf seçin.");
  }

  const body = new FormData();
  body.append("source", file, file.name || "photo.jpg");
  if (message) body.append("caption", message);
  body.append("access_token", page.access_token);

  const response = await fetch(
    GRAPH + "/" + page.id + "/photos",
    { method: "POST", body: body }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Fotoğraf yayınlanamadı."
    );
  }

  return data;
}

/* ---------------- VIDEO ---------------- */

async function videoStart(request) {
  const body = await request.json();
  const page = await getPage(request, body.pageId);
  const fileSize = Number(body.fileSize || 0);

  if (!fileSize) throw new Error("Video boyutu alınamadı.");

  const params = new URLSearchParams({
    upload_phase: "start",
    file_size: String(fileSize),
    access_token: page.access_token
  });

  const response = await fetch(
    GRAPH + "/" + page.id + "/videos",
    { method: "POST", body: params }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Video yükleme başlatılamadı."
    );
  }

  return json({
    success: true,
    page: page.name,
    session: data.upload_session_id,
    start: Number(data.start_offset || 0),
    end: Number(data.end_offset || 0)
  });
}

async function videoUpload(request) {
  const form = await request.formData();
  const page = await getPage(request, form.get("pageId"));
  const session = String(form.get("session") || "");
  const offset = String(form.get("offset") || "0");
  const chunk = form.get("chunk");

  if (!session || !chunk || typeof chunk === "string") {
    throw new Error("Video parçası eksik.");
  }

  const body = new FormData();
  body.append("upload_phase", "transfer");
  body.append("upload_session_id", session);
  body.append("start_offset", offset);
  body.append("video_file_chunk", chunk, "video.chunk");
  body.append("access_token", page.access_token);

  const response = await fetch(
    GRAPH + "/" + page.id + "/videos",
    { method: "POST", body: body }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Video parçası yüklenemedi."
    );
  }

  return json({
    success: true,
    start: Number(data.start_offset || 0),
    end: Number(data.end_offset || 0)
  });
}

async function videoFinish(request) {
  const body = await request.json();
  const page = await getPage(request, body.pageId);

  const params = new URLSearchParams({
    upload_phase: "finish",
    upload_session_id: String(body.session || ""),
    access_token: page.access_token
  });

  if (body.description) {
    params.set("description", String(body.description));
  }

  const response = await fetch(
    GRAPH + "/" + page.id + "/videos",
    { method: "POST", body: params }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Video yayınlanamadı."
    );
  }

  return json({
    success: true,
    page: page.name,
    result: data
  });
}

/* ---------------- REELS ---------------- */

async function reelStart(request) {
  const body = await request.json();
  const page = await getPage(request, body.pageId);

  const params = new URLSearchParams({
    upload_phase: "start",
    access_token: page.access_token
  });

  const response = await fetch(
    GRAPH + "/" + page.id + "/video_reels",
    { method: "POST", body: params }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Reels yükleme başlatılamadı."
    );
  }

  return json({
    success: true,
    page: page.name,
    videoId: data.video_id,
    uploadUrl: data.upload_url
  });
}

async function reelUpload(request) {
  const form = await request.formData();
  const page = await getPage(request, form.get("pageId"));
  const uploadUrl = String(form.get("uploadUrl") || "");
  const offset = String(form.get("offset") || "0");
  const chunk = form.get("chunk");

  if (!uploadUrl || !chunk || typeof chunk === "string") {
    throw new Error("Reels parçası eksik.");
  }

  const host = new URL(uploadUrl).hostname;

  if (host !== "rupload.facebook.com") {
    throw new Error("Geçersiz Meta upload adresi.");
  }

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: "OAuth " + page.access_token,
      offset: offset,
      "Content-Type": "application/octet-stream"
    },
    body: chunk
  });

  const raw = await response.text();
  let data;

  try {
    data = JSON.parse(raw);
  } catch (error) {
    data = { raw: raw };
  }

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Reels videosu yüklenemedi."
    );
  }

  return json({ success: true, result: data });
}

async function reelFinish(request) {
  const body = await request.json();
  const page = await getPage(request, body.pageId);

  const params = new URLSearchParams({
    upload_phase: "finish",
    video_id: String(body.videoId || ""),
    video_state: "PUBLISHED",
    access_token: page.access_token
  });

  if (body.description) {
    params.set("description", String(body.description));
  }

  const response = await fetch(
    GRAPH + "/" + page.id + "/video_reels",
    { method: "POST", body: params }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Reels yayınlanamadı."
    );
  }

  return json({
    success: true,
    page: page.name,
    result: data
  });
}

/* ---------------- STORIES ---------------- */

async function storyPhoto(request) {
  const form = await request.formData();
  const page = await getPage(request, form.get("pageId"));
  const file = form.get("media");

  if (!file || typeof file === "string") {
    throw new Error("Story fotoğrafı seçilmedi.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Story için fotoğraf seçin.");
  }

  const upload = new FormData();
  upload.append("source", file, file.name || "story.jpg");
  upload.append("published", "false");
  upload.append("access_token", page.access_token);

  const photoResponse = await fetch(
    GRAPH + "/" + page.id + "/photos",
    { method: "POST", body: upload }
  );

  const photoData = await photoResponse.json();

  if (!photoResponse.ok || photoData.error || !photoData.id) {
    throw new Error(
      photoData?.error?.message || "Story fotoğrafı yüklenemedi."
    );
  }

  const params = new URLSearchParams({
    photo_id: photoData.id,
    access_token: page.access_token
  });

  const storyResponse = await fetch(
    GRAPH + "/" + page.id + "/photo_stories",
    { method: "POST", body: params }
  );

  const storyData = await storyResponse.json();

  if (!storyResponse.ok || storyData.error) {
    throw new Error(
      storyData?.error?.message || "Fotoğraf Story yayınlanamadı."
    );
  }

  return json({
    success: true,
    page: page.name,
    result: storyData
  });
}

async function storyVideoStart(request) {
  const body = await request.json();
  const page = await getPage(request, body.pageId);

  const params = new URLSearchParams({
    upload_phase: "start",
    access_token: page.access_token
  });

  const response = await fetch(
    GRAPH + "/" + page.id + "/video_stories",
    { method: "POST", body: params }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Video Story upload başlatılamadı."
    );
  }

  return json({
    success: true,
    page: page.name,
    videoId: data.video_id,
    uploadUrl: data.upload_url
  });
}

async function storyVideoUpload(request) {
  const form = await request.formData();
  const page = await getPage(request, form.get("pageId"));
  const uploadUrl = String(form.get("uploadUrl") || "");
  const offset = String(form.get("offset") || "0");
  const chunk = form.get("chunk");

  if (!uploadUrl || !chunk || typeof chunk === "string") {
    throw new Error("Story video parçası eksik.");
  }

  const host = new URL(uploadUrl).hostname;

  if (host !== "rupload.facebook.com") {
    throw new Error("Geçersiz Meta upload adresi.");
  }

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: "OAuth " + page.access_token,
      offset: offset,
      "Content-Type": "application/octet-stream"
    },
    body: chunk
  });

  const raw = await response.text();
  let data;

  try {
    data = JSON.parse(raw);
  } catch (error) {
    data = { raw: raw };
  }

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Story videosu yüklenemedi."
    );
  }

  return json({ success: true, result: data });
}

async function storyVideoFinish(request) {
  const body = await request.json();
  const page = await getPage(request, body.pageId);

  const params = new URLSearchParams({
    upload_phase: "finish",
    video_id: String(body.videoId || ""),
    access_token: page.access_token
  });

  const response = await fetch(
    GRAPH + "/" + page.id + "/video_stories",
    { method: "POST", body: params }
  );

  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data?.error?.message || "Video Story yayınlanamadı."
    );
  }

  return json({
    success: true,
    page: page.name,
    result: data
  });
}

/* ---------------- UI ---------------- */

function app(request) {
  if (!getUserToken(request)) {
    return redirect("/");
  }

  const page = [
    "<!doctype html><html lang='tr'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover'>",
    "<meta name='mobile-web-app-capable' content='yes'>",
    "<meta name='apple-mobile-web-app-capable' content='yes'>",
    "<meta name='apple-mobile-web-app-status-bar-style' content='default'>",
    "<meta name='apple-mobile-web-app-title' content='Social Publisher'>",
    "<link rel='manifest' href='/manifest.json'>",
    "<link rel='apple-touch-icon' href='/apple-touch-icon.png'>",
    "<meta name='theme-color' content='#005082'>",
    "<title>Social Publisher</title>",
    "<style>",
    "*{box-sizing:border-box}",
    "body{margin:0;background:#f3f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#222}",
    ".wrap{max-width:760px;margin:auto;padding:14px}",
    ".head{display:flex;justify-content:space-between;align-items:center;padding:10px 4px 18px}",
    ".logo{font-size:11px;font-weight:800;letter-spacing:2px;color:#009bb4}",
    "h1{margin:2px 0;color:#005082;font-size:26px}",
    "h2{font-size:19px;margin:0 0 14px}",
    ".card{background:#fff;border-radius:22px;padding:18px;margin-bottom:14px;box-shadow:0 7px 25px rgba(0,0,0,.07)}",
    ".grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    ".btn,.type{border:0;border-radius:13px;padding:13px;font-weight:800;font-size:14px}",
    ".btn{background:#005082;color:white}",
    ".light,.type{background:#edf3f5;color:#18333e}",
    ".type.active{background:#005082;color:white}",
    ".search,textarea{width:100%;border:1px solid #d8e0e4;border-radius:13px;padding:13px;font-size:16px}",
    ".search{grid-column:1/-1}",
    "textarea{min-height:130px;margin-top:10px;resize:vertical}",
    ".page{display:flex;align-items:center;gap:10px;padding:12px 2px;border-bottom:1px solid #edf0f2;font-weight:650}",
    ".page input{width:22px;height:22px}",
    ".count{background:#edf3f5;border-radius:30px;padding:6px 10px;font-size:12px}",
    ".file{border:2px dashed #b8cad1;border-radius:15px;padding:15px;margin-top:12px}",
    ".file input{width:100%;margin-top:8px}",
    ".big{width:100%;margin-top:14px;font-size:16px;padding:16px}",
    ".barbox{height:10px;background:#e5ebee;border-radius:20px;overflow:hidden;margin-top:14px}",
    ".bar{height:100%;width:0;background:#009bb4;transition:.2s}",
    ".result{padding:11px;border-radius:11px;margin-top:7px;font-size:14px;line-height:1.5}",
    ".ok{background:#e7f7eb}.bad{background:#ffe8e8;color:#8a1111}",
    ".hidden{display:none!important}",
    ".hint{background:#f3f7f8;border-radius:11px;padding:10px;font-size:13px;color:#58666d;margin-top:10px}",
    ".logout{color:#a00;text-decoration:none;font-size:13px}",
    ".story{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}",
    "</style></head><body>",
    "<main class='wrap'>",
    "<div class='head'><div><div class='logo'>EROL VURAL</div><h1>Social Publisher</h1></div><a class='logout' href='/logout'>Çıkış</a></div>",
    "<section class='card'>",
    "<div style='display:flex;justify-content:space-between;align-items:center'><h2>Facebook Sayfaları</h2><span id='count' class='count'>0 seçili</span></div>",
    "<div class='grid'>",
    "<button class='btn light' onclick='allPages()'>TÜMÜNÜ SEÇ</button>",
    "<button class='btn light' onclick='nonePages()'>TEMİZLE</button>",
    "<input id='search' class='search' placeholder='Sayfa ara...' oninput='renderPages()'>",
    "</div>",
    "<div id='pages'>Yükleniyor...</div>",
    "</section>",
    "<section class='card'>",
    "<h2>İçerik Türü</h2>",
    "<div class='grid'>",
    "<button class='type active' data-type='post' onclick=\"setType('post')\">📝 Gönderi</button>",
    "<button class='type' data-type='photo' onclick=\"setType('photo')\">📷 Fotoğraf</button>",
    "<button class='type' data-type='video' onclick=\"setType('video')\">🎬 Video</button>",
    "<button class='type' data-type='reel' onclick=\"setType('reel')\">🎞️ REELS</button>",
    "<button class='type' data-type='story' onclick=\"setType('story')\">📱 STORY</button>",
    "</div>",
    "<div id='hint' class='hint'>Normal Facebook gönderisi.</div>",
    "<textarea id='message' placeholder='Gönderinizin açıklamasını yazın...'></textarea>",
    "<div id='storyType' class='story hidden'>",
    "<button id='storyPhoto' class='type active' onclick=\"setStory('photo')\">📷 Fotoğraf Story</button>",
    "<button id='storyVideo' class='type' onclick=\"setStory('video')\">🎬 Video Story</button>",
    "</div>",
    "<div id='media'></div>",
    "<button id='publish' class='btn big' onclick='publish()'>🚀 SEÇİLEN SAYFALARDA YAYINLA</button>",
    "<div id='progress' class='hidden'><div class='barbox'><div id='bar' class='bar'></div></div><div id='progressText' class='hint'>Hazırlanıyor...</div></div>",
    "<div id='results'></div>",
    "</section>",
    "<div style='text-align:center;color:#68757b;font-size:12px;line-height:1.6;padding:4px 20px 25px'>",
    "48 saatlik uygulama oturumu. Meta erişim yetkisinin gerçek süresi Meta tarafından belirlenir.<br>Uygulama R2, KV veya D1 kullanmaz.",
    "</div>",
    "</main>",
    "<script>",
    "var pages=[];var type='post';var story='photo';var chunkSize=" + CHUNK_SIZE + ";",
    "function api(u,o){return fetch(u,o).then(function(r){return r.json().catch(function(){return{}}).then(function(d){if(!r.ok)throw new Error(d.error||'İşlem başarısız.');return d;});});}",
    "function esc(v){return String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');}",
    "function selected(){return Array.from(document.querySelectorAll('.pc:checked')).map(function(x){return x.value;});}",
    "function count(){document.getElementById('count').textContent=selected().length+' seçili';}",
    "function renderPages(){var q=document.getElementById('search').value.toLowerCase();var old=selected();var html='';pages.filter(function(p){return p.name.toLowerCase().indexOf(q)>=0;}).forEach(function(p){html+='<label class=\"page\"><input class=\"pc\" type=\"checkbox\" value=\"'+esc(p.id)+'\" '+(old.indexOf(String(p.id))>=0?'checked':'')+' onchange=\"count()\"><span>'+esc(p.name)+'</span></label>';});document.getElementById('pages').innerHTML=html||'<div class=\"hint\">Sayfa bulunamadı.</div>';count();}",
    "function allPages(){document.querySelectorAll('.pc').forEach(function(x){x.checked=true;});count();}",
    "function nonePages(){document.querySelectorAll('.pc').forEach(function(x){x.checked=false;});count();}",
    "function setType(t){type=t;document.querySelectorAll('.type').forEach(function(x){if(x.dataset.type)x.classList.toggle('active',x.dataset.type===t);});document.getElementById('storyType').classList.toggle('hidden',t!=='story');var m=document.getElementById('media');if(t==='post'){m.innerHTML='';document.getElementById('hint').textContent='Normal Facebook gönderisi.';}if(t==='photo'){m.innerHTML=fileBox('photo','image/*','📷 Fotoğraf seç');document.getElementById('hint').textContent='Facebook fotoğraf gönderisi.';}if(t==='video'){m.innerHTML=fileBox('video','video/*','🎬 Video seç');document.getElementById('hint').textContent='Video parçalı yükleme ile gönderilir.';}if(t==='reel'){m.innerHTML=fileBox('reel','video/*','🎞️ Reels videosu seç');document.getElementById('hint').textContent='Reels parçalı yükleme akışı.';}if(t==='story')setStory(story);}",
    "function setStory(t){story=t;document.getElementById('storyPhoto').classList.toggle('active',t==='photo');document.getElementById('storyVideo').classList.toggle('active',t==='video');document.getElementById('media').innerHTML=fileBox('story',t==='photo'?'image/*':'video/*',t==='photo'?'📷 Story fotoğrafı seç':'🎬 Story videosu seç');}",
    "function fileBox(id,accept,label){return '<div class=\"file\"><strong>'+label+'</strong><input id=\"'+id+'File\" type=\"file\" accept=\"'+accept+'\"></div>';}",
    "function progress(p,t,s){document.getElementById('progress').classList.remove('hidden');document.getElementById('bar').style.width=Math.round(p/t*100)+'%';document.getElementById('progressText').textContent=s;}",
    "function addResult(name,ok,msg){document.getElementById('results').insertAdjacentHTML('beforeend','<div class=\"result '+(ok?'ok':'bad')+'\">'+(ok?'✅':'❌')+' <strong>'+esc(name)+'</strong><br>'+esc(msg)+'</div>');}",
    "function pageName(id){var p=pages.find(function(x){return String(x.id)===String(id);});return p?p.name:id;}",
    "async function publish(){var ids=selected();if(!ids.length){alert('En az bir Sayfa seçin.');return;}document.getElementById('publish').disabled=true;document.getElementById('results').innerHTML='';try{if(type==='post'||type==='photo')await normal(ids);else if(type==='video')await videos(ids);else if(type==='reel')await reels(ids);else await stories(ids);}catch(e){addResult('Sistem',false,e.message);}document.getElementById('publish').disabled=false;}",
    "async function normal(ids){var f=new FormData();f.append('pages',JSON.stringify(ids));f.append('type',type);f.append('message',document.getElementById('message').value);var file=document.getElementById(type+'File');if(file&&file.files[0])f.append('media',file.files[0],file.files[0].name);var d=await api('/api/publish',{method:'POST',body:f});d.results.forEach(function(x){addResult(x.page,x.success,x.success?'Yayınlandı.':x.error);});}",
    "async function videos(ids){var file=document.getElementById('videoFile').files[0];if(!file)throw new Error('Video seçin.');for(var i=0;i<ids.length;i++){var id=ids[i];try{var s=await api('/api/video/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,fileSize:file.size})});var off=s.start;var end=s.end||Math.min(off+chunkSize,file.size);while(off<file.size){var part=file.slice(off,end);var f=new FormData();f.append('pageId',id);f.append('session',s.session);f.append('offset',String(off));f.append('chunk',part,'chunk');var r=await api('/api/video/upload',{method:'POST',body:f});off=r.start;end=r.end||Math.min(off+chunkSize,file.size);progress(off/file.size,1,'Video '+pageName(id)+' %'+Math.round(off/file.size*100));}await api('/api/video/finish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,session:s.session,description:document.getElementById('message').value})});addResult(s.page,true,'Video yayınlandı.');}catch(e){addResult(pageName(id),false,e.message);}progress(i+1,ids.length,'Tamamlandı');}}",
    "async function reels(ids){var file=document.getElementById('reelFile').files[0];if(!file)throw new Error('Reels videosu seçin.');for(var i=0;i<ids.length;i++){var id=ids[i];try{var s=await api('/api/reel/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id})});var off=0;while(off<file.size){var end=Math.min(off+chunkSize,file.size);var f=new FormData();f.append('pageId',id);f.append('videoId',s.videoId);f.append('uploadUrl',s.uploadUrl);f.append('offset',String(off));f.append('chunk',file.slice(off,end),'chunk');await api('/api/reel/upload',{method:'POST',body:f});off=end;progress(off/file.size,1,'Reels '+pageName(id)+' %'+Math.round(off/file.size*100));}await api('/api/reel/finish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,videoId:s.videoId,description:document.getElementById('message').value})});addResult(s.page,true,'Reels yayınlandı.');}catch(e){addResult(pageName(id),false,e.message);}progress(i+1,ids.length,'Tamamlandı');}}",
    "async function stories(ids){var file=document.getElementById('storyFile').files[0];if(!file)throw new Error('Story medyası seçin.');for(var i=0;i<ids.length;i++){var id=ids[i];try{if(story==='photo'){var f=new FormData();f.append('pageId',id);f.append('media',file,file.name);var d=await api('/api/story/photo',{method:'POST',body:f});addResult(d.page,true,'Fotoğraf Story yayınlandı.');}else{var s=await api('/api/story/video/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id})});var off=0;while(off<file.size){var end=Math.min(off+chunkSize,file.size);var f2=new FormData();f2.append('pageId',id);f2.append('uploadUrl',s.uploadUrl);f2.append('offset',String(off));f2.append('chunk',file.slice(off,end),'chunk');await api('/api/story/video/upload',{method:'POST',body:f2});off=end;progress(off/file.size,1,'Story '+pageName(id)+' %'+Math.round(off/file.size*100));}await api('/api/story/video/finish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,videoId:s.videoId})});addResult(s.page,true,'Video Story yayınlandı.');}}catch(e){addResult(pageName(id),false,e.message);}progress(i+1,ids.length,'Tamamlandı');}}",
    "api('/api/pages').then(function(d){pages=d.pages||[];renderPages();}).catch(function(e){document.getElementById('pages').innerHTML='<div class=\"result bad\">❌ '+esc(e.message)+'</div>';});",
    "if (\"serviceWorker\" in navigator) { navigator.serviceWorker.register(\"/sw.js\", {scope: \"/\"}).catch(function(){}); }",
    "</script></body></html>"
  ].join("");

  return html(page);
}

/* ---------------- SIMPLE PAGES ---------------- */

function home() {
  return html([
    "<!doctype html><html lang='tr'><head>",
    "<meta charset='UTF-8'>",
    "<meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'>",
    "<meta name='mobile-web-app-capable' content='yes'>",
    "<meta name='apple-mobile-web-app-capable' content='yes'>",
    "<meta name='apple-mobile-web-app-status-bar-style' content='default'>",
    "<meta name='apple-mobile-web-app-title' content='Social Publisher'>",
    "<link rel='manifest' href='/manifest.json'>",
    "<link rel='apple-touch-icon' href='/apple-touch-icon.png'>",
    "<meta name='theme-color' content='#005082'>",
    "<title>Social Publisher</title>",
    "<style>body{margin:0;background:#f3f7f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial}.box{max-width:560px;margin:50px auto;padding:30px;background:white;border-radius:24px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.08)}h1{color:#005082}.btn{display:block;background:#005082;color:#fff;text-decoration:none;padding:17px;border-radius:14px;font-weight:800;margin-top:22px}</style>",
    "</head><body><div class='box'>",
    "<h1>📣 Social Publisher</h1>",
    "<p>Facebook Sayfalarını tek merkezden yönetin.</p>",
    "<a class='btn' href='/login'>Facebook ile Bağlan</a>",
    "<p style='font-size:13px;color:#667'>48 saatlik uygulama oturumu.</p>",
    "<a href='/privacy'>Gizlilik Politikası</a>",
    "</div></body></html>"
  ].join(""));
}

function privacy() {
  return html([
    "<!doctype html><html lang='tr'><head>",
    "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'>",
    "<meta name='mobile-web-app-capable' content='yes'>",
    "<meta name='apple-mobile-web-app-capable' content='yes'>",
    "<meta name='apple-mobile-web-app-status-bar-style' content='default'>",
    "<meta name='apple-mobile-web-app-title' content='Social Publisher'>",
    "<link rel='manifest' href='/manifest.json'>",
    "<link rel='apple-touch-icon' href='/apple-touch-icon.png'>",
    "<title>Gizlilik Politikası</title>",
    "<style>body{font-family:Arial;max-width:800px;margin:40px auto;padding:20px;line-height:1.7}h1,h2{color:#005082}</style>",
    "</head><body>",
    "<h1>Gizlilik Politikası</h1>",
    "<p><strong>Son güncelleme:</strong> 23 Eylül 2026</p>",
    "<h2>Amaç</h2>",
    "<p>Social Publisher, kullanıcının yönetme yetkisine sahip olduğu Facebook Sayfalarında içerik yayınlamasını kolaylaştırır.</p>",
    "<h2>Veri kullanımı</h2>",
    "<p>Facebook hesap ve Sayfa bilgileri yalnızca yetkili yayınlama işlemleri için kullanılır.</p>",
    "<h2>Saklama</h2>",
    "<p>Uygulama R2, KV, D1 veya içerik veritabanı kullanmaz. İçerik ve medya arşivi oluşturmaz.</p>",
    "<h2>Oturum</h2>",
    "<p>Uygulama oturumu 48 saatlik HttpOnly, Secure cookie ile tutulur. Facebook erişim yetkisinin gerçek süresi Meta tarafından belirlenir.</p>",
    "<h2>İletişim</h2><p>qasimm2012@gmail.com</p>",
    "</body></html>"
  ].join(""));
}

/* ---------------- HELPERS ---------------- */

function cookie(name, value, maxAge) {
  return {
    name: "Set-Cookie",
    value:
      name + "=" + encodeURIComponent(value) +
      "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge
  };
}

function readCookies(header) {
  const result = {};
  header.split(";").forEach(function (part) {
    const i = part.indexOf("=");
    if (i < 0) return;
    const key = part.slice(0, i).trim();
    const value = part.slice(i + 1).trim();
    try {
      result[key] = decodeURIComponent(value);
    } catch (error) {
      result[key] = value;
    }
  });
  return result;
}

function redirect(location, cookies) {
  const headers = new Headers();
  headers.set("Location", location);
  headers.set("Cache-Control", "no-store");

  (cookies || []).forEach(function (item) {
    headers.append(item.name, item.value);
  });

  return new Response(null, {
    status: 302,
    headers: headers
  });
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}

function html(content) {
  return new Response(content, {
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}

function text(content, status) {
  return new Response(content, {
    status: status || 200,
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
      "Cache-Control": "no-store"
    }
  });
}

function parseJSON(value, fallback) {
  try {
    return JSON.parse(String(value || ""));
  } catch (error) {
    return fallback;
  }
}

function cleanError(error) {
  return String(error?.message || error || "Bilinmeyen hata")
    .replace(/META_APP_SECRET/gi, "[REDACTED]");
}
