// Approved V2.1 release. No private documents or original PNG files are uploaded.
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir,mkdtemp,readdir,copyFile} from 'node:fs/promises';
import {resolve,dirname,relative,sep,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const task=resolve(root,'..');
const repo='SerdarSuyun/mac-ritmi-media-kit';
const baseline='fa2ff898c56d506112d846b2f596f01b96da8b6f';
const message='fix: clarify sponsored content and dedicated production service definitions';
const liveURL='https://serdarsuyun.github.io/mac-ritmi-media-kit/index.html';
const receiptFile=resolve(task,'outputs/showcase-review/publish-result.json');
const receipt={version:'2.1.0',status:'preparing',repository:repo,liveURL,startedAt:new Date().toISOString()};
await mkdir(dirname(receiptFile),{recursive:true});
const save=()=>writeFile(receiptFile,JSON.stringify(receipt,null,2)+'\n');
function run(command,args,{cwd=root,capture=false,env={}}={}){
 return new Promise((ok,bad)=>{const child=spawn(command,args,{cwd,env:{...process.env,...env},stdio:capture?['ignore','pipe','pipe']:'inherit'});let out='',err='';if(capture){child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>err+=b)}child.on('error',bad);child.on('close',code=>code===0?ok(out.trim()):bad(new Error(`${command} başarısız (${code}). ${capture?err.trim():''}`)));});
}
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function walk(directory){const files=[];for(const item of await readdir(directory,{withFileTypes:true})){if(item.isSymbolicLink())throw new Error('Yayın listesinde symlink bulunamaz.');const full=resolve(directory,item.name);if(item.isDirectory())files.push(...await walk(full));else if(item.isFile())files.push(full);}return files;}
try{
 const test=JSON.parse(await readFile(resolve(task,'outputs/showcase-review/responsive-results.json'),'utf8'));
 const html=await readFile(resolve(root,'dist/index.html'));
 if(test.status!=='passed'||test.buildSHA256!==sha(html)||test.checks.length!==164)throw new Error('164/164 test raporu mevcut derlemeyle eşleşmiyor. Önce ekran testini çalıştırın.');
 await run('npm',['run','check']);
 try{await run('gh',['auth','status'],{capture:true});}catch{
  console.log('GitHub oturumu gerekiyor. Tarayıcıdaki GitHub girişini tamamlayın.');
  await run('gh',['auth','login','--hostname','github.com','--git-protocol','https','--web']);
 }
 const checkout=await mkdtemp(resolve(task,'work/github-release-'));
 receipt.checkout=checkout;
 await run('git',['clone','--branch','main','--single-branch','https://github.com/'+repo+'.git',checkout],{cwd:task});
 const parent=await run('git',['rev-parse','HEAD'],{cwd:checkout,capture:true});
 if(parent!==baseline)throw new Error('Uzak depo son incelemeden sonra değişmiş. Üzerine yazmamak için durduruldu. Yeni HEAD: '+parent);
 receipt.previousCommit=parent;
 const manifest=[];
 async function install(source,destination){
  const path=destination.split(sep).join('/');
  if(/(^|\/)(docs|work|outputs|\.git)(\/|$)/i.test(path)||/\.png$/i.test(path)||/rate.?card|istisna|banka|vergi/i.test(path))throw new Error('Yayın dışı dosya: '+path);
  const file=resolve(checkout,destination);
  if(!file.startsWith(checkout+sep))throw new Error('Geçersiz yayın yolu.');
  const bytes=await readFile(source);
  await mkdir(dirname(file),{recursive:true});await writeFile(file,bytes);
  manifest.push({path,bytes:bytes.length,sha256:sha(bytes)});
 }
 // Source files and public, optimized assets only. Never copy project docs or originals.
 for(const dir of ['src','public','scripts'])for(const source of await walk(resolve(root,dir)))await install(source,relative(root,source));
 for(const name of ['package.json','.gitignore'])await install(resolve(root,name),name);
 // Current hosting publishes main/(root); retain matching dist output as well.
 for(const source of await walk(resolve(root,'dist'))){const path=relative(resolve(root,'dist'),source);await install(source,path);await install(source,join('dist',path));}
 const readme=`# Maç Ritmi Digital Media Kit V2.1\n\nSponsorlu içerik paketleri, Özel Prodüksiyon ve 16 temsili reklam uygulaması.\n\nCanlı site: ${liveURL}\n\n## Geliştirme\n\nNode.js 22+: npm run check, npm run build, npm run preview.\n\nİçerikler src/data içindeki JSON dosyalarından yönetilir. Aylık sponsorluk paketleri mevcut futbol içeriklerine marka entegrasyonudur; markaya özel bağımsız video yalnız Özel Prodüksiyon kapsamında sunulur.\n\nGitHub Pages kök dizini ve dist içeriği aynı build ile güncellenmelidir. Kamuya açık fiyatlandırma bulunmaz.\n`;
 await writeFile(resolve(checkout,'README.md'),readme);
 manifest.push({path:'README.md',bytes:Buffer.byteLength(readme),sha256:sha(Buffer.from(readme))});
 for(const path of ['.nojekyll','dist/.nojekyll']){await writeFile(resolve(checkout,path),'');manifest.push({path,bytes:0,sha256:sha(Buffer.from(''))});}
 receipt.fileCount=manifest.length;
 await writeFile(resolve(task,'outputs/showcase-review/publish-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 await run('git',['add','--force','--',...manifest.map(item=>item.path)],{cwd:checkout});
 const staged=(await run('git',['diff','--cached','--name-only'],{cwd:checkout,capture:true})).split('\n').filter(Boolean);
 const allowed=new Set(manifest.map(item=>item.path));
 if(staged.some(path=>!allowed.has(path)))throw new Error('Yayın listesi dışında değişiklik saptandı.');
 if(!staged.length)throw new Error('Yayımlanacak yeni değişiklik bulunamadı.');
 receipt.changedFiles=staged;
 await run('git',['-c','user.name=SerdarSuyun','-c','user.email=179689874+SerdarSuyun@users.noreply.github.com','commit','-m',message],{cwd:checkout});
 const commit=await run('git',['rev-parse','HEAD'],{cwd:checkout,capture:true});receipt.commit=commit;
 // Credential material remains in GitHub CLI's credential helper, never in files/arguments.
 await run('git',['-c','credential.helper=','-c','credential.helper=!gh auth git-credential','push','origin','HEAD:main'],{cwd:checkout});
 receipt.status='pushed_waiting_for_pages';await save();console.log('GitHub güncellendi. Pages yayını doğrulanıyor…');
 let lastError='Yayın henüz güncellenmedi.';
 for(let attempt=0;attempt<36;attempt++){
  try{const response=await fetch(liveURL+'?release='+commit,{signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});if(response.ok&&sha(Buffer.from(await response.arrayBuffer()))===sha(html)){receipt.status='deployed';receipt.verifiedAt=new Date().toISOString();await save();console.log('YAYIN DOĞRULANDI: '+liveURL);break;}lastError='Canlı HTML henüz bu derlemeyle eşleşmedi.';}catch(error){lastError=error.message;}
  await new Promise(done=>setTimeout(done,5000));
 }
 if(receipt.status!=='deployed'){receipt.verificationNote=lastError;console.log('Commit yüklendi; canlı yayın henüz doğrulanamadı. Actions sayfasından kontrol edin.');}
 if(receipt.status==='deployed'){
  const localReport=await readFile(resolve(task,'outputs/showcase-review/responsive-results.json'));
  console.log('Canlı sitede 6 ekran genişliği kontrol ediliyor…');
  try{
   await run(process.execPath,['scripts/responsive-test.mjs'],{cwd:root,env:{MACRITMI_TEST_URL:liveURL}});
   const liveReport=JSON.parse(await readFile(resolve(task,'outputs/showcase-review/responsive-results.json'),'utf8'));
   await writeFile(resolve(task,'outputs/showcase-review/live-responsive-results.json'),JSON.stringify(liveReport,null,2)+'\n');
   receipt.liveTests={status:liveReport.status,total:liveReport.checks.length,passed:liveReport.checks.filter(c=>c.status==='passed').length,target:liveReport.target};
   if(liveReport.status!=='passed')throw new Error('Canlı site ekran kontrolü tamamlanamadı.');
   receipt.status='deployed_and_tested';console.log('CANLI SİTE TESTİ BAŞARILI: '+liveURL);
  }catch(error){receipt.status='deployed_qa_needs_review';receipt.verificationNote=error.message;console.error(error.message);}
  finally{await writeFile(resolve(task,'outputs/showcase-review/responsive-results.json'),localReport);}
 }

}catch(error){receipt.status=receipt.commit&&receipt.status==='pushed_waiting_for_pages'?'pushed_not_verified':'blocked';receipt.error=error.message;console.error(error.message);process.exitCode=1;}
finally{receipt.finishedAt=new Date().toISOString();await save();console.log('Yayın raporu: '+receiptFile);}
