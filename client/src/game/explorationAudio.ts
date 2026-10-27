/** Exploration-only mixer. NPC cues and ambience never alter Adventure volumes. */
export type ExplorationAudioMix={npcs:number;ambience:number;effects:number};
export const EXPLORATION_AUDIO_KEY='meu-pet-exploration-audio-v1';
export const DEFAULT_EXPLORATION_AUDIO:ExplorationAudioMix={npcs:.55,ambience:.48,effects:.72};
export function normalizeExplorationAudio(raw:unknown):ExplorationAudioMix{
 const value=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 return Object.fromEntries(Object.entries(DEFAULT_EXPLORATION_AUDIO).map(([k,v])=>[k,typeof value[k]==='number'&&Number.isFinite(value[k])?Math.max(0,Math.min(1,value[k] as number)):v])) as ExplorationAudioMix;
}
export function loadExplorationAudio():ExplorationAudioMix{try{return normalizeExplorationAudio(JSON.parse(localStorage.getItem(EXPLORATION_AUDIO_KEY)??'null'));}catch{return {...DEFAULT_EXPLORATION_AUDIO};}}
export function saveExplorationAudio(mix:ExplorationAudioMix){try{localStorage.setItem(EXPLORATION_AUDIO_KEY,JSON.stringify(normalizeExplorationAudio(mix)));}catch{/* Preferences must never block a room. */}}
export const AMBIENCE_MASTER_GAIN=.22;
export const CHAPTER_AMBIENCE=[
 {name:'Clareira dos Troncos',description:'Folhas, brisa leve e cantos de pássaros.',filter:1700,q:.35,gust:.13,notes:[1568,2093,1760],interval:4.6},
 {name:'Riacho dos Cristais',description:'Água corrente, pequenas bolhas e chamados das margens.',filter:2400,q:.55,gust:.21,notes:[740,520,880],interval:3.4},
 {name:'Bosque do Âmbar',description:'Vento nas folhas secas e ressonâncias suaves do bosque.',filter:650,q:.45,gust:.075,notes:[196,246.94,293.66],interval:5.2},
 {name:'Jardim das Nascentes',description:'Água de nascente e brisa entre pedras e folhas.',filter:1900,q:.4,gust:.15,notes:[880,1174.66,987.77],interval:4.2},
] as const;
export const CASTLE_AMBIENCE={name:'Castelo Bônus',description:'Ressonância de pedra, notas medievais graves e suspense suave.',filter:420,q:.7,gust:.055,notes:[146.83,220,174.61],interval:5.8} as const;
export const explorationAmbience=(chapter:number,castle=false)=>castle?CASTLE_AMBIENCE:CHAPTER_AMBIENCE[Math.max(0,Math.min(3,chapter-1))];
export class ExplorationAudio{
 private ctx:AudioContext|null=null;
 private ambient:GainNode|null=null;
 private voices:GainNode|null=null;
 private effects:GainNode|null=null;
 private sources:AudioScheduledSourceNode[]=[];
 private bedNodes:AudioNode[]=[];private echo:DelayNode|null=null;private chapter=1;private castle=false;private nextAmbient=0;private ambientPhrase=0;
 private mix={...DEFAULT_EXPLORATION_AUDIO};private enabled=false;private nextCue=0;
 configure(mix:ExplorationAudioMix,enabled:boolean,chapter=1,castle=false){const nextChapter=Math.max(1,Math.min(4,Math.floor(chapter)||1));if(nextChapter!==this.chapter||castle!==this.castle){this.chapter=nextChapter;this.castle=castle;if(this.ctx)this.startAmbience();}if(enabled===this.enabled&&mix.npcs===this.mix.npcs&&mix.ambience===this.mix.ambience&&mix.effects===this.mix.effects)return;this.mix=normalizeExplorationAudio(mix);this.enabled=enabled;this.apply();}
 private apply(){if(!this.ctx)return;const now=this.ctx.currentTime;this.ambient?.gain.setTargetAtTime(this.enabled?this.mix.ambience*AMBIENCE_MASTER_GAIN:0,now,.08);this.effects?.gain.setTargetAtTime(this.enabled?this.mix.effects:0,now,.05);this.voices?.gain.setTargetAtTime(this.enabled?this.mix.npcs:0,now,.05);}
 unlock(){if(typeof window==='undefined'||!window.AudioContext)return;if(!this.ctx){this.ctx=new window.AudioContext();this.ambient=this.ctx.createGain();this.voices=this.ctx.createGain();this.effects=this.ctx.createGain();this.effects.gain.value=0;this.effects.connect(this.ctx.destination);this.ambient.gain.value=0;this.voices.gain.value=0;this.ambient.connect(this.ctx.destination);this.voices.connect(this.ctx.destination);this.startAmbience();this.apply();}if(this.ctx.state==='suspended')void this.ctx.resume().catch(()=>{});}

