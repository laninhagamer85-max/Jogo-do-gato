import {it,expect} from 'vitest';
import {CHAPTER4_ROOM,nascentesHeight,nascentesTraverse} from './explorationChapter4';
import {EXPLORATION_ROOMS,campaignEnemies,chapterName} from './explorationCampaign';
import {createCombatState,stepCombat,pilotRoute,clearPilotWalkLine,pilotWalkable,readCombatState,combatSnapshot,type CombatState} from './explorationCombat';
import {changeLegend} from './explorationLegends';
const fixture=()=>{const s=createCombatState(30);s.completedRooms=Array.from({length:30},(_,i)=>i);s.claimedRooms=[...s.completedRooms];return s;};
function walk(s:CombatState,target:{x:number;y:number}){
 const route=pilotRoute(s.player,target,s.gateOpen,30);expect(route.length,JSON.stringify(target)).toBeGreaterThan(0);
 for(const next of route){let n=0;while(!s.completed&&Math.hypot(next.x-s.player.x,next.y-s.player.y)>.04&&n++<90){const d=Math.hypot(next.x-s.player.x,next.y-s.player.y),gain=Math.min(1,d/.15);s=stepCombat(s,{dx:(next.x-s.player.x)/d*gain,dy:(next.y-s.player.y)/d*gain},50);}expect(n).toBeLessThan(90);}
 return s;
}
it('ships exactly one new room and no premature NPC content',()=>{expect(EXPLORATION_ROOMS).toHaveLength(31);expect(EXPLORATION_ROOMS.filter(r=>r.index>=30)).toEqual([CHAPTER4_ROOM]);expect(chapterName(30)).toBe('Jardim das Nascentes');expect(campaignEnemies(30,42)).toEqual([]);expect(fixture().enemies).toEqual([]);});
it('blocks terrace edges, closed ramp and lake, while the ramp is the only legal height connector',()=>{
 expect(nascentesHeight({x:12,y:2})).toBe(1);expect(nascentesHeight({x:5,y:5.5})).toBe(0);
 expect(nascentesTraverse({x:9.85,y:2},{x:9.95,y:2})).toBe(false);expect(clearPilotWalkLine({x:9.5,y:2.5},{x:10.5,y:2.5},true,.22,30)).toBe(false);
 expect(pilotWalkable({x:8,y:5.5},false,.22,30)).toBe(false);expect(pilotWalkable({x:14,y:5},true,.22,30)).toBe(false);
 expect(clearPilotWalkLine({x:5.5,y:5.5},{x:10.5,y:5.5},true,.22,30)).toBe(true);
 expect(pilotRoute(CHAPTER4_ROOM.camp,CHAPTER4_ROOM.exit,false,30)).toEqual([]);
});
it('completes the actual authored collection and ordered puzzle, climbs, banks loot, and survives reload',()=>{
 let s=fixture();s=walk(s,CHAPTER4_ROOM.switches[1]);s=stepCombat(s,{interact:true},0);expect(s.switchStep).toBe(0);
 for(const n of CHAPTER4_ROOM.nodes.filter(n=>n.item==='fibra')){s=walk(s,n);s=stepCombat(s,{},0);expect(s.collectedNodes).toContain(n.id);}expect(s.roomCollectedFibers).toBe(12);
 for(const plate of CHAPTER4_ROOM.switches){s=walk(s,plate);s=stepCombat(s,{interact:true},0);}expect(s.switchStep).toBe(3);expect(s.gateOpen).toBe(true);
 const read=readCombatState(combatSnapshot(s));if(!read.supported)throw Error('unsupported');s=read.state;expect(s.gateOpen).toBe(true);expect(s.campaignVersion).toBe(5);
 s=walk(s,{x:11.5,y:5.5});expect(nascentesHeight(s.player)).toBe(1);s=walk(s,CHAPTER4_ROOM.exit);expect(s.completed).toBe(true);expect(s.stock.fibra).toBe(12);expect(s.completedRooms).toContain(30);expect(stepCombat(s,{},0)).toBe(s);
});
it('never downgrades Chapter4 save protection when using a previously-owned Legendary',()=>{const s=fixture();s.legends={unlocked:['kael'],active:null,weapons:[],weapon:null};const next=changeLegend(s,'menino',{type:'select',id:'kael'});expect(next.campaignVersion).toBe(5);const read=readCombatState(combatSnapshot(next));expect(read.supported&&read.state.campaignVersion).toBe(5);});
