import art from './explorationGearArt.json';
export const EQUIPMENT_KINDS=['axe','pickaxe','sword','dagger','bow'] as const;
export type EquipmentKind=typeof EQUIPMENT_KINDS[number];
export const EQUIPMENT_NAMES={axe:'Machado',pickaxe:'Picareta',sword:'Espada',dagger:'Faca',bow:'Arco'} as const;
export const EQUIPMENT_TIERS=[
 {id:'metal',name:'Metal',requiredLevel:6,rank:1,attackMultiplier:1.08,collectionSpeedMultiplier:1.08,wearMultiplier:.95,cost:{ironBar:4,wood:4}},
 {id:'silver',name:'Prata',requiredLevel:12,rank:2,attackMultiplier:1.13,collectionSpeedMultiplier:1.13,wearMultiplier:.93,cost:{silverBar:4,wood:5,perola:1}},
 {id:'gold',name:'Ouro',requiredLevel:15,rank:3,attackMultiplier:1.18,collectionSpeedMultiplier:1.18,wearMultiplier:.9,cost:{goldBar:5,ironBar:3}},
 {id:'diamond',name:'Diamante',requiredLevel:30,rank:4,attackMultiplier:1.3,collectionSpeedMultiplier:1.3,wearMultiplier:.8,cost:{diamond:4,goldBar:3}},
 {id:'crystal',name:'Cristal',requiredLevel:45,rank:5,attackMultiplier:1.45,collectionSpeedMultiplier:1.45,wearMultiplier:.75,cost:{cristal:8,diamond:6,silverBar:5}},
 {id:'legendary',name:'Lendária',requiredLevel:60,rank:6,attackMultiplier:1.65,collectionSpeedMultiplier:1.65,wearMultiplier:.65,cost:{cristal:15,diamond:10,goldBar:8,seiva:12,ambar:50}},
] as const;
export type EquipmentTier=typeof EQUIPMENT_TIERS[number]['id'];
export type GearGrade=EquipmentTier|'wood';
export const TIER_ATLAS='/forest-adventure/items/equipment-tiers-v1.webp';
export function equipmentTier(value:unknown){return EQUIPMENT_TIERS.find(t=>t.id===value);}
export const gradeLevel=(grade:GearGrade)=>equipmentTier(grade)?.requiredLevel??1;
export const gearRequiredLevel=(kind:EquipmentKind,grade:GearGrade)=>grade==='wood'?({axe:1,pickaxe:1,sword:4,dagger:2,bow:3})[kind]:gradeLevel(grade);
export const gradeName=(grade:GearGrade)=>equipmentTier(grade)?.name??'Madeira';
export const gearName=(kind:EquipmentKind,grade:GearGrade)=>`${EQUIPMENT_NAMES[kind]} · ${gradeName(grade)}`;
export function tierSprite(kind:EquipmentKind,tier:GearGrade){const column=EQUIPMENT_KINDS.indexOf(kind),row=['wood','silver','crystal','legendary'].indexOf(tier);return row>=0?{src:art.src,column,row,columns:5,rows:4,rect:art.rects[row][column],clip:art.clips[row][column],width:art.width,height:art.height}:{src:TIER_ATLAS,column,row:['metal','gold','diamond'].indexOf(tier),columns:5,rows:3,rect:undefined,clip:undefined,width:1608,height:960};}
export function tierArtRect(a:ReturnType<typeof tierSprite>,width:number,height:number){return a.rect??[a.column*width/a.columns,a.row*height/a.rows,width/a.columns,height/a.rows];}
export function equipmentTierRequirement(kind:EquipmentKind,target:EquipmentTier,current:EquipmentTier|null,level:number,ownsBase:boolean){const t=equipmentTier(target);if(!EQUIPMENT_KINDS.includes(kind)||!t)return 'Equipamento inválido.';if(!ownsBase)return 'Fabrique o equipamento inicial primeiro.';if(!Number.isFinite(level)||level<t.requiredLevel)return `Requer nível ${t.requiredLevel}.`;if(t.rank!==(equipmentTier(current)?.rank??0)+1)return 'Fabrique o material anterior primeiro: metal, prata, ouro, diamante e cristal.';return '';}
export function tierWeaponStats(base:{bonus:number;range:number},tier:EquipmentTier|null){const t=equipmentTier(tier);return {bonus:t?Math.round(base.bonus*t.attackMultiplier*100)/100:base.bonus,range:base.range};}
export function tierHarvestDelay(tier:EquipmentTier|null){return Math.round(650/(equipmentTier(tier)?.collectionSpeedMultiplier??1));}
export function equipmentCost(kind:EquipmentKind,tier:EquipmentTier):Record<string,number>{const t=equipmentTier(tier)!;return {...t.cost,...(kind==='bow'?{silk:t.rank*2}:kind==='dagger'?{resin:t.rank*2}:kind==='sword'?{fibra:t.rank*3}:kind==='pickaxe'?{stone:t.rank*3}:{wood:4+t.rank*2})};}

/** Clip overlapping atlas rows to the authored item silhouette, retaining transparent gaps. */
export function drawTierItem(ctx:CanvasRenderingContext2D,image:CanvasImageSource,a:ReturnType<typeof tierSprite>,rect:readonly number[],x:number,y:number,w:number,h:number){const [sx,sy,sw,sh]=rect;ctx.save();if(a.clip){ctx.beginPath();a.clip.forEach(([px,py],i)=>{const dx=x+px*w/100,dy=y+py*h/100;i?ctx.lineTo(dx,dy):ctx.moveTo(dx,dy);});ctx.closePath();ctx.clip();}ctx.drawImage(image,sx,sy,sw,sh,x,y,w,h);ctx.restore();}
