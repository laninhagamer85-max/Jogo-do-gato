import {access} from 'node:fs/promises';
// The renderer and inventory now consume the original painted atlas directly.
// Keep old SVG files as legacy assets; do not emit non-SVG component markup into them.
await access(new URL('../client/public/forest-adventure/items/painted-atlas-v1.webp',import.meta.url));
console.log('Exploration painted item atlas verified; legacy assets retained.');
