/* ============================================================
   CLARIXNEWS — SHARED JAVASCRIPT (v3.0 — Tracker v5)
   ============================================================ */

// ── THEME TOGGLE ──
function initTheme() {
  const saved = localStorage.getItem('cnTheme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('cnTheme', next);
  updateThemeBtn(next);
}

function updateThemeBtn(theme) {
  const btn = document.getElementById('themeBtn');
  if (btn) btn.innerHTML = theme === 'dark' ? '☀ Light' : '🌙 Dark';
}

// ── DATE ──
function setDate() {
  const el = document.getElementById('currentDate');
  if (!el) return;
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  el.textContent = new Date().toLocaleDateString('en-US', opts).toUpperCase();
}

// ── MOBILE NAV ──
function initMobileNav() {
  const btn = document.getElementById('mobileNavBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  function toggleMenu() {
    const isOpen = links.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    btn.textContent = isOpen ? '✕' : '☰';
  }

  btn.addEventListener('click', toggleMenu);

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      document.body.style.overflow = '';
      btn.textContent = '☰';
    });
  });

  links.addEventListener('click', (e) => {
    if (e.target === links) {
      links.classList.remove('open');
      document.body.style.overflow = '';
      btn.textContent = '☰';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      document.body.style.overflow = '';
      btn.textContent = '☰';
    }
  });
}

// ── SCROLL TO TOP ──
function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── ACTIVE NAV LINK ──
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
}

// ── SEARCH ──
function initSearch() {
  const btn = document.getElementById('searchBtn');
  const overlay = document.getElementById('searchOverlay');
  const close = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const form = document.getElementById('searchForm');
  if (!btn || !overlay) return;

  btn.addEventListener('click', () => {
    overlay.style.display = 'flex';
    setTimeout(() => input && input.focus(), 100);
  });
  close && close.addEventListener('click', () => overlay.style.display = 'none');
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.style.display = 'none'; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') overlay.style.display = 'none'; });

  form && form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input.value.trim();
    if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
  });
}

// ── WEATHER WIDGET ──
async function initWeather() {
  const el = document.getElementById('weatherWidget');
  if (!el) return;
  const path = location.pathname;
  if (path.endsWith('index.html') || path === '/' || path.endsWith('dashboard.html')) return;

  const cities = [
    { name: 'Karachi', lat: 24.8607, lon: 67.0011 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708 }
  ];

  el.innerHTML = cities.map(c =>
    `<div class="weather-item"><span class="weather-city">${c.name}</span><span class="weather-icon">⏳</span><span class="weather-temp">--°C</span></div>`
  ).join('');

  function weatherIcon(code, isDay) {
    const day = isDay !== 0;
    if (code === 0 || code === 1) return day ? '☀' : '🌙';
    if (code === 2) return '⛅';
    if (code === 3) return '☁';
    if (code === 45 || code === 48) return '🌫';
    if (code >= 51 && code <= 67) return '🌧';
    if (code >= 71 && code <= 86) return '❄';
    if (code >= 95) return '⛈';
    return '🌤';
  }

  try {
    const results = await Promise.all(cities.map(c =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code,is_day&timezone=auto`)
        .then(r => r.json())
        .catch(() => null)
    ));

    el.innerHTML = cities.map((c, i) => {
      const data = results[i];
      if (!data || !data.current) {
        return `<div class="weather-item"><span class="weather-city">${c.name}</span><span class="weather-icon">--</span><span class="weather-temp">--°C</span></div>`;
      }
      const temp = Math.round(data.current.temperature_2m);
      const icon = weatherIcon(data.current.weather_code, data.current.is_day);
      return `<a href="weather.html?lat=${c.lat}&lon=${c.lon}&name=${encodeURIComponent(c.name)}" class="weather-item" style="text-decoration:none;color:inherit;">
        <span class="weather-city">${c.name}</span>
        <span class="weather-icon">${icon}</span>
        <span class="weather-temp">${temp}°C</span>
      </a>`;
    }).join('');
  } catch (e) {
    console.error('Weather widget failed:', e);
  }
}

// ── COMMENTS ──
function initComments() {
  const form = document.getElementById('commentForm');
  const list = document.getElementById('commentList');
  if (!form || !list) return;

  const stored = JSON.parse(localStorage.getItem('cn_comments') || '[]');
  renderComments(stored, list);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('commentName').value.trim();
    const text = document.getElementById('commentText').value.trim();
    if (!name || !text) return;

    const comments = JSON.parse(localStorage.getItem('cn_comments') || '[]');
    const newComment = { name, text, time: new Date().toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) };
    comments.unshift(newComment);
    localStorage.setItem('cn_comments', JSON.stringify(comments.slice(0, 50)));
    renderComments(comments, list);
    form.reset();
  });
}

function renderComments(comments, list) {
  if (comments.length === 0) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-3);font-size:13px;">No comments yet. Be the first to share your thoughts!</div>';
    return;
  }
  list.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-avatar">${c.name[0].toUpperCase()}</div>
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-name">${c.name}</span>
          <span class="comment-time">${c.time}</span>
        </div>
        <div class="comment-text">${c.text}</div>
      </div>
    </div>
  `).join('');
}

// ── SOCIAL SHARE ──
function share(platform) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const links = {
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    whatsapp: `https://wa.me/?text=${title}%20${url}`
  };
  if (links[platform]) window.open(links[platform], '_blank', 'width=600,height=400');
}

// ── COPY LINK ──
function copyLink() {
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById('copyBtn');
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = '🔗 Copy Link', 2000); }
  });
}

