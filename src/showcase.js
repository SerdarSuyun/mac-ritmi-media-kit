(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const data = JSON.parse($('site-data').textContent);
  const {advertising, brand, packages} = data;
  if (!advertising || !$('reklam-modelleri')) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let category = 'reels';
  let currentId = null;
  let restoreFocus = null;
  let scrollPosition = 0;
  const dialog = $('advertising-dialog');
  const tracks = new Map();
  const groupElements = new Map();
  const categoryButtons = [];
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const demoNumber = model => `DEMO ${String(model.number).padStart(2, '0')}`;
  const categoryName = id => id === 'live' ? 'Canlı yayın' : id === 'reels' ? 'Reels & Shorts' : 'Tüm modeller';
  const modelsInCategory = () => advertising.models.filter(model => category === 'all' || model.category === category);
  const trackEvent = (name, model = null, extra = {}) => {
    const detail = {name, parameters: {advertising_category: category, source_section: 'advertising_showcase', ...extra}};
    if (model) Object.assign(detail.parameters, {demo_id: model.id, demo_name: model.name, platform: model.category === 'live' ? 'youtube_live' : 'reels_shorts'});
    document.dispatchEvent(new CustomEvent('macritmi:advertising', {detail}));
  };
  function whatsappURL(message) {
    const url = new URL(brand.whatsapp);
    if (url.protocol !== 'https:' || url.hostname !== 'wa.me' || !/^\/\d+$/.test(url.pathname)) throw new Error('WhatsApp bağlantısı geçersiz.');
    url.search = '';
    url.hash = '';
    url.searchParams.set('text', message);
    return url.href;
  }
  function bindExternal(link, url) {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  function syncTrack(key) {
    const {track, previous, next} = tracks.get(key);
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
  }
  function fillModal(id, opening = false) {
    const model = advertising.models.find(item => item.id === id);
    if (!model) return;
    currentId = id;
    const image = $('ad-dialog-image');
    image.src = model.image.src;
    image.width = model.image.width;
    image.height = model.image.height;
    image.alt = `${model.name} — VORTEX temsili reklam tasarımı`;
    $('ad-dialog-visual').dataset.orientation = model.orientation;
    $('ad-dialog-number').textContent = `${demoNumber(model)} / ${categoryName(model.category)}`;
    $('ad-dialog-title').textContent = model.name;
    $('ad-dialog-english').textContent = model.english;
    $('ad-dialog-description').textContent = model.description;
    $('ad-dialog-goal').textContent = model.goal;
    $('ad-dialog-packages').textContent = 'İlgili paketler: ' + packages.items.filter(item => item.demos.includes(model.id)).map(item => item.name).join(', ') + '. Bu görsel paket kapsamındaki bir uygulama örneğidir.';
    $('ad-dialog-platforms').replaceChildren(...model.platforms.map(name => element('li', '', name)));
    const sequence = modelsInCategory();
    $('ad-dialog-position').textContent = `${sequence.findIndex(item => item.id === id) + 1} / ${sequence.length}`;
    bindExternal($('ad-dialog-quote'), whatsappURL(`Merhaba, Maç Ritmi Digital Media Kit sitenizi inceledim. ${model.name} (${demoNumber(model)}) uygulamasını kapsayan sponsorluk paketleriniz hakkında bilgi ve fiyat teklifi almak istiyorum.`));
    if (!opening) $('ad-dialog-shell').scrollTop = 0;
    trackEvent('advertising_demo_open', model);
  }
  function closeModal() {
    if (dialog.open) dialog.close();
  }
  function openModal(id, trigger) {
    restoreFocus = trigger;
    fillModal(id, true);
    scrollPosition = window.scrollY;
    document.documentElement.classList.add('showcase-open');
    document.body.style.top = `-${scrollPosition}px`;
    try {
      dialog.showModal();
      $('ad-dialog-shell').scrollTop = 0;
      $('ad-dialog-close').focus({preventScroll: true});
    } catch (error) {
      document.documentElement.classList.remove('showcase-open');
      document.body.style.top = '';
      throw error;
    }
  }
  function moveModal(delta) {
    const sequence = modelsInCategory();
    const index = sequence.findIndex(item => item.id === currentId);
    fillModal(sequence[(index + delta + sequence.length) % sequence.length].id);
  }
  $('ad-dialog-close').addEventListener('click', closeModal);
  dialog.addEventListener('cancel', e => {e.preventDefault(); closeModal();});
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('showcase-open');
    document.body.style.top = '';
    window.scrollTo({top: scrollPosition, behavior: 'instant'});
    if (restoreFocus?.isConnected) restoreFocus.focus({preventScroll: true});
  });
  let backdropPress = false;
  const outsideDialog = e => {
    const rect = dialog.getBoundingClientRect();
    return e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom;
  };
  dialog.addEventListener('pointerdown', e => {backdropPress = e.target === dialog && outsideDialog(e);});
  dialog.addEventListener('click', e => {if (e.target === dialog && backdropPress && outsideDialog(e)) closeModal();});
  $('ad-dialog-previous').addEventListener('click', () => moveModal(-1));
  $('ad-dialog-next').addEventListener('click', () => moveModal(1));
  dialog.addEventListener('keydown', e => {
    if (!dialog.open) return;
    if (e.key === 'Tab') {
      // Wrap explicitly: some browsers otherwise move focus to browser chrome.
      const controls = [...dialog.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')]
        .filter(node => !node.hidden && node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) {e.preventDefault(); return;}
      if (e.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        e.preventDefault(); first.focus();
      }
      return;
    }
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.key === 'ArrowLeft') {e.preventDefault(); moveModal(-1);}
    else if (e.key === 'ArrowRight') {e.preventDefault(); moveModal(1);}
  });
  $('ad-dialog-quote').addEventListener('click', () => {
    trackEvent('advertising_quote_click', advertising.models.find(model => model.id === currentId), {contact_channel: 'whatsapp'});
  });

  for (const key of ['reels', 'live']) {
    const section = element('section', 'ad-group');
    section.id = `ad-group-${key}`;
    section.setAttribute('aria-labelledby', `ad-group-title-${key}`);
    section.hidden = key !== 'reels';
    const header = element('div', 'ad-group-header');
    const heading = element('h3', '', categoryName(key));
    heading.id = `ad-group-title-${key}`;
    const controls = element('div', 'ad-track-controls');
    const previous = element('button', '', 'Önceki');
    const next = element('button', '', 'Sonraki');
    const track = element('div', `ad-track ad-track-${key}`);
    track.id = `ad-track-${key}`;
    track.setAttribute('role', 'list');
    track.setAttribute('aria-label', `${categoryName(key)} reklam modelleri`);
    for (const control of [previous, next]) {
      control.type = 'button';
      control.setAttribute('aria-controls', track.id);
    }
    previous.setAttribute('aria-label', `${categoryName(key)} modellerini geri kaydır`);
    next.setAttribute('aria-label', `${categoryName(key)} modellerini ileri kaydır`);
    controls.append(previous, next);
    header.append(heading, controls);
    section.append(header, track);
    tracks.set(key, {track, previous, next});
    groupElements.set(key, section);
    const shift = delta => track.scrollBy({left: delta * (track.clientWidth + 20), behavior: reducedMotion.matches ? 'instant' : 'smooth'});
    previous.addEventListener('click', () => shift(-1));
    next.addEventListener('click', () => shift(1));
    track.addEventListener('scroll', () => syncTrack(key), {passive: true});
    for (const model of advertising.models.filter(item => item.category === key)) {
      const item = element('div', 'ad-item');
      item.setAttribute('role', 'listitem');
      const card = element('button', 'ad-card');
      card.type = 'button';
      card.dataset.demo = model.id;
      card.setAttribute('aria-haspopup', 'dialog');
      card.setAttribute('aria-controls', dialog.id);
      card.setAttribute('aria-label', `${demoNumber(model)}: ${model.name}, detayları incele`);
      const visual = element('span', `ad-card-image ad-card-image-${model.orientation}`);
      const img = element('img');
      img.src = model.thumbnail.src;
      img.srcset = `${model.thumbnail.src} ${model.thumbnail.width}w, ${model.image.src} ${model.image.width}w`;
      img.sizes = model.orientation === 'portrait' ? '(max-width: 600px) 78vw, (max-width: 1000px) 40vw, 300px' : '(max-width: 600px) 86vw, (max-width: 1000px) 72vw, 620px';
      img.width = model.thumbnail.width;
      img.height = model.thumbnail.height;
      img.alt = `${model.name} — temsili reklam yerleşimi`;
      img.loading = 'lazy';
      img.decoding = 'async';
      visual.append(img, element('span', 'ad-image-tag', 'TEMSİLİ UYGULAMA'));
      const copy = element('span', 'ad-card-copy');
      const name = element('span', 'ad-card-title', model.name);
      const english = element('span', 'ad-card-english', model.english);
      copy.append(element('span', 'ad-card-number', demoNumber(model)), name, english, element('span', 'ad-card-description', model.description), element('span', 'ad-card-link', 'Detayları İncele'));
      card.append(visual, copy);
      card.addEventListener('click', () => openModal(model.id, card));
      item.append(card);
      track.append(item);
    }
    $('ad-groups').append(section);
  }
  function selectCategory(id, userAction = false) {
    if (!advertising.categories.some(item => item.id === id)) return;
    category = id;
    for (const button of categoryButtons) {
      const selected = button.dataset.category === id;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    }
    $('ad-results').setAttribute('aria-labelledby', `ad-filter-${id}`);
    const count = modelsInCategory().length;
    $('ad-result-count').textContent = `${categoryName(id)} · ${count} reklam uygulaması. Kartları kaydırarak keşfedin.`;
    for (const [key, section] of groupElements) {
      section.hidden = id !== 'all' && key !== id;
      if (!section.hidden) {
        tracks.get(key).track.scrollLeft = 0;
        requestAnimationFrame(() => syncTrack(key));
      }
    }
    $('ad-show-all').hidden = id === 'all';
    if (userAction) trackEvent('advertising_category_select', null);
  }
  for (const item of advertising.categories) {
    const button = element('button', '', `${item.name} (${item.count})`);
    button.type = 'button';
    button.id = `ad-filter-${item.id}`;
    button.dataset.category = item.id;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', 'ad-results');
    button.addEventListener('click', () => selectCategory(item.id, true));
    button.addEventListener('keydown', e => {
      let index = categoryButtons.indexOf(button);
      if (e.key === 'ArrowRight') index = (index + 1) % categoryButtons.length;
      else if (e.key === 'ArrowLeft') index = (index + categoryButtons.length - 1) % categoryButtons.length;
      else if (e.key === 'Home') index = 0;
      else if (e.key === 'End') index = categoryButtons.length - 1;
      else return;
      e.preventDefault();
      const next = categoryButtons[index];
      next.focus({preventScroll: true});
      selectCategory(next.dataset.category, true);
    });
    categoryButtons.push(button);
    $('ad-filters').append(button);
  }
  $('ad-show-all').addEventListener('click', () => {
    selectCategory('all', true);
    trackEvent('advertising_all_models_click');
    $('ad-filter-all').focus({preventScroll: true});
  });
  $('ad-title').textContent = advertising.title;
  $('ad-description').textContent = advertising.description;
  $('ad-disclaimer').textContent = advertising.disclaimer;
  $('ad-static-notice').textContent = advertising.staticNotice;
  $('ad-custom-title').textContent = advertising.customQuote.title;
  $('ad-custom-description').textContent = advertising.customQuote.description;
  bindExternal($('ad-custom-quote'), whatsappURL(advertising.customQuote.message));
  $('ad-custom-quote').addEventListener('click', () => trackEvent('advertising_whatsapp_click', null, {contact_channel: 'whatsapp', source_section: 'advertising_custom_package'}));
  selectCategory('reels');
  if ('ResizeObserver' in window) {
    const resize = new ResizeObserver(() => {for (const [key, group] of groupElements) if (!group.hidden) syncTrack(key);});
    resize.observe($('ad-results'));
  } else window.addEventListener('resize', () => {for (const key of tracks.keys()) syncTrack(key);}, {passive: true});
})();
