/* Legacy: optional Google Ads measurement; WhatsApp clicks are secondary, not leads. */
(function () {
  'use strict';
  if (window.__legacyMeasurementLoaded) return;
  window.__legacyMeasurementLoaded = true;
  var storageKey = 'legacy-measurement-v1';
  var maxAge = 180 * 24 * 60 * 60 * 1000;
  var tagId = 'AW-18554666014';
  var eventId = tagId + '/UUXfCP726bEdEJ74xo9F';
  var enabled = false;
  var started = false;
  var lang = document.documentElement.lang;
  var en = lang === 'en', kk = lang === 'kk' || lang === 'kz';
  var copy = en ? {
    text: 'Allow Google Ads to measure visits and WhatsApp clicks? This uses cookies and online identifiers. Form contents are not sent.',
    yes: 'Allow measurement', no: 'Without measurement', settings: 'Measurement settings', title: 'Optional measurement'
  } : kk ? {
    text: 'Google Ads арқылы кірулер мен WhatsApp басуларын өлшеуге рұқсат бересіз бе? Cookie файлдары мен онлайн идентификаторлар қолданылады. Өтінім мәтіні жіберілмейді.',
    yes: 'Рұқсат беру', no: 'Өлшеусіз', settings: 'Өлшеу параметрлері', title: 'Қосымша өлшеу'
  } : {
    text: 'Разрешить Google Ads измерять посещения и клики по WhatsApp? Используются cookie и онлайн-идентификаторы. Содержимое формы не передаётся.',
    yes: 'Разрешить измерение', no: 'Без измерения', settings: 'Настройки измерения', title: 'Необязательное измерение'
  };
  function readChoice() {
    try {
      var result = JSON.parse(localStorage.getItem(storageKey));
      if (result && Date.now() - result.at < maxAge && (result.choice === 'yes' || result.choice === 'no')) return result.choice;
    } catch (_) {}
    return null;
  }
  function saveChoice(choice) {
    try { localStorage.setItem(storageKey, JSON.stringify({choice: choice, at: Date.now()})); } catch (_) {}
  }
  function consent(allow) {
    return {ad_storage: allow ? 'granted' : 'denied', analytics_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'};
  }
  function start() {
    if (started) return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', consent(true));
    window.gtag('js', new Date());
    var address = new URL(window.location.href);
    var location = address.origin + address.pathname;
    var clickIds = new URLSearchParams();
    ['gclid', 'gbraid', 'wbraid'].forEach(function (key) {
      if (address.searchParams.has(key)) clickIds.set(key, address.searchParams.get(key));
    });
    if (clickIds.toString()) location += '?' + clickIds.toString();
    var referrer = '';
    try { referrer = document.referrer ? new URL(document.referrer).origin : ''; } catch (_) {}
    window.gtag('config', tagId, {
      allow_ad_personalization_signals: false,
      allow_google_signals: false,
      page_location: location,
      page_referrer: referrer
    });
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + tagId;
    document.head.appendChild(tag);
  }
  function apply(choice) {
    enabled = choice === 'yes';
    if (enabled) start();
    if (started) window.gtag('consent', 'update', consent(enabled));
  }
  function ui() {
    var style = document.createElement('style');
    style.textContent = '.legacy-measurement{position:fixed;left:16px;bottom:62px;z-index:10000;max-width:520px;width:calc(100% - 32px);box-sizing:border-box;padding:18px;background:#fff;color:#141a20;border:1px solid #c7cdd2;border-radius:12px;box-shadow:0 8px 35px #0003;font:14px/1.5 Arial,sans-serif}.legacy-measurement[hidden]{display:none}.legacy-measurement p{margin:0 0 12px}.legacy-measurement button{font:inherit;border:1px solid #8c969e;border-radius:6px;background:#fff;color:#141a20;padding:9px 13px;margin:4px 8px 0 0;cursor:pointer}.legacy-measurement .accept{background:#141a20;color:#fff}.legacy-measurement a{color:#17558c}.legacy-measurement-settings{position:fixed;left:12px;bottom:12px;z-index:9998;background:#fff;color:#38434c;border:1px solid #c7cdd2;border-radius:6px;padding:6px 10px;font:12px Arial,sans-serif;cursor:pointer}.legacy-measurement button:focus-visible,.legacy-measurement-settings:focus-visible{outline:3px solid #d27a0f;outline-offset:3px}';
    document.head.appendChild(style);
    var panel = document.createElement('section');
    panel.className = 'legacy-measurement';
    panel.setAttribute('aria-label', copy.title);
    var text = document.createElement('p'); text.textContent = copy.text; panel.appendChild(text);
    var privacy = document.createElement('a');
    privacy.href = 'https://policies.google.com/technologies/partner-sites';
    privacy.target = '_blank'; privacy.rel = 'noopener';
    privacy.textContent = en ? 'How Google uses data' : kk ? 'Google деректерді қалай пайдаланады' : 'Как Google использует данные';
    panel.appendChild(privacy); panel.appendChild(document.createElement('br'));
    var yes = document.createElement('button'); yes.type = 'button'; yes.className = 'accept'; yes.textContent = copy.yes;
    var no = document.createElement('button'); no.type = 'button'; no.textContent = copy.no;
    var settings = document.createElement('button'); settings.type = 'button'; settings.className = 'legacy-measurement-settings'; settings.textContent = copy.settings;
    function choose(value) { saveChoice(value); apply(value); panel.hidden = true; settings.focus(); }
    yes.addEventListener('click', function () { choose('yes'); });
    no.addEventListener('click', function () { choose('no'); });
    settings.addEventListener('click', function () { panel.hidden = !panel.hidden; if (!panel.hidden) yes.focus(); });
    panel.appendChild(yes); panel.appendChild(no); document.body.appendChild(panel); document.body.appendChild(settings);
    var choice = readChoice();
    panel.hidden = choice !== null;
    if (choice) apply(choice);
  }
  document.addEventListener('click', function (event) {
    if (!enabled || !started || !event.isTrusted) return;
    var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
    if (!link) return;
    var url;
    try { url = new URL(link.href, window.location.href); } catch (_) { return; }
    if (url.protocol !== 'https:' || (url.hostname !== 'wa.me' && url.hostname !== 'api.whatsapp.com')) return;
    var last = 0;
    try { last = Number(sessionStorage.getItem('legacy-whatsapp-last')) || 0; } catch (_) {}
    if (Date.now() - last < 30 * 60 * 1000) return;
    try { sessionStorage.setItem('legacy-whatsapp-last', String(Date.now())); } catch (_) {}
    window.gtag('event', 'conversion', {send_to: eventId, value: 0, currency: 'USD'});
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui, {once: true});
  else ui();
})();
