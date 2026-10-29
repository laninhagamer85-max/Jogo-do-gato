import {mkdir,copyFile,rm,cp} from 'node:fs/promises';
await copyFile('dist/public/lendarios.html','dist/public/index.html');
for(const route of ['entrar','jogar','cadastro','game']){await mkdir(`dist/public/${route}`,{recursive:true});await copyFile('dist/public/index.html',`dist/public/${route}/index.html`);}
for(const name of ['qa-exploration-viewport.html','qa-map-viewport.html'])await rm(`dist/public/${name}`,{force:true});

await cp('apps/lendarios-do-rei/public','dist/public',{recursive:true});
