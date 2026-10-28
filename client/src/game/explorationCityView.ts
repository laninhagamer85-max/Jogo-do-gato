/** Original Canvas masonry and civic details inspired by a medieval market square.
 * Ground inlays are walkable. Facade props remain inside the existing building footprint.
 */
export function drawCityPlaza(ctx:CanvasRenderingContext2D,x:number,y:number){
 ctx.save();ctx.translate(x,y);ctx.scale(1,.62);
 ctx.beginPath();ctx.arc(0,0,2.8,0,Math.PI*2);ctx.fillStyle='#b9ad8cb0';ctx.fill();
 ctx.strokeStyle='#776c526b';ctx.lineWidth=.07;ctx.stroke();
 for(const r of [2.55,1.15]){ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();}
 for(let n=0;n<12;n++){const a=n*Math.PI/6;ctx.beginPath();ctx.moveTo(Math.cos(a)*1.15,Math.sin(a)*1.15);ctx.lineTo(Math.cos(a)*2.55,Math.sin(a)*2.55);ctx.stroke();}
 ctx.beginPath();for(let n=0;n<16;n++){const a=n*Math.PI/8-Math.PI/2,r=n%2?.45:1.05;n?ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r):ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fillStyle='#797e6f88';ctx.fill();ctx.restore();
}
export function drawCityFacade(ctx:CanvasRenderingContext2D,x:number,y:number,tile:number){
 ctx.save();ctx.translate(x,y);ctx.scale(tile,tile);
 for(const side of [-1,1]){
  const a=side*.9;
  // Standards flank the doorway, leaving the door and its approach clear.
  ctx.fillStyle='#574d3a';ctx.fillRect(a-.035,-2.35,.07,1.4);
  ctx.beginPath();ctx.moveTo(a,-2.3);ctx.lineTo(a+side*.38,-2.3);ctx.lineTo(a+side*.38,-1.45);ctx.lineTo(a+side*.19,-1.6);ctx.lineTo(a,-1.45);ctx.closePath();ctx.fillStyle='#486a68';ctx.fill();ctx.strokeStyle='#b6a375';ctx.lineWidth=.025;ctx.stroke();
  // Low planted boxes stay within the established non-walkable house base.
  ctx.fillStyle='#8e7c59';ctx.fillRect(a-.28,-.28,.56,.22);ctx.fillStyle='#52754b';
  for(let n=0;n<5;n++){ctx.beginPath();ctx.ellipse(a-.22+n*.11,-.3-(n%2)*.07,.09,.12,0,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#d5bb7a';ctx.fillRect(a-.08,-1.05,.16,.24);ctx.strokeStyle='#625b47';ctx.strokeRect(a-.08,-1.05,.16,.24);
 }
 ctx.restore();
}
