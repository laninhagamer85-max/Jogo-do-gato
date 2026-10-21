/** Shared balance and sprite coordinates for the Workshop, inventory and equipped items. */
export const EQUIPMENT_KINDS=['axe','pickaxe','sword','dagger','bow'] as const;
export type EquipmentKind=typeof EQUIPMENT_KINDS[number];
export const EQUIPMENT_TIERS=[
 {id:'metal',name:'Metal',requiredLevel:6,rank:1,attackMultiplier:1.08,collectionSpeedMultiplier:1.08,wearMultiplier:.95,cost:{ironBar:4,wood:4}},
 {id:'gold',name:'Ouro',requiredLevel:15,rank:2,attackMultiplier:1.18,collectionSpeedMultiplier:1.18,wearMultiplier:.9,cost:{goldBar:5,ironBar:3}},
 {id:'diamond',name:'Diamante',requiredLevel:30,rank:3,attackMultiplier:1.3,collectionSpeedMultiplier:1.3,wearMultiplier:.8,cost:{diamond:4,goldBar:3}},
] as const;
export type EquipmentTier=typeof EQUIPMENT_TIERS[number]['id'];
export const TIER_ATLAS='/forest-adventure/items/equipment-tiers-v1.webp';
export function equipmentTier(value:unknown){return EQUIPMENT_TIERS.find(t=>t.id===value);}
export function tierSprite(kind:EquipmentKind,tier:EquipmentTier){return {src:TIER_ATLAS,column:EQUIPMENT_KINDS.indexOf(kind),row:EQUIPMENT_TIERS.findIndex(t=>t.id===tier),columns:5,rows:3};}
/** Upgrade only one material grade at a time; never downgrade an existing item. */
export function equipmentTierRequirement(kind:EquipmentKind,target:EquipmentTier,current:EquipmentTier|null,level:number,ownsBase:boolean){
 const t=equipmentTier(target);if(!EQUIPMENT_KINDS.includes(kind)||!t)return 'Equipamento inválido.';
 if(!ownsBase)return 'Fabrique o equipamento inicial primeiro.';
 if(!Number.isFinite(level)||level<t.requiredLevel)return `Requer nível ${t.requiredLevel}.`;
 if(t.rank!==(equipmentTier(current)?.rank??0)+1)return 'Melhore um material por vez: metal, ouro e diamante.';
 return '';
}
/** Preserve weapon identity: dagger stays quick/short, sword melee, bow ranged. */
export function tierWeaponStats(base:{bonus:number;range:number},tier:EquipmentTier|null){const t=equipmentTier(tier);return {bonus:t?Math.round(base.bonus*t.attackMultiplier*100)/100:base.bonus,range:base.range};}
export function tierHarvestDelay(tier:EquipmentTier|null){return Math.round(650/(equipmentTier(tier)?.collectionSpeedMultiplier??1));}
