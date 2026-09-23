const APP_ID = "27708155402192252";
const GRAPH_VERSION = "v23.0";
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;
const RUPLOAD_HOST = "rupload.facebook.com";

const SESSION_TTL = 48 * 60 * 60; // 48 saat
const OAUTH_TTL = 10 * 60;

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
    pages: pages.map(p => ({
      id: p.id,
      name: p.name,
      tasks: p.tasks || [],
      instagramBusinessAccount: p.instagram_business_account || null
    }))
  });
}

async function getPages(userToken) {
  const url =
    `${GRAPH}/me/accounts` +
    `?fields=id,name,access_token,tasks,instagram_business_account` +
    `&access_token=${encodeURIComponent(userToken)}`;

  let r = await fetch(url, { cache: "no-store" });
  let data = await r.json().catch(() => ({}));

  // Instagram alanı yetki nedeniyle hata verirse Facebook Sayfalarını
  // yine de yükle; Instagram bağlantısını ayrı ve isteğe bağlı ele alıyoruz.
  if (!r.ok || data.error) {
    const basicUrl = `${GRAPH}/me/accounts?fields=id,name,access_token,tasks&access_token=${encodeURIComponent(userToken)}`;
    r = await fetch(basicUrl, { cache: "no-store" });
    data = await r.json().catch(() => ({}));
    if (!r.ok || data.error) {
      throw new Error(data?.error?.message || "Facebook Sayfaları alınamadı.");
    }
    return (data.data || []).map(p => ({ ...p, instagram_business_account: null }));
  }

  return data.data || [];
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

  const r = await fetch(
    `${GRAPH}/${page.id}/video_stories` +
    `?upload_phase=start` +
    `&access_token=${encodeURIComponent(token)}`,
    { method: "POST" }
  );

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

function appPage() { return html(`<!doctype html><html lang="tr"><head>${baseHead("Social Publisher")}</head><body class="appBody">\n<div class=\"aurora a1\"></div><div class=\"aurora a2\"></div><div class=\"grain\"></div>\n<main class=\"appShell\">\n<header class=\"appTop glass\">\n  <div class=\"brandBlock\"><div class=\"brandEyebrow\">EROL VURAL</div><div class=\"brandTitle\">Social Publisher</div><div class=\"brandSub\">Tek dokunu\u015fla \u00e7oklu yay\u0131n</div></div>\n  <a href=\"/logout\" class=\"logoutPill touch\">\u00c7\u0131k\u0131\u015f</a>\n</header>\n\n<section id=\"homeSection\" class=\"screenSection\">\n  <div class=\"heroGlass glass\">\n    <div class=\"heroOrb\"><span>SP</span></div>\n    <div><div class=\"heroKicker\">YAYIN MERKEZ\u0130</div><h1>\u0130\u00e7eri\u011fini se\u00e7.<br><span>Hedeflerini belirle.</span></h1><p>Facebook Sayfalar\u0131 ve ba\u011fl\u0131 Instagram hesaplar\u0131na tek ak\u0131\u015ftan yay\u0131nla.</p></div>\n    <div class=\"heroStats\"><div><b id=\"heroPageCount\">\u2014</b><small>Sayfa</small></div><div><b id=\"heroIgCount\">\u2014</b><small>Instagram</small></div><div><b id=\"heroSelected\">0</b><small>Se\u00e7ili</small></div></div>\n  </div>\n\n  <section class=\"glass panel\" id=\"targetsPanel\">\n    <div class=\"sectionHead\"><div><span class=\"sectionKicker\">HEDEFLER</span><h2>Yay\u0131n nereye gitsin?</h2></div><span id=\"count\" class=\"countBubble\">0</span></div>\n    <div class=\"segmented glassInner\" role=\"tablist\"><button id=\"fbTarget\" class=\"segment active touch\" data-platform=\"facebook\">Facebook</button><button id=\"igTarget\" class=\"segment touch\" data-platform=\"instagram\">Instagram</button></div>\n    <div id=\"igNote\" class=\"softNotice hidden\">Instagram listesi yaln\u0131zca ba\u011fl\u0131 ve eri\u015filebilir Professional hesaplar\u0131 g\u00f6sterir.</div>\n    <div class=\"targetTools\"><button id=\"selectAllBtn\" class=\"miniButton touch\">T\u00fcm\u00fcn\u00fc se\u00e7</button><button id=\"clearAllBtn\" class=\"miniButton touch\">Temizle</button><div class=\"searchWrap glassInner\"><span>\u2315</span><input id=\"search\" placeholder=\"Sayfa ara...\" autocomplete=\"off\"></div></div>\n    <div id=\"pages\" class=\"pageList\"><div class=\"loadingState\"><span class=\"spinner\"></span>Sayfalar haz\u0131rlan\u0131yor</div></div>\n  </section>\n</section>\n\n<section id=\"publishSection\" class=\"screenSection\">\n  <section class=\"glass panel\">\n    <div class=\"sectionHead\"><div><span class=\"sectionKicker\">\u0130\u00c7ER\u0130K</span><h2>Ne yay\u0131nlayal\u0131m?</h2></div><span class=\"liveDot\"><i></i> Haz\u0131r</span></div>\n    <div class=\"contentGrid\">\n      <button class=\"contentCard active touch\" data-type=\"post\"><span class=\"contentIcon\">\u270e</span><b>G\u00f6nderi</b><small>Metin & ba\u011flant\u0131</small></button>\n      <button class=\"contentCard touch\" data-type=\"photo\"><span class=\"contentIcon\">\u25c9</span><b>Foto\u011fraf</b><small>G\u00f6rsel payla\u015f</small></button>\n      <button class=\"contentCard touch\" data-type=\"video\"><span class=\"contentIcon\">\u25b6</span><b>Video</b><small>Video g\u00f6nderisi</small></button>\n      <button class=\"contentCard touch\" data-type=\"reel\"><span class=\"contentIcon\">\u25eb</span><b>Reel</b><small>Dikey k\u0131sa video</small></button>\n      <button class=\"contentCard touch\" data-type=\"story\"><span class=\"contentIcon\">\u25a3</span><b>Story</b><small>24 saatlik i\u00e7erik</small></button>\n    </div>\n    <div id=\"typeInfo\" class=\"typeInfo glassInner\">Metin veya ba\u011flant\u0131 i\u00e7eren normal Facebook g\u00f6nderisi.</div>\n    <label class=\"fieldLabel\">A\u00e7\u0131klama</label>\n    <textarea id=\"message\" class=\"glassInput\" placeholder=\"Ne payla\u015fmak istiyorsun?\" spellcheck=\"true\"></textarea>\n    <div id=\"mediaBox\"></div>\n    <div id=\"instagramUrlBox\" class=\"hidden\"><label class=\"fieldLabel\">Instagram medya URL'si</label><input id=\"instagramMediaUrl\" class=\"glassInput\" placeholder=\"https://...\" inputmode=\"url\"><div class=\"fieldHint\">Meta'n\u0131n eri\u015febilece\u011fi herkese a\u00e7\u0131k bir medya URL'si.</div></div>\n    <div id=\"reelOptions\" class=\"hidden\"><label class=\"fieldLabel\">Reel ba\u015fl\u0131\u011f\u0131</label><input id=\"reelTitle\" class=\"glassInput\" placeholder=\"\u0130ste\u011fe ba\u011fl\u0131\"></div>\n    <div id=\"storyOptions\" class=\"hidden\"><div class=\"storySwitch\"><button class=\"storyTab active touch\" data-story=\"photo\">Foto Story</button><button class=\"storyTab touch\" data-story=\"video\">Video Story</button></div><div id=\"storyHint\" class=\"fieldHint\">Dikey g\u00f6rsel se\u00e7in.</div></div>\n    <div id=\"preview\" class=\"previewGlass hidden\"></div>\n    <button id=\"publishBtn\" class=\"publishButton touch\"><span class=\"publishIcon\">\u2191</span><span>Se\u00e7ilenlerde yay\u0131nla</span><span class=\"publishCount\" id=\"publishCount\">0</span></button>\n  </section>\n</section>\n\n<section id=\"queueSection\" class=\"screenSection hidden\">\n  <section class=\"glass panel queuePanel\">\n    <div class=\"sectionHead\"><div><span class=\"sectionKicker\">CANLI DURUM</span><h2>Yay\u0131n ak\u0131\u015f\u0131</h2></div><span id=\"queueSummary\" class=\"countBubble\">Haz\u0131r</span></div>\n    <div id=\"jobs\" class=\"jobs\"></div>\n    <div class=\"queueActions\"><button id=\"retryBtn\" class=\"miniButton touch hidden\">\u21bb Ba\u015far\u0131s\u0131zlar\u0131 yeniden dene</button><button id=\"clearQueueBtn\" class=\"miniButton touch\">Kuyru\u011fu temizle</button></div>\n  </section>\n</section>\n\n<section id=\"accountsSection\" class=\"screenSection hidden\"><section class=\"glass panel\"><div class=\"sectionHead\"><div><span class=\"sectionKicker\">HESAPLAR</span><h2>Ba\u011fl\u0131 hedefler</h2></div></div><div id=\"accountSummary\" class=\"accountSummary\"></div></section></section>\n\n<nav class=\"bottomDock glass\">\n  <button class=\"navItem active touch\" data-nav=\"home\"><span class=\"navIcon\">\u2302</span><span>Ana Sayfa</span></button>\n  <button class=\"navItem touch\" data-nav=\"publish\"><span class=\"navIcon\">\uff0b</span><span>Yay\u0131nla</span></button>\n  <button class=\"navItem touch\" data-nav=\"queue\"><span class=\"navIcon\">\u25cc</span><span>Kuyruk</span></button>\n  <button class=\"navItem touch\" data-nav=\"accounts\"><span class=\"navIcon\">\u25ce</span><span>Hesaplar</span></button>\n</nav>\n<div id=\"toast\" class=\"toastGlass\"></div>\n</main><script src="/app.js?v=6" defer></script></body></html>`); }

function appScript() { return new Response("\nlet pages=[];let currentType='post';let storyType='photo';let platform='facebook';let jobs=[];let lastPayload=null;\nconst CHUNK_SIZE=24*1024*1024;const CONCURRENCY=3;\nconst $=id=>document.getElementById(id);const qs=s=>document.querySelector(s);const qsa=s=>[...document.querySelectorAll(s)];\nasync function api(url,options={}){const r=await fetch(url,options);const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'\u0130\u015flem ba\u015far\u0131s\u0131z.');return d}\nfunction xhrApi(url,options={},onProgress){return new Promise((resolve,reject)=>{const x=new XMLHttpRequest();x.open(options.method||'POST',url,true);if(options.headers)Object.entries(options.headers).forEach(([k,v])=>x.setRequestHeader(k,v));x.upload.onprogress=e=>{if(e.lengthComputable&&onProgress)onProgress(e.loaded,e.total)};x.onload=()=>{let d={};try{d=JSON.parse(x.responseText||'{}')}catch{}if(x.status>=200&&x.status<300)resolve(d);else reject(new Error(d.error||('HTTP '+x.status)))};x.onerror=()=>reject(new Error('A\u011f ba\u011flant\u0131s\u0131 ba\u015far\u0131s\u0131z.'));x.onabort=()=>reject(new Error('\u0130\u015flem iptal edildi.'));x.send(options.body||null)})}\nfunction toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2600)}\nfunction navTo(name){qsa('.navItem').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));qsa('.screenSection').forEach(s=>s.classList.add('hidden'));const map={home:'homeSection',publish:'publishSection',queue:'queueSection',accounts:'accountsSection'};const target=$(map[name]);if(target)target.classList.remove('hidden');const active=qsa('.navItem').find(b=>b.dataset.nav===name);const dock=document.querySelector('.bottomDock');if(active&&dock){const r=active.getBoundingClientRect(),d=dock.getBoundingClientRect();dock.style.setProperty('--glow-left',(r.left-d.left+((r.width-74)/2))+'px')}if(name==='queue')setTimeout(()=>$('queueSection')?.scrollIntoView({behavior:'smooth',block:'start'}),30);else window.scrollTo({top:0,behavior:'smooth'})}\nfunction bindUI(){qsa('.navItem').forEach(b=>b.addEventListener('click',()=>navTo(b.dataset.nav)));qsa('.liquidButton').forEach(b=>b.addEventListener('pointerdown',()=>{b.classList.add('pressed');setTimeout(()=>b.classList.remove('pressed'),220)}));$('fbTarget').addEventListener('click',()=>setPlatform('facebook'));$('igTarget').addEventListener('click',()=>setPlatform('instagram'));$('selectAllBtn').addEventListener('click',selectAll);$('clearAllBtn').addEventListener('click',clearAll);$('search').addEventListener('input',renderPages);qsa('.contentCard').forEach(b=>b.addEventListener('click',()=>setType(b.dataset.type)));qsa('.storyTab').forEach(b=>b.addEventListener('click',()=>setStoryType(b.dataset.story)));$('publishBtn').addEventListener('click',publish);$('retryBtn').addEventListener('click',retryFailed);$('clearQueueBtn').addEventListener('click',clearQueue);}\nasync function loadPages(){try{const d=await api('/api/pages');pages=d.pages||[];$('heroPageCount').textContent=pages.length;$('heroIgCount').textContent=pages.filter(p=>p.instagramBusinessAccount).length;renderPages();renderAccounts()}catch(e){$('pages').innerHTML='<div class=\"loadingState\">\u26a0\ufe0f '+esc(e.message)+'</div>';toast(e.message)}}\nfunction renderPages(){const q=($('search').value||'').toLowerCase();const list=pages.filter(p=>p.name.toLowerCase().includes(q)&&(platform==='facebook'||!!p.instagramBusinessAccount));$('pages').innerHTML=list.length?list.map(p=>{const checked=!!document.querySelector('#p_'+CSS.escape(String(p.id)))?.checked;return '<label class=\"pageRow '+(checked?'selected':'')+'\"><input class=\"pageCheck\" id=\"p_'+escAttr(p.id)+'\" type=\"checkbox\" value=\"'+escAttr(p.id)+'\" '+(checked?'checked':'')+'><span class=\"pageName\">'+esc(p.name)+'</span>'+(p.instagramBusinessAccount?'<span class=\"igBadge\">IG BA\u011eLI</span>':'')+'</label>'}).join(''):'<div class=\"loadingState\">Bu hedefte g\u00f6sterilecek hesap bulunamad\u0131.</div>';qsa('.pageCheck').forEach(x=>x.addEventListener('change',()=>{x.closest('.pageRow').classList.toggle('selected',x.checked);updateCount()}));updateCount()}\nfunction selectedIds(){return qsa('.pageCheck:checked').map(x=>x.value)}\nfunction updateCount(){const n=selectedIds().length;$('count').textContent=n;$('heroSelected').textContent=n;$('publishCount').textContent=n}\nfunction selectAll(){qsa('.pageCheck').forEach(x=>x.checked=true);qsa('.pageRow').forEach(x=>x.classList.add('selected'));updateCount();toast('G\u00f6r\u00fcnen hedeflerin tamam\u0131 se\u00e7ildi')}\nfunction clearAll(){qsa('.pageCheck').forEach(x=>x.checked=false);qsa('.pageRow').forEach(x=>x.classList.remove('selected'));updateCount()}\nfunction setPlatform(v){platform=v;$('fbTarget').classList.toggle('active',v==='facebook');$('igTarget').classList.toggle('active',v==='instagram');$('igNote').classList.toggle('hidden',v!=='instagram');renderPages();if(v==='instagram'&&!['photo','reel'].includes(currentType)){setType('photo');toast('Instagram i\u00e7in Foto\u011fraf veya Reel se\u00e7ildi')}}\nfunction setType(type){currentType=type;qsa('.contentCard').forEach(b=>b.classList.toggle('active',b.dataset.type===type));$('reelOptions').classList.toggle('hidden',type!=='reel');$('storyOptions').classList.toggle('hidden',type!=='story');$('instagramUrlBox').classList.toggle('hidden',platform!=='instagram'||!['photo','reel'].includes(type));const info={post:'Metin veya ba\u011flant\u0131 i\u00e7eren normal Facebook g\u00f6nderisi.',photo:'Foto\u011fraf g\u00f6nderisi.',video:'Normal Facebook video g\u00f6nderisi. B\u00fcy\u00fck videolar par\u00e7alara ayr\u0131larak y\u00fcklenir.',reel:'Facebook Reel. Y\u00fckleme sonras\u0131 Meta i\u015fleme durumu takip edilir.',story:'Facebook Story.'};$('typeInfo').textContent=info[type];const m=$('mediaBox');if(type==='post')m.innerHTML='';else if(type==='photo')m.innerHTML=fileInput('photoFile','image/*','Foto\u011fraf se\u00e7');else if(type==='video')m.innerHTML=fileInput('videoFile','video/*','Video se\u00e7');else if(type==='reel')m.innerHTML=fileInput('reelFile','video/*','Reel videosu se\u00e7');else m.innerHTML=fileInput('storyFile',storyType==='photo'?'image/*':'video/*',storyType==='photo'?'Story g\u00f6rseli se\u00e7':'Story videosu se\u00e7');bindFileEvents()}\nfunction setStoryType(type){storyType=type;qsa('.storyTab').forEach(b=>b.classList.toggle('active',b.dataset.story===type));$('storyHint').textContent=type==='photo'?'Dikey g\u00f6rsel se\u00e7in.':'Dikey video se\u00e7in.';if(currentType==='story')setType('story')}\nfunction fileInput(id,accept,label){return '<div class=\"fileBox\"><div class=\"fileLabel\"><span>'+label+'</span><label class=\"fileButton touch\" for=\"'+id+'\">Dosya se\u00e7</label></div><input class=\"fileInput\" id=\"'+id+'\" type=\"file\" accept=\"'+accept+'\"><div id=\"'+id+'_name\" class=\"fileName\">Hen\u00fcz dosya se\u00e7ilmedi</div></div>'}\nfunction bindFileEvents(){const id=currentType==='photo'?'photoFile':currentType==='video'?'videoFile':currentType==='reel'?'reelFile':currentType==='story'?'storyFile':null;const el=id&&$(id);if(!el)return;el.addEventListener('change',()=>{const f=el.files[0];if(!f)return;$(id+'_name').textContent=f.name+' \u2022 '+formatBytes(f.size);previewFile(f)})}\nfunction previewFile(file){const box=$('preview');if(!file){box.classList.add('hidden');return}const u=URL.createObjectURL(file);box.classList.remove('hidden');box.innerHTML=file.type.startsWith('image/')?'<img src=\"'+u+'\" alt=\"\u00d6nizleme\">':'<video src=\"'+u+'\" controls playsinline></video>'}\nasync function validateFile(file,type){if(!file)throw new Error('Medya se\u00e7in.');if(type==='photo'&&!file.type.startsWith('image/'))throw new Error('Ge\u00e7erli bir g\u00f6rsel se\u00e7in.');if(['video','reel'].includes(type)&&!file.type.startsWith('video/'))throw new Error('Ge\u00e7erli bir video se\u00e7in.');if(type==='reel'){const m=await videoMeta(file);if(m.duration<3||m.duration>60)throw new Error('Facebook Reel i\u00e7in video s\u00fcresi 3\u201360 saniye olmal\u0131.');if(m.width/m.height<0.45||m.width/m.height>1.2)throw new Error('Reel i\u00e7in dikey video kullan\u0131n.')}}\nfunction videoMeta(file){return new Promise((resolve,reject)=>{const v=document.createElement('video');v.preload='metadata';v.onloadedmetadata=()=>{URL.revokeObjectURL(v.src);resolve({duration:v.duration,width:v.videoWidth,height:v.videoHeight})};v.onerror=()=>reject(new Error('Video bilgisi okunamad\u0131.'));v.src=URL.createObjectURL(file)})}\nasync function publish(){const ids=selectedIds();if(!ids.length){toast('\u00d6nce en az bir hedef se\u00e7');return}const message=$('message').value.trim();let file=null;try{if(platform==='instagram'){if(!['photo','reel'].includes(currentType))throw new Error('Instagram i\u00e7in Foto\u011fraf veya Reel se\u00e7in.');if(!$('instagramMediaUrl').value.trim())throw new Error('Instagram medya URL\u2019si gerekli.')}else{const id=currentType==='photo'?'photoFile':currentType==='video'?'videoFile':currentType==='reel'?'reelFile':currentType==='story'?'storyFile':null;file=id?$(id)?.files[0]:null;if(['photo','video','reel','story'].includes(currentType))await validateFile(file,currentType)};setBusy(true);prepareJobs(ids,file);lastPayload={ids,message,file,type:currentType,storyType,platform,mediaUrl:$('instagramMediaUrl')?.value.trim()||''};navTo('queue');if(platform==='instagram')await publishInstagram(ids,message);else await publishFacebook(ids,message,file)}catch(e){if(jobs.length)addSystemError(e.message);else toast(e.message)}finally{setBusy(false);if(jobs.length)finalizeQueue()}}\nfunction prepareJobs(ids,file){jobs=ids.map(id=>({id,name:pageName(id),percent:0,status:'waiting',started:0,finished:0,duration:null,file:file?file.name:'',type:currentType,error:null}));$('queueSection').classList.remove('hidden');renderJobs();updateSummary();}\nfunction renderJobs(){const sorted=[...jobs].sort((a,b)=>{if(a.duration!=null&&b.duration!=null)return a.duration-b.duration;if(a.duration!=null)return -1;if(b.duration!=null)return 1;return b.percent-a.percent});$('jobs').innerHTML=sorted.map(j=>'<div class=\"job '+j.status+'\" id=\"job_'+escAttr(j.id)+'\"><div class=\"jobTop\"><div><div class=\"jobTitle\">'+statusIcon(j.status)+' '+esc(j.name)+'</div><div class=\"jobMeta\">'+esc(j.file||contentLabel(j.type))+(j.duration!=null?' \u2022 '+formatTime(j.duration):'')+'</div></div><div class=\"jobPercent\">'+j.percent+'%</div></div><div class=\"jobBar\"><div style=\"width:'+j.percent+'%\"></div></div><div class=\"jobState\">'+esc(jobState(j))+'</div></div>').join('')}\nfunction statusIcon(s){return s==='done'?'\u2713':s==='error'?'\u00d7':s==='running'?'\u25cc':'\u00b7'}function jobState(j){if(j.status==='done')return 'Tamamland\u0131 \u2022 '+formatTime(j.duration);if(j.status==='error')return j.error||'Ba\u015far\u0131s\u0131z';if(j.status==='running')return 'Y\u00fckleniyor\u2026';return 'S\u0131rada'}function contentLabel(t){return({post:'G\u00f6nderi',photo:'Foto\u011fraf',video:'Video',reel:'Reel',story:'Story'})[t]||t}\nfunction setJob(id,patch){const j=jobs.find(x=>String(x.id)===String(id));if(!j)return;Object.assign(j,patch);renderJobs();updateSummary()}\nfunction updateSummary(){const done=jobs.filter(j=>j.status==='done').length,err=jobs.filter(j=>j.status==='error').length,run=jobs.filter(j=>j.status==='running').length;const total=jobs.length;$('queueSummary').textContent=total?(done+'/'+total+' tamamland\u0131'):'Haz\u0131r';$('retryBtn').classList.toggle('hidden',err===0)}\nasync function publishFacebook(ids,message,file){if(currentType==='post'||currentType==='photo')return runPool(ids,id=>publishStandardOne(id,message,file));if(currentType==='video')return runPool(ids,id=>publishVideoOne(id,message,file));if(currentType==='reel')return runPool(ids,id=>publishReelOne(id,message,file));return runPool(ids,id=>publishStoryOne(id,message,file))}\nasync function runPool(ids,worker){let next=0;async function runner(){while(true){const i=next++;if(i>=ids.length)return;const id=ids[i];const j=jobs.find(x=>x.id===id);j.started=performance.now();setJob(id,{status:'running',percent:0});try{await worker(id);j.finished=performance.now();setJob(id,{status:'done',percent:100,duration:j.finished-j.started})}catch(e){j.finished=performance.now();setJob(id,{status:'error',duration:j.finished-j.started,error:e.message})}}}await Promise.all(Array.from({length:Math.min(CONCURRENCY,ids.length)},()=>runner()))}\nasync function publishStandardOne(id,message,file){const form=new FormData();form.append('pages',JSON.stringify([id]));form.append('message',message);form.append('type',currentType);if(file)form.append('media',file,file.name);const d=await xhrApi('/api/publish',{method:'POST',body:form},(l,t)=>setJob(id,{percent:Math.round(l/t*100)}));const r=d.results?.[0];if(!r?.success)throw new Error(r?.error||'Yay\u0131nlanamad\u0131.')}\nasync function publishVideoOne(id,message,file){const start=await api('/api/video/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,fileSize:file.size})});let off=start.startOffset||0,end=start.endOffset||0;while(off<file.size){const target=Math.min(end||off+CHUNK_SIZE,file.size);const chunk=file.slice(off,target);const form=new FormData();form.append('pageId',id);form.append('uploadSessionId',start.uploadSessionId);form.append('startOffset',String(off));form.append('fileSize',String(file.size));form.append('chunk',chunk,file.name);const part=await xhrApi('/api/video/upload',{method:'POST',body:form},(l,t)=>setJob(id,{percent:Math.round(((off+l/t*(target-off))/file.size)*100)}));off=part.startOffset;end=part.endOffset||Math.min(off+CHUNK_SIZE,file.size)}await api('/api/video/finish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,uploadSessionId:start.uploadSessionId,description:message})});setJob(id,{percent:100})}\nasync function publishReelOne(id,message,file){const start=await api('/api/reel/start',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id})});let off=0;while(off<file.size){const target=Math.min(off+CHUNK_SIZE,file.size);const chunk=file.slice(off,target);const form=new FormData();form.append('pageId',id);form.append('videoId',start.videoId);form.append('uploadUrl',start.uploadUrl);form.append('offset',String(off));form.append('fileSize',String(file.size));form.append('chunk',chunk,file.name);await xhrApi('/api/reel/upload',{method:'POST',body:form},(l,t)=>setJob(id,{percent:Math.round(((off+l/t*(target-off))/file.size)*100)}));off=target}for(let i=0;i<120;i++){const st=await api('/api/reel/status?pageId='+encodeURIComponent(id)+'&videoId='+encodeURIComponent(start.videoId));const p=Number(st.status?.processing_progress||0);setJob(id,{percent:Math.max(90,Math.min(99,p||90)});const ps=String(st.status?.video_status||'').toLowerCase();if(ps==='ready'||ps==='complete'||ps==='published'||st.status?.publishing_phase?.status==='complete')break;if(ps==='error'||ps==='failed')throw new Error('Meta Reel i\u015flemesi ba\u015far\u0131s\u0131z.');await new Promise(r=>setTimeout(r,1500))}await api('/api/reel/finish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,videoId:start.videoId,description:message})})}\nasync function publishStoryOne(id,message,file){if(storyType==='photo'){const form=new FormData();form.append('pageId',id);form.append('message',message);form.append('media',file,file.name);const d=await xhrApi('/api/story/start',{method:'POST',body:form},(l,t)=>setJob(id,{percent:Math.round(l/t*100)}));if(d?.success===false)throw new Error(d.error||'Story yay\u0131nlanamad\u0131.')}else{throw new Error('Video Story ak\u0131\u015f\u0131 Meta taraf\u0131nda yeniden do\u011frulama gerektiriyor; bu hedef \u015fu an kapal\u0131.')}}\nasync function publishInstagram(ids,message){const u=$('instagramMediaUrl').value.trim();return runPool(ids,id=>publishInstagramOne(id,message,u))}async function publishInstagramOne(id,message,u){const d=await api('/api/instagram/publish',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pageId:id,type:currentType==='reel'?'reel':'photo',mediaUrl:u,caption:message,shareToFeed:true})});if(!d.success)throw new Error(d.error||'Instagram yay\u0131nlanamad\u0131.');setJob(id,{percent:100})}\nasync function retryFailed(){if(!lastPayload)return;const failed=jobs.filter(j=>j.status==='error').map(j=>j.id);if(!failed.length)return;failed.forEach(id=>{const j=jobs.find(x=>x.id===id);Object.assign(j,{status:'waiting',percent:0,error:null,duration:null})});renderJobs();if(lastPayload.platform==='instagram')await runPool(failed,id=>publishInstagramOne(id,lastPayload.message,lastPayload.mediaUrl));else await publishFacebook(failed,lastPayload.message,lastPayload.file);finalizeQueue()}\nfunction finalizeQueue(){renderJobs();updateSummary();const f=jobs.filter(j=>j.status==='error').length;toast(f?'Baz\u0131 hedefler ba\u015far\u0131s\u0131z oldu':'T\u00fcm yay\u0131nlar tamamland\u0131')}\nfunction clearQueue(){jobs=[];$('jobs').innerHTML='';$('queueSection').classList.add('hidden');$('queueSummary').textContent='Haz\u0131r'}\nfunction addSystemError(msg){jobs=[{id:'system',name:'Sistem',percent:0,status:'error',error:msg,duration:0,file:'',type:''}];$('queueSection').classList.remove('hidden');renderJobs()}\nfunction setBusy(b){const x=$('publishBtn');x.disabled=b;x.style.opacity=b?.72:1;x.querySelector('span:nth-child(2)').textContent=b?'Yay\u0131nlan\u0131yor\u2026':'Se\u00e7ilenlerde yay\u0131nla'}\nfunction renderAccounts(){$('accountSummary').innerHTML=pages.map(p=>'<div class=\"accountCard\"><b>'+esc(p.name)+'</b><small>'+(p.instagramBusinessAccount?'Instagram ba\u011fl\u0131':'Yaln\u0131zca Facebook')+'</small></div>').join('')||'<div class=\"fieldHint\">Hesap bulunamad\u0131.</div>'}\nfunction pageName(id){return pages.find(p=>String(p.id)===String(id))?.name||id}function formatBytes(n){if(n<1024)return n+' B';if(n<1048576)return(n/1024).toFixed(1)+' KB';if(n<1073741824)return(n/1048576).toFixed(1)+' MB';return(n/1073741824).toFixed(2)+' GB'}function formatTime(ms){return(ms/1000).toFixed(1)+' sn'}function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\"','&quot;').replaceAll(\"'\",'&#039;')}function escAttr(v){return esc(v)}\nwindow.addEventListener('DOMContentLoaded',()=>{try{bindUI();setType('post');setPlatform('facebook');navTo('home');loadPages();window.addEventListener('resize',()=>navTo(document.querySelector('.navItem.active')?.dataset.nav||'home'))}catch(e){console.error(e);toast('Arayüz başlatılamadı: '+e.message)}});\n\", {headers:{\"content-type\":\"application/javascript; charset=UTF-8\",\"cache-control\":\"no-store, no-cache, must-revalidate\"}}); }

// ============================================================
// HTML / CSS
// ============================================================

function styleSheet() { return new Response(\"\n\n/* v6 compatibility: app markup uses these semantic names */\n.appTop{border-radius:26px;padding:15px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.brandBlock{position:relative;z-index:1}.brandEyebrow{font-size:10px;letter-spacing:2.8px;font-weight:900;color:#5e7382}.brandTitle{font-size:25px;font-weight:850;letter-spacing:-.8px}.brandSub{font-size:12px;color:#6c7882;margin-top:2px}.logoutPill{position:relative;z-index:1;text-decoration:none;color:#33424d;font-size:12px;font-weight:800;padding:10px 13px;border-radius:999px;background:rgba(255,255,255,.28);border:1px solid rgba(255,255,255,.65)}.heroGlass{border-radius:30px;padding:22px;margin-bottom:12px;display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center}.heroOrb{width:68px;height:68px;border-radius:22px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(255,255,255,.76),rgba(255,255,255,.32));border:1px solid rgba(255,255,255,.86);box-shadow:inset 0 1px 0 white,0 15px 32px rgba(65,85,100,.11)}.heroOrb span{font-weight:950;font-size:20px;color:#18384d}.heroKicker,.sectionKicker{font-size:10px;letter-spacing:2.4px;font-weight:900;color:#1689e8}.heroGlass h1{font-size:31px;line-height:1.04;letter-spacing:-1.5px;margin:5px 0 9px}.heroGlass h1 span{color:#5c788b}.heroGlass p{font-size:13px;line-height:1.5;color:#6c7882;margin:0}.heroStats{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:2px}.heroStats div{padding:10px 5px;text-align:center;border-radius:16px;background:rgba(255,255,255,.30);border:1px solid rgba(255,255,255,.55)}.heroStats b{display:block;font-size:18px}.heroStats small{font-size:9px;color:#71808a;font-weight:700}.softNotice,.typeInfo{padding:11px 12px;border-radius:16px;background:rgba(255,255,255,.34);border:1px solid rgba(255,255,255,.62);color:#687680;font-size:12px;line-height:1.45;margin:9px 0 12px}.contentIcon{font-size:21px;color:#1689e8;margin-bottom:3px}.liveDot{font-size:10px;color:#5e737f;font-weight:800}.liveDot i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#49ba8a;box-shadow:0 0 0 4px rgba(73,186,138,.10)}.appTop .glass:before{pointer-events:none}.bottomDock{box-shadow:var(--shadow),inset 0 1px 0 rgba(255,255,255,.95)}\n.landingBody{background:radial-gradient(600px 420px at 10% 0%,rgba(255,255,255,.95),transparent 62%),linear-gradient(180deg,#f6f8fa 0%,#e7edf1 100%);color:#15212b;min-height:100vh;overflow-x:hidden}.dropAmbient{position:fixed;border-radius:50%;pointer-events:none;filter:blur(20px);background:radial-gradient(circle at 32% 25%,rgba(255,255,255,.95),rgba(255,255,255,.42) 28%,rgba(142,190,220,.20) 55%,transparent 72%);opacity:.9}.dropOne{width:330px;height:330px;left:-130px;top:12%}.dropTwo{width:430px;height:430px;right:-210px;bottom:8%;opacity:.55}.landingShell{min-height:100vh;display:grid;place-items:center;padding:24px}.landingGlass{width:min(460px,100%);border-radius:38px;padding:34px 28px;text-align:center;overflow:hidden}.landingBrand{font-size:10px;letter-spacing:4px;font-weight:900;color:#71818b;margin-bottom:18px}.landingMark{width:76px;height:76px;margin:0 auto 16px;border-radius:25px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(255,255,255,.34));border:1px solid rgba(255,255,255,.9);box-shadow:inset 0 1px 0 white,0 16px 36px rgba(65,85,100,.12)}.landingMark span{font-size:22px;font-weight:950;color:#18384d}.landingKicker{font-size:10px;letter-spacing:2.4px;font-weight:900;color:#1689e8}.landingGlass h1{font-size:39px;line-height:1.03;letter-spacing:-2px;margin:8px 0 12px}.landingGlass h1 span{color:#5c788b}.landingGlass p{font-size:14px;line-height:1.55;color:#6b7881;max-width:350px;margin:0 auto 22px}.landingButton{display:flex;align-items:center;justify-content:center;gap:12px;text-decoration:none;color:#163b55;background:rgba(255,255,255,.68);border:1px solid rgba(255,255,255,.92);border-radius:22px;padding:15px 18px;font-weight:900;box-shadow:0 14px 30px rgba(60,85,105,.12),inset 0 1px 0 white}.landingButton span{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:rgba(24,139,231,.11);color:#1689e8}.landingMeta{display:flex;justify-content:center;flex-wrap:wrap;gap:7px;color:#7c8991;font-size:9px;margin-top:14px}.privacyLink{display:inline-block;margin-top:18px;color:#6d7c86;font-size:11px;text-decoration:none}.appBody .appShell{padding-bottom:130px}.appBody .screenSection{scroll-margin-top:90px}.liquidButton{overflow:hidden;isolation:isolate;position:relative}.liquidButton:before{content:\"\";position:absolute;width:80px;height:80px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%) scale(.2);background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.95),rgba(255,255,255,.28) 32%,rgba(100,180,235,.10) 58%,transparent 72%);opacity:0;pointer-events:none;transition:transform .45s cubic-bezier(.15,.85,.2,1),opacity .3s}.liquidButton:active:before{transform:translate(-50%,-50%) scale(1.8);opacity:1;transition-duration:.22s}.liquidButton:active{transform:scale(.965)}@media(max-width:560px){.landingShell{padding:16px}.landingGlass{border-radius:30px;padding:28px 20px}.landingGlass h1{font-size:34px}}\n\n:root{--ink:#15212b;--muted:#6c7882;--blue:#1689e8;--line:rgba(255,255,255,.72);--glass:rgba(255,255,255,.48);--glass2:rgba(255,255,255,.34);--shadow:0 18px 55px rgba(72,91,108,.14)}\n*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html{scroll-behavior:smooth}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,\"SF Pro Display\",\"SF Pro Text\",\"Segoe UI\",sans-serif;color:var(--ink);background:#edf2f5;min-height:100vh}button,input,textarea{font:inherit}button{border:0}.hidden{display:none!important}.touch{touch-action:manipulation;user-select:none}.appBody{overflow-x:hidden;background:radial-gradient(800px 450px at 0% 0%,rgba(120,190,230,.23),transparent 62%),radial-gradient(650px 500px at 100% 35%,rgba(180,195,210,.24),transparent 65%),linear-gradient(180deg,#f7f9fa 0%,#e9eef2 100%)}.ambient{position:fixed;width:420px;height:420px;left:-220px;top:25%;border-radius:50%;background:rgba(255,255,255,.6);filter:blur(40px);pointer-events:none}.ambient2{left:auto;right:-250px;top:55%;background:rgba(205,220,232,.5)}\n.appShell{position:relative;z-index:2;max-width:720px;margin:auto;padding:12px 12px 110px}.glass{background:linear-gradient(145deg,rgba(255,255,255,.62),rgba(255,255,255,.30));border:1px solid rgba(255,255,255,.82);box-shadow:var(--shadow),inset 0 1px 0 rgba(255,255,255,.95),inset 0 -1px 0 rgba(140,155,168,.10);backdrop-filter:blur(28px) saturate(135%);-webkit-backdrop-filter:blur(28px) saturate(135%);position:relative;overflow:hidden}.glass:before{content:\"\";position:absolute;inset:0;background:linear-gradient(120deg,rgba(255,255,255,.30),transparent 34%,transparent 68%,rgba(255,255,255,.18));pointer-events:none}.topbar{border-radius:26px;padding:15px 16px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}.brand{position:relative;z-index:1}.eyebrow{font-size:10px;letter-spacing:2.8px;font-weight:900;color:#5e7382}.title{font-size:25px;font-weight:850;letter-spacing:-.8px}.sub{font-size:12px;color:var(--muted);margin-top:2px}.logout{position:relative;z-index:1;text-decoration:none;color:#33424d;font-size:12px;font-weight:800;padding:10px 13px;border-radius:999px}\n.hero{border-radius:30px;padding:22px;margin-bottom:12px}.heroText{position:relative;z-index:1}.hero h1{font-size:31px;line-height:1.03;letter-spacing:-1.5px;margin:7px 0 9px}.hero h1 span{color:#4f7b98}.hero p{margin:0;max-width:560px;font-size:13px;line-height:1.5;color:var(--muted)}.stats{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:18px;border-radius:20px;padding:6px}.stats div{padding:10px 5px;text-align:center;border-radius:16px}.stats b{display:block;font-size:18px}.stats span{font-size:9px;color:var(--muted);font-weight:700}.glassInner{background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.65);box-shadow:inset 0 1px 0 rgba(255,255,255,.8),inset 0 -8px 18px rgba(100,120,135,.05);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}.panel{border-radius:28px;padding:17px;margin-bottom:12px}.sectionHead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:13px;position:relative;z-index:1}.sectionHead h2{font-size:21px;margin:3px 0 0;letter-spacing:-.6px}.countBubble{min-width:42px;height:40px;padding:0 12px;border-radius:999px;display:grid;place-items:center;background:rgba(255,255,255,.5);border:1px solid rgba(255,255,255,.75);box-shadow:inset 0 1px 0 white,0 8px 22px rgba(75,95,110,.10);font-size:12px;font-weight:900}.segmented{display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:18px;margin-bottom:10px}.segment{background:transparent;color:#65727b;border-radius:14px;padding:12px;font-weight:850;position:relative}.segment.active{background:rgba(255,255,255,.68);color:#18384d;box-shadow:0 7px 20px rgba(70,90,105,.11),inset 0 1px 0 white}.targetTools{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:9px}.miniButton{padding:11px 12px;border-radius:15px;background:rgba(255,255,255,.43);border:1px solid rgba(255,255,255,.72);color:#31414c;font-size:12px;font-weight:800;box-shadow:inset 0 1px 0 white,0 8px 18px rgba(60,80,95,.07);position:relative}.searchWrap{grid-column:1/-1;display:flex;align-items:center;gap:7px;border-radius:16px;padding:0 12px}.searchWrap span{font-size:19px;color:#73808a}.searchWrap input{width:100%;padding:12px 0;border:0;outline:0;background:transparent;color:var(--ink);font-size:14px}.searchWrap input::placeholder,.glassInput::placeholder{color:#87929a}.pageList{max-height:380px;overflow:auto;position:relative}.pageRow{display:flex;align-items:center;gap:10px;padding:11px 7px;border-bottom:1px solid rgba(100,115,125,.11);transition:.25s}.pageRow.selected{background:rgba(255,255,255,.42);border-radius:16px;box-shadow:inset 0 1px 0 rgba(255,255,255,.7)}.pageCheck{appearance:none;width:23px;height:23px;border-radius:50%;border:1px solid #bcc7ce;background:rgba(255,255,255,.48);position:relative;flex:0 0 auto}.pageCheck:checked{background:#188be7;border-color:#188be7;box-shadow:0 0 0 4px rgba(24,139,231,.09)}.pageCheck:checked:after{content:\"\u2713\";position:absolute;inset:0;display:grid;place-items:center;color:white;font-size:13px;font-weight:900}.pageName{flex:1;font-size:13px;font-weight:750}.igBadge{font-size:9px;font-weight:850;padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.48);border:1px solid rgba(255,255,255,.7);color:#687782}.notice,.fieldHint{padding:11px 12px;border-radius:16px;background:rgba(255,255,255,.34);border:1px solid rgba(255,255,255,.62);color:#687680;font-size:12px;line-height:1.45;margin:9px 0 12px}.contentGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.contentCard{min-height:90px;padding:13px;border-radius:20px;text-align:left;background:rgba(255,255,255,.37);border:1px solid rgba(255,255,255,.72);color:#33434e;display:flex;flex-direction:column;gap:3px;position:relative;box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 9px 22px rgba(70,90,105,.06)}.contentCard.active{background:rgba(255,255,255,.68);box-shadow:0 10px 25px rgba(60,90,110,.11),inset 0 1px 0 white}.contentCard .icon{font-size:21px;color:#1689e8}.contentCard b{font-size:14px}.contentCard small{font-size:10px;color:#7a8790}.fieldLabel{display:block;font-size:10px;font-weight:900;letter-spacing:1.5px;color:#697781;margin:14px 2px 7px;text-transform:uppercase}.glassInput{width:100%;border-radius:18px;padding:13px 14px;background:rgba(255,255,255,.43);border:1px solid rgba(255,255,255,.72);color:var(--ink);outline:0;resize:vertical;box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 7px 18px rgba(65,85,100,.05);transition:.25s}.glassInput:focus{background:rgba(255,255,255,.64);border-color:rgba(24,139,231,.35);box-shadow:0 0 0 4px rgba(24,139,231,.08),inset 0 1px 0 white}textarea.glassInput{min-height:135px}.fileBox{border:1px dashed rgba(120,140,152,.45);border-radius:19px;padding:14px;margin-top:10px;background:rgba(255,255,255,.25)}.fileLabel{display:flex;justify-content:space-between;gap:8px;font-size:13px;font-weight:800}.fileButton{padding:9px 11px;border-radius:12px;background:rgba(255,255,255,.56);border:1px solid rgba(255,255,255,.75);font-size:11px}.fileInput{display:none}.fileName{margin-top:8px;font-size:10px;color:#78858e}.storySwitch{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.storyTab{padding:11px;border-radius:14px;background:rgba(255,255,255,.38);color:#65737c;border:1px solid rgba(255,255,255,.7);font-size:12px;font-weight:800}.storyTab.active{background:rgba(255,255,255,.68);color:#18384d}.previewGlass{margin-top:11px;border-radius:20px;overflow:hidden;background:rgba(255,255,255,.3);border:1px solid rgba(255,255,255,.7)}.previewGlass img,.previewGlass video{display:block;width:100%;max-height:400px;object-fit:contain}.publishButton{width:100%;margin-top:15px;padding:14px 15px;border-radius:20px;background:rgba(255,255,255,.65);border:1px solid rgba(255,255,255,.86);color:#163b55;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;font-weight:900;box-shadow:0 12px 28px rgba(55,85,105,.12),inset 0 1px 0 white}.publishIcon,.publishCount{display:grid;place-items:center;border-radius:999px;background:rgba(24,139,231,.12);color:#1689e8}.publishIcon{width:27px;height:27px}.publishCount{min-width:25px;height:21px;padding:0 7px;font-size:10px}.ready{font-size:10px;color:#5e737f;font-weight:800}.ready i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#49ba8a;box-shadow:0 0 0 4px rgba(73,186,138,.10)}\n.jobs{display:flex;flex-direction:column;gap:8px}.job{padding:13px;border-radius:20px;background:rgba(255,255,255,.43);border:1px solid rgba(255,255,255,.72);box-shadow:inset 0 1px 0 white,0 10px 24px rgba(65,85,100,.07);animation:jobIn .42s cubic-bezier(.2,.9,.2,1) both}.job.running{border-color:rgba(24,139,231,.35)}.job.done{border-color:rgba(73,186,138,.35)}.job.error{border-color:rgba(210,90,100,.35)}.jobTop{display:flex;justify-content:space-between;gap:10px}.jobTitle{font-weight:900;font-size:13px}.jobMeta{font-size:10px;color:#7c8991;margin-top:3px}.jobPercent{font-size:12px;font-weight:900;color:#426176}.jobBar{height:8px;margin:10px 0 7px;border-radius:999px;background:rgba(120,135,145,.16);overflow:hidden;box-shadow:inset 0 1px 2px rgba(70,80,90,.07)}.jobBar div{height:100%;border-radius:999px;background:linear-gradient(90deg,#3aa7ed,#1689e8);box-shadow:0 0 12px rgba(24,139,231,.28);transition:width .16s linear}.jobState{font-size:10px;color:#77848d;min-height:14px}.queueActions{display:flex;gap:7px;margin-top:10px}.accountCard{padding:12px;border-radius:18px;background:rgba(255,255,255,.4);border:1px solid rgba(255,255,255,.7);margin-bottom:7px}.accountCard b{display:block;font-size:13px}.accountCard small{color:#78858d;font-size:10px}.loadingState{display:flex;justify-content:center;align-items:center;gap:8px;padding:23px;color:#74828b;font-size:12px}.spinner{width:15px;height:15px;border:2px solid rgba(100,120,135,.18);border-top-color:#1689e8;border-radius:50%;animation:spin .8s linear infinite}\n.bottomDock{position:fixed;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:50;width:min(680px,calc(100% - 18px));padding:6px;border-radius:27px;display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.dockGlow{position:absolute;width:74px;height:74px;border-radius:50%;background:rgba(255,255,255,.55);filter:blur(12px);pointer-events:none;left:var(--glow-left,6px);top:2px;transition:left .35s cubic-bezier(.2,.9,.2,1)}.navItem{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:8px 3px;border-radius:21px;background:transparent;color:#7a8790;font-size:9px;font-weight:850;transition:transform .25s cubic-bezier(.2,.9,.2,1),color .25s,background .25s,box-shadow .25s}.navIcon{font-size:19px;line-height:19px}.navItem.active{color:#18384d;background:rgba(255,255,255,.63);box-shadow:inset 0 1px 0 white,0 8px 20px rgba(70,90,105,.10)}.toastGlass{position:fixed;left:50%;bottom:95px;transform:translate(-50%,18px) scale(.96);opacity:0;pointer-events:none;z-index:100;max-width:calc(100% - 30px);padding:11px 14px;border-radius:16px;background:rgba(245,248,250,.82);border:1px solid white;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);color:#243541;font-size:12px;font-weight:800;box-shadow:0 18px 45px rgba(60,80,95,.16);transition:.3s}.toastGlass.show{opacity:1;transform:translate(-50%,0) scale(1)}\n.liquidButton{overflow:hidden;isolation:isolate;position:relative}.liquidButton:before{content:\"\";position:absolute;width:80px;height:80px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%) scale(.2);background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.95),rgba(255,255,255,.28) 32%,rgba(100,180,235,.10) 58%,transparent 72%);opacity:0;pointer-events:none;transition:transform .45s cubic-bezier(.15,.85,.2,1),opacity .3s}.liquidButton:after{content:\"\";position:absolute;inset:1px;border-radius:inherit;border-top:1px solid rgba(255,255,255,.82);opacity:.8;pointer-events:none}.liquidButton:active:before{transform:translate(-50%,-50%) scale(1.8);opacity:1;transition-duration:.22s}.liquidButton:active{transform:scale(.965)}.navItem:active{transform:scale(.90)}@keyframes spin{to{transform:rotate(360deg)}}@keyframes jobIn{from{opacity:0;transform:translateY(10px) scale(.98);filter:blur(4px)}to{opacity:1;transform:none;filter:none}}\n@media(max-width:560px){.appShell{padding:9px 9px 105px}.topbar{border-radius:22px}.title{font-size:23px}.hero{border-radius:25px;padding:19px}.hero h1{font-size:28px}.panel{border-radius:24px;padding:15px}.bottomDock{width:calc(100% - 14px)}.navItem{padding:8px 2px}.contentGrid{gap:7px}}\n", { headers: { "content-type": "text/css; charset=UTF-8", "cache-control": "no-store, no-cache, must-revalidate" } }); }

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
