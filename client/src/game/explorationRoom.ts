/** Room geometry and art share the same ground footprints. */
export const PILOT_OBSTACLES = [
  {id:'fallen-log', x:5,y:3,width:2,height:1,index:2,artWidth:2.1,artHeight:1.08},
  {id:'moss-rocks',x:10,y:6,width:1,height:1,index:0,artWidth:1.4,artHeight:1.05},
];
export const ROOM_WALLS=PILOT_OBSTACLES.flatMap(o=>Array.from({length:o.width*o.height},(_,i)=>({x:o.x+i%o.width,y:o.y+Math.floor(i/o.width)})));
export const ROOM_SCENERY=PILOT_OBSTACLES.map(o=>({x:o.x+o.width/2,y:o.y+o.height-.08,index:o.index,width:o.artWidth,height:o.artHeight}));
// Irregular larger clusters mark the perimeter without a repeating tile hedge.
export const ROOM_EDGES=[
  ...[1.3,3.7,6.6,9.1,12.1].map((x,i)=>({x,y:.85,index:i%2?3:0,width:1.35,height:.95})),
  ...[1.4,4.2,7.1,10,12.7].map((x,i)=>({x,y:10.1,index:i%2?0:3,width:1.5,height:1.05})),
  ...[2.4,5,7.9].flatMap((y,i)=>[{x:.15,y,index:i%2?3:0,width:1.1,height:1.25},{x:13.9,y:y+.3,index:i%2?0:3,width:1.1,height:1.25}]),
];
