/** Bound mobile draw work without changing elapsed-time movement or combat rules. */
export const EXPLORATION_FRAME_INTERVAL=1000/30;
export function shouldRunExplorationFrame(previous:number,now:number){return !previous||now-previous>=EXPLORATION_FRAME_INTERVAL-1;}
export function shouldDrawExplorationFrame(active:boolean,currentKey:string,lastKey:string){return active||currentKey!==lastKey;}
