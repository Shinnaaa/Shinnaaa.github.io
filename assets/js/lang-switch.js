/* lang-switch.js — Trilingual post language switcher */
(function () {
  'use strict';

  var STORAGE_KEY = 'lang';
  var DEFAULT_LANG = 'zh';

  function readStorage() {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; }
    catch (e) { return DEFAULT_LANG; }
  }

  function writeStorage(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function applyLang(lang) {
    // Show/hide lang-block divs
    var blocks = document.querySelectorAll('.lang-block');
    blocks.forEach(function (el) {
      if (el.getAttribute('lang') === lang) {
        el.removeAttribute('hidden');
      } else {
        el.setAttribute('hidden', '');
      }
    });

    // Update active button state on ALL switchers on the page
    var buttons = document.querySelectorAll('.lang-btn');
    buttons.forEach(function (btn) {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('lang-btn--active');
      } else {
        btn.classList.remove('lang-btn--active');
      }
    });
  }

  function switchLang(lang) {
    writeStorage(lang);
    applyLang(lang);
  }

  function init() {
    var lang = readStorage();
    applyLang(lang);

    // Event delegation — works for all .lang-switcher elements on the page
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.lang-btn');
      if (!btn) return;
      var newLang = btn.getAttribute('data-lang');
      if (newLang) switchLang(newLang);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
