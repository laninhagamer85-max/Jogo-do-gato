/** Biome-independent terrain material: fixed world density, overlapping aperiodic patches. */
export type TerrainMaterial={id:string;seed:number;span:number;step:number;jitter:number;feather:number;atlasColumns?:number;atlasRows?:number;upright?:boolean};
export const GRASS_MATERIAL:TerrainMaterial={id:'grass-block-v1',seed:5102026,span:2,step:.9,jitter:.08,feather:.18};
export type TerrainBounds={left:number;top:number;width:number;height:number};
export function terrainPatch(x:number,y:number,material=GRASS_MATERIAL){
 let n=(Math.imul(x,73856093)^Math.imul(y,19349663)^material.seed)>>>0;
 const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 return {x:(x+.5)*material.step+(random()-.5)*material.jitter*2,y:(y+.5)*material.step+(random()-.5)*material.jitter*2,span:material.span*(.94+random()*.12),turn:Math.floor(random()*4)*(material.upright?0:1),mirror:random()>.5&&!material.upright,variant:Math.floor(random()*(material.atlasColumns??1)*(material.atlasRows??1))};
}
export function terrainPatches(bounds:TerrainBounds,material=GRASS_MATERIAL){
 const patches=[];const pad=material.span*1.1;
 for(let y=Math.floor((bounds.top-pad)/material.step);y<=Math.ceil((bounds.top+bounds.height+pad)/material.step);y++)for(let x=Math.floor((bounds.left-pad)/material.step);x<=Math.ceil((bounds.left+bounds.width+pad)/material.step);x++)patches.push(terrainPatch(x,y,material));
 return patches;
}
const masks=new WeakMap<HTMLImageElement,{key:string;canvases:HTMLCanvasElement[]}>();

function maskedTextures(image:HTMLImageElement,feather:number,columns=1,rows=1){
 const key=[feather,columns,rows,image.naturalWidth,image.naturalHeight].join(':');
 const previous=masks.get(image);if(previous?.key===key)return previous.canvases;
 const canvases:HTMLCanvasElement[]=[];
 for(let index=0;index<columns*rows;index++){
 const canvas=document.createElement('canvas');canvas.width=Math.floor(image.naturalWidth/columns);canvas.height=Math.floor(image.naturalHeight/rows);
 const g=canvas.getContext('2d');if(!g)return null;
 g.drawImage(image,index%columns*canvas.width,Math.floor(index/columns)*canvas.height,canvas.width,canvas.height,0,0,canvas.width,canvas.height);g.globalCompositeOperation='destination-in';
 for(const horizontal of [true,false]){
  const gradient=g.createLinearGradient(0,0,horizontal?canvas.width:0,horizontal?0:canvas.height);
  gradient.addColorStop(0,'transparent');gradient.addColorStop(feather,'#000');gradient.addColorStop(1-feather,'#000');gradient.addColorStop(1,'transparent');
  g.fillStyle=gradient;g.fillRect(0,0,canvas.width,canvas.height);
 }
 canvases.push(canvas);
 }
 masks.set(image,{key,canvases});return canvases;
}
export type TerrainCompositionLayer={id:string;draw:(ctx:CanvasRenderingContext2D,bounds:TerrainBounds)=>void};
type Chunk={canvas:HTMLCanvasElement;x:number;y:number};
type ChunkCache={key:string;image:HTMLImageElement;chunks:Map<string,Chunk>;pixels:number;built:number;hits:number};
const chunkCaches=new WeakMap<CanvasRenderingContext2D,ChunkCache>();
export const TERRAIN_CACHE_PIXELS=8_000_000;
/** Native density on phones, bounded visible workload on very large displays. */
export function terrainChunkLayout(width:number,height:number,tile:number,dpr:number){
  const density=Math.min(tile*dpr,tile*Math.sqrt(4_000_000/Math.max(1,width*height)));
  const size=384,span=size/density;
  return {density,size,span};
}
/** Counters describe CPU draw work/cache residency, not browser frame rate. */
export function terrainCacheStats(ctx:CanvasRenderingContext2D){
  const c=chunkCaches.get(ctx);return {built:c?.built??0,hits:c?.hits??0,chunks:c?.chunks.size??0,pixels:c?.pixels??0};
}
export function drawTerrainTexture(ctx:CanvasRenderingContext2D,width:number,height:number,image:HTMLImageElement,left:number,top:number,tile:number,material=GRASS_MATERIAL,composition?:TerrainCompositionLayer){
  if(!image.complete||!image.naturalWidth||!image.naturalHeight||tile<=0)return false;
  const dpr=Math.max(.1,Math.abs(ctx.getTransform().a)||1),layout=terrainChunkLayout(width,height,tile,dpr);
  const {density,size,span}=layout;
  const key=[material.id,material.seed,material.span,material.step,material.jitter,material.feather,material.atlasColumns??1,material.atlasRows??1,composition?.id??'',material.upright??false,density].join(':');
  let cache=chunkCaches.get(ctx);
  if(!cache||cache.image!==image||cache.key!==key){
    cache={key,image,chunks:new Map(),pixels:0,built:0,hits:0};chunkCaches.set(ctx,cache);
  }
  const textures=maskedTextures(image,material.feather,material.atlasColumns,material.atlasRows);if(!textures)return false;
  const startX=Math.floor(-left/tile/span),endX=Math.ceil((width-left)/tile/span)-1;
  const startY=Math.floor(-top/tile/span),endY=Math.ceil((height-top)/tile/span)-1;
  // One-pixel gutters are cropped off at presentation; adjacent chunks share world coordinates.
  const pixels=(size+2)**2;
  for(let y=startY;y<=endY;y++)for(let x=startX;x<=endX;x++){
    const id=`${x}:${y}`;let chunk=cache.chunks.get(id);
    if(chunk){cache.hits++;cache.chunks.delete(id);cache.chunks.set(id,chunk);}
    else{
      // Drop least recently drawn chunks BEFORE allocating. Backtracking reuses resident regions.
      while(cache.pixels+pixels>TERRAIN_CACHE_PIXELS&&cache.chunks.size){
        const oldest=cache.chunks.keys().next().value!;cache.chunks.delete(oldest);cache.pixels-=pixels;
      }
      const canvas=document.createElement('canvas');canvas.width=canvas.height=size+2;
      const g=canvas.getContext('2d');if(!g)return false;
      const bounds={left:x*span-1/density,top:y*span-1/density,width:span+2/density,height:span+2/density};
      g.setTransform(density,0,0,density,-x*size+1,-y*size+1);
      g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
      for(const patch of terrainPatches(bounds,material)){
        g.save();g.translate(patch.x,patch.y);g.rotate(patch.turn*Math.PI/2);if(patch.mirror)g.scale(-1,1);
        g.drawImage(textures[patch.variant],-patch.span/2,-patch.span/2,patch.span,patch.span);g.restore();
      }
      composition?.draw(g,bounds);
      chunk={canvas,x,y};cache.chunks.set(id,chunk);cache.pixels+=pixels;cache.built++;
    }
    ctx.drawImage(chunk.canvas,1,1,size,size,left+x*span*tile,top+y*span*tile,span*tile,span*tile);
  }
  return true;
}
