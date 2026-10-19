import {it,expect,vi} from 'vitest';
import {ExplorationAudio,CHAPTER_AMBIENCE,DEFAULT_EXPLORATION_AUDIO,AMBIENCE_MASTER_GAIN} from './explorationAudio';
it('uses different biome beds, bounded phrases, master volume, and disposes every looping source',()=>{
 const sources:{stop:ReturnType<typeof vi.fn>;disconnect:ReturnType<typeof vi.fn>}[]=[],filters:{frequency:{value:number}}[]=[],gains:any[]=[],oscillators:any[]=[];
 const param=()=>({value:0,setTargetAtTime:vi.fn(),setValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn(),linearRampToValueAtTime:vi.fn()});
 const context={state:'running',sampleRate:8000,currentTime:0,destination:{},createGain:()=>{const g={gain:param(),connect:vi.fn(),disconnect:vi.fn()};gains.push(g);return g;},createBuffer:(_n:number,length:number)=>({getChannelData:()=>new Float32Array(length)}),createBufferSource:()=>{const s={connect:vi.fn(),start:vi.fn(),stop:vi.fn(),disconnect:vi.fn()};sources.push(s);return s;},createBiquadFilter:()=>{const f={frequency:param(),Q:param(),connect:vi.fn(),disconnect:vi.fn()};filters.push(f);return f;},createOscillator:()=>{const o={frequency:param(),connect:vi.fn(),start:vi.fn(),stop:vi.fn(),disconnect:vi.fn()};oscillators.push(o);return o;},close:vi.fn(()=>Promise.resolve())};
 vi.stubGlobal('window',{AudioContext:class{constructor(){return context;}}});
 try{
  const audio=new ExplorationAudio();audio.configure(DEFAULT_EXPLORATION_AUDIO,true,1);audio.unlock();expect(gains[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(DEFAULT_EXPLORATION_AUDIO.ambience*AMBIENCE_MASTER_GAIN,0,.08);expect(DEFAULT_EXPLORATION_AUDIO.ambience).toBeGreaterThan(.18);
  audio.tick();expect(oscillators).toHaveLength(1);context.currentTime=1;audio.tick();expect(oscillators).toHaveLength(2);audio.tick();expect(oscillators).toHaveLength(2);
  audio.configure(DEFAULT_EXPLORATION_AUDIO,true,2);audio.configure(DEFAULT_EXPLORATION_AUDIO,true,3);expect(filters.map(f=>f.frequency.value)).toEqual(CHAPTER_AMBIENCE.map(p=>p.filter));expect(sources.slice(0,2).every(s=>s.stop.mock.calls.length===1&&s.disconnect.mock.calls.length===1)).toBe(true);
  audio.configure(DEFAULT_EXPLORATION_AUDIO,false,3);audio.tick();expect(gains[0].gain.setTargetAtTime).toHaveBeenLastCalledWith(0,1,.08);
  audio.dispose();expect(sources.every(s=>s.stop.mock.calls.length===1&&s.disconnect.mock.calls.length===1)).toBe(true);expect(context.close).toHaveBeenCalledOnce();
 }finally{vi.unstubAllGlobals();}
});
