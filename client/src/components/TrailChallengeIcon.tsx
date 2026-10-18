import {Leaf,Swords,Puzzle,KeyRound,Route,Heart,Crown,Footprints,Coins,DoorOpen} from 'lucide-react';
import type {TrailChallenge} from '@/game/trailStageInfo';
export default function TrailChallengeIcon({kind,size=13}:{kind:TrailChallenge;size?:number}){const Icon={collect:Leaf,combat:Swords,puzzle:Puzzle,key:KeyRound,bridge:Route,heal:Heart,master:Crown,route:Footprints,jump:Footprints,coins:Coins,portal:DoorOpen}[kind];return <Icon size={size} aria-hidden="true"/>;}
