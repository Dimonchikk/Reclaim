(function () {
  'use strict';
  var cfg = window.RECLAIM || {};
  var owner = cfg.owner, repo = cfg.repo;

  // На GitHub Pages: https://OWNER.github.io/REPO/ — беремо значення з адреси.
  var m = location.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
  if (m) {
    owner = m[1];
    var seg = location.pathname.split('/').filter(Boolean)[0];
    repo = seg || (owner + '.github.io');
  }

  var base = 'https://github.com/' + owner + '/' + repo;
  var links = {
    repo: base,
    release: base + '/releases/latest',
    notice: base + '/blob/main/bin/NOTICE.txt',
  };
  document.querySelectorAll('[data-link]').forEach(function (a) { a.href = links[a.dataset.link] || '#'; });
  document.querySelectorAll('[data-version]').forEach(function (el) { el.textContent = cfg.version || ''; });

  // Тема: системна, світла, темна; вибір запам'ятовується.
  var root = document.documentElement;
  function mark() {
    var t = root.getAttribute('data-theme') || 'system';
    document.querySelectorAll('[data-theme-set]').forEach(function (b) {
      var on = b.dataset.themeSet === t;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  document.querySelectorAll('[data-theme-set]').forEach(function (b) {
    b.addEventListener('click', function () {
      root.setAttribute('data-theme', b.dataset.themeSet);
      try { localStorage.setItem('theme', b.dataset.themeSet); } catch (e) {}
      mark();
    });
  });
  mark();
})();
