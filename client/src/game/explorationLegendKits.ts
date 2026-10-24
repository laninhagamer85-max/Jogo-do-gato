import type {CombatState} from './explorationCombat';
import art from './explorationNewLegendArt.json';

export const LEGEND_KITS={
 soren:{skill:'Véu das Brumas',description:'Ao usar Poder, fica protegido por 0,75 segundo e desacelera os inimigos atingidos por 2 segundos. Movimento 10% mais rápido.',weapon:'bow',tool:'pickaxe',weaponName:'Arco das Brumas',toolName:'Picareta da Névoa',weaponDescription:'+5 de ataque; flecha frontal até 6 passos. Paredes bloqueiam o disparo.',toolDescription:'Mineração 30% mais rápida. Capacidade mínima Nv 2; materiais mais raros continuam exigindo melhorias.',bonus:5,range:6,weaponColumn:0,toolColumn:1},
 ayla:{skill:'Pulso Rubro',description:'Poder causa 25% mais dano. A armadura de Ayla reduz o dano comum recebido em 3, sem tornar a heroína invulnerável.',weapon:'sword',tool:'axe',weaponName:'Espada Rubra',toolName:'Machado Rubro',weaponDescription:'+8 de ataque; golpe frontal até 1,7 passo.',toolDescription:'Corte de madeira 30% mais rápido. Capacidade mínima Nv 2; recursos avançados continuam exigindo melhorias.',bonus:8,range:1.7,weaponColumn:2,toolColumn:3},
} as const;
export type KitLegend=keyof typeof LEGEND_KITS;
export type SignatureSlot='weapon'|'tool';
export function legendKit(s:Pick<CombatState,'legends'>){const id=s.legends?.active;return id&&(id==='soren'||id==='ayla')&&s.legends?.unlocked.includes(id)?LEGEND_KITS[id]:null;}
export function signatureActive(s:Pick<CombatState,'legends'|'workshop'|'castleQuest'>,slot:SignatureSlot){
 const kit=legendKit(s),l=s.legends;if(!kit||!l?.signature?.[slot])return false;
 const royal=s.castleQuest?.claims[s.castleQuest.actor];
 if(royal?.issued&&royal.equipped[slot==='weapon'?'sword':kit.tool])return false;
 return slot==='weapon'?l.weapon===kit.weapon:!s.workshop?.disabledTools?.[kit.tool];
}
export function signatureArt(id:KitLegend,slot:SignatureSlot){const kit=LEGEND_KITS[id],rect=art.signature.rows[0][slot==='weapon'?kit.weaponColumn:kit.toolColumn];return {...rect,src:'/forest-adventure/legends/signature-v1.png',imageWidth:art.signature.width,imageHeight:art.signature.height};}
