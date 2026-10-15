import { FOREST_MAP, forestPositionBlocked, type Cell, type ForestGameState, type ForestInput } from './forestPuzzle';
/** Four-connected BFS: never pushes, opens doors or crosses unbuilt bridges automatically. */
export function forestTapPath(state: ForestGameState, target: Cell): Cell[] | null {
  const goal={x:Math.floor(target.x),y:Math.floor(target.y)};
  if (!Number.isFinite(target.x) || !Number.isFinite(target.y) || forestPositionBlocked(state,goal.x+.5,goal.y+.5)) return null;
  const start={x:Math.floor(state.player.x),y:Math.floor(state.player.y)};
  const key=(p:Cell)=>p.y*FOREST_MAP.columns+p.x;
  const visited=new Map<number,Cell|null>([[key(start),null]]), queue:Cell[]=[start];
  for(let index=0;index<queue.length;index++) {
    const p=queue[index];
    if(p.x===goal.x && p.y===goal.y) {
      const route:Cell[]=[];let at:Cell|null=p;
      while(at) {route.push({x:at.x+.5,y:at.y+.5});at=visited.get(key(at))??null;}
      return route.reverse();
    }
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const n={x:p.x+dx,y:p.y+dy};
      if(n.x<0||n.y<0||n.x>=FOREST_MAP.columns||n.y>=FOREST_MAP.rows||visited.has(key(n))||forestPositionBlocked(state,n.x+.5,n.y+.5))continue;
      visited.set(key(n),p);queue.push(n);
    }
  }
  return null;
}
export function forestRouteInput(player:Cell,route:Cell[],dt:number):ForestInput {
  const tolerance=Math.max(.025,Math.min(.09,dt*3.15*.6));
  while(route.length && Math.hypot(route[0].x-player.x,route[0].y-player.y)<=tolerance) route.shift();
  if(!route.length)return {};
  const dx=route[0].x-player.x,dy=route[0].y-player.y;
  return Math.abs(dx)>tolerance ? {left:dx<0,right:dx>0} : {up:dy<0,down:dy>0};
}
