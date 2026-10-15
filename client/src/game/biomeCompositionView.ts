import {insideRegion,regionBounds,type BiomeComposition,type GroundPoint,type GroundRegion} from './biomeComposition';
import type {TerrainBounds} from './terrainTexture';

function trace(ctx:CanvasRenderingContext2D,polygon:readonly GroundPoint[]){
  ctx.beginPath();polygon.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();
}
function randomAt(x:number,y:number,seed:number){
  let n=(Math.imul(x,374761393)^Math.imul(y,668265263)^seed)>>>0;
  n=Math.imul(n^(n>>>13),1274126177)>>>0;return (n^(n>>>16))>>>0;
}
function visible(region:GroundRegion,bounds:TerrainBounds){
  const r=regionBounds(region.polygon);
  return r.right>=bounds.left&&r.left<=bounds.left+bounds.width&&r.bottom>=bounds.top&&r.top<=bounds.top+bounds.height;
}
/** Original Canvas materials: fixed fine grains, quiet color variations and feathered margins. */
function paintMaterial(ctx:CanvasRenderingContext2D,region:GroundRegion,bounds:TerrainBounds){
  const box=regionBounds(region.polygon),water=region.material==='water',sand=region.material==='sand';
  const base=water?'#6aaba2':sand?'#bcb584':'#929364';
  ctx.save();trace(ctx,region.polygon);
  if(!water){
    ctx.lineJoin='round';ctx.strokeStyle=base;
    for(const [alpha,width] of [[.1,.26],[.2,.17],[.45,.08]]){ctx.globalAlpha=alpha;ctx.lineWidth=width;ctx.stroke();}
  }
  ctx.globalAlpha=1;
  const gradient=ctx.createLinearGradient(box.left,box.top,box.right,box.bottom);
  gradient.addColorStop(0,water?'#81bbb1':sand?'#c7c291':'#9b9c6c');
  gradient.addColorStop(1,water?'#4f928e':sand?'#ada97c':'#83875c');
  ctx.fillStyle=gradient;ctx.fill();ctx.clip();
  const step=water?.16:.075;
  // Cull in world coordinates; the same grains are emitted after camera/viewport changes.
  for(let y=Math.floor(Math.max(box.top,bounds.top)/step);y<=Math.ceil(Math.min(box.bottom,bounds.top+bounds.height)/step);y++){
    for(let x=Math.floor(Math.max(box.left,bounds.left)/step);x<=Math.ceil(Math.min(box.right,bounds.left+bounds.width)/step);x++){
      const n=randomAt(x,y,region.seed),px=(x+(n%1024)/1024)*step,py=(y+((n>>>10)%1024)/1024)*step;
      ctx.fillStyle=water?(n&1?'#b3d0b327':'#326f7930'):sand?(n&1?'#f2e3b247':'#756c4d30'):(n&1?'#d5cc9842':'#575f3f30');
      ctx.beginPath();ctx.ellipse(px,py,.009+(n%5)*.002,.006+(n%3)*.002,(n%10)*.3,0,Math.PI*2);ctx.fill();
    }
  }
  if(water){
    // Inset contact edge belongs to the water, never outside its collision boundary.
    trace(ctx,region.polygon);ctx.strokeStyle='#315b523a';ctx.lineWidth=.1;ctx.stroke();
    trace(ctx,region.polygon);ctx.strokeStyle='#d1dfbb70';ctx.lineWidth=.025;ctx.stroke();
  }
  ctx.restore();
}
/** Called inside the single visible static terrain buffer: no per-material cache eviction. */
export function drawBiomeStatic(ctx:CanvasRenderingContext2D,bounds:TerrainBounds,composition:BiomeComposition){
  for(const region of composition.regions)if(visible(region,bounds))paintMaterial(ctx,region,bounds);
}

/** Same clipped shoreline as collision. Time is simulation time, so pause also freezes the water. */
export function drawBiomeWater(ctx:CanvasRenderingContext2D,composition:BiomeComposition,left:number,top:number,tile:number,time:number,reducedMotion:boolean){
  ctx.save();ctx.translate(left,top);ctx.scale(tile,tile);
  for(const region of composition.regions){
    if(region.material!=='water')continue;
    const box=regionBounds(region.polygon),phase=reducedMotion?0:time*.00045;
    ctx.save();trace(ctx,region.polygon);ctx.clip();ctx.lineCap='round';ctx.lineWidth=.018;
    // Long coherent ripples span the pond; there is no independent animation per floor block.
    for(let row=0;row<7;row++){
      const y=box.top+.16+row*.19;
      ctx.strokeStyle=row%2?'#d4e4c33b':'#c2d9c248';ctx.beginPath();
      for(let i=0;i<=24;i++){
        const x=box.left+i*(box.right-box.left)/24;
        const wy=y+Math.sin(x*2.8+phase+row*.7)*.027;
        i?ctx.lineTo(x,wy):ctx.moveTo(x,wy);
      }
      ctx.stroke();
    }
    // Scattered soft highlights stay inside the authored pond contour.
    for(let i=0;i<5;i++){
      const x=box.left+.35+i*.48,y=box.top+.55+Math.sin(i*2.4)*.18;
      if(!insideRegion({x,y},region.polygon))continue;
      ctx.globalAlpha=reducedMotion?.35:.3+.12*Math.sin(phase+i);
      ctx.strokeStyle='#e2e8c8';ctx.lineWidth=.012;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+.1,y-.025,x+.22,y);ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}
