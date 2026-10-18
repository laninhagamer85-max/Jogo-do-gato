import type {CampaignRoom} from './explorationCampaign';
export type TrailChallenge='collect'|'combat'|'puzzle'|'key'|'bridge'|'heal'|'master'|'route'|'jump'|'coins'|'portal';
export function explorationTrailInfo(room:CampaignRoom){
 const kind:TrailChallenge=room.bossId?'master':room.key?'key':room.switches.length?'puzzle':room.bridge?'bridge':room.useConsumable?'heal':room.title.toLowerCase().includes('coleta')||room.index===0?'collect':'combat';
 const labels:Record<TrailChallenge,string>={collect:'Coleta',combat:'Combate',puzzle:'Enigma',key:'Chave',bridge:'Ponte',heal:'Cura',master:'Mestre',route:'Trilha',jump:'Saltos',coins:'Moedas',portal:'Portal'};
 return {kind,label:labels[kind],enemyLevel:Math.max(1,...room.enemies.map(e=>e.level)),reward:room.bossId?(room.biome==='river'?'Coração das Marés':'Coração dos Troncos'):null};
}
export function adventureTrailInfo(id:number){const kinds:TrailChallenge[]=['route','bridge','combat','jump','puzzle','combat','collect','route','coins','portal'];return kinds[(id-1)%10];}
/** Captions may move around their fixed stop, never over another playable target. */
export function trailCaptionOffsets(layout:{points:readonly {x:number;y:number}[];vertical:boolean;width:number;height:number}){
 const used:{x:number;y:number;w:number;h:number}[]=[];
 return layout.points.map((p,i)=>{const w=layout.vertical?70:60,h=i%10===9?30:20;
 const sides=layout.vertical?(p.x<layout.width*.5?[[34,-8],[-w-35,-8]]:[[-w-35,-8],[34,-8]]):[[ -w/2,38],[34,-10],[-w-34,-10],[-w/2,-h-32]];
 const candidates=[...sides,[-w/2,38],[-w/2,-h-32]];
 const intersects=(a:{x:number;y:number;w:number;h:number},b:{x:number;y:number;w:number;h:number})=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
 let best=candidates[0],score=Infinity;
 for(const raw of candidates){const c=[Math.max(4,Math.min(layout.width-w-4,p.x+raw[0]))-p.x,Math.max(4,Math.min(layout.height-h-4,p.y+raw[1]))-p.y];const r={x:p.x+c[0],y:p.y+c[1],w,h};let n=r.x<3||r.x+w>layout.width-3||r.y<3||r.y+h>layout.height-3?100:0;
 layout.points.forEach((q,j)=>{if(i===j)return;const radius=(layout.vertical?29:24)+(j%10===9?4:0);if(intersects(r,{x:q.x-radius,y:q.y-radius,w:radius*2,h:radius*2}))n+=10;});n+=used.filter(u=>intersects(r,u)).length;
 if(n<score){score=n;best=c;}if(!n)break;
 }used.push({x:p.x+best[0],y:p.y+best[1],w,h});return {left:best[0],top:best[1]};
 });
}
