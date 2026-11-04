// Development-only visual fixture. No Firebase, account access or persistent saves.
// qa-adventure.html is not an input to the production build.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import PlatformAdventure from "../src/components/PlatformAdventure";
import { createInitialGameState, setPetProfile, completePlatformStage } from "../src/game/PetGame";
import "../src/index.css";
import "../src/components/AdventureMobile.css";

function Review() {
  const [state, setState] = useState(() => ({
    ...setPetProfile(createInitialGameState(), { name: "Pudim", age: 2, gender: "menino", characterId: "menino-prata" }),
    tutorialComplete: true,
  }));
  const [soundOn, setSoundOn] = useState(false);
  const [audioMix, setAudioMix] = useState({ music: 0, effects: 0 });
  return <PlatformAdventure state={state} soundOn={soundOn} audioMix={audioMix}
    onAudioMixChange={setAudioMix} onToggleSound={() => setSoundOn(value => !value)}
    onGoToHouse={() => window.alert("Esta revisão local cobre a aventura. Nenhuma conta ou partida real é usada.")}
    onCompleteTutorial={() => setState(value => ({ ...value, tutorialComplete: true }))}
    onCompleteStage={(stage, stars, coins, items) => {
      const completion = completePlatformStage(state, stage, stars, coins, items);
      setState(completion.state);
      return completion;
    }} />;
}

if (import.meta.env.DEV) createRoot(document.getElementById("root")!).render(<Review />);
