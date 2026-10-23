/** Walk frames are complete authored silhouettes. Never split a body at its waist
 * or rotate rectangular fragments: those fragments expose square seams in motion.
 * Callers select the distance-driven atlas frame and keep the shared foot anchor.
 */
export function drawHumanPose(ctx:CanvasRenderingContext2D,image:CanvasImageSource,x:number,y:number,width:number,height:number){ctx.drawImage(image,x,y,width,height);}
