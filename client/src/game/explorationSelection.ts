import {newVillage,readVillage} from './explorationVillage';
import {VILLAGE_CENTER,villageSettlements} from './explorationVillageLayout';
import {CASTLE_TEST_ACCESS,readCastleQuest} from './explorationCastleQuest';
import {readWorkshop} from './explorationWorkshop';
import {readLegendProgress} from './explorationLegends';
import {EXPLORATION_ROOMS,campaignRoom} from './explorationCampaign';
import {travelCombatPortal,createCombatState,readCombatState,combatSnapshot,combatMaxHp,type CombatState} from './explorationCombat';
export function explorationRoomStatus(s:CombatState,index:number):'completed'|'current'|'locked'{
 if(s.completedRooms.includes(index))return 'completed';
 return index===(s.completed?s.roomIndex+1:s.roomIndex)?'current':'locked';
}
/** A replay is a separate attempt. Its room-local state never replaces the campaign checkpoint. */
export function startExplorationReplay(campaign:CombatState,index:number):CombatState|null{
 if(index<0||index>=EXPLORATION_ROOMS.length||!campaign.completedRooms.includes(index)&&!(CASTLE_TEST_ACCESS&&index>=30))return null;
 if(index>=30)return index===campaign.roomIndex?{...campaign,completed:false,portalTarget:undefined}:travelCombatPortal(campaign,index);
 let attempt:CombatState|null=null;
 try{const raw=JSON.parse(campaign.roomAttempts[index]??'null');if(raw&&typeof raw==='object'){const read=readCombatState({...raw,roomAttempts:{}});if(read.supported&&read.state.roomIndex===index&&!read.state.completed)attempt=read.state;}}catch{/* An invalid attempt starts afresh, never changes campaign progress. */}
 const s=attempt??createCombatState(index,campaign.encounterSeed+index+1);
 s.village=readVillage(campaign.village);s.castleQuest=readCastleQuest(campaign.castleQuest);s.workshop=readWorkshop(campaign.workshop);s.legends=campaign.legends?readLegendProgress(campaign.legends):undefined;if(s.legends)s.campaignVersion=Math.max(4,s.campaignVersion) as CombatState['campaignVersion'];
 s.roomStars={...campaign.roomStars};s.roomAttempts={};s.completedRooms=[...campaign.completedRooms];s.claimedRooms=[...campaign.claimedRooms];s.completionRewardClaimed=true;
 s.xp=campaign.xp;s.stock={...campaign.stock};s.rareStock={...campaign.rareStock};s.equipmentOwned=campaign.equipmentOwned;s.equipmentOn=campaign.equipmentOn;s.cards=[...campaign.cards];s.activeCard=campaign.activeCard;s.secondaryCard=campaign.secondaryCard;s.activePower=campaign.activePower;s.quickItems=campaign.quickItems?.slice();s.rareEquipped=campaign.rareEquipped;
 if(s.rareEquipped&&s.rareStock[s.rareEquipped]+s.rareBag[s.rareEquipped]<1)s.rareEquipped=null;
 if(!attempt)s.hp=combatMaxHp(s.xp);s.hp=Math.min(s.hp,combatMaxHp(s.xp));s.revision=campaign.revision+1;
 s.message=attempt?'Repetição retomada de onde parou. O avanço da campanha está preservado.':`Repetindo ${campaignRoom(index).title}. O avanço da campanha está preservado.`;
 return s;
}
/** Banking and spending replace totals once; campaign geometry, HP and quest flags stay intact. */
export function saveExplorationReplay(campaign:CombatState,replayValue:unknown):CombatState{
 const raw=replayValue&&typeof replayValue==='object'?replayValue as Record<string,unknown>:{};
 if(typeof raw.roomIndex!=='number'||!Number.isInteger(raw.roomIndex)||!campaign.completedRooms.includes(raw.roomIndex))return campaign;
 const read=readCombatState(replayValue);if(!read.supported||read.state.roomIndex!==raw.roomIndex)return campaign;
 const replay=read.state;if(!campaign.completedRooms.includes(replay.roomIndex))return campaign;
 const snapshot=JSON.stringify({...combatSnapshot(replay),roomAttempts:{}});
 if(campaign.roomAttempts[replay.roomIndex]===snapshot)return campaign;
 try{const previous=JSON.parse(campaign.roomAttempts[replay.roomIndex]??'null');if(previous&&previous.revision>replay.revision)return campaign;}catch{/* Replace only the invalid attempt. */}
 return {...campaign,village:readVillage(replay.village),castleQuest:readCastleQuest(replay.castleQuest),workshop:readWorkshop(replay.workshop),legends:replay.legends?readLegendProgress(replay.legends):campaign.legends,campaignVersion:Math.max(campaign.campaignVersion,replay.campaignVersion) as CombatState['campaignVersion'],roomStars:{...campaign.roomStars,...(replay.completed&&replay.roomStars[replay.roomIndex]?{[replay.roomIndex]:Math.max(campaign.roomStars[replay.roomIndex]??0,replay.roomStars[replay.roomIndex])}:{})},revision:Math.max(campaign.revision,replay.revision)+1,xp:Math.max(campaign.xp,replay.xp),stock:{...replay.stock},rareStock:{...replay.rareStock},equipmentOwned:campaign.equipmentOwned||replay.equipmentOwned,equipmentOn:replay.equipmentOn,cards:[...new Set([...campaign.cards,...replay.cards])],activeCard:replay.activeCard,secondaryCard:replay.secondaryCard,activePower:replay.activePower,quickItems:replay.quickItems?.slice(),rareEquipped:replay.rareEquipped,roomAttempts:{...campaign.roomAttempts,[replay.roomIndex]:snapshot}};
}

