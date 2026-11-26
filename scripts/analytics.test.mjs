import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../src/analytics.js',import.meta.url),'utf8');
function setup(overrides={},url='https://kit.example.com/?email=private@example.com#kitle',stored=null){
 const nodes=new Map();const scripts=[];const events={};const data={enabled:true,measurementId:'G-TEST123456',allowedHosts:['kit.example.com'],consentVersion:1,consentMaxAgeDays:180,...overrides};
 const node=id=>{if(!nodes.has(id))nodes.set(id,{id,hidden:true,handlers:{},addEventListener(type,fn){this.handlers[type]=fn},focus(){this.focused=true}});return nodes.get(id)};
 node('site-data').textContent=JSON.stringify({analytics:data});
 const storage=new Map(stored?[['macritmi.analytics-consent',JSON.stringify(stored)]]:[]);
 const document={title:'Maç Ritmi',referrer:'https://source.example.org/private?email=hidden',cookie:'',visibilityState:'visible',getElementById:node,createElement:()=>({}),head:{append(script){scripts.push(script)}},addEventListener(type,fn){events[type]=fn}};
 const window={};const location=new URL(url);
 vm.runInNewContext(source,{document,window,location,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},URL,Date});
 const calls=()=>Array.from(window.dataLayer||[],x=>Array.from(x));
 return {node,scripts,window,calls,advertising:detail=>events['macritmi:advertising']?.({detail}),packages:detail=>events['macritmi:packages']?.({detail}),click:id=>node(id).handlers.click(),track:target=>events.click({target:{closest:()=>target}})};
}
test('No tag, script or banner on disabled, local, invalid-ID and other-host previews',()=>{
 for(const [config,url] of [[{enabled:false},undefined],[{},'file:///tmp/index.html'],[{},'https://localhost'],[{},'https://other.example.com'],[{measurementId:''},undefined]]){const s=setup(config,url);assert.equal(s.scripts.length,0);assert.equal(s.calls().length,0);assert.equal(s.node('analytics-consent').hidden,true);}
});
test('No Google network script before consent; rejection does not track',()=>{
 const s=setup();assert.equal(s.scripts.length,0);assert.equal(s.node('analytics-consent').hidden,false);s.click('analytics-reject');s.track({id:'whatsapp-floating'});assert.equal(s.scripts.length,0);assert.equal(s.calls().filter(c=>c[0]==='event').length,0);
});
test('Acceptance loads once and records one pageview with sanitized URLs',()=>{
 const s=setup();s.click('analytics-accept');s.click('analytics-accept');assert.equal(s.scripts.length,1);const views=s.calls().filter(c=>c[0]==='event'&&c[1]==='page_view');assert.equal(views.length,1);assert.equal(views[0][2].page_location,'https://kit.example.com/');const config=s.calls().find(c=>c[0]==='config')[2];assert.equal(config.send_page_view,false);assert.equal(config.page_referrer,'https://source.example.org');assert.equal(config.allow_google_signals,false);
});
test('WhatsApp placements are distinguished without sending phone, message or link',()=>{
 const s=setup();s.click('analytics-accept');s.track({id:'whatsapp-floating',href:'https://wa.me/secret'});s.track({id:'whatsapp'});const clicks=s.calls().filter(c=>c[1]==='whatsapp_click');assert.equal(clicks.length,2);assert.equal(clicks[0][2].button_location,'floating');assert.equal(clicks[1][2].button_location,'contact');assert(!JSON.stringify(clicks).includes('secret'));
});
test('Withdrawal blocks later contact events',()=>{
 const s=setup();s.click('analytics-accept');s.click('analytics-reject');const before=s.calls().length;s.track({id:'whatsapp'});assert.equal(s.calls().length,before);assert.equal(s.window['ga-disable-G-TEST123456'],true);
});
test('A saved current consent works; expired consent requires a new choice',()=>{
 assert.equal(setup({},undefined,{choice:'granted',version:1,at:Date.now()}).scripts.length,1);
 const expired=setup({},undefined,{choice:'granted',version:1,at:0});assert.equal(expired.scripts.length,0);assert.equal(expired.node('analytics-consent').hidden,false);
});

test('Advertising events honor consent and each quote is recorded once',()=>{
 const s=setup();const detail={name:'advertising_quote_click',parameters:{demo_id:'demo-09',demo_name:'Sözlü Sponsor Anlatımı',advertising_category:'reels',platform:'reels_shorts',source_section:'advertising_showcase'}};
 s.advertising(detail);assert.equal(s.calls().filter(c=>c[1]==='advertising_quote_click').length,0);s.click('analytics-accept');s.advertising(detail);const quotes=s.calls().filter(c=>c[1]==='advertising_quote_click');assert.equal(quotes.length,1);assert.equal(quotes[0][2].demo_id,'demo-09');assert.equal(quotes[0][2].platform,'reels_shorts');
});
test('Advertising bridge strips unapproved parameters and unknown event names',()=>{
 const s=setup();s.click('analytics-accept');s.advertising({name:'advertising_demo_open',parameters:{demo_id:'demo-01',email:'private@example.com',url:'https://private.example.com'}});const call=s.calls().find(c=>c[1]==='advertising_demo_open');assert(call);assert(!JSON.stringify(call).includes('private'));const before=s.calls().length;s.advertising({name:'unapproved_event',parameters:{}});assert.equal(s.calls().length,before);
});

test('Package quote events require consent and keep only approved public parameters',()=>{
 const s=setup();const detail={name:'package_quote_click',parameters:{package_name:'Gümüş',source_section:'package_details',platform:'instagram_facebook_youtube',private_note:'do-not-send'}};
 s.packages(detail);assert.equal(s.calls().filter(c=>c[1]==='package_quote_click').length,0);s.click('analytics-accept');s.packages(detail);const calls=s.calls().filter(c=>c[1]==='package_quote_click');assert.equal(calls.length,1);assert.equal(calls[0][2].package_name,'Gümüş');assert(!JSON.stringify(calls).includes('do-not-send'));
});
test('Package card WhatsApp and modal quote events have separate scopes',()=>{
 const s=setup();s.click('analytics-accept');s.packages({name:'package_whatsapp_click',parameters:{package_name:'Bronz',source_section:'package_card',platform:'instagram_facebook_youtube'}});assert.equal(s.calls().filter(c=>c[1]==='package_whatsapp_click').length,1);assert.equal(s.calls().filter(c=>c[1]==='package_quote_click').length,0);
});
