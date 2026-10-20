import {it,expect} from 'vitest';
import {CHAPTER4_ROOM,nascentesHeight,nascentesTraverse,nascentesPoint,NASCENTES_STAIR_BASE,NASCENTES_STAIR_TOP} from './explorationChapter4';
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
it('blocks painted water and cliff faces; only the diagonal stair connects heights',()=>{
 expect(nascentesHeight(nascentesPoint(.73,.25))).toBe(1);expect(nascentesHeight(CHAPTER4_ROOM.camp)).toBe(0);
 expect(pilotWalkable(nascentesPoint(.30,.45),true,.22,30)).toBe(false);
 expect(pilotWalkable(nascentesPoint(.54,.36),true,.22,30)).toBe(false);
 expect(pilotWalkable(NASCENTES_STAIR_BASE,false,.22,30)).toBe(false);
 expect(pilotRoute(CHAPTER4_ROOM.camp,CHAPTER4_ROOM.exit,false,30)).toEqual([]);
 expect(pilotRoute(NASCENTES_STAIR_BASE,CHAPTER4_ROOM.exit,true,30).length).toBeGreaterThan(0);
});
it('completes the actual authored collection and ordered puzzle, climbs, banks loot, and survives reload',()=>{
 let s=fixture();s=walk(s,CHAPTER4_ROOM.switches[1]);s=stepCombat(s,{interact:true},0);expect(s.switchStep).toBe(0);
 for(const n of CHAPTER4_ROOM.nodes.filter(n=>n.item==='fibra')){s=walk(s,n);s=stepCombat(s,{},0);expect(s.collectedNodes).toContain(n.id);}expect(s.roomCollectedFibers).toBe(12);
 for(const plate of CHAPTER4_ROOM.switches){s=walk(s,plate);s=stepCombat(s,{interact:true},0);}expect(s.switchStep).toBe(3);expect(s.gateOpen).toBe(true);
 const read=readCombatState(combatSnapshot(s));if(!read.supported)throw Error('unsupported');s=read.state;expect(s.gateOpen).toBe(true);expect(s.campaignVersion).toBe(6);
 s=walk(s,nascentesPoint(.73,.25));expect(nascentesHeight(s.player)).toBe(1);s=walk(s,CHAPTER4_ROOM.exit);expect(s.completed).toBe(true);expect(s.stock.fibra).toBe(12);expect(s.completedRooms).toContain(30);expect(stepCombat(s,{},0)).toBe(s);
});
it('never downgrades Chapter4 save protection when using a previously-owned Legendary',()=>{const s=fixture();s.legends={unlocked:['kael'],active:null,weapons:[],weapon:null};const next=changeLegend(s,'menino',{type:'select',id:'kael'});expect(next.campaignVersion).toBe(6);const read=readCombatState(combatSnapshot(next));expect(read.supported&&read.state.campaignVersion).toBe(6);});

it('migrates old room31 coordinates once while preserving materials and solved challenge',()=>{
 const old={...combatSnapshot(fixture()),campaignVersion:5,nascentesSceneVersion:undefined,player:{x:16.5,y:8.5},gateOpen:true,switchStep:3,roomCollectedFibers:12,stock:{fibra:73,ambar:18,erva:2,fruta:1}};
 const read=readCombatState(old);expect(read.supported).toBe(true);if(!read.supported)return;
 expect(read.state.player).toEqual(CHAPTER4_ROOM.camp);expect(read.state.stock.fibra).toBe(73);expect(read.state.gateOpen).toBe(true);expect(read.state.switchStep).toBe(3);expect(read.state.nascentesSceneVersion).toBe(2);
 const after=walk(read.state,nascentesPoint(.73,.25)),again=readCombatState(combatSnapshot(after));expect(again.supported&&again.state.player).toEqual(after.player);
});
