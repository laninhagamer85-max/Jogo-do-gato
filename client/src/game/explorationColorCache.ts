/** Bake runtime palette variants once. Canvas remains a native drawImage source. */
const variants=new Map<string,{image:HTMLImageElement;pixels:number}>();
export const EXPLORATION_COLOR_CACHE_PIXELS=12_000_000;
let pixels=0;
export const AUTUMN_GROUND_FILTER='sepia(.45) saturate(.85) hue-rotate(338deg)';
export const AUTUMN_PROP_FILTER='sepia(.65) saturate(1.15) hue-rotate(338deg)';
export function explorationColorVariant(image:HTMLImageElement|undefined,filter:string):HTMLImageElement|undefined{
 if(!image?.complete||!image.naturalWidth||typeof document==='undefined')return image;
 const key=`${image.currentSrc||image.src}:${filter}:${image.naturalWidth}x${image.naturalHeight}`;
 const hit=variants.get(key);if(hit){variants.delete(key);variants.set(key,hit);return hit.image;}
 const area=image.naturalWidth*image.naturalHeight;if(area>EXPLORATION_COLOR_CACHE_PIXELS)return image;
 while(pixels+area>EXPLORATION_COLOR_CACHE_PIXELS&&variants.size){const first=variants.keys().next().value!;pixels-=variants.get(first)!.pixels;variants.delete(first);}
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 const ctx=canvas.getContext('2d');if(!ctx)return image;
 ctx.filter=filter;ctx.drawImage(image,0,0);ctx.filter='none';
 // Existing sprite functions read decoded-image dimensions. No PNG encoding or async reload.
 Object.defineProperties(canvas,{complete:{value:true},naturalWidth:{value:canvas.width},naturalHeight:{value:canvas.height},src:{value:key}});
 const compatible=canvas as unknown as HTMLImageElement;variants.set(key,{image:compatible,pixels:area});pixels+=area;return compatible;
}
