import { describe,it,expect } from 'vitest';
import { isolateSprite,homeWalkDirection } from './petFrameCleanup';
function pixels(w:number,h:number, points:[number,number][]) {
  const data=new Uint8ClampedArray(w*h*4);
  for(const [x,y] of points) {data[(y*w+x)*4]=180;data[(y*w+x)*4+3]=255;}
  return data;
}
describe('sprite fragment isolation',()=>{
  it('removes a separate neighbour fragment while retaining diagonal-connected tail pixels',()=>{
    const data=pixels(8,6,[[2,2],[3,2],[2,3],[3,3],[4,4],[0,0],[7,0]]);
    expect(isolateSprite(data,8,6)).toEqual({left:2,top:2,width:3,height:3});
    expect(data[3]).toBe(0);expect(data[(4*8+4)*4+3]).toBe(255);
    expect(data[(0*8+7)*4+3]).toBe(0);
  });
  it('handles an empty frame safely',()=>{
    expect(isolateSprite(new Uint8ClampedArray(16),2,2)).toBeNull();
  });
});
describe('home movement direction selection',()=>{
  it('distinguishes up/down, left/right and diagonal facing from displacement',()=>{
    expect(homeWalkDirection(0,1)).toEqual({row:2,mirror:false});
    expect(homeWalkDirection(0,-1)).toEqual({row:1,mirror:false});
    expect(homeWalkDirection(1,0)).toEqual({row:0,mirror:false});
    expect(homeWalkDirection(-1,0)).toEqual({row:0,mirror:true});
    expect(homeWalkDirection(1,-1)).toEqual({row:3,mirror:false});
    expect(homeWalkDirection(-1,-1)).toEqual({row:3,mirror:true});
    expect(homeWalkDirection(1,1)).toEqual({row:2,mirror:false});
    expect(homeWalkDirection(-1,1)).toEqual({row:2,mirror:true});
  });
});
