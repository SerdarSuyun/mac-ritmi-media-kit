(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const {packages, advertising, brand} = JSON.parse($('site-data').textContent);
  if (!packages || !$('package-cards')) return;
  const dialog = $('package-dialog');
  let currentPackage = null;
  let returnFocus = null;
  let pageScroll = 0;
  const node = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  function event(name, item, source) {
    document.dispatchEvent(new CustomEvent('macritmi:packages', {detail: {name, parameters: {package_name: item.name, source_section: source, platform: 'instagram_facebook_youtube'}}}));
  }
  function quoteURL(item) {
    const url = new URL(brand.whatsapp);
    if (url.protocol !== 'https:' || url.hostname !== 'wa.me' || !/^\/\d+$/.test(url.pathname)) throw new Error('WhatsApp bağlantısı geçersiz.');
    url.search = '';
    url.hash = '';
    const subject = item.id === 'production' ? 'hizmetiniz' : 'paketiniz';
    url.searchParams.set('text', `Merhaba, Maç Ritmi Digital Media Kit sitenizi inceledim. ${item.name} — ${item.subtitle} ${subject} hakkında bilgi ve fiyat teklifi almak istiyorum.`);
    return url.href;
  }
  function quoteLink(item, source) {
    const link = node('a', 'ad-whatsapp package-quote', 'WhatsApp’tan Teklif Al');
    link.href = quoteURL(item);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.packageQuote = item.id;
    link.setAttribute('aria-label', `${item.name} için WhatsApp’tan teklif al`);
    link.addEventListener('click', () => event('package_whatsapp_click', item, source));
    return link;
  }
  function listFeatures(item, className) {
    const list = node('ul', className);
    for (const feature of item.features) list.append(node('li', '', feature));
    return list;
  }
  function selectExample(id) {
    if (!currentPackage?.demos.includes(id)) return;
    const demo = advertising.models.find(model => model.id === id);
    const img = $('package-demo-image');
    img.src = demo.image.src;
    img.width = demo.image.width;
    img.height = demo.image.height;
    img.alt = `${currentPackage.name} kapsamında ${demo.name} — temsili reklam örneği`;
    $('package-demo-caption').textContent = `DEMO ${String(demo.number).padStart(2, '0')} / ${demo.name}`;
    for (const button of $('package-demo-options').children) button.setAttribute('aria-pressed', String(button.dataset.demoExample === id));
  }
  function openDetails(item, trigger, source) {
    if (document.querySelector('dialog[open]')) return;
    currentPackage = item;
    returnFocus = trigger;
    $('package-dialog-title').textContent = `${item.name} — ${item.subtitle}`;
    $('package-dialog-model').textContent = `${item.serviceType} / ${item.model}`;
    $('package-dialog-english').textContent = item.english;
    $('package-dialog-description').textContent = item.audience;
    $('package-dialog-delivery').textContent = item.id === 'production' ? '1 Özgün Video (Özel Video) / proje' : `${item.sponsoredCount} sponsorlu içerik / ay${item.liveCount ? ' + ' + item.liveCount + ' canlı yayın entegrasyonu' : ''}`;
    $('package-dialog-service-note').textContent = item.serviceNote;
    $('package-dialog-features').replaceChildren(listFeatures(item, 'package-feature-list'));
    $('package-dialog-platforms').textContent = packages.platforms.join(' · ');
    const quote = $('package-dialog-quote');
    quote.href = quoteURL(item);
    quote.target = '_blank';
    quote.rel = 'noopener noreferrer';
    quote.setAttribute('aria-label', `${item.name} için WhatsApp’tan teklif al`);
    $('package-demo-options').replaceChildren();
    for (const id of item.demos) {
      const demo = advertising.models.find(model => model.id === id);
      const button = node('button', 'package-example');
      button.type = 'button';
      button.dataset.demoExample = id;
      button.setAttribute('aria-label', `${demo.name} örneğini göster`);
      const image = node('img');
      image.src = demo.thumbnail.src;
      image.width = demo.thumbnail.width;
      image.height = demo.thumbnail.height;
      image.alt = '';
      image.loading = 'lazy';
      button.append(image, node('span', '', `DEMO ${String(demo.number).padStart(2, '0')}`));
      button.addEventListener('click', () => selectExample(id));
      $('package-demo-options').append(button);
    }
    selectExample(item.demos[0]);
    pageScroll = window.scrollY;
    document.documentElement.classList.add('showcase-open');
    document.body.style.top = `-${pageScroll}px`;
    dialog.showModal();
    $('package-dialog-shell').scrollTop = 0;
    $('package-dialog-close').focus({preventScroll: true});
    event('package_details_open', item, source);
  }
  const close = () => {if (dialog.open) dialog.close();};
  $('package-dialog-close').addEventListener('click', close);
  $('package-dialog-quote').addEventListener('click', () => {if (currentPackage) event('package_quote_click', currentPackage, 'package_details');});
  dialog.addEventListener('cancel', e => {e.preventDefault(); close();});
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('showcase-open');
    document.body.style.top = '';
    window.scrollTo({top: pageScroll, behavior: 'instant'});
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll: true});
  });
  const outside = e => {const r = dialog.getBoundingClientRect();return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;};
  let backdrop = false;
  dialog.addEventListener('pointerdown', e => {backdrop = e.target === dialog && outside(e);});
  dialog.addEventListener('click', e => {if (e.target === dialog && backdrop && outside(e)) close();});
  dialog.addEventListener('keydown', e => {
    if (!dialog.open || e.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')].filter(el => !el.hidden && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
    const first = controls[0], last = controls.at(-1);
    if (!first) {e.preventDefault(); return;}
    if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {e.preventDefault(); last.focus();}
    else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {e.preventDefault(); first.focus();}
  });
  $('packages-title').textContent = packages.title;
  $('packages-description').textContent = packages.description;
  $('package-scope-note').textContent = packages.scopeNote;
  $('comparison-scope-note').textContent = packages.scopeNote;
  $('package-delivery-note').textContent = 'Çok platformlu yayın: içerik formatı ve yayın platformları kampanyanın hedeflerine göre planlanır.';
  $('comparison-platform-note').textContent = packages.deliveryNote;
  $('package-intro-note').textContent = packages.introNote;
  for (const service of packages.services) {
    const card = node('article', 'service-model');
    card.append(node('p', 'service-model-english', service.english), node('h3', '', service.name), node('p', 'service-model-formula', service.formula), node('p', 'service-model-description', service.description));
    $('service-models').append(card);
  }
  for (const item of packages.items) {
    const card = node('article', `package-card package-${item.id}`);
    card.id = `package-${item.id}`;
    card.style.setProperty('--package-accent', item.accent);
    if (item.id === 'production') {
      const image = node('img', 'production-image');
      const demo = advertising.models.find(model => model.id === 'demo-12');
      image.src = demo.thumbnail.src;image.width = demo.thumbnail.width;image.height = demo.thumbnail.height;image.alt = 'Markaya özel reklam videosu — temsili tasarım';image.loading = 'lazy';
      card.append(image);
    }
    const heading = node('div', 'package-heading');
    heading.append(node('p', 'package-cadence', `${item.serviceType} / ${item.model}`), node('h3', 'package-name', item.name.toLocaleUpperCase('tr-TR')), node('p', 'package-subtitle', item.subtitle), node('p', 'package-english', item.english));
    const stats = node('div', 'package-delivery');
    const amount = node('div');amount.append(node('strong', '', String(item.sponsoredCount || item.dedicatedCount)), node('span', '', item.id === 'production' ? 'markaya özel video / proje' : 'sponsorlu içerik / ay'));
    if (item.liveCount) amount.append(node('span', 'package-live-count', `+ ${item.liveCount} canlı yayın entegrasyonu`));
    const channels = node('div', 'package-channel-summary');channels.append(node('strong', '', 'Çok platformlu yayın'), node('span', '', 'Kampanyaya uygun platform ve içerik formatı'));
    stats.append(amount, channels);
    const copy = node('div', 'package-main');
    copy.append(heading, stats, node('p', 'package-platforms', packages.platforms.join(' · ')), node('p', 'package-audience', item.audience), node('p', 'package-service-note', item.serviceNote), listFeatures(item, 'package-feature-list'));
    const actions = node('div', 'package-actions');
    const details = node('button', 'package-details', 'Kapsamı ve Örnekleri İncele');
    details.type = 'button';details.dataset.packageDetails = item.id;details.setAttribute('aria-haspopup', 'dialog');details.setAttribute('aria-controls', dialog.id);details.setAttribute('aria-label', `${item.name} kapsamını ve örneklerini incele`);
    details.addEventListener('click', () => openDetails(item, details, 'package_card'));
    actions.append(details, quoteLink(item, 'package_card'));
    card.append(copy, actions);
    $(item.id === 'production' ? 'production-package' : 'package-cards').append(card);
  }
  const header = $('comparison-head');
  const featureHead = node('th', '', 'Hizmet');featureHead.scope = 'col';header.append(featureHead);
  for (const item of packages.items) {
    const th = node('th');th.scope = 'col';th.dataset.packageColumn = item.id;
    const name = node('span', '', item.name);
    const details = node('button', '', 'İncele');details.type = 'button';details.setAttribute('aria-label', `${item.name} paket detayları`);details.addEventListener('click', () => openDetails(item, details, 'package_comparison'));
    th.append(name, details);header.append(th);
  }
  for (const row of packages.comparison) {
    const tr = node('tr');const label = node('th', '', row.label);label.scope = 'row';tr.append(label);
    row.values.forEach((value, index) => {
      const td = node('td');td.dataset.packageColumn = packages.items[index].id;
      if (typeof value === 'boolean') {
        const symbol = node('span', value ? 'package-yes' : 'package-no', value ? '✓' : '—');symbol.setAttribute('aria-hidden', 'true');
        td.append(symbol, node('span', 'visually-hidden', value ? 'Dahil' : 'Dahil değil'));
      } else td.textContent = String(value);
      tr.append(td);
    });
    $('comparison-body').append(tr);
  }
})();
