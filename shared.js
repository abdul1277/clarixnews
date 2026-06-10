/* ============================================================
   CLARIXNEWS — SHARED JAVASCRIPT
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
  btn.addEventListener('click', () => links.classList.toggle('open'));
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

  // Simulated weather data (in real use, connect OpenWeatherMap free API)
  const cities = [
    { city: 'Karachi', temp: 34, icon: '☀', cond: 'Sunny' },
    { city: 'London', temp: 16, icon: '⛅', cond: 'Cloudy' },
    { city: 'New York', temp: 24, icon: '🌤', cond: 'Partly Cloudy' },
    { city: 'Dubai', temp: 41, icon: '☀', cond: 'Hot' },
  ];

  el.innerHTML = cities.map(c =>
    `<div class="weather-item">
      <span class="weather-city">${c.city}</span>
      <span class="weather-icon">${c.icon}</span>
      <span class="weather-temp">${c.temp}°C</span>
    </div>`
  ).join('');
}

// ── COMMENTS (SIMULATED) ──
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
  const base = [
    { name: 'Ahmad Raza', text: 'Very informative article. ClarixNews always delivers quality journalism.', time: 'Jun 7, 2026' },
    { name: 'Sarah Johnson', text: 'Great coverage! This is exactly the kind of in-depth analysis we need.', time: 'Jun 7, 2026' },
    { name: 'Bilal Khan', text: 'Excellent perspective. Sharing this with my colleagues.', time: 'Jun 6, 2026' },
  ];
  const all = [...comments, ...base];
  list.innerHTML = all.map(c => `
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
    whatsapp: `https://wa.me/?text=${title}%20${url}`,
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
