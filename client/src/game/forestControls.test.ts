import { describe, it, expect } from 'vitest';
import { ForestControls } from './forestControls';
import { forestStickDirection } from './combatPresentation';

describe('mixed keyboard and multitouch controls', () => {
  it('releasing one of two fingers does not release the other finger', () => {
    const input = new ForestControls();
    input.pointerDown(1, 'right'); input.pointerDown(2, 'right');
    input.pointerUp(1); expect(input.snapshot().right).toBe(true);
    input.pointerUp(2); expect(input.snapshot().right).toBe(false);
  });
  it('cancelling touch does not cancel a held keyboard direction', () => {
    const input = new ForestControls();
    input.keyDown('d', 'right'); input.pointerDown(1, 'right');
    input.pointerUp(1); expect(input.snapshot().right).toBe(true);
    input.keyUp('d'); expect(input.snapshot().right).toBe(false);
  });
  it('keeps aliases independent and clears all controls for pause/blur', () => {
    const input = new ForestControls();
    input.keyDown('d', 'right'); input.keyDown('arrowright', 'right');
    input.keyUp('d'); expect(input.snapshot().right).toBe(true);
    input.pointerDown(7, 'up');
    expect(input.snapshot()).toEqual({ right: true, up: true, left: false, down: false });
    input.clear(); input.pointerUp(7);
    expect(input.snapshot()).toEqual({ right: false, up: false, left: false, down: false });
  });
  it('shares the analog control without allowing two simultaneous grid directions',()=>{
    const input=new ForestControls();const direction=forestStickDirection({x:.7,y:.8});expect(direction).toBe('down');if(direction)input.keyDown('shared-exploration-stick',direction);expect(input.snapshot()).toEqual({up:false,down:true,left:false,right:false});
  });
  it('releasing the shared joystick leaves a physical keyboard key held',()=>{
    const input=new ForestControls();input.keyDown('d','right');input.keyDown('shared-exploration-stick','up');input.keyUp('shared-exploration-stick');expect(input.snapshot()).toEqual({up:false,down:false,left:false,right:true});
  });
  it('treats neutral and invalid stick values as release in chapter navigation',()=>{expect(forestStickDirection({x:0,y:0})).toBeNull();expect(forestStickDirection({x:NaN,y:1})).toBeNull();});
  it('allows deliberate cardinal changes while holding the same touch',()=>{
    const input=new ForestControls();input.keyDown('shared-exploration-stick','up');const direction=forestStickDirection({x:-1,y:.1});if(direction)input.keyDown('shared-exploration-stick',direction);expect(input.snapshot()).toEqual({up:false,down:false,left:true,right:false});
  });

});
