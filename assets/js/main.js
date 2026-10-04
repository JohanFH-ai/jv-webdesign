/* JV Webdesign: gedrag voor de statische homepage.
   1. Mobiel menu  2. Contactformulier  3. Jaartal in de footer  4. Boekingskalender */
(function () {
  'use strict';

  /* 1. Mobiel menu (onder 900px verbergt jv-webdesign.css de links) */
  var nav = document.querySelector('.jv-nav');
  var toggle = nav && nav.querySelector('.jv-nav__toggle');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });
    nav.querySelectorAll('.jv-nav__links a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* 2. Contactformulier
     Verstuurt als JSON naar Formspree (data-endpoint). _gotcha is Formspree's honeypot.
     Zolang de Formspree-ID nog een placeholder is, wordt er niets verstuurd. */
  var form = document.querySelector('.jv-form');
  if (form) {
    var status = form.querySelector('.jv-form__status');
    var button = form.querySelector('button[type="submit"]');

    function showStatus(text, type) {
      status.textContent = text;
      status.className = 'jv-form__status is-' + type;
      status.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var invalid = Array.prototype.filter.call(form.elements, function (el) {
        var bad = el.willValidate && !el.checkValidity();
        if (el.willValidate && el.type !== 'checkbox') el.setAttribute('aria-invalid', bad ? 'true' : 'false');
        return bad;
      });
      if (invalid.length) {
        showStatus('Vul de verplichte velden in en ga akkoord met de privacyverklaring.', 'error');
        invalid[0].focus();
        return;
      }

      // Honeypot ingevuld: doe alsof het gelukt is, verstuur niets
      if (form.elements._gotcha && form.elements._gotcha.value) {
        form.reset();
        showStatus('Bedankt! We antwoorden binnen één werkdag.', 'success');
        return;
      }

      var endpoint = form.getAttribute('data-endpoint');
      if (!endpoint || endpoint.indexOf('[') !== -1) {
        showStatus('Het formulier is nog niet gekoppeld. Mail of bel ons gerust, we antwoorden binnen één werkdag.', 'error');
        return;
      }

      var data = {};
      new FormData(form).forEach(function (value, key) {
        if (key !== '_gotcha') data[key] = value;
      });

      button.setAttribute('aria-busy', 'true');
      button.disabled = true;

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error(res.status);
          form.reset();
          showStatus('Bedankt! We antwoorden binnen één werkdag.', 'success');
        })
        .catch(function () {
          showStatus('Versturen is niet gelukt. Probeer het opnieuw of mail ons rechtstreeks.', 'error');
        })
        .finally(function () {
          button.removeAttribute('aria-busy');
          button.disabled = false;
        });
    });

    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }

  /* 3. Jaartal */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* 4. Boekingskalender: Cal.com inline-embed, pas geladen na een klik (GDPR).
     Instellingen staan op .jv-booking__placeholder: data-cal-link en data-cal-origin. */
  var calBox = document.querySelector('[data-cal-link]');
  var calButton = calBox && calBox.querySelector('[data-cal-load]');
  if (calButton) {
    var calLink = calBox.getAttribute('data-cal-link');
    var calOrigin = (calBox.getAttribute('data-cal-origin') || 'https://app.cal.com').replace(/\/$/, '');
    var calTarget = document.getElementById('cal-inline');
    var calLoader = document.querySelector('.jv-booking__loading');

    if (!calLink || calLink.indexOf('[') !== -1) {
      calButton.hidden = true;
      calBox.querySelector('.jv-body').hidden = true;
      calBox.querySelector('.jv-small').textContent = 'De online agenda is nog niet gekoppeld. Mail of bel ons voor een afspraak.';
    } else {
      calButton.addEventListener('click', function () {
        calBox.hidden = true;
        calTarget.hidden = false;
        calLoader.hidden = false;

        // Officiële Cal.com-loader (embed.js), met het origin uit data-cal-origin
        (function (C, A, L) {
          var p = function (a, ar) { a.q.push(ar); };
          var d = C.document;
          C.Cal = C.Cal || function () {
            var cal = C.Cal; var ar = arguments;
            if (!cal.loaded) {
              cal.ns = {}; cal.q = cal.q || [];
              var s = d.head.appendChild(d.createElement('script'));
              s.src = A;
              s.onerror = function () {
                calLoader.hidden = true;
                calTarget.innerHTML = '';
                var msg = d.createElement('p');
                msg.className = 'jv-small';
                msg.innerHTML = 'De agenda kon niet geladen worden. <a href="' + calOrigin.replace('app.', '') + '/' + calLink + '">Open de agenda op Cal.com</a> of mail ons.';
                calTarget.appendChild(msg);
              };
              cal.loaded = true;
            }
            if (ar[0] === L) {
              var api = function () { p(api, arguments); };
              var namespace = ar[1];
              api.q = api.q || [];
              if (typeof namespace === 'string') {
                cal.ns[namespace] = cal.ns[namespace] || api;
                p(cal.ns[namespace], ar);
                p(cal, ['initNamespace', namespace]);
              } else p(cal, ar);
              return;
            }
            p(cal, ar);
          };
        })(window, calOrigin + '/embed/embed.js', 'init');

        Cal('init', 'kennismaking', { origin: calOrigin });
        Cal.ns.kennismaking('ui', {
          theme: 'dark',
          cssVarsPerTheme: { dark: { 'cal-brand': '#5b3ff6' }, light: { 'cal-brand': '#4f32e6' } },
          hideEventTypeDetails: false,
          layout: 'month_view'
        });
        Cal.ns.kennismaking('on', {
          action: 'linkReady',
          callback: function () {
            calLoader.hidden = true;
          }
        });
        Cal.ns.kennismaking('inline', {
          elementOrSelector: '#cal-inline',
          calLink: calLink,
          config: { layout: 'month_view', theme: 'dark' }
        });
      });
    }
  }
})();
