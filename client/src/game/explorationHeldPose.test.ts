import {it,expect} from 'vitest';
import {heldPose,heldAnchors,meleeSwing} from './explorationHeldPose';
import {EQUIPMENT_KINDS} from './explorationEquipmentTiers';
for(const kind of EQUIPMENT_KINDS)for(const variant of ['base','tier','royal','signature'] as const){if(variant==='royal'&&(kind==='dagger'||kind==='bow'))continue;if(variant==='signature'&&kind==='dagger')continue;it(`${variant} ${kind}: hand anchor and outward blade in eight directions throughout swing`,()=>{for(let n=0;n<8;n++)for(const swing of [-.85,-.7,0,.22,.7]){const angle=n*Math.PI/4,facing={x:Math.cos(angle),y:Math.sin(angle)},w=89,h=100,p=heldPose(kind,variant,w,h,facing,swing),a=heldAnchors(kind,variant);expect(p.x+a.grip.x*w).toBeCloseTo(0);expect(p.y+a.grip.y*h).toBeCloseTo(0);const dx=(a.aim.x-a.grip.x)*w,dy=(a.aim.y-a.grip.y)*h,x=dx*Math.cos(p.rotation)-dy*Math.sin(p.rotation),y=dx*Math.sin(p.rotation)+dy*Math.cos(p.rotation);expect(x*facing.x+y*facing.y).toBeGreaterThan(0);}});}
// Landmarks are read from the paintings, independently of the aim metadata:
// the curved limb must lead and the string must trail during every walk phase.
for(const [variant,front,string] of [
 ['signature',{x:.08,y:.51},{x:.94,y:.51}],
 ['tier',{x:.23,y:.77},{x:.75,y:.34}],
 ['base',{x:.94,y:.51},{x:.08,y:.51}],
] as const)it(`${variant} bow keeps the painted limb ahead of its string while walking`,()=>{
 for(const [w,h] of [[40,180],[150,160],[89,100]])for(let direction=0;direction<8;direction++)for(let frame=0;frame<4;frame++){
  const a=direction*Math.PI/4,facing={x:Math.cos(a),y:Math.sin(a)},sway=Math.sin(frame*Math.PI/2)*.065,p=heldPose('bow',variant,w,h,facing,sway);
  const dx=(front.x-string.x)*w,dy=(front.y-string.y)*h;
  expect((dx*Math.cos(p.rotation)-dy*Math.sin(p.rotation))*facing.x+(dx*Math.sin(p.rotation)+dy*Math.cos(p.rotation))*facing.y).toBeGreaterThan(0);
 }
});
it('Ayla keeps the actual sword point outward and its pommel behind the hand in walk and attack',()=>{
 for(let direction=0;direction<8;direction++)for(const swing of [-.7,-.065,0,.065,.7]){
  const angle=direction*Math.PI/4,facing={x:Math.cos(angle),y:Math.sin(angle)},w=45,h=160,p=heldPose('sword','signature',w,h,facing,swing);
  const point={x:(.5*w+p.x),y:(.03*h+p.y)},pommel={x:(.5*w+p.x),y:(.98*h+p.y)};
  const projection=(v:{x:number;y:number})=>(v.x*Math.cos(p.rotation)-v.y*Math.sin(p.rotation))*facing.x+(v.x*Math.sin(p.rotation)+v.y*Math.cos(p.rotation))*facing.y;
  expect(projection(point)).toBeGreaterThan(0);expect(projection(pommel)).toBeLessThan(0);
 }
});
it('a full melee swing never turns the blade through the wielder',()=>{for(let t=0;t<320;t++)expect(Math.abs(meleeSwing(t,320))).toBeLessThan(Math.PI/2);});
