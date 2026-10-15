import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { combatStick } from '@/game/combatPresentation';
import { unlockPlatformAudio } from '@/game/platformerAudio';
import './ExplorationJoystick.css';
export default function ExplorationJoystick({disabled=false,onChange}:{disabled?:boolean;onChange:(value:{x:number;y:number})=>void}){
  const pointer=useRef<number|null>(null),callback=useRef(onChange);callback.current=onChange;
  const [position,setPosition]=useState({x:0,y:0});
  const reset=()=>{pointer.current=null;setPosition({x:0,y:0});callback.current({x:0,y:0});};
  useEffect(()=>{if(disabled)reset();},[disabled]);
  useEffect(()=>{const stop=()=>reset();window.addEventListener('blur',stop);return()=>{window.removeEventListener('blur',stop);callback.current({x:0,y:0});};},[]);
  const update=(event:PointerEvent<HTMLButtonElement>)=>{const r=event.currentTarget.getBoundingClientRect();const value=combatStick(event.clientX-r.left-r.width/2,event.clientY-r.top-r.height/2,r.width*.32);setPosition(value);callback.current(value);};
  const release=(event:PointerEvent<HTMLButtonElement>)=>{if(pointer.current!==event.pointerId)return;reset();if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);};
  return <button type="button" className="exploration-joystick" aria-label="Mover o pet: arraste o direcional ou use as setas do teclado" disabled={disabled} onPointerDown={event=>{event.preventDefault();if(disabled||pointer.current!==null)return;unlockPlatformAudio();pointer.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);update(event);}} onPointerMove={event=>{if(pointer.current===event.pointerId)update(event);}} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}><span className="exploration-stick-ring"/><span className="exploration-stick-knob" style={{transform:`translate(${position.x*27}px,${position.y*27}px)`}}/></button>;
}
