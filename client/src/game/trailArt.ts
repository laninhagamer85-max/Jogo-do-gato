export type TrailMode='adventure'|'exploration';
export type TrailArtKind='forest'|'river'|'home';
export const TRAIL_ART_ANCHORS={
 portrait:[[.52,.84],[.28,.57],[.7,.42],[.3,.24],[.52,.085]],
 landscape:[[.1,.48],[.3,.33],[.5,.52],[.7,.39],[.9,.5]],
} as const;
// Anchors calibrated by inspecting the twelve authored plates, not assumed from prompts.
const anchors={
 forest:{portrait:[[[.52,.84],[.28,.56],[.7,.42],[.3,.23],[.52,.085]],[[.52,.8],[.28,.57],[.74,.47],[.31,.31],[.51,.13]]],landscape:[[[.1,.48],[.3,.33],[.5,.52],[.7,.39],[.9,.5]],[[.15,.45],[.34,.59],[.5,.37],[.7,.59],[.9,.48]]]},
 river:{portrait:[[[.52,.84],[.28,.6],[.7,.42],[.28,.25],[.52,.085]],[[.51,.85],[.28,.63],[.73,.44],[.3,.26],[.51,.11]]],landscape:[[[.1,.44],[.3,.29],[.5,.52],[.72,.41],[.9,.5]],[[.1,.38],[.26,.49],[.46,.3],[.68,.6],[.89,.47]]]},
 home:{portrait:[[[.52,.845],[.28,.55],[.7,.42],[.28,.22],[.52,.075]],[[.58,.8],[.35,.6],[.7,.43],[.29,.26],[.53,.117]]],landscape:[[[.1,.5],[.3,.35],[.5,.53],[.7,.39],[.9,.5]],[[.1,.32],[.34,.53],[.51,.29],[.69,.59],[.89,.45]]]},
} as const;
export function trailArtKind(mode:TrailMode,chapter:number):TrailArtKind|undefined{
 if(mode==='exploration')return chapter===0?'forest':chapter===1?'river':undefined;
 return chapter===0?'home':chapter===5?'forest':undefined;
}
export function trailArtAnchors(mode:TrailMode,chapter:number,segment:number,vertical:boolean):readonly (readonly [number,number])[]{const kind=trailArtKind(mode,chapter);return kind?anchors[kind][vertical?'portrait':'landscape'][segment]:TRAIL_ART_ANCHORS[vertical?'portrait':'landscape'];}
export function trailArtSource(kind:TrailArtKind,vertical:boolean,variant:number){return `/forest-adventure/map-${kind}-${vertical?'portrait':'landscape'}-${variant?'b':'a'}-${kind==='home'?'v2':'clean-v3'}.webp`;}
