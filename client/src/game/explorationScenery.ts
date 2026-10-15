/** One camera-anchored ground plane. A mirrored repeat prevents hard texture seams. */
const groundTiles = new WeakMap<HTMLImageElement, HTMLCanvasElement>();
export function drawExplorationGround(ctx:CanvasRenderingContext2D,width:number,height:number,image:HTMLImageElement,left:number,top:number,tile:number){
  ctx.fillStyle='#6b803e';ctx.fillRect(0,0,width,height);
  if(!image.complete||!image.naturalWidth)return;
  let canvas=groundTiles.get(image);
  if(!canvas){
    canvas=document.createElement('canvas');canvas.width=768;canvas.height=768;const g=canvas.getContext('2d');if(!g)return;
    for(let y=0;y<2;y++)for(let x=0;x<2;x++){g.save();g.translate(x?768:0,y?768:0);g.scale(x?-1:1,y?-1:1);g.drawImage(image,0,0,384,384);g.restore();}
    groundTiles.set(image,canvas);
  }
  const pattern=ctx.createPattern(canvas,'repeat');if(!pattern)return;
  const scale=tile*3.5/384;
  ctx.save();ctx.translate(left,top);ctx.scale(scale,scale);ctx.fillStyle=pattern;ctx.fillRect(-left/scale,-top/scale,width/scale,height/scale);ctx.restore();
  ctx.fillStyle='rgba(24,48,24,.08)';ctx.fillRect(0,0,width,height);
}
export function drawWoodlandProp(ctx:CanvasRenderingContext2D,image:HTMLImageElement,index:number,x:number,y:number,tile:number){
  if(!image.complete||!image.naturalWidth)return;
  const cw=image.naturalWidth/3,ch=image.naturalHeight/2;
  ctx.drawImage(image,(index%3)*cw,Math.floor(index/3)*ch,cw,ch,x-tile*.64,y-tile*1.17,tile*1.28,tile*1.28);
}
