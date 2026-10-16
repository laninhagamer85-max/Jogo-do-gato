import {composeForestClusters,FOREST_EDGE_CLUSTERS} from './biomeScenery';
/** Cat shelter sits left of spawn, with its doorway facing the pet outside. */
export const PILOT_SHELTER={x:.45,y:1.9,width:1.55,height:1.55,footprint:{x:-.1,y:1.45,width:1,height:.45},asset:'/forest-adventure/cat-safe-house-v1.webp'};
/** Room geometry and art share the same ground footprints. */
export const PILOT_OBSTACLES = [
  {id:'fallen-log', x:5,y:3,width:2,height:1,index:2,artWidth:2.1,artHeight:1.08},
  {id:'moss-rocks',x:10,y:6,width:1,height:1,index:0,artWidth:1.4,artHeight:1.05},
  {id:'old-stump',x:3,y:3,width:1,height:1,index:4,artWidth:1.05,artHeight:1.1},
  {id:'fern-rocks',x:7,y:6,width:1,height:1,index:0,artWidth:1.18,artHeight:.92},
  {id:'small-fallen-log',x:11,y:8,width:1,height:1,index:2,artWidth:1.15,artHeight:.72},
];
export const ROOM_WALLS=PILOT_OBSTACLES.flatMap(o=>Array.from({length:o.width*o.height},(_,i)=>({x:o.x+i%o.width,y:o.y+Math.floor(i/o.width)})));
export const ROOM_SCENERY=PILOT_OBSTACLES.map(o=>({x:o.x+o.width/2,y:o.y+o.height-.08,index:o.index,width:o.artWidth,height:o.artHeight}));
/** Low groundcover is explicitly walkable and painted UNDER pickups and characters. */
export const ROOM_UNDERGROWTH=[
  {x:2.8,y:2.5,index:1,width:.58,height:.42},
  {x:3.45,y:2.65,index:3,width:.38,height:.32},
  {x:4.2,y:4.25,index:1,width:.48,height:.35},
  {x:6.7,y:2.1,index:3,width:.52,height:.4},
  {x:7.25,y:2.55,index:1,width:.66,height:.44},
  {x:7.75,y:2.2,index:3,width:.35,height:.28},
  {x:10.15,y:1.65,index:1,width:.55,height:.4},
  {x:11.8,y:2.15,index:3,width:.46,height:.36},
  {x:1.85,y:5.8,index:1,width:.62,height:.44},
  {x:2.4,y:6.1,index:3,width:.36,height:.3},
  {x:5.15,y:5.3,index:1,width:.64,height:.45},
  {x:5.75,y:5.6,index:3,width:.4,height:.34},
  {x:6.55,y:6.1,index:1,width:.46,height:.32},
  {x:7.8,y:7.3,index:3,width:.55,height:.4},
  {x:9.3,y:7.95,index:1,width:.64,height:.44},
  {x:9.8,y:8.35,index:3,width:.4,height:.3},
  {x:11.2,y:7.4,index:1,width:.55,height:.4},
  {x:12.3,y:6.2,index:3,width:.55,height:.42},
  {x:12.65,y:6.75,index:1,width:.4,height:.3},
  {x:4.8,y:8.45,index:1,width:.65,height:.46},
  {x:5.35,y:8.65,index:3,width:.38,height:.3},
  {x:2.1,y:8.4,index:3,width:.48,height:.38},
].map(p=>({...p,blocking:false as const}));
export const ROOM_EDGES=composeForestClusters(FOREST_EDGE_CLUSTERS);
/** Replace the repeated fern silhouette with six original low, walkable plant varieties. */
/** The same low moss/grass used on the edges, scattered through the clearing.
 * These patches render below the pet and never enter ROOM_WALLS. */
