import {afterEach, beforeEach, expect, it, vi} from 'vitest';

const flush=async()=>{for(let i=0;i<24;i++)await Promise.resolve();};
class ControlledImage {
 static instances:ControlledImage[]=[];
 onload:(()=>void)|null=null;
 onerror:(()=>void)|null=null;
 naturalWidth=0;
 src='';
 decoding='';
 private decoded!:()=>void;
 private refused!:(reason:Error)=>void;
 private completion=new Promise<void>((resolve,reject)=>{this.decoded=resolve;this.refused=reject;});
 decode=vi.fn(()=>this.completion);
 constructor(){ControlledImage.instances.push(this);}
 load(){this.naturalWidth=810;this.onload?.();}
 ready(){this.decoded();}
 broken(){this.onerror?.();}
 badDecode(){this.refused(Error('invalid pixels'));}
}
beforeEach(()=>{
 vi.resetModules();vi.useFakeTimers();ControlledImage.instances=[];
 vi.stubGlobal('Image',ControlledImage);vi.spyOn(Math,'random').mockReturnValue(.9999);
});
afterEach(()=>{vi.clearAllTimers();vi.useRealTimers();vi.unstubAllGlobals();vi.restoreAllMocks();});
async function boot(){
 const module=await import('./loadingScenes');
 module.preloadNextLoadingScene();
 const pair=ControlledImage.instances.slice();
 expect(pair).toHaveLength(2);
 for(const img of pair){img.load();img.ready();}
 await flush();
 expect(ControlledImage.instances).toHaveLength(4);
 return module;
}
it('does not hand off artwork until both actual image decode promises finish',async()=>{
 const m=await boot(),pair=ControlledImage.instances.slice(2);
 for(const img of pair)img.load();
 pair[0].ready();await flush();
 expect(m.loadingSceneFor('room:1').id).toBe('rest');
 expect(ControlledImage.instances).toHaveLength(4);
 pair[1].ready();await flush();
 // A progress update / retry for this destination cannot switch art midway.
 expect(m.loadingSceneFor('room:1').id).toBe('rest');
 expect(m.loadingSceneFor('room:2').id).toBe('thorn-lizard');
 expect(ControlledImage.instances).toHaveLength(6);
});
it('waits for the other orientation after a network error and retries only on another destination',async()=>{
 const m=await boot(),pair=ControlledImage.instances.slice(2);
 pair[0].broken();pair[1].load();
 await flush();
 for(let i=0;i<50;i++)expect(m.loadingSceneFor('room:3').id).toBe('rest');
 expect(ControlledImage.instances).toHaveLength(4);
 pair[1].ready();await flush();
 expect(pair.every(img=>img.onload===null&&img.onerror===null)).toBe(true);
 expect(vi.getTimerCount()).toBe(0);
 expect(m.loadingSceneFor('room:3').id).toBe('rest');
 expect(ControlledImage.instances).toHaveLength(4);
 expect(m.loadingSceneFor('room:4').id).toBe('rest');
 expect(ControlledImage.instances).toHaveLength(6);
});
it('retains the current artwork through a decode rejection and a stalled orientation timeout',async()=>{
 const m=await boot(),pair=ControlledImage.instances.slice(2);
 pair[0].load();pair[0].badDecode();await flush();
 expect(m.loadingSceneFor('room:5').id).toBe('rest');
 await vi.advanceTimersByTimeAsync(11999);
 expect(ControlledImage.instances).toHaveLength(4);
 await vi.advanceTimersByTimeAsync(1);await flush();
 expect(vi.getTimerCount()).toBe(0);
 expect(pair.every(img=>img.onload===null&&img.onerror===null)).toBe(true);
 expect(m.loadingSceneFor('room:5').id).toBe('rest');
 expect(m.loadingSceneFor('room:6').id).toBe('rest');
 expect(ControlledImage.instances).toHaveLength(6);
});
it('serializes 300 biome handoffs without accumulating downloads or selecting an undecoded scene',async()=>{
 const {createPreparedLoadingScenes}=await import('./loadingScenes');
 const decoded=new Set<string>();
 let pending:undefined|{scene:{id:string};resolve:()=>void;reject:()=>void};
 let active=0,peak=0,calls=0;
 const manager=createPreparedLoadingScenes(scene=>{
  expect(pending).toBeUndefined();
  active++;calls++;peak=Math.max(peak,active);
  return new Promise<void>((resolve,reject)=>{
   pending={scene,resolve:()=>{active--;pending=undefined;decoded.add(scene.id);resolve();},
    reject:()=>{active--;pending=undefined;reject(Error('offline'));}};
  });
 },()=>.9999);
 manager.start();pending!.resolve();await flush();
 for(let i=0;i<300;i++){
  // Change biomes while a request is in flight, then alternate error/success.
  const key=i%2?'room:41':'room:1';
  const before=manager.select(key);
  expect(decoded.has(before.id)).toBe(true);
  const snapshot=pending,callsBefore=calls;
  for(let n=0;n<20;n++)expect(manager.select(key)).toBe(before);
  expect(pending).toBe(snapshot);expect(calls).toBe(callsBefore);
  if(pending){if(i%7===0)pending.reject();else pending.resolve();}
  await flush();
  // Completing an obsolete group can schedule only one replacement.
  expect(active).toBeLessThanOrEqual(1);
  expect(manager.select(key)).toBe(before);
 }
 expect(peak).toBe(1);
 expect(calls).toBeLessThanOrEqual(602);
});
