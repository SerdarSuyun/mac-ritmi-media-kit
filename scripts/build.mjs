import {cp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
import {validate} from './validate.mjs';
await validate();
const root=new URL('../',import.meta.url);await rm(new URL('dist',root),{recursive:true,force:true});await mkdir(new URL('dist',root));
await cp(new URL('public/',root),new URL('dist/',root),{recursive:true});
for(const [from,to] of [['src/template.html','dist/index.html'],['src/styles.css','dist/styles.css'],['src/app.js','dist/app.js'],['src/showcase.js','dist/showcase.js'],['src/showcase.css','dist/showcase.css'],['src/packages.js','dist/packages.js'],['src/packages.css','dist/packages.css'],['src/analytics.js','dist/analytics.js'],['src/data','dist/data']])await cp(new URL(from,root),new URL(to,root),{recursive:true});
console.log('Statik site hazır: dist/');

const data=Object.fromEntries(await Promise.all(['brand','metrics','audience','content','analytics','advertising','packages'].map(async n=>[n,JSON.parse(await readFile(new URL(`src/data/${n}.json`,root),'utf8'))])));
const html=(await readFile(new URL('dist/index.html',root),'utf8')).replace('<!--DATA-->',`<script type="application/json" id="site-data">${JSON.stringify(data).replace(/</g,'\\u003c')}</script>`);
await writeFile(new URL('dist/index.html',root),html);
