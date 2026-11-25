(() => {
const $ = id => document.getElementById(id);
const number = value => new Intl.NumberFormat('tr-TR', {maximumFractionDigits:0}).format(value);
const decimal = value => new Intl.NumberFormat('tr-TR', {maximumFractionDigits:1}).format(value);
function el(tag, className, text) {const node=document.createElement(tag); if(className)node.className=className; if(text!==undefined)node.textContent=text; return node;}
function link(node, url, text) {if(!/^(https:\/\/|mailto:|tel:|#)/.test(url))throw new Error('Geçersiz bağlantı'); node.href=url;node.textContent=text;if(url.startsWith('https://')){node.target='_blank';node.rel='noopener noreferrer';}}
function tabs(selector, attribute, render) {
 const buttons=[...document.querySelectorAll(selector)];
 const activate=button=>{for(const item of buttons){const active=item===button;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;}render(button.getAttribute(attribute));$(button.getAttribute('aria-controls')).setAttribute('aria-labelledby',button.id);};
 for(const button of buttons){button.addEventListener('click',()=>activate(button));button.addEventListener('keydown',event=>{let i=buttons.indexOf(button);if(event.key==='ArrowRight')i=(i+1)%buttons.length;else if(event.key==='ArrowLeft')i=(i-1+buttons.length)%buttons.length;else if(event.key==='Home')i=0;else if(event.key==='End')i=buttons.length-1;else return;event.preventDefault();buttons[i].focus();activate(buttons[i]);});}
 activate(buttons[0]);
}
$('menu-toggle').addEventListener('click',()=>{const open=$('menu-toggle').getAttribute('aria-expanded')!=='true';$('menu-toggle').setAttribute('aria-expanded',String(open));$('navigation').classList.toggle('open',open);});
function closeMenu(){ $('menu-toggle').setAttribute('aria-expanded','false');$('navigation').classList.remove('open'); }
$('navigation').addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('navigation').classList.contains('open')){closeMenu();$('menu-toggle').focus();}});
$('print').addEventListener('click',()=>window.print());
try {
 const {brand,metrics,audience,content}=JSON.parse($('site-data').textContent);
 const about=content.about;
 $('about-title').textContent=about.title;
 for(const paragraph of about.paragraphs)$('about-copy').append(el('p',null,paragraph));
 const selectFormat=id=>{const format=about.formats.find(item=>item.id===id);for(const button of $('format-controls').children)button.setAttribute('aria-pressed',String(button.dataset.format===id));$('format-title').textContent=format.title;$('format-description').textContent=format.description;$('pitch-ball').style.left=`${format.x}%`;$('pitch-ball').style.top=`${format.y}%`;};
 for(const format of about.formats){const button=el('button',null,format.label);button.type='button';button.dataset.format=format.id;button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>{setMotion(false);selectFormat(format.id);});$('format-controls').append(button);}
 selectFormat(about.formats[0].id);
 const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
 const playbook=$('playbook');
 const motionToggle=$('motion-toggle');
 let motionEnabled=!motionPreference.matches;
 for(const [index,format] of about.formats.entries()){playbook.style.setProperty(`--pass-x-${index}`,`${format.x}%`);playbook.style.setProperty(`--pass-y-${index}`,`${format.y}%`);}
 function setMotion(enabled){motionEnabled=enabled&&!motionPreference.matches;playbook.dataset.motion=motionEnabled?'playing':'paused';motionToggle.setAttribute('aria-pressed',String(!motionEnabled));motionToggle.textContent=motionPreference.matches?'Hareket azaltıldı':motionEnabled?'Hareketi durdur':'Hareketi başlat';motionToggle.disabled=motionPreference.matches;}
 motionToggle.addEventListener('click',()=>setMotion(!motionEnabled));
 motionPreference.addEventListener('change',()=>setMotion(!motionPreference.matches));
 setMotion(motionEnabled);
 if('IntersectionObserver' in window){const motionObserver=new IntersectionObserver(entries=>{playbook.dataset.visible=String(entries[0].isIntersecting);},{threshold:0.1});motionObserver.observe(playbook);}else playbook.dataset.visible='true';

 if('IntersectionObserver' in window){const links=[...$('navigation').querySelectorAll('a[href^="#"]')];const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(!visible.length)return;const id=visible[0].target.id;for(const link of links){if(link.hash===`#${id}`)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');}},{rootMargin:'-10% 0px -55% 0px',threshold:0});for(const link of links){const section=$(link.hash.slice(1));if(section)observer.observe(section);}}

 tabs('[data-period]','data-period',key=>{const p=metrics.periods[key];$('meta-total').textContent=number(p.total);$('meta-period').textContent=p.period;$('meta-instagram').textContent=number(p.instagram);$('meta-facebook').textContent=number(p.facebook);});
 for(const p of metrics.platforms){const card=el('article','platform-card');const title=el('h3',null,p.name);title.append(el('span',null,'PLATFORM ÖZETİ'));card.append(title);const followers=el('p','platform-followers',number(p.followers));followers.append(el('small',null,p.unit));card.append(followers,el('p','mini',`Anlık sayım: ${p.asOf}`));const views=el('p','platform-views');views.append(el('strong',null,number(p.views)),document.createTextNode(' görüntülenme'));card.append(views,el('p','mini',p.scope),el('p','mini',p.period));$('platforms').append(card);}
 const list=el('ul');for(const note of metrics.notes)list.append(el('li',null,note));$('method-notes').append(list);
 tabs('[data-audience]','data-audience',key=>{const a=audience[key];$('audience-scope').textContent=`${a.scope} ${a.period}`;$('male').textContent=`%${decimal(a.male)}`;$('female').textContent=`Kadın kitle: %${decimal(a.female)}`;$('country').textContent=`%${decimal(a.country)}`;$('ages').replaceChildren();for(const item of a.ages){const row=el('div','bar-row');row.append(el('span',null,item.label));const track=el('div','bar-track');track.setAttribute('aria-hidden','true');const bar=el('div','bar');bar.style.width=`${item.value}%`;track.append(bar);row.append(track,el('b',null,`%${decimal(item.value)}`));$('ages').append(row);}$('cities').replaceChildren();if(a.cities.length){for(const city of a.cities)$('cities').append(el('span',null,`${city.label} %${decimal(city.value)}`));}else $('cities').textContent='Şehir verisi doğrulanmadı.';$('audience-note').textContent=`${a.note} Kaynak: ${metrics.sources[a.source].title}.`;});
 for(const reel of content.reels){const card=el('figure','reel-card');const img=el('img');img.src=reel.image;img.alt=reel.title+' — Maç Ritmi Reels kapağı';img.width=360;img.height=640;img.loading='lazy';card.append(img,el('figcaption',null,reel.title));$('reels').append(card);}
 const r=metrics.reels;for(const [value,label] of [[r.count,'Instagram Reels'],[r.mean,'Ortalama görüntülenme / Reels'],[r.median,'Medyan görüntülenme / Reels'],[r.over100k,'100 bin üzeri görüntülenen Reels']]){const stat=el('div');stat.append(el('strong',null,number(value)),el('span',null,label));$('reel-stats').append(stat);}
 $('reel-scope').textContent=`${r.period} · ${r.scope}`;const s=metrics.story;$('story-note').textContent=`Story envanteri: ${number(s.count)} içerik · ortalama ${decimal(s.mean)} · medyan ${number(s.median)} görüntülenme. ${s.period}. ${s.scope}`;
 for(const item of content.collaborations){const card=el('article','collaboration');const cta=el('a');link(cta,`mailto:${brand.email}?subject=${encodeURIComponent('Maç Ritmi — '+item.title)}`,'Bu iş birliğini konuşalım');card.append(el('span',null,item.tag),el('h3',null,item.title),el('p',null,item.description),cta);$('collaborations').append(card);}
 link($('contact-email'),`mailto:${brand.email}`,brand.email);link($('secondary-email'),`mailto:${brand.secondaryEmail}`,brand.secondaryEmail);link($('contact-phone'),brand.phoneHref,brand.phone);link($('whatsapp'),brand.whatsapp,'WhatsApp’tan görüşelim');$('whatsapp-floating').href=$('whatsapp').href;$('whatsapp-floating').hidden=false;for(const social of brand.socials){const a=el('a');link(a,social.url,social.name);$('socials').append(a);}$('updated').textContent=`© 2026 ${brand.name} · Digital Media Kit V${brand.version} · Son veri incelemesi: ${brand.updated}`;
} catch(error) {console.error(error);$('load-error').hidden=false;}

})();
