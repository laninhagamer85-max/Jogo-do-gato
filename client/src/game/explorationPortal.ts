/** Painted portal art and timed light share one foot anchor; no geometric ring stand-in. */
export const WOODLAND_PORTAL={width:1.95,footOffset:.13,asset:'/forest-adventure/woodland-portal-v2.webp'};
export function portalPhase(time:number,reducedMotion:boolean){return reducedMotion?.5:time/4200;}
export const CASTLE_PORTAL_PALETTE={ground:'164,179,255',halo:'108,111,240',core:'232,233,255',light:'190,180,255'};
export function drawPortalEnergy(ctx:CanvasRenderingContext2D,x:number,y:number,tile:number,time:number,active:boolean,reducedMotion:boolean,palette?:typeof CASTLE_PORTAL_PALETTE){
 if(!active)return;
 const phase=portalPhase(time,reducedMotion),breath=reducedMotion?1:1+Math.sin(phase*Math.PI*2)*.07;
 // Broad contact light and a luminous opening remain readable against the green floor.
 ctx.save();
 const ground=ctx.createRadialGradient(x,y,0,x,y,tile*1.3);
 ground.addColorStop(0,`rgba(${palette?.ground??'234,248,154'},.34)`);ground.addColorStop(.5,`rgba(${palette?.ground??'204,238,120'},.18)`);ground.addColorStop(1,`rgba(${palette?.ground??'205,240,130'},0)`);
 ctx.fillStyle=ground;ctx.save();ctx.translate(x,y);ctx.scale(1,.46);ctx.fillRect(-tile*1.3,-tile*1.3,tile*2.6,tile*2.6);ctx.restore();
 ctx.save();ctx.translate(x,y-tile*.68);ctx.scale(.72,1);
 const core=ctx.createRadialGradient(0,0,tile*.06,0,0,tile*.76*breath);
 core.addColorStop(0,`rgba(${palette?.core??'255,255,222'},.76)`);core.addColorStop(.36,`rgba(${palette?.light??'241,252,171'},.6)`);core.addColorStop(.72,`rgba(${palette?.halo??'178,234,133'},.29)`);core.addColorStop(1,`rgba(${palette?.halo??'172,232,129'},0)`);
 ctx.fillStyle=core;ctx.fillRect(-tile*.85,-tile*.85,tile*1.7,tile*1.7);ctx.restore();
 for(let i=0;i<12;i++){
  const life=reducedMotion?(i+.5)/12:(phase+i/12)%1;
  const px=x+Math.sin(i*2.399+life*2.2)*tile*(.3+(i%3)*.11),py=y+tile*.12-life*tile*1.75;
  const radius=tile*(.055+(i%3)*.012),light=ctx.createRadialGradient(px,py,0,px,py,radius);
  light.addColorStop(0,`rgba(${palette?.core??'255,255,226'},.98)`);light.addColorStop(.25,`rgba(${palette?.light??'255,247,160'},.85)`);light.addColorStop(1,`rgba(${palette?.halo??'219,246,144'},0)`);
  ctx.globalAlpha=.5+.4*Math.sin(life*Math.PI);ctx.fillStyle=light;ctx.fillRect(px-radius,py-radius,radius*2,radius*2);
 }
 ctx.restore();
}
export function drawPortalArch(ctx:CanvasRenderingContext2D,image:HTMLImageElement|undefined,x:number,y:number,tile:number){
 if(!image?.complete||!image.naturalWidth)return;
 const width=tile*WOODLAND_PORTAL.width,height=width*image.naturalHeight/image.naturalWidth;
 ctx.drawImage(image,x-width/2,y-height+tile*WOODLAND_PORTAL.footOffset,width,height);
}
