import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,it,expect} from 'vitest';
import ExplorationItemIcon from '../components/ExplorationItemIcon';
describe('pickup and inventory art consistency',()=>{
 it.each(['fibra','erva','fruta','ambar'] as const)('keeps %s floor sprite identical to its inventory art',item=>{
  const svg=readFileSync(new URL(`../../public/forest-adventure/items/${item}.svg`,import.meta.url),'utf8');
  expect(svg.replace(' xmlns="http://www.w3.org/2000/svg"','')).toBe(renderToStaticMarkup(React.createElement(ExplorationItemIcon,{item,size:48})));
 });
});
