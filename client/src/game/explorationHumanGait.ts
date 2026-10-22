/** The lateral atlases contain two similar silhouettes, not opposite support poses.
 * Keep one stable torso and articulate the two lower legs around a fixed hip.
 * Distance-driven phase makes both directions and every human use the same cadence.
 */
export function humanGait(phase:number,walking:boolean,reduced=false){const p=((phase%1)+1)%1,angle=p*Math.PI*2,enabled=walking&&!reduced;return {near:enabled?Math.sin(angle):0,far:enabled?-Math.sin(angle):0,lift:enabled?Math.abs(Math.sin(angle*2))*.012:0};}
export function drawHumanSideWalk(ctx:CanvasRenderingContext2D,image:CanvasImageSource,source:{width:number;height:number},x:number,y:number,width:number,height:number,phase:number,walking:boolean,reduced=false,dress=false){
 if(!walking||reduced){ctx.drawImage(image,x,y,width,height);return;}
 const {near,far,lift}=humanGait(phase,walking,reduced),hip=dress?.80:.68,split=.52,sw=source.width,sh=source.height;
 function leg(left:boolean,swing:number){const sx=left?0:sw*split,cw=left?sw*split:sw*(1-split),px=x+width*(left?.38:.65),py=y+height*hip;ctx.save();ctx.translate(px,py);ctx.rotate(swing*(dress?.09:.19));ctx.translate(swing*width*.035,-Math.max(0,swing)*height*.025);ctx.drawImage(image,sx,sh*hip,cw,sh*(1-hip),x+(sx/sw)*width-px,0,cw/sw*width,height*(1-hip));ctx.restore();}
 // Draw the rear foot first. The torso masks the shared joint, with no outline or cut gap.
 leg(false,far);leg(true,near);ctx.drawImage(image,0,0,sw,sh*(hip+.025),x,y-height*lift,width,height*(hip+.025));
}
