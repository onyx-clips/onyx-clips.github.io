// The contact form on the legal notice pages: sends the message to the Onyx server (its HTTPS address, which
// tools/server/build-pages.ps1 puts into the form's action) and says right here whether it arrived, in the
// page's language (<html lang>). Without JavaScript the form posts itself and the server answers with a short page of its own.
(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  if (!form || !window.fetch) return;
  var status = form.querySelector('.contact-status');
  var button = form.querySelector('button[type="submit"]');
  var lang = (document.documentElement.lang || 'de').slice(0, 2);
  var TEXTS = {
    de: {
      sent: 'Danke! Deine Nachricht ist angekommen. Wir antworten dir an {0}.',
      busy: 'Gerade zu viele Nachrichten. Versuch es in einer Stunde noch einmal oder schreib uns per E-Mail.',
      check: 'Bitte prüf deine E-Mail-Adresse und die Nachricht (mindestens 10 Zeichen).',
      failed: 'Das hat nicht geklappt. Bitte schreib uns per E-Mail.',
      offline: 'Der Server ist gerade nicht erreichbar. Bitte schreib uns per E-Mail.'
    },
    en: {
      sent: 'Thanks! Your message has arrived. We\'ll answer you at {0}.',
      busy: 'Too many messages right now. Try again in an hour or write to us by e-mail.',
      check: 'Please check your e-mail address and the message (at least 10 characters).',
      failed: 'That didn\'t work. Please write to us by e-mail.',
      offline: 'The server can\'t be reached right now. Please write to us by e-mail.'
    },
    ru: {
      sent: 'Спасибо! Сообщение дошло. Мы ответим тебе на {0}.',
      busy: 'Сейчас слишком много сообщений. Попробуй через час или напиши нам по e-mail.',
      check: 'Проверь e-mail и сообщение (не меньше 10 символов).',
      failed: 'Не получилось. Напиши нам, пожалуйста, по e-mail.',
      offline: 'Сервер сейчас недоступен. Напиши нам, пожалуйста, по e-mail.'
    }
  };
  var text = TEXTS[lang] || TEXTS.en;
  function field(name) { return form.elements.namedItem(name); }

  function say(message, ok) {
    status.textContent = message;
    status.className = 'contact-status ' + (ok ? 'is-ok' : 'is-error');
    status.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      name: field('name').value.trim(),
      email: field('email').value.trim(),
      message: field('message').value.trim(),
      website: field('website').value
    };
    button.disabled = true;
    status.hidden = true;
    fetch(form.action, {
      method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (r.ok) {
        form.reset();
        say(text.sent.replace('{0}', data.email), true);
        return;
      }
      return r.json().catch(function () { return {}; }).then(function (answer) {
        // the server explains in German: on the German page as it is, otherwise in the page's language
        if (r.status === 429) say(text.busy, false);
        else if (answer && answer.error && lang === 'de') say(answer.error, false);
        else if (r.status === 400) say(text.check, false);
        else say(text.failed, false);
      });
    }).catch(function () {
      say(text.offline, false);
    }).then(function () { button.disabled = false; });
  });
})();