 private clearAmbience(){for(const source of this.sources){try{source.stop();}catch{}source.disconnect();}this.sources=[];for(const node of this.bedNodes)node.disconnect();this.bedNodes=[];this.echo=null;}
 private startAmbience(){
  this.clearAmbience();const c=this.ctx;if(!c||!this.ambient)return;const profile=explorationAmbience(this.chapter,this.castle);
  const buffer=c.createBuffer(1,c.sampleRate*4,c.sampleRate),data=buffer.getChannelData(0);let seed=731*this.chapter,brown=0;
  for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/4294967296*2-1;brown=(brown+.025*white)/1.025;data[i]=Math.max(-1,Math.min(1,brown*3.5+white*(this.chapter===2?.22:.1)));}
  // Blend the loop seam so water and wind do not click at the boundary.
  for(let i=0;i<128;i++){const a=i/128;data[i]=data[data.length-128+i]*(1-a)+data[i]*a;}
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),envelope=c.createGain(),gust=c.createOscillator(),depth=c.createGain();
  source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=profile.filter;filter.Q.value=profile.q;envelope.gain.value=.7;gust.type='sine';gust.frequency.value=profile.gust;depth.gain.value=.2;
  source.connect(filter);filter.connect(envelope);envelope.connect(this.ambient);gust.connect(depth);depth.connect(envelope.gain);source.start();gust.start();this.sources=[source,gust];this.bedNodes=[filter,envelope,depth];
  if(this.castle){for(const frequency of [73.416,110]){const drone=c.createOscillator(),gain=c.createGain();drone.type='triangle';drone.frequency.value=frequency;gain.gain.value=.035;drone.connect(gain);gain.connect(this.ambient);drone.start();this.sources.push(drone);this.bedNodes.push(gain);}const delay=c.createDelay(1),feedback=c.createGain(),wet=c.createGain();delay.delayTime.value=.28;feedback.gain.value=.18;wet.gain.value=.22;delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(this.ambient);this.echo=delay;this.bedNodes.push(delay,feedback,wet);}this.nextAmbient=c.currentTime+.4;this.ambientPhrase=0;
 }
 /** Called by the existing play loop; no background timer survives pause or unmount. */
 tick(){
  const c=this.ctx;if(!c||!this.ambient||!this.enabled||this.mix.ambience<=0||c.state!=='running'||c.currentTime<this.nextAmbient)return;
  const profile=explorationAmbience(this.chapter,this.castle),phrase=this.ambientPhrase++,at=c.currentTime;this.nextAmbient=at+profile.interval+(phrase%3)*.37;
  const o=c.createOscillator(),gain=c.createGain(),note=profile.notes[phrase%3],duration=this.castle?3.2:this.chapter===3?1.5:.48;
  o.type=this.castle||this.chapter===3?'triangle':'sine';o.frequency.setValueAtTime(note,at);
  o.frequency.exponentialRampToValueAtTime(note*(this.castle?1:this.chapter===1?1.3:this.chapter===2?.55:1.06),at+duration*.4);o.frequency.exponentialRampToValueAtTime(note*(this.castle?1:this.chapter===1?.94:this.chapter===2?.8:1),at+duration);
  gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(this.castle?.12:this.chapter===3?.16:.24,at+.04);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(gain);gain.connect(this.ambient);if(this.echo)gain.connect(this.echo);o.start(at);o.stop(at+duration+.03);o.onended=()=>{o.disconnect();gain.disconnect();};
 }
 cue(boss=false){const c=this.ctx;if(!c||!this.voices||!this.enabled||this.mix.npcs<=0||c.state!=='running'||c.currentTime<this.nextCue)return;this.nextCue=c.currentTime+1.1;const o=c.createOscillator(),gain=c.createGain(),at=c.currentTime;o.type='triangle';o.frequency.setValueAtTime(boss?170:340,at);o.frequency.exponentialRampToValueAtTime(boss?75:190,at+.18);gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(.045,at+.025);gain.gain.exponentialRampToValueAtTime(.0001,at+.22);o.connect(gain);gain.connect(this.voices);o.start(at);o.stop(at+.24);o.onended=()=>{o.disconnect();gain.disconnect();};}
 action(kind:'paw'|'power'|'hurt'|'pickup'){const c=this.ctx;if(!c||!this.effects||!this.enabled||c.state!=='running'||this.mix.effects<=0)return;const o=c.createOscillator(),gain=c.createGain(),at=c.currentTime;const notes={paw:[700,160,.12],power:[190,570,.22],hurt:[320,115,.24],pickup:[660,880,.12]} as const;const [from,to,duration]=notes[kind];o.type='triangle';o.frequency.setValueAtTime(from,at);o.frequency.exponentialRampToValueAtTime(to,at+duration);gain.gain.setValueAtTime(.0001,at);gain.gain.linearRampToValueAtTime(.045,at+.012);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);o.connect(gain);gain.connect(this.effects);o.start(at);o.stop(at+duration+.02);o.onended=()=>{o.disconnect();gain.disconnect();};}
 dispose(){this.enabled=false;this.clearAmbience();if(this.ctx)void this.ctx.close().catch(()=>{});this.ctx=null;this.ambient=null;this.voices=null;this.effects=null;}
}
