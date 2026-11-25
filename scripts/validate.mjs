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
 const tracking=await load('analytics');assert.equal(typeof tracking.enabled,'boolean');assert(Array.isArray(tracking.allowedHosts));if(tracking.enabled){assert(/^G-[A-Z0-9]{6,}$/.test(tracking.measurementId),'Geçerli GA4 ölçüm kimliği gerekli');assert(tracking.allowedHosts.length>0,'Yayın hostname gerekli');}assert(tracking.allowedHosts.every(h=>/^[a-z0-9.-]+$/.test(h)&&!h.includes('localhost')));
 console.log('Veri kapsamı, platform kırılımları, kaynaklar, görseller ve sayfa bağlantıları doğrulandı.');
}
if(process.argv[1]===new URL(import.meta.url).pathname)await validate();
