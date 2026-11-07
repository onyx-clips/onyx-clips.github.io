// Onyx website: the newest version next to the download buttons, sections that rise in while
// scrolling, the hero video only playing while it is visible.
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // "Version 0.4.0 · 74 MB · Windows 10 und 11" from the server. On GitHub Pages
  // tools/server/build-pages.ps1 writes it into the page (data-static) and there is nothing to ask.
  var first = document.getElementById('releaseLine');
  if (!(first && first.hasAttribute('data-static'))) fetch('/api/release', { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (r) {
    if (!r || !r.version) return;
    var mb = r.size ? ' · ' + (r.size / 1048576).toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' MB' : '';
    var line = 'Version ' + r.version + mb + ' · Windows 10 und 11';
    ['releaseLine', 'releaseLine2'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = line;
    });
  }).catch(function () { /* the button still works */ });

  // Sections rise in once
  var targets = document.querySelectorAll('.step, .feature, .card, .perf-inner, .trust-card, .faq details, .download-card, .more li');
  if ('IntersectionObserver' in window) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        seen.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el) { el.classList.add('reveal'); seen.observe(el); });
  }

  // The hero video plays only while it is on screen (saves battery and data)
  var video = document.querySelector('.phone-video');
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
        else video.pause();
      });
    }, { threshold: 0.2 }).observe(video);
  }
})();
