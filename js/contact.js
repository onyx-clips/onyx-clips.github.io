// The contact form in the Impressum: sends the message to the Onyx server (its HTTPS address, which
// tools/server/build-pages.ps1 puts into the form's action) and says right here whether it arrived.
// Without JavaScript the form posts itself and the server answers with a short page of its own.
(function () {
  'use strict';
  var form = document.getElementById('contactForm');
  if (!form || !window.fetch) return;
  var status = form.querySelector('.contact-status');
  var button = form.querySelector('button[type="submit"]');
  function field(name) { return form.elements.namedItem(name); }

  function say(text, ok) {
    status.textContent = text;
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
        say('Danke! Deine Nachricht ist angekommen. Wir antworten dir an ' + data.email + '.', true);
        return;
      }
      return r.json().catch(function () { return {}; }).then(function (answer) {
        if (answer && answer.error) say(answer.error, false);
        else if (r.status === 429) say('Gerade zu viele Nachrichten. Versuch es in einer Stunde noch einmal oder schreib uns per E-Mail.', false);
        else say('Das hat nicht geklappt. Bitte schreib uns per E-Mail.', false);
      });
    }).catch(function () {
      say('Der Server ist gerade nicht erreichbar. Bitte schreib uns per E-Mail.', false);
    }).then(function () { button.disabled = false; });
  });
})();
