/* ============================================================
   contact.js — the message box.

   The site is static, so there is no server to post to. Instead
   the form validates, then hands a fully composed message to the
   visitor's own mail app. Honest about what it does, and it
   works on a plain file host.

   To switch to a hosted form service later: POST the same
   payload in send() and keep the validation above it.
   ============================================================ */

window.CONTACT = (function () {
  'use strict';

  var UTIL = window.UTIL;
  var SITE = window.SITE;

  function setError(input, message) {
    var slot = document.getElementById(input.id + '-error');
    if (slot) slot.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validate(fields) {
    var valid = true;

    if (!fields.name.value.trim()) {
      setError(fields.name, 'Add a name so the reply knows where to go.');
      valid = false;
    } else {
      setError(fields.name, '');
    }

    var email = fields.email.value.trim();
    if (!email) {
      setError(fields.email, 'An email address is needed to reply.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError(fields.email, 'That address looks incomplete.');
      valid = false;
    } else {
      setError(fields.email, '');
    }

    if (fields.message.value.trim().length < 12) {
      setError(fields.message, 'A sentence or two about the work helps.');
      valid = false;
    } else {
      setError(fields.message, '');
    }

    return valid;
  }

  function compose(fields) {
    var subject = '[Portfolio] ' + fields.topic.value + ' \u2014 ' + fields.name.value.trim();
    var body = [
      fields.message.value.trim(),
      '',
      '\u2014',
      'From: ' + fields.name.value.trim(),
      'Reply to: ' + fields.email.value.trim(),
      'Topic: ' + fields.topic.value
    ].join('\n');

    return 'mailto:' + SITE.identity.email +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  function init() {
    var form = document.getElementById('contact-form');
    if (form) {
      var fields = {
        name: document.getElementById('contact-name'),
        email: document.getElementById('contact-email'),
        topic: document.getElementById('contact-topic'),
        message: document.getElementById('contact-message')
      };

      form.addEventListener('submit', function (event) {
        event.preventDefault();

        if (!validate(fields)) {
          window.SFX.error();
          var firstBad = form.querySelector('[aria-invalid="true"]');
          if (firstBad) firstBad.focus();
          return;
        }

        window.SFX.confirm();
        window.location.href = compose(fields);
        form.reset();
        Object.keys(fields).forEach(function (key) { setError(fields[key], ''); });
        UTIL.toast('Opening your mail app with the message ready.', 3200);
      });

      Object.keys(fields).forEach(function (key) {
        fields[key].addEventListener('input', function () { setError(fields[key], ''); });
      });
    }

    UTIL.qsa('.social-icon').forEach(function (img) {
      img.addEventListener('error', function () {
        var fallback = document.createElement('span');
        fallback.className = 'icon-fallback';
        fallback.setAttribute('aria-hidden', 'true');
        fallback.textContent = img.getAttribute('data-fallback') || '';
        img.replaceWith(fallback);
      }, { once: true });
      // src is assigned only after the listener exists, so a request that
      // fails immediately (offline, blocked, DNS failure) can't fire the
      // error event before anything is listening for it.
      img.src = img.getAttribute('data-src');
    });

    UTIL.qsa('[data-copy]').forEach(function (button) {
      button.addEventListener('click', function () {
        var value = button.getAttribute('data-copy');
        UTIL.copy(value).then(function () {
          window.SFX.confirm();
          UTIL.toast('Copied: ' + value, 2400);
        }).catch(function () {
          window.SFX.error();
          UTIL.toast('Copy failed \u2014 select the text instead.', 2600);
        });
      });
    });
  }

  return { init: init };
})();
