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
import mimi from "../assets/companheira-mimi.webp?url";
import tico from "../assets/companheiro-tico.webp?url";
import welcomeVoice from "../assets/voz-boas-vindas.mp3?url";
import careVoice from "../assets/voz-cuidado.mp3?url";
import levelVoice from "../assets/voz-nivel.mp3?url";

export const GAME_ASSETS = {
  room: level01,
  kitten,
  levels: [level01, level02, level03, level04, level05, level06, level07, level08, level09, level10],
  accessories: { boy: boyCap, girl: girlBow },
  companions: { mimi, tico },
  voice: { welcome: welcomeVoice, care: careVoice, level: levelVoice },
} as const;
