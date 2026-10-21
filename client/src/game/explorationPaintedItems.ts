/** One raster atlas shared by world drops, bag, cards and authored hazards. */
export const PAINTED_ITEMS='/forest-adventure/items/painted-atlas-v1.webp';
export const PAINTED_ITEM_CELLS={fibra:0,erva:1,fruta:2,ambar:3,broche:4,perola:5,escama:6,roots:7,tide:8,amber:9,spikes:10,steam:11} as const;
export type PaintedItem=keyof typeof PAINTED_ITEM_CELLS;
export function paintedItemPosition(item:PaintedItem){const n=PAINTED_ITEM_CELLS[item];return{x:n%4,y:Math.floor(n/4)};}
export function drawPaintedItem(ctx:CanvasRenderingContext2D,atlas:HTMLImageElement|undefined,item:PaintedItem,x:number,y:number,size:number){if(!atlas?.complete||!atlas.naturalWidth)return;const p=paintedItemPosition(item),w=atlas.naturalWidth/4,h=atlas.naturalHeight/3,scale=size/Math.max(w,h);ctx.drawImage(atlas,p.x*w,p.y*h,w,h,x-w*scale/2,y-h*scale/2,w*scale,h*scale);}
