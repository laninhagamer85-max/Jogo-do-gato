/** Biome-independent terrain material: fixed world density, overlapping aperiodic patches. */
export type TerrainMaterial={id:string;seed:number;span:number;step:number;jitter:number;feather:number};
export const GRASS_MATERIAL:TerrainMaterial={id:'grass-block-v1',seed:5102026,span:2,step:.9,jitter:.08,feather:.18};
export type TerrainBounds={left:number;top:number;width:number;height:number};
export function terrainPatch(x:number,y:number,material=GRASS_MATERIAL){
 let n=(Math.imul(x,73856093)^Math.imul(y,19349663)^material.seed)>>>0;
 const random=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
 return {x:(x+.5)*material.step+(random()-.5)*material.jitter*2,y:(y+.5)*material.step+(random()-.5)*material.jitter*2,span:material.span*(.94+random()*.12),turn:Math.floor(random()*4),mirror:random()>.5};
}
export function terrainPatches(bounds:TerrainBounds,material=GRASS_MATERIAL){
 const patches=[];const pad=material.span*1.1;
 for(let y=Math.floor((bounds.top-pad)/material.step);y<=Math.ceil((bounds.top+bounds.height+pad)/material.step);y++)for(let x=Math.floor((bounds.left-pad)/material.step);x<=Math.ceil((bounds.left+bounds.width+pad)/material.step);x++)patches.push(terrainPatch(x,y,material));
 return patches;
}
export function terrainBufferPlan(width:number,height:number,left:number,top:number,tile:number,dpr:number){
 const x=Math.floor((-left/tile-.75)*2)/2,y=Math.floor((-top/tile-.75)*2)/2;
 const right=Math.ceil(((width-left)/tile+.75)*2)/2,bottom=Math.ceil(((height-top)/tile+.75)*2)/2;
 const w=right-x,h=bottom-y,pixelsPerUnit=Math.min(tile*dpr,Math.sqrt(8_000_000/(w*h)));
 return {left:x,top:y,width:w,height:h,pixelsPerUnit};
}
export function terrainContains(bounds:TerrainBounds,width:number,height:number,left:number,top:number,tile:number){
 return bounds.left<=-left/tile&&bounds.top<=-top/tile&&bounds.left+bounds.width>=(width-left)/tile&&bounds.top+bounds.height>=(height-top)/tile;
}
const masks=new WeakMap<HTMLImageElement,{feather:number;canvas:HTMLCanvasElement}>();
const buffers=new WeakMap<CanvasRenderingContext2D,{key:string;image:HTMLImageElement;bounds:TerrainBounds;canvas:HTMLCanvasElement}>();
function maskedTexture(image:HTMLImageElement,feather:number){
 const previous=masks.get(image);if(previous?.feather===feather)return previous.canvas;
 const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 const g=canvas.getContext('2d');if(!g)return null;
 g.drawImage(image,0,0);g.globalCompositeOperation='destination-in';
 for(const horizontal of [true,false]){
  const gradient=g.createLinearGradient(0,0,horizontal?canvas.width:0,horizontal?0:canvas.height);
  gradient.addColorStop(0,'transparent');gradient.addColorStop(feather,'#000');gradient.addColorStop(1-feather,'#000');gradient.addColorStop(1,'transparent');
  g.fillStyle=gradient;g.fillRect(0,0,canvas.width,canvas.height);
 }
 masks.set(image,{feather,canvas});return canvas;
}
export function drawTerrainTexture(ctx:CanvasRenderingContext2D,width:number,height:number,image:HTMLImageElement,left:number,top:number,tile:number,material=GRASS_MATERIAL){
 if(!image.complete||!image.naturalWidth||!image.naturalHeight)return false;
 const dpr=Math.max(.1,Math.abs(ctx.getTransform().a)||1);
 const key=[material.id,material.seed,material.span,material.step,material.jitter,material.feather,tile,dpr,width,height].join(':');
 let cached=buffers.get(ctx);
 if(!cached||cached.image!==image||cached.key!==key||!terrainContains(cached.bounds,width,height,left,top,tile)){
  const texture=maskedTexture(image,material.feather);if(!texture)return false;
  const plan=terrainBufferPlan(width,height,left,top,tile,dpr),canvas=document.createElement('canvas');
  canvas.width=Math.ceil(plan.width*plan.pixelsPerUnit);canvas.height=Math.ceil(plan.height*plan.pixelsPerUnit);
  const g=canvas.getContext('2d');if(!g)return false;
  g.setTransform(canvas.width/plan.width,0,0,canvas.height/plan.height,-plan.left*canvas.width/plan.width,-plan.top*canvas.height/plan.height);
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  for(const patch of terrainPatches(plan,material)){
   g.save();g.translate(patch.x,patch.y);g.rotate(patch.turn*Math.PI/2);if(patch.mirror)g.scale(-1,1);
   g.drawImage(texture,-patch.span/2,-patch.span/2,patch.span,patch.span);g.restore();
  }
  cached={key,image,bounds:plan,canvas};buffers.set(ctx,cached);
 }
 const b=cached.bounds;ctx.drawImage(cached.canvas,left+b.left*tile,top+b.top*tile,b.width*tile,b.height*tile);return true;
}
