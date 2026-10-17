/** River characters occupy unequal vertical bands in the original atlas.
 * Fractions preserve complete heads/feet at any decoded resolution. */
export function explorationMobFrame(art:'forest-mobs'|'river-mobs',row:number,frame:number,width:number,height:number){
 const r=Math.max(0,Math.min(2,Math.floor(row))),column=Math.max(0,Math.min(3,Math.floor(frame)));
 const bands=art==='river-mobs'?[[.08,.29],[.31,.575],[.575,1]]:[[0,1/3],[1/3,2/3],[2/3,1]];
 const [top,bottom]=bands[r];
 return {x:column*width/4,y:top*height,width:width/4,height:(bottom-top)*height};
}
