export const DAY_PHASE_MS=30*60*1000;
export function explorationDay(clock=0){const elapsed=Number.isFinite(clock)?Math.max(0,clock):0,part=(elapsed/DAY_PHASE_MS)%3,index=Math.floor(part),fraction=part-index;return {phase:(['morning','afternoon','night'] as const)[index],label:['Manhã','Tarde','Noite'][index],fraction,night:index===2?Math.min(1,fraction*12,(1-fraction)*12):0,minutesLeft:Math.max(1,Math.ceil((1-fraction)*30))};}
export const villagerWalkPose=(facing:{x:number;y:number},phase:number,walking:boolean,reduced=false)=>{const side=Math.abs(facing.x)>Math.abs(facing.y),frame=walking&&!reduced&&phase>=.5?1:0;return {column:side?6+frame:(facing.y<0?2:0)+frame,mirror:side&&facing.x<0};};

export function portalDayClock(room:number,visit:number,seed:number){let hash=(seed^Math.imul(room+1,2654435761)^Math.imul(visit+1,1597334677))>>>0;hash=Math.imul(hash^(hash>>>16),2246822507)>>>0;return (hash%3)*DAY_PHASE_MS;}
