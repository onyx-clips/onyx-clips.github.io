// Onyx website: the newest version next to the download buttons, sections that rise in while
// scrolling, the hero video only playing while it is visible.
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // "Version 0.4.0 · 74 MB · Windows 10 and 11" from the server, in the page's language. On GitHub Pages
  // tools/server/build-pages.ps1 writes it into the page (data-static) and there is nothing to ask.
  var lang = (document.documentElement.lang || 'en').slice(0, 2);
  var LINE = {
    de: { version: 'Version', windows: 'Windows 10 und 11', locale: 'de-DE' },
    en: { version: 'Version', windows: 'Windows 10 and 11', locale: 'en-US' },
    ru: { version: 'Версия', windows: 'Windows 10 и 11', locale: 'ru-RU' }
  }[lang] || { version: 'Version', windows: 'Windows 10 and 11', locale: 'en-US' };
  var first = document.getElementById('releaseLine');
  if (!(first && first.hasAttribute('data-static'))) fetch('/api/release', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (r) {
    if (!r || !r.version) return;
    var mb = r.size ? ' · ' + (r.size / 1048576).toLocaleString(LINE.locale, { maximumFractionDigits: 0 }) + ' MB' : '';
    var line = LINE.version + ' ' + r.version + mb + ' · ' + LINE.windows;
    ['releaseLine', 'releaseLine2'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = line;
    });
  }).catch(function () { /* the button still works */ });

  // Sections rise in once (not after changing the language: that page was seen already, lang.js)
  var targets = document.querySelectorAll('.step, .showcase-frame, .feature, .perf-inner, .trust-card, .faq details, .download-card, .more li');
  if ('IntersectionObserver' in window && !document.documentElement.classList.contains('lang-switched')) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        seen.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { el.classList.add('reveal'); seen.observe(el); });
  }

  // The videos play only while they are on screen (saves battery and data; the showcase only loads then);
  // a click on the showcase stops it and starts it again
  document.querySelectorAll('.phone-video, .showcase-video').forEach(function (video) {
    var stopped = false;
    var play = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !stopped) play();
          else if (!e.isIntersecting) video.pause();
        });
      }, { threshold: 0.2 }).observe(video);
    } else if (!stopped) {
      play();
    }
    if (video.classList.contains('showcase-video')) {
      video.addEventListener('click', function () {
        stopped = !video.paused;
        if (stopped) video.pause(); else play();
      });
    }
  });
})();
