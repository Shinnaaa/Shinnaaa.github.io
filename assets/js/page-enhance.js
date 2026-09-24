/* page-enhance.js — scroll reveal, table of contents, back-to-top.
 * Pure progressive enhancement: every page works without it.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll reveal ──────────────────────────────────────────────────── */

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ── Table of contents (long posts) ─────────────────────────────────── */

  var TOC_TITLE = { zh: '目录', en: 'Contents', ja: '目次' };
  var tocObserver = null;

  function visibleHeadings(content) {
    return Array.prototype.filter.call(content.querySelectorAll('h2'), function (h) {
      return h.offsetParent !== null;  // skip headings inside hidden language blocks
    });
  }

  function buildToc() {
    var content = document.querySelector('.page__content');
    var page = document.querySelector('.page');
    var old = document.querySelector('.page-toc');
    if (old) old.remove();
    if (tocObserver) tocObserver.disconnect();
    if (!content || !page) return;

    var headings = visibleHeadings(content);
    if (headings.length < 4) return;

    var lang = document.documentElement.getAttribute('data-lang') || 'zh';
    var nav = document.createElement('nav');
    nav.className = 'page-toc';
    nav.setAttribute('aria-label', TOC_TITLE[lang]);
    var list = '';
    headings.forEach(function (h, i) {
      if (!h.id) h.id = 'section-' + lang + '-' + (i + 1);
      list += '<li><a href="#' + h.id + '">' + h.textContent.trim() + '</a></li>';
    });
    nav.innerHTML = '<div class="page-toc__inner"><div class="page-toc__title">' + TOC_TITLE[lang] +
      '</div><ol>' + list + '</ol></div>';
    page.appendChild(nav);

    var links = nav.querySelectorAll('a');
    tocObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var idx = headings.indexOf(entry.target);
        links.forEach(function (a, i) { a.classList.toggle('is-active', i === idx); });
      });
    }, { rootMargin: '0px 0px -70% 0px' });
    headings.forEach(function (h) { tocObserver.observe(h); });
  }

  /* ── Back to top ────────────────────────────────────────────────────── */

  function initBackToTop() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    document.body.appendChild(btn);

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        btn.classList.toggle('is-visible', window.scrollY > 600);
        ticking = false;
      });
    }, { passive: true });
  }

  function init() {
    initReveal();
    buildToc();
    initBackToTop();
    document.addEventListener('langchange', buildToc);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
