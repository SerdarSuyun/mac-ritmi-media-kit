(() => {
  'use strict';
  const settings = JSON.parse(document.getElementById('site-data').textContent).analytics;
  const host = location.hostname.toLowerCase();
  const local = host === 'localhost' || host === '::1' || host === '[::1]' || /^127\./.test(host);
  if (!settings?.enabled || !/^G-[A-Z0-9]{6,}$/.test(settings.measurementId) || location.protocol !== 'https:' || local || !settings.allowedHosts.includes(host)) return;

  const id = settings.measurementId;
  const key = 'macritmi.analytics-consent';
  const panel = document.getElementById('analytics-consent');
  const preferences = document.getElementById('analytics-preferences');
  let approved = false;
  let loaded = false;
  let pageSent = false;
  const seen = new Set();
  let returnFocus = null;
  window.dataLayer = window.dataLayer || [];
  const tag = function () { window.dataLayer.push(arguments); };
  window.gtag = tag;
  // Basic consent: no external Google script until analytics consent is granted.
  tag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });

  function readChoice() {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && value.version === settings.consentVersion && Date.now() - value.at < settings.consentMaxAgeDays * 86400000 ? value.choice : null;
    } catch { return null; }
  }
  function remember(choice) {
    try { localStorage.setItem(key, JSON.stringify({choice, at: Date.now(), version: settings.consentVersion})); } catch { /* Choice still applies to this page. */ }
  }
  function cleanLocation() {
    // Never forward arbitrary query strings or fragments from a sponsor's link.
    return location.origin + location.pathname;
  }
  function event(name, parameters = {}) {
    if (!approved) return;
    tag('event', name, {send_to: id, page_location: cleanLocation(), ...parameters});
  }
  function start() {
    approved = true;
    window['ga-disable-' + id] = false;
    tag('consent', 'update', {analytics_storage: 'granted'});
    if (!loaded) {
      loaded = true;
      tag('js', new Date());
      tag('config', id, {send_page_view: false, page_location: cleanLocation(), page_referrer: document.referrer ? new URL(document.referrer).origin : '', allow_google_signals: false, allow_ad_personalization_signals: false, cookie_flags: 'SameSite=Lax;Secure'});
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
      document.head.append(script);
    }
    if (!pageSent) {
      pageSent = true;
      event('page_view', {page_title: document.title});
    }
  }
  function stop() {
    approved = false;
    window['ga-disable-' + id] = true;
    tag('consent', 'update', {analytics_storage: 'denied'});
    // Remove this host's Analytics cookies where JavaScript can address them.
    const domains = ['', host, '.' + host];
    const parts = host.split('.');
    for (let i = 1; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));
    const pathParts = location.pathname.split('/').filter(Boolean);
    const paths = ['/'];
    for (let i = 1; i <= pathParts.length; i++) paths.push('/' + pathParts.slice(0, i).join('/'));
    for (const cookie of document.cookie.split(';')) {
      const name = cookie.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of domains) for (const path of paths) document.cookie = name + '=;Max-Age=0;path=' + path + (domain ? ';domain=' + domain : '') + ';Secure;SameSite=Lax';
    }
  }
  function decide(choice) {
    remember(choice);
    if (choice === 'granted') start(); else stop();
    panel.hidden = true;
    if (returnFocus) { returnFocus.focus(); returnFocus = null; }
  }
  preferences.hidden = false;
  preferences.addEventListener('click', () => {returnFocus = preferences; panel.hidden = false; document.getElementById('analytics-accept').focus();});
  document.getElementById('analytics-accept').addEventListener('click', () => decide('granted'));
  document.getElementById('analytics-reject').addEventListener('click', () => decide('denied'));
  const choice = readChoice();
  if (choice === 'granted') start(); else if (choice !== 'denied') panel.hidden = false;

  document.addEventListener('click', e => {
    const target = e.target.closest('a,button');
    if (!target) return;
    if (['whatsapp', 'whatsapp-floating'].includes(target.id)) event('whatsapp_click', {button_location: target.id === 'whatsapp-floating' ? 'floating' : 'contact'});
    else if (target.protocol === 'mailto:') event('email_click', {button_location: target.closest('#collaborations') ? 'sponsorship' : 'contact'});
    else if (target.protocol === 'tel:') event('phone_click', {button_location: 'contact'});
    else if (target.id === 'print') event('media_kit_print_requested');
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!approved || !entry.isIntersecting || document.visibilityState === 'hidden' || seen.has(entry.target.id)) continue;
        seen.add(entry.target.id);
        event(entry.target.id === 'kitle' ? 'audience_view' : 'sponsorship_view');
      }
    }, {threshold: 0.25});
    for (const section of ['kitle', 'is-birligi']) observer.observe(document.getElementById(section));
  }
})();
