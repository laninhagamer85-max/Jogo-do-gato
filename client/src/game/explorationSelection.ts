import {readLegendProgress} from './explorationLegends';
import {EXPLORATION_ROOMS,campaignRoom} from './explorationCampaign';
import {createCombatState,readCombatState,combatSnapshot,combatMaxHp,type CombatState} from './explorationCombat';
export function explorationRoomStatus(s:CombatState,index:number):'completed'|'current'|'locked'{
 if(s.completedRooms.includes(index))return 'completed';
 return index===(s.completed?s.roomIndex+1:s.roomIndex)?'current':'locked';
}
/** A replay is a separate attempt. Its room-local state never replaces the campaign checkpoint. */
export function startExplorationReplay(campaign:CombatState,index:number):CombatState|null{
 if(index<0||index>=EXPLORATION_ROOMS.length||!campaign.completedRooms.includes(index))return null;
 let attempt:CombatState|null=null;
 try{const raw=JSON.parse(campaign.roomAttempts[index]??'null');if(raw&&typeof raw==='object'){const read=readCombatState({...raw,roomAttempts:{}});if(read.supported&&read.state.roomIndex===index&&!read.state.completed)attempt=read.state;}}catch{/* An invalid attempt starts afresh, never changes campaign progress. */}
 const s=attempt??createCombatState(index,campaign.encounterSeed+index+1);
 s.legends=campaign.legends?readLegendProgress(campaign.legends):undefined;if(s.legends)s.campaignVersion=4;
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
 return {...campaign,legends:replay.legends?readLegendProgress(replay.legends):campaign.legends,campaignVersion:replay.legends?4:campaign.campaignVersion,roomStars:{...campaign.roomStars,...(replay.completed&&replay.roomStars[replay.roomIndex]?{[replay.roomIndex]:Math.max(campaign.roomStars[replay.roomIndex]??0,replay.roomStars[replay.roomIndex])}:{})},revision:Math.max(campaign.revision,replay.revision)+1,xp:Math.max(campaign.xp,replay.xp),stock:{...replay.stock},rareStock:{...replay.rareStock},equipmentOwned:campaign.equipmentOwned||replay.equipmentOwned,equipmentOn:replay.equipmentOn,cards:[...new Set([...campaign.cards,...replay.cards])],activeCard:replay.activeCard,secondaryCard:replay.secondaryCard,activePower:replay.activePower,quickItems:replay.quickItems?.slice(),rareEquipped:replay.rareEquipped,roomAttempts:{...campaign.roomAttempts,[replay.roomIndex]:snapshot}};
}
