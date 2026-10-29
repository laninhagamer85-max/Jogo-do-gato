import {combatSnapshot,readCombatState} from '../game/explorationCombat';
import type {PetProfile} from '../game/PetGame';
export type Saved={version:1;profile:PetProfile;progress:Record<string,unknown>};
export function decodeSaved(serialized:string):Saved {const p=JSON.parse(serialized);const profile=p.profile;const raw=p.progress??p.explorationCombatProgress;if(!raw||typeof raw!=='object'||typeof raw.version!=='number'||typeof raw.roomIndex!=='number'||(p.progress&&p.version!==1))throw new Error('Arquivo de progresso inválido ou de uma versão incompatível.');const state=readCombatState(raw);if(!profile||typeof profile.name!=='string'||profile.name.length>28||!['menino','menina'].includes(profile.gender)||!['menino-prata','menino-laranja','menino-preto','menina-creme','menina-calico','menina-azul'].includes(profile.characterId)||!state.supported)throw new Error('Arquivo de progresso inválido ou de uma versão incompatível.');if(!profile.characterId.startsWith(profile.gender+'-'))throw new Error('Personagem incompatível com o perfil.');return withStarterLegend({version:1,profile:{name:profile.name,gender:profile.gender,characterId:profile.characterId,age:1},progress:combatSnapshot(state.state)});}

/** Independent game's starter entitlement; never consumes materials or replaces a compatible selected hero. */
export function withStarterLegend(saved:Saved):Saved {
 const result=readCombatState(saved.progress);
 if(!result.supported)throw new Error('Versão de campanha incompatível.');
 const state=result.state,starter=saved.profile.gender==='menina'?'lyra':'kael';
 const legends=state.legends??{unlocked:[],active:null,weapons:[],weapon:null};
 const compatible=legends.active&&(saved.profile.gender==='menina'?['lyra','ayla']:['kael','soren']).includes(legends.active);
 state.legends={...legends,unlocked:[...new Set([...legends.unlocked,starter])],active:compatible?legends.active:starter} as typeof state.legends;
 state.campaignVersion=Math.max(4,state.campaignVersion) as typeof state.campaignVersion;
 return {...saved,progress:combatSnapshot(state)};
}
