import {addVillageNews} from './explorationVillageNews';
import type {CombatState} from './explorationCombat';
import {campaignRoom,type RareItem} from './explorationCampaign';
import {returnPortal,connectedPortal} from './explorationChapter4';
import {villagerDefinition,villageDoor,villageSettlements} from './explorationVillageLayout';
import type {Citizen,VillageProgress} from './explorationVillage';
export type ImportStock=Record<string,Partial<Record<RareItem,number>>>;
export function caravanDestination(s:CombatState,home:number,cycle:number){const accessible=(room:number)=>room===s.roomIndex||s.completedRooms.includes(room)||s.completedRooms.includes(room-1)||room>=30;const options=[home-1,home+1].filter(r=>r>=0&&r<32&&connectedPortal(home,r)&&accessible(r));return options[cycle%Math.max(1,options.length)];}
export function caravanDoor(room:number,target:number){return target>room?campaignRoom(room).exit:returnPortal(room);}
export function caravanArrival(room:number,from:number){const q=from<room?returnPortal(room):campaignRoom(room).exit;return{x:q.x+1.3,y:q.y+1};}
export function caravanRare(room:number):RareItem{return room>=20?'cristal':room>=10?'escama':'seiva';}
/** One shipment per completed physical round trip; a save keeps its phase and cargo. */
export function finishCaravan(v:VillageProgress,id:string,c:Citizen){const d=villagerDefinition(id),town=villageSettlements(d.room)[d.settlement],key=town.id;if(c.cargo){const stock=v.imports?.[key]??{};v.imports={...v.imports,[key]:{...stock,[c.cargo]:Math.min(4,(stock[c.cargo]??0)+1)}};}if(c.cargo)addVillageNews(v,{id:`shipment:${id}:${c.cargo}`,author:id,room:d.room,settlement:d.settlement,text:'Voltei de outra vila com recursos raros para nossa loja. O estoque é pequeno; visite o comércio da praça.'});c.cargo=undefined;c.destination=undefined;c.cycle++;c.task='home';c.timer=7000;Object.assign(c,villageDoor(d.home,d.room));}
export const importFor=(s:CombatState,id:string)=>{const parts=id.split(':'),room=Number(parts[0]?.slice(1)),slot=Number(parts[1]?.slice(1));return `r${Number.isFinite(room)?room:s.roomIndex}:s${Number.isFinite(slot)?slot:0}`;};
