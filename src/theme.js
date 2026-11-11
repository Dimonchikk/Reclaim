// Тема застосовується до відмальовування сторінки, щоб не було миготіння.
(function () {
  var t = 'system';
  try { t = localStorage.getItem('theme') || 'system'; } catch (_) {}
  if (['system', 'light', 'dark'].indexOf(t) < 0) t = 'system';
  document.documentElement.setAttribute('data-theme', t);
})();
