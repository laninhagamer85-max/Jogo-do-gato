import {composeForestClusters,FOREST_EDGE_CLUSTERS} from './biomeScenery';
/** Existing woodland house marks the safe camp; its base leaves spawn and routes free. */
export const PILOT_SHELTER={x:2.75,y:1.9,width:1.4,height:1.4,footprint:{x:2.4,y:1.55,width:.7,height:.35},asset:'/manus-storage/bosque-casa-arvore_0200432f.webp'};
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
export const ROOM_GARDENS=ROOM_UNDERGROWTH.map((p,i)=>({...p,index:[0,1,2,4,5,1,2,3,4,5,0][i%11]}));
export const ROOM_EDGE_GARDENS=ROOM_EDGES.filter(p=>p.index===1||p.index===3).map((p,i)=>({...p,index:[4,1,0,2,5,3,1][i%7],blocking:false as const}));
export const ROOM_EDGE_SOLIDS=ROOM_EDGES.filter(p=>p.index!==1&&p.index!==3);
