import type { DecorationId, PetCharacterId } from "./PetGame";
import kitten from "../assets/meu-pet-gatinho.webp?url";
import level01 from "../assets/nivel-01-lar.webp?url";
import level02 from "../assets/nivel-02-jardim.webp?url";
import level03 from "../assets/nivel-03-feira.webp?url";
import level04 from "../assets/nivel-04-telhado.webp?url";
import level05 from "../assets/nivel-05-praia.webp?url";
import level06 from "../assets/nivel-06-bosque.webp?url";
import level07 from "../assets/nivel-07-neve.webp?url";
import level08 from "../assets/nivel-08-biblioteca.webp?url";
import level09 from "../assets/nivel-09-observatorio.webp?url";
import level10 from "../assets/nivel-10-festival.webp?url";
import boyCap from "../assets/acessorio-bone.webp?url";
import girlBow from "../assets/acessorio-laco.webp?url";
import boySilver from "../assets/boy-prata.webp?url";
import boyOrange from "../assets/boy-laranja.webp?url";
import boyBlack from "../assets/boy-preto.webp?url";
import girlCream from "../assets/girl-creme.webp?url";
import girlCalico from "../assets/girl-calico.webp?url";
import girlBlue from "../assets/girl-azul.webp?url";
import mimi from "../assets/companheira-mimi.webp?url";
import tico from "../assets/companheiro-tico.webp?url";
import tower from "../assets/decor-tower.webp?url";
import bed from "../assets/decor-bed.webp?url";
import plant from "../assets/decor-plant.webp?url";
import lamp from "../assets/decor-lamp.webp?url";
import gift from "../assets/gift-surprise.webp?url";
import appIcon from "../assets/app-icon.webp?url";
import welcomeVoice from "../assets/voz-boas-vindas.mp3?url";
import careVoice from "../assets/voz-cuidado.mp3?url";
import levelVoice from "../assets/voz-nivel.mp3?url";
import levelBoyVoice from "../assets/level-boy.mp3?url";
import levelGirlVoice from "../assets/level-girl.mp3?url";
import mimiVoice from "../assets/voice-mimi.mp3?url";
import ticoVoice from "../assets/voice-tico.mp3?url";
import matchSound from "../assets/match-combo.mp3?url";

export const GAME_ASSETS = {
  room: level01,
  kitten,
  levels: [level01, level02, level03, level04, level05, level06, level07, level08, level09, level10],
  accessories: { boy: boyCap, girl: girlBow },
  characters: {
    "menino-prata": boySilver,
    "menino-laranja": boyOrange,
    "menino-preto": boyBlack,
    "menina-creme": girlCream,
    "menina-calico": girlCalico,
    "menina-azul": girlBlue,
  } satisfies Record<PetCharacterId, string>,
  companions: { mimi, tico },
  decorations: { tower, bed, plant, lamp } satisfies Record<DecorationId, string>,
  gift,
  icon: appIcon,
  voice: {
    welcome: welcomeVoice,
    care: careVoice,
    level: levelVoice,
    levelBoy: levelBoyVoice,
    levelGirl: levelGirlVoice,
    mimi: mimiVoice,
    tico: ticoVoice,
  },
  sounds: { match: matchSound },
} as const;
