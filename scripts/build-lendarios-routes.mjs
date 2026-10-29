import {mkdir,copyFile,rm,cp,readFile,writeFile} from 'node:fs/promises';
await copyFile('dist/public/lendarios.html','dist/public/index.html');
for(const route of ['entrar','jogar','cadastro','game','guia','guia/capitulo-1','guia/capitulo-2','guia/capitulo-3','bestiario']){await mkdir(`dist/public/${route}`,{recursive:true});await copyFile('dist/public/index.html',`dist/public/${route}/index.html`);}
for(const name of ['qa-exploration-viewport.html','qa-map-viewport.html'])await rm(`dist/public/${name}`,{force:true});

await cp('apps/lendarios-do-rei/public','dist/public',{recursive:true});

await rm('out',{recursive:true,force:true});
await cp('dist/public','out',{recursive:true});

const pages={guia:['Guia de jogo','Aprenda os controles e consulte as salas dos três primeiros capítulos.'],'guia/capitulo-1':['Guia da Clareira dos Troncos','Objetivos e preparação para as salas 1 a 10 e o Mestre dos Troncos.'],'guia/capitulo-2':['Guia do Riacho dos Cristais','Objetivos e preparação para as salas 11 a 20 e o Mestre das Marés.'],'guia/capitulo-3':['Guia do Bosque do Âmbar','Objetivos e preparação para as salas 21 a 30 e o Mestre do Âmbar.'],bestiario:['Bestiário do reino','Conheça os lendários, mestres, criaturas e moradores humanos do reino.']};
for(const [route,[title,description]] of Object.entries(pages)){const path=`out/${route}/index.html`;let html=await readFile(path,'utf8');html=html.replace(/<title>.*?<\/title>/,`<title>${title} — Lendários do Rei</title>`).replace(/(<meta name="description" content=")[^"]*/,'$1'+description).replaceAll('https://lendarios-do-rei.aquimeusite.chatgpt.site/"',`https://lendarios-do-rei.aquimeusite.chatgpt.site/${route}/"`);await writeFile(path,html);}
