/* ============================================================
   CLARIXNEWS — SHARED JAVASCRIPT (v2.1 - Hardened)
   ============================================================ */

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('cnTheme'); } catch (_) {}
  const theme = saved === 'light' || saved === 'dark' ? saved : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeBtn(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('cnTheme', next); } catch (_) {}
  updateThemeBtn(next);
}

function updateThemeBtn(theme) {
  const btn = document.getElementById('themeBtn');
  if (!btn) return;
  btn.textContent = theme === 'dark' ? '☀ Light' : '🌙 Dark';
  btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
}

function setDate() {
  const el = document.getElementById('currentDate');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).toUpperCase();
}

function initMobileNav() {
  const btn = document.getElementById('mobileNavBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  const closeMenu = () => {
    links.classList.remove('open');
    document.body.style.overflow = '';
    btn.textContent = '☰';
    btn.setAttribute('aria-expanded', 'false');
  };

  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    document.body.style.overflow = open ? 'hidden' : '';
    btn.textContent = open ? '✕' : '☰';
    btn.setAttribute('aria-expanded', String(open));
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', e => {
    if (links.classList.contains('open') && !links.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && links.classList.contains('open')) closeMenu();
  });
}

function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    const hrefPage = href.split('?')[0].split('#')[0].split('/').pop();
    if (hrefPage === page) a.classList.add('active');
  });
}

function initSearch() {
  const btn = document.getElementById('searchBtn');
  const overlay = document.getElementById('searchOverlay');
  const close = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const form = document.getElementById('searchForm');
  if (!btn || !overlay) return;

  const closeSearch = () => {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  };
  const openSearch = () => {
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(() => input && input.focus(), 50);
  };

  btn.addEventListener('click', openSearch);
  if (close) close.addEventListener('click', closeSearch);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const q = input ? input.value.trim() : '';
    if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
  });
}

async function initWeather() {
  const el = document.getElementById('weatherWidget');
  if (!el || location.pathname.endsWith('index.html') || location.pathname === '/') return;

  const cities = [
    { name: 'Karachi', lat: 24.8607, lon: 67.0011 },
    { name: 'London', lat: 51.5074, lon: -0.1278 },
    { name: 'New York', lat: 40.7128, lon: -74.0060 },
    { name: 'Dubai', lat: 25.2048, lon: 55.2708 }
  ];

  const iconFor = (code, isDay) => {
    if (code <= 1) return isDay ? '☀' : '🌙';
    if (code === 2) return '⛅';
    if (code === 3) return '☁';
    if (code === 45 || code === 48) return '🌫';
    if (code >= 51 && code <= 67) return '🌧';
    if (code >= 71 && code <= 86) return '❄';
    if (code >= 95) return '⛈';
    return '🌤';
  };

  el.innerHTML = cities.map(c => `<div class="weather-item"><span class="weather-city">${c.name}</span><span class="weather-icon">⏳</span><span class="weather-temp">--°C</span></div>`).join('');

  const results = await Promise.all(cities.map(async c => {
    try {
      const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code,is_day&timezone=auto`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      return data && data.current ? data.current : null;
    } catch (e) {
      console.warn(`Weather unavailable for ${c.name}`, e);
      return null;
    }
  }));

  el.innerHTML = cities.map((c, i) => {
    const current = results[i];
    if (!current) return `<div class="weather-item"><span class="weather-city">${c.name}</span><span class="weather-icon">--</span><span class="weather-temp">--°C</span></div>`;
    const temp = Number(current.temperature_2m);
    const icon = iconFor(Number(current.weather_code), Number(current.is_day) !== 0);
    return `<a href="weather.html?lat=${c.lat}&lon=${c.lon}&name=${encodeURIComponent(c.name)}" class="weather-item" style="text-decoration:none;color:inherit"><span class="weather-city">${c.name}</span><span class="weather-icon">${icon}</span><span class="weather-temp">${Number.isFinite(temp) ? Math.round(temp) : '--'}°C</span></a>`;
  }).join('');
}

function readComments() {
  try {
    const data = JSON.parse(localStorage.getItem('cn_comments') || '[]');
    return Array.isArray(data) ? data : [];
  } catch (_) {
    try { localStorage.removeItem('cn_comments'); } catch (_) {}
    return [];
  }
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[ch]);
}

function initComments() {
  const form = document.getElementById('commentForm');
  const list = document.getElementById('commentList');
  if (!form || !list) return;

  renderComments(readComments(), list);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nameEl = document.getElementById('commentName');
    const textEl = document.getElementById('commentText');
    const name = nameEl ? nameEl.value.trim().slice(0, 80) : '';
    const text = textEl ? textEl.value.trim().slice(0, 2000) : '';
    if (!name || !text) return;

    const comments = readComments();
    comments.unshift({
      name, text,
      time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    const limited = comments.slice(0, 50);
    try {
      localStorage.setItem('cn_comments', JSON.stringify(limited));
      renderComments(limited, list);
      form.reset();
    } catch (e) {
      console.error('Could not save comment:', e);
    }
  });
}

function renderComments(comments, list) {
  if (!Array.isArray(comments) || comments.length === 0) {
    list.textContent = 'No comments yet. Be the first to share your thoughts!';
    return;
  }
  list.innerHTML = comments.map(c => {
    const name = escapeHTML(c.name || 'Anonymous');
    const text = escapeHTML(c.text || '');
    const time = escapeHTML(c.time || '');
    const initial = escapeHTML((String(c.name || 'A').trim()[0] || 'A').toUpperCase());
    return `<div class="comment-item"><div class="comment-avatar">${initial}</div><div class="comment-body"><div class="comment-header"><span class="comment-name">${name}</span><span class="comment-time">${time}</span></div><div class="comment-text">${text}</div></div></div>`;
  }).join('');
}

function share(platform) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  const links = {
    twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    whatsapp: `https://wa.me/?text=${title}%20${url}`
  };
  if (links[platform]) window.open(links[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
}

async function copyLink() {
  const btn = document.getElementById('copyBtn');
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(window.location.href);
    } else {
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (!ok) throw new Error('Clipboard copy was rejected');
    }
    if (btn) {
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = '🔗 Copy Link'; }, 2000);
    }
  } catch (e) {
    console.error('Copy link failed:', e);
    if (btn) {
      btn.textContent = 'Copy failed';
      setTimeout(() => { btn.textContent = '🔗 Copy Link'; }, 2000);
    }
  }
}

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
