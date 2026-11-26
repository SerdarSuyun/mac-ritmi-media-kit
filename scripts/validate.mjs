import {readFile,access} from 'node:fs/promises';
import assert from 'node:assert/strict';
const load=async n=>JSON.parse(await readFile(new URL(`../src/data/${n}.json`,import.meta.url),'utf8'));
export async function validate(){
 const [brand,m,a,c]=await Promise.all(['brand','metrics','audience','content'].map(load));
 for(const p of Object.values(m.periods)){assert.equal(p.total,p.instagram+p.facebook,'Meta toplamı platform kırılımlarıyla aynı olmalı');assert(m.sources[p.source]);assert(p.period&&p.scope);}
 assert.equal(m.platforms.find(p=>p.name==='Instagram').followers,6523,'V2 güncel takipçi sayısı korunmalı');
 for(const p of m.platforms){assert(m.sources[p.source]);assert(p.period&&p.asOf&&p.scope);assert(p.followers>0&&p.views>0);}
 for(const p of Object.values(a)){assert(m.sources[p.source]);assert(p.period&&p.scope);assert(Math.abs(p.male+p.female-100)<.11);for(const item of [...p.ages,...p.cities])assert(item.value>=0&&item.value<=100);}
 assert(m.reels.median<=m.reels.mean);assert(m.reels.over100k<=m.reels.count);assert.equal(c.reels.length,5);
 for(const r of c.reels)await access(new URL(`../public/${r.image}`,import.meta.url));
 for(const f of ['anton.ttf','antonio.ttf','logo.webp','portrait.webp','studio-wide.webp','studio-camera.webp','studio-blue.webp'])await access(new URL(`../public/assets/${f}`,import.meta.url));
 for(const s of brand.socials)assert.equal(new URL(s.url).protocol,'https:');
 const html=await readFile(new URL('../src/template.html',import.meta.url),'utf8');const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'HTML id benzersiz olmalı');for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(id),`Eksik anchor ${id}`);
 const ads=await load('advertising');assert.equal(ads.models.length,16);assert.equal(new Set(ads.models.map(m=>m.id)).size,16);
 assert.equal(ads.models.filter(m=>m.category==='reels').length,12);assert.equal(ads.models.filter(m=>m.category==='live').length,4);
 assert(ads.disclaimer.includes('temsili')&&ads.disclaimer.includes('gerçek bir sponsorluk'));
 for(const model of ads.models){assert(model.name&&model.english&&model.description&&model.goal&&model.platforms.length);assert(!model.image.src.includes('alt-'));assert.equal(model.orientation,model.number<=12?'portrait':'landscape');for(const image of [model.thumbnail,model.image]){assert(image.width>0&&image.height>0);assert(image.src.startsWith('assets/advertising-showcase/')&&image.src.endsWith('.webp'));await access(new URL('../public/'+image.src,import.meta.url));}}
 const offers=await load('packages');assert.equal(offers.items.length,4);assert.equal(offers.comparison.length,25);
 assert.deepEqual(offers.items.map(p=>p.sponsoredCount),[4,8,12,0]);assert.deepEqual(offers.items.map(p=>p.dedicatedCount),[0,0,0,1]);assert(offers.items.every(p=>!('shares' in p)&&!('videos' in p)));
 assert(offers.platforms.includes('YouTube yatay video (16:9)'));
 for(const offer of offers.items.filter(p=>p.id!=='production'))assert(!/özgün (kısa )?video|markaya özel video üretimi|özel reklam çekimi/i.test(JSON.stringify(offer.features)));
 assert.deepEqual(offers.comparison.find(r=>r.label==='Sponsorlu içerik').values,[4,8,12,false]);
 assert.deepEqual(offers.comparison.find(r=>r.label==='Özgün video (özel video)').values,[false,false,false,1]);
 assert.deepEqual(offers.items.map(p=>p.demos.length),[7,10,15,1]);
 for(const offer of offers.items){assert(offer.features.length>0);for(const id of offer.demos)assert(ads.models.some(m=>m.id===id));assert(!Object.keys(offer).some(key=>/price|cost|profit|margin|pilot|negotiation/i.test(key)));}
 for(const row of offers.comparison)assert.equal(row.values.length,4);
 assert.deepEqual(offers.items.find(p=>p.id==='production').demos,['demo-12']);
 const tracking=await load('analytics');assert.equal(typeof tracking.enabled,'boolean');assert(Array.isArray(tracking.allowedHosts));if(tracking.enabled){assert(/^G-[A-Z0-9]{6,}$/.test(tracking.measurementId),'Geçerli GA4 ölçüm kimliği gerekli');assert(tracking.allowedHosts.length>0,'Yayın hostname gerekli');}assert(tracking.allowedHosts.every(h=>/^[a-z0-9.-]+$/.test(h)&&!h.includes('localhost')));
 console.log('Veri kapsamı, platform kırılımları, kaynaklar, görseller ve sayfa bağlantıları doğrulandı.');
}
if(process.argv[1]===new URL(import.meta.url).pathname)await validate();
