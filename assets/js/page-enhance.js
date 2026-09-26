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

    var lang = document.documentElement.getAttribute('data-lang') || 'en';
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

  /* ── Masthead nav overflow ────────────────────────────────────────── */

  // Replaces the theme's greedy-nav updateNav() (a global called by its resize
  // handler). The original remembered each item's width when hiding it and never
  // re-measured, so after a language switch or a late font load items stayed in
  // the dropdown although they fit. This version recomputes from scratch.
  function initNavOverflow() {
    var nav = document.getElementById('site-nav');
    if (!nav || !window.jQuery) return;
    var btn = nav.querySelector('button');
    var visible = nav.querySelector('.visible-links');
    var hidden = nav.querySelector('.hidden-links');

    window.updateNav = function () {
      while (hidden.firstElementChild) visible.appendChild(hidden.firstElementChild);
      btn.classList.add('hidden');
      if (visible.getBoundingClientRect().width > nav.getBoundingClientRect().width) {
        btn.classList.remove('hidden');
        var room = nav.getBoundingClientRect().width - btn.getBoundingClientRect().width - 30;
        while (visible.children.length && visible.getBoundingClientRect().width > room) {
          hidden.insertBefore(visible.lastElementChild, hidden.firstElementChild);
        }
      }
      if (!hidden.children.length) {
        hidden.classList.add('hidden');
        btn.classList.remove('close');
      }
      btn.setAttribute('count', hidden.children.length);
    };

    window.updateNav();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(window.updateNav);
  }

  function init() {
    initNavOverflow();
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
