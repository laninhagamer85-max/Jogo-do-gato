import {existsSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe,it,expect} from 'vitest';
import ExplorationItemIcon from '../components/ExplorationItemIcon';
import {PAINTED_ITEMS,PAINTED_ITEM_CELLS,paintedItemPosition} from './explorationPaintedItems';
describe('painted pickup and inventory art',()=>{
 it('has one distinct cell per item and hazard inside the shared raster atlas',()=>{expect(new Set(Object.values(PAINTED_ITEM_CELLS)).size).toBe(12);expect(existsSync(new URL('../../public'+PAINTED_ITEMS,import.meta.url))).toBe(true);});
 it.each(['fibra','erva','fruta','ambar','perola','escama','roots','tide','amber'] as const)('uses the same painted source for %s in the inventory',item=>{const html=renderToStaticMarkup(React.createElement(ExplorationItemIcon,{item,size:48}));expect(html).toContain(PAINTED_ITEMS);expect(html).not.toContain('<svg');const p=paintedItemPosition(item);expect(p.x).toBeLessThan(4);expect(p.y).toBeLessThan(3);});
});
