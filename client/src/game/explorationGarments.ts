/** Cache recolored cloth only. Warm skin/hair, neutral armor and transparent pixels remain intact. */
export const CITIZEN_CLOTHES=['#36766d','#526b9a','#89578b','#9b6944','#638244','#a34c51','#6e638f','#ad8745','#456d83','#7d4e64','#7a7848','#4e607c','#754b3d','#44765a','#8c6796','#98744c'] as const;
export function clothPixel(r:number,g:number,b:number,y:number,x=.5){
 const max=Math.max(r,g,b),min=Math.min(r,g,b),chroma=max-min;
 // Skin and hair are usually warm; keep all of them, including hands below the head.
 const skin=r>g*1.06&&r>b*1.18;
 return y>.23&&y<.89&&max>28&&chroma>16&&(!skin&&(b>r*.95||g>r*1.04)||(r>g*1.5&&r>b*1.4||g>r*.7&&b<g*.65)&&y>.32&&y<.63&&x>.22&&x<.78);
}
export function tintCloth(data:Uint8ClampedArray,width:number,height:number,color:string){const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)),base=Math.max(...rgb);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2];if(!data[i+3]||!clothPixel(r,g,b,y/height,x/width))continue;const shade=Math.max(r,g,b)/base;for(let c=0;c<3;c++)data[i+c]=Math.min(255,Math.round(rgb[c]*shade));}return data;}
const cache=new Map<string,HTMLCanvasElement>();
export function garmentCrop(im:HTMLImageElement,rect:readonly number[],variant:number){if(typeof document==='undefined'||!im.complete||!im.naturalWidth)return;const key=`${im.src}:${rect.join(',')}:${variant}`,hit=cache.get(key);if(hit)return hit;const [sx,sy,w,h]=rect,c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');if(!ctx)return;ctx.drawImage(im,sx,sy,w,h,0,0,w,h);const pixels=ctx.getImageData(0,0,w,h);tintCloth(pixels.data,w,h,CITIZEN_CLOTHES[variant%CITIZEN_CLOTHES.length]);ctx.putImageData(pixels,0,0);if(cache.size>=384)cache.delete(cache.keys().next().value!);cache.set(key,c);return c;}
