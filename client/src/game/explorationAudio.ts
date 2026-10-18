/** Exploration-only mixer. NPC cues and ambience never alter Adventure volumes. */
export type ExplorationAudioMix={npcs:number;ambience:number;effects:number};
export const EXPLORATION_AUDIO_KEY='meu-pet-exploration-audio-v1';
export const DEFAULT_EXPLORATION_AUDIO:ExplorationAudioMix={npcs:.55,ambience:.18,effects:.72};
export function normalizeExplorationAudio(raw:unknown):ExplorationAudioMix{
 const value=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 return Object.fromEntries(Object.entries(DEFAULT_EXPLORATION_AUDIO).map(([k,v])=>[k,typeof value[k]==='number'&&Number.isFinite(value[k])?Math.max(0,Math.min(1,value[k] as number)):v])) as ExplorationAudioMix;
}
export function loadExplorationAudio():ExplorationAudioMix{try{return normalizeExplorationAudio(JSON.parse(localStorage.getItem(EXPLORATION_AUDIO_KEY)??'null'));}catch{return {...DEFAULT_EXPLORATION_AUDIO};}}
export function saveExplorationAudio(mix:ExplorationAudioMix){try{localStorage.setItem(EXPLORATION_AUDIO_KEY,JSON.stringify(normalizeExplorationAudio(mix)));}catch{/* Preferences must never block a room. */}}
export class ExplorationAudio{
 private ctx:AudioContext|null=null;
 private ambient:GainNode|null=null;
 private voices:GainNode|null=null;
 private effects:GainNode|null=null;
 private sources:OscillatorNode[]=[];
 private mix={...DEFAULT_EXPLORATION_AUDIO};private enabled=false;private nextCue=0;
 configure(mix:ExplorationAudioMix,enabled:boolean){this.mix=normalizeExplorationAudio(mix);this.enabled=enabled;this.apply();}
 private apply(){if(!this.ctx)return;const now=this.ctx.currentTime;this.ambient?.gain.setTargetAtTime(this.enabled?this.mix.ambience*.018:0,now,.08);this.effects?.gain.setTargetAtTime(this.enabled?this.mix.effects:0,now,.05);this.voices?.gain.setTargetAtTime(this.enabled?this.mix.npcs:0,now,.05);}
 unlock(){if(typeof window==='undefined'||!window.AudioContext)return;if(!this.ctx){this.ctx=new window.AudioContext();this.ambient=this.ctx.createGain();this.voices=this.ctx.createGain();this.effects=this.ctx.createGain();this.effects.gain.value=0;this.effects.connect(this.ctx.destination);this.ambient.gain.value=0;this.voices.gain.value=0;this.ambient.connect(this.ctx.destination);this.voices.connect(this.ctx.destination);for(const f of [146.83,220]){const o=this.ctx.createOscillator();o.type='sine';o.frequency.value=f;o.connect(this.ambient);o.start();this.sources.push(o);}this.apply();}if(this.ctx.state==='suspended')void this.ctx.resume().catch(()=>{});}
 cue(boss=false){const c=this.ctx;if(!c||!this.voices||!this.enabled||this.mix.npcs<=0||c.state!=='running'||c.currentTime<this.nextCue)return;this.nextCue=c.currentTime+1.1;const o=c.createOscillator(),gain=c.createGain(),at=c.currentTime;o.type='triangle';o.frequency.setValueAtTime(boss?170:340,at);o.frequency.exponentialRampToValueAtTime(boss?75:190,at+.18);gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(.045,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+.22);o.connect(gain);gain.connect(this.voices);o.start(at);o.stop(at+.24);o.onended=()=>{o.disconnect();gain.disconnect();};}
 action(kind:'paw'|'power'|'hurt'|'pickup'){const c=this.ctx;if(!c||!this.effects||!this.enabled||c.state!=='running'||this.mix.effects<=0)return;const o=c.createOscillator(),gain=c.createGain(),at=c.currentTime;const notes={paw:[700,160,.12],power:[190,570,.22],hurt:[320,115,.24],pickup:[660,880,.12]} as const;const [from,to,duration]=notes[kind];o.type='triangle';o.frequency.setValueAtTime(from,at);o.frequency.exponentialRampToValueAtTime(to,at+duration);gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(.045,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(gain);gain.connect(this.effects);o.start(at);o.stop(at+duration+.02);o.onended=()=>{o.disconnect();gain.disconnect();};}
 dispose(){this.enabled=false;for(const o of this.sources){o.stop();o.disconnect();}this.sources=[];if(this.ctx)void this.ctx.close().catch(()=>{});this.ctx=null;this.ambient=null;this.voices=null;this.effects=null;}
}
