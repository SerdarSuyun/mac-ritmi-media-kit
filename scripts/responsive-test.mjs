// Local review only. This script neither commits nor publishes anything.
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir,stat,access} from 'node:fs/promises';
import {resolve,extname,sep,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const output=resolve(root,'../outputs/showcase-review');
await mkdir(output,{recursive:true});
const widths=[390,430,768,1024,1440,1920];
const report={version:'2.1.0',buildSHA256:createHash('sha256').update(await readFile(resolve(root,'dist/index.html'))).digest('hex'),startedAt:new Date().toISOString(),status:'running',checks:[],screenshots:[],errors:[]};
const reportPath=resolve(output,'responsive-results.json');
const save=()=>writeFile(reportPath,JSON.stringify(report,null,2));
let browser,server,reviewPage;
async function check(width,name,fn){try{await fn();report.checks.push({width,name,status:'passed'});}catch(error){report.checks.push({width,name,status:'failed',error:error.message});}finally{if(reviewPage&&!reviewPage.isClosed()){if(await reviewPage.locator('dialog[open]').count()){await reviewPage.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await reviewPage.waitForFunction(()=>!document.querySelector('dialog[open]'));}}}await save();}
try{
 const candidates=[process.env.MACRITMI_PLAYWRIGHT_MODULE,'playwright','playwright-core','/Users/lunarmedia/.codex/skills/talking-head-b-roll/node_modules/playwright-core/index.mjs'].filter(Boolean);
 let pw;
 for(const name of candidates){try{pw=await import(name.startsWith('/')?pathToFileURL(name).href:name);break;}catch{}}
 if(!pw)throw new Error('Playwright bulunamadı. Test ortamında playwright veya playwright-core kurulu olmalı.');
 let base=process.env.MACRITMI_TEST_URL;
 if(base&&base!=='https://serdarsuyun.github.io/mac-ritmi-media-kit/index.html')throw new Error('Canlı test adresi beklenen Maç Ritmi adresi olmalı.');
 if(!base){
 server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=resolve(root,'dist','.'+pathname);const dist=resolve(root,'dist');if(file!==dist&&!file.startsWith(dist+sep)){res.writeHead(403).end();return;}if((await stat(file)).isDirectory())file=resolve(file,'index.html');const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.ttf':'font/ttf'};res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(await readFile(file));}catch{res.writeHead(404).end('Not found');}});
 await new Promise((ok,bad)=>{server.once('error',bad);server.listen(0,'127.0.0.1',ok)});
 base=`http://127.0.0.1:${server.address().port}`;
 }
 report.target=base;
 const executables=[process.env.MACRITMI_CHROMIUM_EXECUTABLE,'/Users/lunarmedia/Documents/Codex/2026-10-04/github-da-rec/tools/remotion-studio/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
 let executablePath;
 for(const candidate of executables){try{await access(candidate);executablePath=candidate;break;}catch{}}
 browser=await pw.chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
 console.log(`Testing: ${widths.join(', ')} px`);
 for(const width of widths){
  const height=width<=430?900:width===768?1024:1000;
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,isMobile:width<=430,hasTouch:width<=430});
  const page=await context.newPage();reviewPage=page;page.setDefaultTimeout(10000);
  const pageErrors=[];const badResponses=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  page.on('response',response=>{if(response.status()>=400)badResponses.push({url:response.url(),status:response.status()})});
  await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#is-birligi').scrollIntoViewIfNeeded();
  await check(width,'V2.1 shows three monthly packages and one separate production service',async()=>{
   assert.equal(await page.locator('#package-cards .package-card').count(),3);assert.equal(await page.locator('#production-package .package-card').count(),1);
   if(width>=1024){const y=await page.locator('#package-cards .package-card').evaluateAll(nodes=>nodes.map(n=>n.getBoundingClientRect().top));assert(y.every(value=>Math.abs(value-y[0])<2));}
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  });
  const offers=await page.locator('#site-data').evaluate(n=>JSON.parse(n.textContent).packages.items);
  await check(width,'V2.1 separates sponsored content from dedicated production without share quotas',async()=>{
   const counts=await page.locator('#package-cards .package-delivery>div:first-child').allTextContents();assert(counts.every(text=>text.includes('sponsorlu içerik / ay')));assert.equal(await page.locator('#service-models .service-model').count(),2);
   const data=await page.locator('#site-data').evaluate(n=>JSON.parse(n.textContent).packages);assert(data.items.every(item=>!('shares' in item)&&!('videos' in item)));assert.deepEqual(data.items.map(item=>item.sponsoredCount),[4,8,12,0]);assert.deepEqual(data.items.map(item=>item.dedicatedCount),[0,0,0,1]);assert(data.platforms.includes('YouTube yatay video (16:9)'));
  });

  await check(width,'Comparison table has 25 services and sticky labels without page overflow',async()=>{
   const region=page.locator('#comparison-scroll');await region.scrollIntoViewIfNeeded();assert.equal(await page.locator('#comparison-body tr').count(),25);assert.equal(await page.locator('#comparison-head th').count(),5);
   const first=page.locator('#comparison-body tr:first-child th');const before=(await first.boundingBox()).x;
   await region.evaluate(n=>n.scrollTo({left:n.scrollWidth,behavior:'instant'}));await page.evaluate(()=>new Promise(requestAnimationFrame));const after=(await first.boundingBox()).x;assert(Math.abs(before-after)<2);
   if(width<=768)assert(await region.evaluate(n=>n.scrollWidth>n.clientWidth));
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await region.evaluate(n=>n.scrollTo({left:0,behavior:'instant'}));
  });
  const packageShot=resolve(output,`packages-${width}.png`);await page.locator('#is-birligi').screenshot({path:packageShot});report.screenshots.push(packageShot);
  for(const item of offers){
   await check(width,`${item.id}: package detail, matching demos and WhatsApp message work`,async()=>{
    const trigger=page.locator(`[data-package-details="${item.id}"]`);await trigger.click();const modal=page.locator('#package-dialog');await modal.waitFor({state:'visible'});const bounds=await modal.boundingBox();assert(bounds.x>=-1&&bounds.y>=-1&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height+1);
    assert.equal(await page.locator('#package-demo-options button').count(),item.demos.length);assert((await page.locator('#package-dialog-title').textContent()).startsWith(item.name));
    await page.locator('#package-demo-options button').last().click();assert((await page.locator('#package-demo-image').getAttribute('src')).includes(item.demos.at(-1)));assert(await page.locator('#package-demo-image').evaluate(async n=>{await n.decode();return n.naturalWidth>0}));
    const quote=page.locator('#package-dialog-quote');await quote.scrollIntoViewIfNeeded();const url=new URL(await quote.getAttribute('href'));assert.equal(url.pathname,'/905062560041');assert(url.searchParams.get('text').includes(item.name+' — '+item.subtitle));assert(await quote.isVisible());
    const sizing=await page.locator('#package-dialog-shell').evaluate(n=>({scroll:n.scrollWidth,client:n.clientWidth}));assert(sizing.scroll<=sizing.client+1,`Package dialog overflow: ${JSON.stringify(sizing)}`);assert.equal(await page.locator('#whatsapp-floating').evaluate(n=>getComputedStyle(n).visibility),'hidden');
    const steps=item.demos.length+5;for(let i=0;i<steps;i++){await page.keyboard.press('Tab');assert(await modal.evaluate(n=>n.contains(document.activeElement)));}for(let i=0;i<steps;i++){await page.keyboard.press('Shift+Tab');assert(await modal.evaluate(n=>n.contains(document.activeElement)));}
    if(item.id==='silver'){await page.locator('#package-dialog-shell').evaluate(n=>n.scrollTop=0);const shot=resolve(output,`package-detail-${width}.png`);await modal.screenshot({path:shot});report.screenshots.push(shot);}
    await page.keyboard.press('Escape');await modal.waitFor({state:'hidden'});assert.equal(await trigger.evaluate(n=>document.activeElement===n),true);
   });
  }
  await check(width,'Package comparison header opens matching detail and backdrop closes it',async()=>{
   const trigger=page.locator('#comparison-head th[data-package-column="gold"] button');await trigger.click();assert((await page.locator('#package-dialog-title').textContent()).startsWith('Altın'));await page.mouse.click(2,2);assert(!(await page.locator('#package-dialog').isVisible()));
  });
  await check(width,'Package quote clicks emit the expected public event once',async()=>{
   await page.evaluate(()=>{window.__packageClicks=[];document.addEventListener('macritmi:packages',e=>window.__packageClicks.push(e.detail));document.querySelector('[data-package-quote="silver"]').addEventListener('click',e=>e.preventDefault());document.getElementById('package-dialog-quote').addEventListener('click',e=>e.preventDefault());});
   await page.locator('[data-package-quote="silver"]').click();await page.locator('[data-package-details="silver"]').click();await page.locator('#package-dialog-quote').click();const events=await page.evaluate(()=>window.__packageClicks);assert.equal(events.filter(e=>e.name==='package_whatsapp_click').length,1);assert.equal(events.filter(e=>e.name==='package_quote_click').length,1);assert.equal(events.find(e=>e.name==='package_quote_click').parameters.package_name,'Gümüş');await page.keyboard.press('Escape');
  });
  await page.locator('#reklam-modelleri').scrollIntoViewIfNeeded();
  await check(width,'Page has no horizontal overflow',async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)));
  await check(width,'Navigation remains usable at this width',async()=>{
   if(width<=1240){await page.locator('#menu-toggle').click();assert(await page.locator('#navigation').isVisible());assert(await page.locator('#navigation').evaluate(n=>n.getBoundingClientRect().right<=innerWidth+1));await page.locator('#navigation a[href="#reklam-modelleri"]').click();assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'),'false');}
   else assert(await page.locator('#navigation').isVisible());
  });
  await check(width,'Default shows Reels group and exactly 12 portrait cards',async()=>{assert.equal(await page.locator('#ad-filter-reels').getAttribute('aria-selected'),'true');assert.equal(await page.locator('#ad-track-reels .ad-card').count(),12);assert(!(await page.locator('#ad-group-live').isVisible()));});
  if(width>=1440)await check(width,'Four portrait cards fit the first desktop row',async()=>{
   const count=await page.locator('#ad-track-reels').evaluate(track=>{const r=track.getBoundingClientRect();return [...track.querySelectorAll('.ad-card')].filter(c=>{const b=c.getBoundingClientRect();return b.left>=r.left-4&&b.right<=r.right+4}).length});assert.equal(count,4);
  });
  await check(width,'Portrait track can reach the final model',async()=>{
   const track=page.locator('#ad-track-reels');await track.evaluate(n=>n.scrollTo({left:n.scrollWidth,behavior:'instant'}));await page.waitForFunction(()=>{const t=document.getElementById('ad-track-reels');return t.scrollLeft>0});assert(await track.evaluate(n=>{const a=n.getBoundingClientRect(),b=n.lastElementChild.getBoundingClientRect();return b.right<=a.right+4}));await track.evaluate(n=>n.scrollTo({left:0,behavior:'instant'}));
  });
  const portraitShot=resolve(output,`${width<=430?'mobile':'desktop'}-${width}.png`);await page.locator('#reklam-modelleri').screenshot({path:portraitShot});report.screenshots.push(portraitShot);
  await check(width,'Live category shows 4 landscape cards and hides portrait group',async()=>{await page.locator('#ad-filter-live').click();assert(!(await page.locator('#ad-group-reels').isVisible()));assert.equal(await page.locator('#ad-track-live .ad-card').count(),4);assert(await page.locator('#ad-group-live').isVisible());});
  await check(width,'All category preserves two orientation groups',async()=>{await page.locator('#ad-filter-all').click();assert(await page.locator('#ad-group-reels').isVisible());assert(await page.locator('#ad-group-live').isVisible());});
  const models=width===390||width===1440?Array.from({length:16},(_,i)=>i+1):[1,12,13,16];
  for(const number of models){
   const id=`demo-${String(number).padStart(2,'0')}`;
   await check(width,`${id}: modal fits, image loads, quote is usable, focus returns`,async()=>{
    const card=page.locator(`[data-demo="${id}"]`);await card.click();const modal=page.locator('#advertising-dialog');await modal.waitFor({state:'visible'});
    const bounds=await modal.boundingBox();assert(bounds.x>=-1&&bounds.y>=-1&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height+1);
    assert(await page.locator('#ad-dialog-image').evaluate(async img=>{try{await img.decode()}catch{}return img.complete&&img.naturalWidth>0}));
    const visual=await page.locator('#ad-dialog-image').boundingBox();assert(visual.width<=bounds.width);
    assert.equal(await page.locator('#whatsapp-floating').evaluate(n=>getComputedStyle(n).visibility),'hidden');
    const quote=page.locator('#ad-dialog-quote');await quote.scrollIntoViewIfNeeded();assert(await quote.isVisible());
    const url=new URL(await quote.getAttribute('href'));assert.equal(url.pathname,'/905062560041');assert(url.searchParams.get('text').includes(`DEMO ${String(number).padStart(2,'0')}`));
    assert(await page.locator('#ad-dialog-shell').evaluate(n=>n.scrollWidth<=n.clientWidth+1));
    if(number===1||number===13){const shot=resolve(output,`detail-${width}-${id}.png`);await page.locator('#ad-dialog-shell').evaluate(n=>n.scrollTop=0);await modal.screenshot({path:shot});report.screenshots.push(shot);}
    await page.locator('#ad-dialog-close').click();await modal.waitFor({state:'hidden'});assert.equal(await card.evaluate(n=>document.activeElement===n),true);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   });
   if(await page.locator('#advertising-dialog').isVisible())await page.keyboard.press('Escape');
  }
  await check(width,'Modal keyboard focus is contained and Escape closes it',async()=>{await page.locator('[data-demo="demo-01"]').click();for(let i=0;i<10;i++){await page.keyboard.press('Tab');assert(await page.locator('#advertising-dialog').evaluate(n=>n.contains(document.activeElement)));}for(let i=0;i<10;i++){await page.keyboard.press('Shift+Tab');assert(await page.locator('#advertising-dialog').evaluate(n=>n.contains(document.activeElement)));}await page.keyboard.press('Escape');assert(!(await page.locator('#advertising-dialog').isVisible()));});
  await check(width,'Next/previous honor category and backdrop closes detail',async()=>{await page.locator('#ad-filter-live').click();await page.locator('[data-demo="demo-13"]').click();await page.locator('#ad-dialog-previous').click();assert((await page.locator('#ad-dialog-number').textContent()).startsWith('DEMO 16'));await page.locator('#ad-dialog-next').click();assert((await page.locator('#ad-dialog-number').textContent()).startsWith('DEMO 13'));await page.mouse.click(2,2);assert(!(await page.locator('#advertising-dialog').isVisible()));});
  await check(width,'Floating WhatsApp stays inside viewport; card images preserve aspect',async()=>{const box=await page.locator('#whatsapp-floating').boundingBox();assert(box.x>=0&&box.x+box.width<=width&&box.y+box.height<=height);assert(await page.locator('.ad-card-image img').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).objectFit==='contain')));});
  await check(width,'No broken HTTP assets or JavaScript errors',async()=>{assert.deepEqual(pageErrors,[]);assert.deepEqual(badResponses,[]);});
  await context.close();await save();console.log(`${width}px checked`);
 }
 report.status=report.checks.some(c=>c.status==='failed')?'failed':'passed';
}catch(error){report.status='blocked';report.errors.push(error.stack||error.message);console.error(error.message);}
finally{if(browser)await browser.close();if(server)await new Promise(done=>server.close(done));report.finishedAt=new Date().toISOString();await save();}
console.log(JSON.stringify({status:report.status,passed:report.checks.filter(c=>c.status==='passed').length,failed:report.checks.filter(c=>c.status==='failed').length,report:reportPath},null,2));
process.exitCode=report.status==='passed'?0:1;
