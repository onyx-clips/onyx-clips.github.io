// Changing the language (EN, DE, RU at the top right): the other page opens at the same spot, with a quiet
// crossfade (view transition, site.css) in which the white pill slides over to the new language. Nothing on
// it rises in again, and the video in the phone goes on where it was. Loaded in <head>, before the page is
// drawn; the page waits for its footer (<link rel="expect" href="#foot" blocking="render">), so the spot is
// set before the first frame. Browsers without view transitions just open the page at that spot.
(function () {
  'use strict';
  var KEY = 'onyx.langSwitch';
  var html = document.documentElement;

  // The blocks a page is made of, the same in every language: the spot is kept as "this block, this far in"
  function blocks() { return document.querySelectorAll('main > *, body > footer'); }
  function line() { return Math.round(window.innerHeight / 3); } // where the eye is: a third down

  var spot = null;
  try {
    spot = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    sessionStorage.removeItem(KEY);
  } catch (e) { spot = null; }
  if (spot && (Date.now() - spot.t > 10000 || spot.to !== location.pathname)) spot = null;
  if (spot) html.classList.add('lang-switched'); // site.js: everything shows at once, nothing rises in

  var restored = false;
  function restore() {
    if (!spot || restored) return;
    restored = true;
    var el = spot.i >= 0 ? blocks()[spot.i] : null;
    if (el) {
      var r = el.getBoundingClientRect();
      var y = window.scrollY + r.top + spot.f * r.height - line();
      window.scrollTo({ top: Math.max(0, Math.round(y)), behavior: 'instant' });
    }
    // The video loads right from where it was (a start time in its address), so its first seconds do not
    // flash up before it jumps there
    var video = document.querySelector('.phone-video');
    var src = video && video.getAttribute('src');
    if (src && spot.h > 0) video.src = src.split('#')[0] + '#t=' + spot.h.toFixed(2);
  }
  // Right before the first frame (Chrome, Edge, Safari), otherwise as soon as the page is read
  window.addEventListener('pagereveal', restore);
  document.addEventListener('DOMContentLoaded', restore);

  // A click on another language remembers the spot for the page that comes next (a new tab starts at the top)
  document.addEventListener('click', function (e) {
    var a = e.target instanceof Element ? e.target.closest('.langs a[href]') : null;
    if (!a || a.getAttribute('aria-current') === 'page' || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var data = { t: Date.now(), to: new URL(a.href, location.href).pathname, i: -1, f: 0, h: 0 };
    if (window.scrollY > 4) {
      var y = line();
      var list = blocks();
      for (var i = 0; i < list.length; i++) {
        var r = list[i].getBoundingClientRect();
        if (r.bottom > y) {
          data.i = i;
          data.f = r.height > 0 ? Math.min(1, Math.max(0, (y - r.top) / r.height)) : 0;
          break;
        }
      }
    }
    var video = document.querySelector('.phone-video');
    if (video && !video.paused) data.h = video.currentTime;
    try { sessionStorage.setItem(KEY, JSON.stringify(data)); } catch (err) { /* then it simply starts at the top */ }
  });
})();
