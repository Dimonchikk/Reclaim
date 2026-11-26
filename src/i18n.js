// Reclaim — мови інтерфейсу: українська (оригінал), російська, англійська.
// Інтерфейс пишеться українською; перекладач замінює готові тексти на сторінці
// за словником (src/lang/*.js), а рядки з числами чи назвами — за шаблонами.
(function () {
  'use strict';
  var LANGS = { uk: 'uk-UA', ru: 'ru-RU', en: 'en-US' };
  var lang = 'uk';
  try { lang = localStorage.getItem('lang') || 'uk'; } catch (_) {}
  if (!LANGS[lang]) lang = 'uk';
  document.documentElement.lang = lang;

  var pack = (window.RECLAIM_LANG || {})[lang] || { dict: {}, patterns: [] };
  var dict = pack.dict || {};
  var patterns = (pack.patterns || []).map(function (p) { return [new RegExp('^' + p[0] + '$'), p[1]]; });
  var missed = {};
  var done = new Set(Object.keys(dict).map(function (k) { return dict[k]; })); // уже перекладені тексти
  var mine = new WeakMap(); // вузли, які ми вже переклали, і що саме туди записали

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function tr(s) {
    var k = norm(s);
    if (!k || lang === 'uk') return null;
    if (Object.prototype.hasOwnProperty.call(dict, k)) return dict[k];
    if (done.has(k)) return null;
    for (var i = 0; i < patterns.length; i++) {
      var m = patterns[i][0].exec(k);
      if (m) return patterns[i][1].replace(/\$(\d)/g, function (_, n) { var v = m[+n] || ''; return tr(v) || v; });
    }
    if (/[А-Яа-яІіЇїЄєҐґ]/.test(k)) missed[k] = true; // лише справжній текст, не номери й коди
    return null;
  }
  function textNode(n) {
    if (mine.get(n) === n.nodeValue) return;
    var p = n.parentNode;
    if (!p || p.closest && p.closest('[translate="no"], script, style')) return;
    var v = n.nodeValue, t = tr(v);
    if (t == null) return;
    var lead = v.match(/^\s*/)[0], tail = v.match(/\s*$/)[0];
    n.nodeValue = lead + t + tail;
    mine.set(n, n.nodeValue);
  }
  var ATTRS = ['placeholder', 'title', 'alt', 'aria-label'];
  function element(el) {
    if (el.closest && el.closest('[translate="no"]')) return;
    for (var i = 0; i < ATTRS.length; i++) {
      var a = el.getAttribute && el.getAttribute(ATTRS[i]);
      if (a) { var t = tr(a); if (t != null && t !== a) el.setAttribute(ATTRS[i], t); }
    }
  }
  function walk(root) {
    if (lang === 'uk' || !root) return;
    if (root.nodeType === 3) return textNode(root);
    if (root.nodeType !== 1) return;
    element(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    var n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) textNode(n); else element(n); }
  }

  window.I18N = {
    lang: lang,
    locale: LANGS[lang],
    langs: Object.keys(LANGS),
    t: function (s) { var t = tr(s); return t == null ? s : t; },
    missed: function () { return Object.keys(missed); },
    set: function (l) {
      if (!LANGS[l] || l === lang) return;
      try { localStorage.setItem('lang', l); } catch (_) {}
      location.reload();
    },
  };
  document.title = window.I18N.t(document.title);

  function start() {
    walk(document.body);
    new MutationObserver(function (list) {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === 'characterData') textNode(m.target);
        else if (m.type === 'attributes') element(m.target);
        else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (lang !== 'uk') {
    if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  }
})();
