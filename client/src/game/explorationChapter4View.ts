import {NASCENTES_ASSETS,stairSourcePoint,castleGatePoint} from './explorationChapter4';
import {drawTerrainTexture,type TerrainBounds} from './terrainTexture';
import {NASCENTES_SCENE,nascentesElevation,nascentesRoom,returnPortal,nascentesTrees,nascentesShoreProps,type NascentesTree} from './explorationChapter4';
import {drawExplorationGround,drawWoodlandProp,FOREST_GROUND,FOREST_GRASS_MATERIAL} from './explorationScenery';
import {drawBiomeWater,drawBiomeStatic} from './biomeCompositionView';
import {drawPortalArch,drawPortalEnergy} from './explorationPortal';
import {touchesRegion,type GroundPoint} from './biomeComposition';
export function nascentesView(width:number,height:number,player:GroundPoint,zoom=1,overview=false){
 const s={left:Math.min(-18,player.x-3),top:Math.min(-15,player.y-3),width:Math.max(24,player.x+3)-Math.min(-18,player.x-3),height:Math.max(19,player.y+3)-Math.min(-15,player.y-3)};
 if(overview){const portrait=height>width,padTop=portrait?180:12,availableWidth=Math.max(180,width-(portrait?12:165)),availableHeight=Math.max(100,height-padTop-12),tile=Math.min(availableWidth/s.width,availableHeight/s.height);return{tile,left:availableWidth/2-(s.left+s.width/2)*tile,top:padTop+availableHeight/2-(s.top+s.height/2)*tile};}
 const tile=Math.max(46,width/15,height/12)*zoom;return{tile,left:width/2-player.x*tile,top:height*.46-player.y*tile};
}
export const nascentesOverview=(w:number,h:number)=>nascentesView(w,h,{x:0,y:0},1,true);
let castleArt:HTMLImageElement|undefined,stairImage:HTMLImageElement|undefined;
const ready=(im?:HTMLImageElement)=>im?.complete&&im.naturalWidth;
/** Chunk-cached material ground; independent water/elevation/props and portals, no baked map image. */
export function drawNascentesTerrain(ctx:CanvasRenderingContext2D,width:number,height:number,left:number,top:number,tile:number,grass:HTMLImageElement|undefined,_items?:HTMLImageElement,open=false,_stairs?:HTMLImageElement,plateau?:HTMLImageElement,props?:HTMLImageElement,time=0,reduced=true,portal?:HTMLImageElement,water?:HTMLImageElement,shelter?:HTMLImageElement,index=30,treesInTerrain=true,soil?:HTMLImageElement){
 if(!ready(grass))return;const room=nascentesRoom(index),e=nascentesElevation(index),p=(q:GroundPoint)=>({x:left+q.x*tile,y:top+q.y*tile});
 drawNascentesGround(ctx,width,height,grass!,soil,left,top,tile,index);
 ctx.save();ctx.globalAlpha=.48;drawBiomeWater(ctx,room.composition!,left,top,tile,time,reduced,water);ctx.restore();
 if(ready(props))for(const q of nascentesShoreProps(index)){const a=p(q);drawWoodlandProp(ctx,props!,0,a.x,a.y,tile,{width:q.width,height:q.width*.8});drawWoodlandProp(ctx,props!,1,a.x+tile*.5,a.y-tile*.2,tile,{width:.8,height:.7});}
 if(ready(props))for(const q of nascentesDecorations(left,top,tile,width,height,index)){const a=p(q);drawWoodlandProp(ctx,props!,q.index,a.x,a.y,tile,{width:q.size,height:q.size},false);}

 if(ready(plateau)){const x=left+e.left*tile,y=top+e.top*tile,size=e.size*tile;if(x+size>=0&&y+size>=0&&x<=width&&y<=height)ctx.drawImage(plateau!,x,y,size,size);}
 if(typeof Image!=='undefined'){if(!stairImage){stairImage=new Image();stairImage.src=NASCENTES_ASSETS.stairs;}if(ready(stairImage))drawStoneStair(ctx,p,stairSourcePoint,index,open);}

 if(treesInTerrain)for(const tree of nascentesTrees({left:-left/tile,top:-top/tile,width:width/tile,height:height/tile},index).sort((a,b)=>a.y-b.y)){const q=p(tree);drawNascentesTree(ctx,_stairs,tree,q.x,q.y,tile);}
 if(index===31&&typeof Image!=='undefined'){if(!castleArt){castleArt=new Image();castleArt.src='/forest-adventure/chapter4/castle-gate-v1.webp';}if(ready(castleArt)){ctx.drawImage(castleArt!,left+12*tile,top-14.8*tile,10*tile,10*tile);/* The castle asset already paints its short stone staircase. Keep that continuous masonry instead of stacking a rotated second stair over it. */const gate=p(castleGatePoint);drawPortalEnergy(ctx,gate.x,gate.y,tile,time,true,reduced);if(tile>20){ctx.font=`600 ${Math.max(9,Math.min(12,tile*.18))}px sans-serif`;ctx.fillStyle='#fff5cf';ctx.textAlign='center';ctx.fillText('Cap. 5 · Interior do Castelo',gate.x,gate.y+tile*.45);}}}
 if(ready(shelter)){const a=p({x:room.camp.x-.8,y:room.camp.y-.5}),w=tile*2,h=w*shelter!.naturalHeight/shelter!.naturalWidth;ctx.drawImage(shelter!,a.x-w/2,a.y-h,w,h);}
 for(const [q,active,label] of [[room.exit,open,index===30?'Sala 32':'Sala 31 · atalho'],[returnPortal(index),true,index===31?'Sala 31':'Retorno ao bosque']] as const){const a=p(q);drawPortalEnergy(ctx,a.x,a.y,tile,time,active,reduced);drawPortalArch(ctx,portal,a.x,a.y,tile);if(tile>20){ctx.save();ctx.font=`600 ${Math.min(12,tile*.2)}px sans-serif`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#263724';ctx.strokeText(label,a.x,a.y+tile*.35);ctx.fillStyle='#f8f4d3';ctx.fillText(label,a.x,a.y+tile*.35);ctx.restore();}}
}
export function nascentesDecorations(left:number,top:number,tile:number,width:number,height:number,index=30){const result:{x:number;y:number;index:number;size:number}[]=[],e=nascentesElevation(index),room=nascentesRoom(index);for(let cy=Math.floor(-top/tile/4)-1;cy<=Math.ceil((height-top)/tile/4)+1;cy++)for(let cx=Math.floor(-left/tile/4)-1;cx<=Math.ceil((width-left)/tile/4)+1;cx++){const n=(Math.imul(cx,73856093)^Math.imul(cy,19349663)^Math.imul(index,83492791))>>>0;if(n%5>1)continue;const x=cx*4+((n>>>4)%29)/10,y=cy*4+((n>>>10)%29)/10;if(x>e.left-1&&x<e.left+e.size+1&&y>e.top+e.size*.27&&y<e.top+e.size+1)continue;if(room.composition!.regions.some(r=>r.material==='water'&&touchesRegion({x,y},1,r.polygon)))continue;if([room.camp,room.exit,returnPortal(index),...room.nodes,...room.switches].some(q=>Math.hypot(q.x-x,q.y-y)<1.4))continue;result.push({x,y,index:n%2===0?1:3,size:1.05+(n%7)*.13});}return result;}
export function drawNascentesItem(ctx:CanvasRenderingContext2D,atlas:HTMLImageElement|undefined,index:number,x:number,y:number,tile:number,width=.48){if(!ready(atlas))return;const crops=[[74,166,440,547],[111,182,438,531],[98,190,430,515],[66,192,434,536]],b=crops[index],cw=atlas!.naturalWidth/4,sw=b[2]-b[0],sh=b[3]-b[1],w=tile*width,h=w*sh/sw;ctx.drawImage(atlas!,index*cw+b[0],b[1],sw,sh,x-w/2,y-h*.75,w,h);}

/** Explicit safe atlas rectangles and root anchors from the original generated artwork. */
export function drawNascentesTree(ctx:CanvasRenderingContext2D,atlas:HTMLImageElement|undefined,tree:NascentesTree,x:number,y:number,tile:number){
 if(!ready(atlas))return;const frames=[[66,62,328,752,164,743],[459,129,446,685,229,676],[953,133,376,681,178,672],[1428,426,289,386,146,377]],r=frames[tree.variant%4],scale=tile*tree.width/r[2];ctx.drawImage(atlas!,r[0],r[1],r[2],r[3],x-r[4]*scale,y-r[5]*scale,r[2]*scale,r[3]*scale);
}

function drawNascentesGround(ctx:CanvasRenderingContext2D,w:number,h:number,grass:HTMLImageElement,soil:HTMLImageElement|undefined,left:number,top:number,tile:number,index:number){
 const composition=nascentesRoom(index).composition!;
 if(!ready(soil)){drawExplorationGround(ctx,w,h,grass,left,top,tile,FOREST_GROUND,composition);return;}
 ctx.fillStyle=FOREST_GROUND.base;ctx.fillRect(0,0,w,h);
 drawTerrainTexture(ctx,w,h,grass,left,top,tile,{...FOREST_GRASS_MATERIAL,id:'nascentes-material-v4',seed:7413},{id:composition.id+'-soil-v1',draw:(g,bounds:TerrainBounds)=>{
  drawBiomeStatic(g,bounds,{...composition,regions:composition.regions.filter(r=>r.material!=='soil')});
  const pattern=g.createPattern(soil!,'repeat');if(!pattern)return;pattern.setTransform(new DOMMatrix().scale(2.8/soil!.naturalWidth));
  for(const r of composition.regions.filter(r=>r.material==='soil')){g.save();g.beginPath();r.polygon.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();g.fillStyle=pattern;g.strokeStyle=pattern;g.lineJoin='round';for(const [alpha,width] of [[.10,.45],[.18,.25],[.30,.10]]){g.globalAlpha=alpha;g.lineWidth=width;g.stroke();}g.globalAlpha=.82;g.fill();g.restore();}
 }});
}

function drawStoneStair(ctx:CanvasRenderingContext2D,p:(q:GroundPoint)=>GroundPoint,project:(x:number,y:number,index:number)=>GroundPoint,index:number,open:boolean){const a=p(project(0,0,index)),b=p(project(1,0,index));ctx.save();ctx.transform(b.x-a.x,b.y-a.y,-(b.y-a.y),b.x-a.x,a.x,a.y);ctx.globalAlpha=open?1:.65;ctx.drawImage(stairImage!,0,0);ctx.restore();}