const ROOM_MEADOW_PATCHES=[
  {x:4.65,y:2.1,width:1.05,height:.62},
  {x:6.9,y:4.6,width:1.18,height:.7},
  {x:5.25,y:5.9,width:.95,height:.56},
  {x:9.15,y:3.25,width:1.12,height:.65},
  {x:10.8,y:5.35,width:.86,height:.52},
  {x:4.65,y:7.9,width:1.08,height:.64},
].map(p=>({...p,index:2,blocking:false as const}));
export const ROOM_GARDENS=[...ROOM_UNDERGROWTH.map((p,i)=>({...p,index:[0,1,2,4,5,1,2,3,4,5,0][i%11]})),...ROOM_MEADOW_PATCHES];
export const ROOM_EDGE_GARDENS=ROOM_EDGES.filter(p=>p.index===1||p.index===3).map((p,i)=>({...p,index:[4,1,0,2,5,3,1][i%7],blocking:false as const}));
export const ROOM_EDGE_SOLIDS=ROOM_EDGES.filter(p=>p.index!==1&&p.index!==3);

/** Sparse walkable groups beyond the old rectangle; fixed world coordinates, no rotations. */
export const EXPANDED_GARDENS=Array.from({length:44},(_,i)=>{
 const angle=i*2.39996323,ring=3.5+((i*17)%29)/29*5;
 return {x:7+Math.cos(angle)*ring*1.25,y:5+Math.sin(angle)*ring,index:[2,4,1,5,0][i%5],width:.42+(i%4)*.12,height:.35+(i%3)*.09,blocking:false as const};
}).filter(p=>p.x<-.6||p.x>14.7||p.y<-.5||p.y>10.8);
/** Dense outer forest follows the rounded world edge, leaving the old pockets untouched. */
export const OUTER_GARDENS=Array.from({length:96},(_,i)=>{
 const angle=i*Math.PI*2/96;
 return {x:7+Math.cos(angle)*(13.15+.18*Math.sin(i*1.7)),y:5+Math.sin(angle)*(10.15+.15*Math.cos(i)),index:[4,1,0,2,5,3,1][i%7],width:1.2+(i%3)*.18,height:1.0+(i%4)*.13,blocking:false as const};
});

/** Low vegetation is traversable; rock/log bases now share collision with the visible props.
 * Height is the ground contact depth, not the entire upright sprite silhouette. */
export const EDGE_PROP_FOOTPRINTS=ROOM_EDGE_SOLIDS.map(prop=>({
 x:prop.x,y:prop.y-prop.height*.19,rx:prop.width*.46,ry:prop.height*.24,
}));
export function hitsEdgeScenery(p:{x:number;y:number},radius:number){
 return EDGE_PROP_FOOTPRINTS.some(f=>Math.hypot((p.x-f.x)/(f.rx+radius),(p.y-f.y)/(f.ry+radius))<1);
}
/** Stable irregular groups with clearings around spawn, pickups and the exit. */
const gardenClearings=[{x:1.5,y:1.5,r:1.15},{x:12.4,y:4.5,r:1.35},{x:8.5,y:4.5,r:.85},
 {x:2.5,y:4.5,r:.75},{x:6.5,y:7.5,r:.75},{x:3.5,y:7.5,r:.75}];
const scatterRandom=(seed:number)=>{let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};};
function woodlandGardens(){
 const random=scatterRandom(16352026),result:typeof ROOM_GARDENS=[];
 for(let i=0;i<85&&result.length<34;i++){
  const x=-3.8+random()*22,y=-2.8+random()*16;
  if(Math.hypot((x-7)/11.4,(y-5)/8.4)>1||gardenClearings.some(c=>Math.hypot(x-c.x,y-c.y)<c.r))continue;
  if([...ROOM_GARDENS,...ROOM_EDGE_GARDENS,...result].some(q=>Math.hypot(x-q.x,y-q.y)<1.15))continue;
  const width=.35+random()*.37,height=width*(.65+random()*.15);
  result.push({x,y,index:[0,1,2,4,5][i%5],width,height,blocking:false});
  // Occasional small companion plant makes groups, not a uniform grid.
  if(i%3===0)result.push({x:x+.36,y:y+.19,index:[1,2,5][i%3],width:width*.52,height:height*.52,blocking:false});
 }
 return result;
}
export const SCATTERED_GARDENS=woodlandGardens();