// ── INIT ALL ──
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setDate();
  initMobileNav();
  initScrollTop();
  setActiveNav();
  initSearch();
  initWeather();
  initComments();
});

/* CLARIXNEWS VISITOR TRACKER v6 — Edge Function based */
(function(){
  'use strict';
  var TRACK_URL = 'https://lovhjdghpchoikwbumid.supabase.co/functions/v1/track-visit';
  var PUBLIC_KEY = 'sb_publishable_aHEkPJ2b5AbkN-3DAoj76Q_RA4ZqWcA';

  function storageGet(key){
    try { return localStorage.getItem(key); } catch(e) { return null; }
  }
  function storageSet(key,value){
    try { localStorage.setItem(key,value); } catch(e) {}
  }
  function makeId(prefix){
    return prefix + '_' + Math.random().toString(36).slice(2,10) + Date.now().toString(36);
  }
  function getVisitorId(){
    var id=storageGet('cn_visitor_id');
    if(!id){ id=makeId('v'); storageSet('cn_visitor_id',id); }
    return id;
  }
  function getSessionId(){
    var now=Date.now(), session=null;
    try { session=JSON.parse(storageGet('cn_sess')||'null'); } catch(e){}
    if(!session||!session.id||(now-session.t)>30*60*1000){
      session={id:makeId('s'),t:now};
    } else { session.t=now; }
    storageSet('cn_sess',JSON.stringify(session));
    return session.id;
  }
  function isFirstTouch(){
    var seen=storageGet('cn_seen');
    if(seen) return false;
    storageSet('cn_seen',String(Date.now()));
    return true;
  }
  function deviceInfo(){
    var ua=navigator.userAgent||'';
    return {
      device:/iPad|Tablet/i.test(ua)?'Tablet':(/Mobile|Android|iPhone/i.test(ua)?'Mobile':'Desktop'),
      browser:/Firefox/i.test(ua)?'Firefox':(/Edg/i.test(ua)?'Edge':(/Chrome/i.test(ua)?'Chrome':(/Safari/i.test(ua)?'Safari':'Unknown')))
    };
  }
  function articleId(){
    if(location.pathname.indexOf('article')===-1) return null;
    try { return new URLSearchParams(location.search).get('id'); } catch(e){ return null; }
  }
  async function postVisit(){
    if(location.pathname.toLowerCase().indexOf('dashboard')!==-1) return;
    var info=deviceInfo();
    var payload={
      visitor_id:getVisitorId(),
      session_id:getSessionId(),
      country:'Unknown',
      city:'Unknown',
      page:location.pathname||'/',
      device:info.device,
      browser:info.browser,
      is_returning:!isFirstTouch()
    };
    try {
      var response=await fetch(TRACK_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':PUBLIC_KEY},
        body:JSON.stringify(payload),
        keepalive:true
      });
      if(!response.ok){
        var detail='';
        try { detail=await response.text(); } catch(e){}
        console.error('[ClarixNews tracker] request failed:',response.status,detail);
        return;
      }
      console.info('[ClarixNews tracker] visit recorded');
    } catch(error) {
      console.error('[ClarixNews tracker] network error:',error);
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',postVisit,{once:true});
  } else {
    postVisit();
  }
})();
