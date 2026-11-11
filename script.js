(function () {
  'use strict';
  var cfg = window.RECLAIM || {};
  var REPO = cfg.repo || '';

  // На GitHub Pages беремо логін і репозиторій з адреси.
  var m = location.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
  if (m) {
    var first = location.pathname.split('/').filter(Boolean)[0];
    REPO = m[1] + '/' + (first && first.indexOf('.') < 0 ? first : m[1] + '.github.io');
  }

  // ----- посилання -----
  var base = 'https://github.com/' + REPO;
  document.querySelectorAll('.dl').forEach(function (a) { a.href = base + '/releases/latest/download/' + cfg.setup; });
  document.querySelectorAll('.rel').forEach(function (a) { a.href = base + '/releases'; });
  document.querySelectorAll('.repo').forEach(function (a) { a.href = base; });
  document.querySelectorAll('.notice').forEach(function (a) { a.href = base + '/blob/main/bin/NOTICE.txt'; });

  function setVer(v) { document.querySelectorAll('.ver').forEach(function (s) { s.textContent = v; }); }
  setVer(cfg.version || '');
  // Номер версії береться з останнього опублікованого релізу, сайт правити не треба.
  if (window.fetch) {
    fetch('https://api.github.com/repos/' + REPO + '/releases/latest')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { if (j && j.tag_name) setVer(String(j.tag_name).replace(/^v/i, '')); })
      .catch(function () {});
  }

  // ----- тема: світла або темна; поки не обрано, як у системі -----
  var root = document.documentElement, mq = window.matchMedia('(prefers-color-scheme: dark)');
  function chosen() { try { var t = localStorage.getItem('theme'); return t === 'light' || t === 'dark' ? t : null; } catch (e) { return null; } }
  function saved() { return chosen() || (mq.matches ? 'dark' : 'light'); }
  function apply(mode) {
    var dark = mode === 'dark';
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    document.querySelectorAll('.theme button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.t === mode); });
    document.querySelectorAll('img.themed').forEach(function (im) {
      var src = 'screenshots/' + im.getAttribute('data-shot') + (dark ? '-dark' : '') + '.png';
      if (im.getAttribute('src') !== src) im.src = src;
    });
    if (window.__gal) window.__gal();
  }
  document.querySelectorAll('.theme button').forEach(function (b) {
    b.addEventListener('click', function () {
      try { localStorage.setItem('theme', b.dataset.t); } catch (e) {}
      apply(b.dataset.t);
    });
  });
  function sys() { if (!chosen()) apply(saved()); }
  (mq.addEventListener ? mq.addEventListener('change', sys) : mq.addListener(sys));

  // ----- галерея -----
  var shots = [
    { n: 'home',       c: 'Головна: оберіть, що сталося, і Reclaim проведе офіційним шляхом Apple.' },
    { n: 'device',     c: 'Мій iPhone: що готово, а чого бракує, плюс модель, версія iOS, серійний номер та IMEI.' },
    { n: 'proof',      c: 'Докази власності: чек-лист для підтримки Apple і PDF-пакет із серійним номером та IMEI.' },
    { n: 'activation', c: 'Блокування активації: що це, чому воно є і як його знімає власник.' },
    { n: 'reset',      c: 'Скидання через режим відновлення: кроки для різних моделей. Саме скидання виконує програма Apple.' },
    { n: 'about',      c: 'Про застосунок: версія, вбудовані утиліти, стан драйвера й видалення.' }
  ];
  var cur = 0, img = document.getElementById('galImg'), cap = document.getElementById('galCap');
  function show(i) {
    cur = i;
    var s = shots[i], dark = root.getAttribute('data-theme') === 'dark';
    var src = 'screenshots/' + s.n + (dark ? '-dark' : '') + '.png';
    if (img.getAttribute('src') !== src) {
      img.style.opacity = 0;
      setTimeout(function () { img.src = src; img.onload = function () { img.style.opacity = 1; }; }, 150);
    }
    img.alt = s.c; cap.textContent = s.c;
    document.querySelectorAll('.tabs button').forEach(function (b) { b.setAttribute('aria-selected', +b.dataset.i === i); });
  }
  window.__gal = function () { show(cur); };
  document.querySelectorAll('.tabs button').forEach(function (b) {
    b.addEventListener('click', function () { show(+b.dataset.i); });
  });
  apply(saved());

  // ----- плавна поява -----
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
})();