/** Temporary public access retains all account economy and genuine chapter completion. */
export function startExplorationTestRoom(campaign:CombatState,index:30|31):CombatState{
 if(campaign.castleQuest?.reviveAt)return campaign;
 const fresh=createCombatState(index,campaign.encounterSeed+1);
 return {...campaign,...fresh,village:readVillage(campaign.village),castleQuest:readCastleQuest(campaign.castleQuest),workshop:readWorkshop(campaign.workshop),legends:campaign.legends,castle:campaign.castle?{...campaign.castle,active:false}:undefined,xp:campaign.xp,hp:Math.max(1,campaign.hp),stock:{...campaign.stock},bag:{...campaign.bag},rareStock:{...campaign.rareStock},rareBag:{...campaign.rareBag},cards:[...campaign.cards],activeCard:campaign.activeCard,secondaryCard:campaign.secondaryCard,activePower:campaign.activePower,quickItems:campaign.quickItems,rareEquipped:campaign.rareEquipped,equipmentOwned:campaign.equipmentOwned,equipmentOn:campaign.equipmentOn,completedRooms:[...campaign.completedRooms],claimedRooms:[...campaign.claimedRooms],roomStars:{...campaign.roomStars},roomVisits:campaign.roomVisits,roomAttempts:campaign.roomAttempts,gateOpen:true,campaignVersion:13,revision:campaign.revision+1,message:'Acesso de teste liberado: salas 31, 32 e castelo. Seu progresso anterior está preservado.'};
}

/** Side visit banks the same economy but never replaces the expedition's room/checkpoint. */
export function startVillageVisit(campaign:CombatState,index=0){if(campaign.castleQuest?.reviveAt)return campaign;const fresh=createCombatState(index);return {...campaign,...fresh,village:readVillage(campaign.village),workshop:readWorkshop(campaign.workshop),legends:campaign.legends,xp:campaign.xp,hp:campaign.hp,energy:campaign.energy,stock:{...campaign.stock},bag:{...campaign.bag},rareStock:{...campaign.rareStock},rareBag:{...campaign.rareBag},cards:[...campaign.cards],activeCard:campaign.activeCard,secondaryCard:campaign.secondaryCard,activePower:campaign.activePower,quickItems:campaign.quickItems,equipmentOwned:campaign.equipmentOwned,equipmentOn:campaign.equipmentOn,rareEquipped:campaign.rareEquipped,castleQuest:readCastleQuest(campaign.castleQuest),castle:undefined,completedRooms:[...campaign.completedRooms],claimedRooms:[...campaign.claimedRooms],player:{x:villageSettlements(index)[0].x,y:villageSettlements(index)[0].y+1},revision:campaign.revision+1,message:'Povoado do bioma · Visite as casas e converse com os moradores. Seu avanço da campanha está preservado.'};}
export function saveVillageVisit(campaign:CombatState,raw:unknown){const parsed=readCombatState(raw);if(!parsed.supported)return campaign;const v=parsed.state;return {...campaign,village:readVillage(v.village),workshop:readWorkshop(v.workshop),legends:v.legends,castleQuest:readCastleQuest(v.castleQuest),xp:v.xp,hp:v.hp,energy:v.energy,stock:{...v.stock},bag:{...v.bag},rareStock:{...v.rareStock},rareBag:{...v.rareBag},cards:[...v.cards],activeCard:v.activeCard,secondaryCard:v.secondaryCard,activePower:v.activePower,quickItems:v.quickItems,equipmentOwned:v.equipmentOwned,equipmentOn:v.equipmentOn,rareEquipped:v.rareEquipped,revision:Math.max(campaign.revision,v.revision)+1,campaignVersion:13 as const};}

/** Older public-test jumps could replace the campaign pointer. Recover the first genuine unfinished room. */
export function recoverExplorationCheckpoint(campaign:CombatState):CombatState{
 if(campaign.roomIndex<30)return campaign;const frontier=EXPLORATION_ROOMS.findIndex(r=>!campaign.completedRooms.includes(r.index));if(frontier<0||frontier>=30)return campaign;
 const fresh=createCombatState(frontier,campaign.encounterSeed),bank=saveVillageVisit(fresh,combatSnapshot(campaign)),memory=campaign.roomVisits?.[frontier];
 return {...bank,...memory,completedRooms:[...campaign.completedRooms],claimedRooms:[...campaign.claimedRooms],roomStars:{...campaign.roomStars},roomVisits:{...campaign.roomVisits},roomAttempts:{...campaign.roomAttempts},revision:campaign.revision+1,message:'O avanço da campanha foi restaurado. As salas de teste continuam disponíveis sem substituir sua sala atual.'};
}
