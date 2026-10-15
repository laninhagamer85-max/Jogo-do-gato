import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {mkdir,writeFile} from 'node:fs/promises';
import ExplorationItemIcon from '../client/src/components/ExplorationItemIcon';
// Export the existing original inventory artwork, so floor pickups use exactly the same silhouettes.
const directory=new URL('../client/public/forest-adventure/items/',import.meta.url);
await mkdir(directory,{recursive:true});
for(const item of ['fibra','erva','fruta','ambar','broche'] as const){
 const svg=renderToStaticMarkup(React.createElement(ExplorationItemIcon,{item,size:48}));
 await writeFile(new URL(item+'.svg',directory),svg.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '));
}
console.log('Exploration item SVGs exported from the original inventory component.');
