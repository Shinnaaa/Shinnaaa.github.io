/* lang-switch.js — site-wide language switcher.
 *
 * The current language lives in <html data-lang="…">, set early by the inline
 * script in _includes/head.html so the page never flashes the wrong language.
 * CSS (_sass/_lang-switch.scss) does all showing/hiding of .lang-block elements
 * and highlights the active button; this script only changes the attribute.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'lang';
  var LANGS = ['zh', 'en', 'ja'];
  var HTML_LANG = { zh: 'zh-CN', en: 'en', ja: 'ja' };
  var root = document.documentElement;

  function writeStorage(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function applyLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', HTML_LANG[lang]);
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
  }

  function init() {
    applyLang(root.getAttribute('data-lang') || 'zh');

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.lang-btn');
      if (!btn) return;
      var lang = btn.getAttribute('data-lang');
      if (LANGS.indexOf(lang) === -1 || lang === root.getAttribute('data-lang')) return;
      writeStorage(lang);
      var swap = function () {
        applyLang(lang);
        // Nav labels change width; let the greedy nav re-measure what fits.
        window.dispatchEvent(new Event('resize'));
        document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
      };
      var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (document.startViewTransition && !reduceMotion) {
        document.startViewTransition(swap);
      } else {
        swap();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
