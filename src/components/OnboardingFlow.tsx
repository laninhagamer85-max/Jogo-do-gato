import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, PawPrint, Sparkles, Volume2 } from "lucide-react";
import { defaultCharacter, PET_CHARACTERS, type PetGender, type PetProfile } from "@/game/PetGame";
import { GAME_ASSETS } from "@/game/assets";

type Props = {
  profile: PetProfile | null;
  onComplete: (profile: PetProfile) => void;
  onHearIntro: () => void;
  onHearPet: (gender: PetGender | null) => void;
  onPreviewPet: (gender: PetGender, characterId: PetProfile["characterId"]) => void;
};

export default function OnboardingFlow({ profile, onComplete, onHearIntro, onHearPet, onPreviewPet }: Props) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<PetGender | null>(profile?.gender ?? null);
  const [characterId, setCharacterId] = useState<PetProfile["characterId"] | null>(profile?.characterId ?? null);
  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(String(profile?.age ?? 1));
  const [error, setError] = useState("");
  const choices = useMemo(() => PET_CHARACTERS.filter((item) => item.gender === gender), [gender]);

  function chooseGender(value: PetGender) {
    setGender(value);
    setCharacterId(null);
    setError("");
    onPreviewPet(value, defaultCharacter(value));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const years = Number(age);
    if (!characterId || !gender) { setError("Escolha seu gatinho antes de continuar."); setStep(1); return; }
    if (cleanName.length < 2) { setError("Escolha um nome com pelo menos 2 letras."); return; }
    if (!Number.isFinite(years) || years < 1 || years > 25) { setError("A idade precisa estar entre 1 e 25 anos."); return; }
    onComplete({ name: cleanName.slice(0, 18), age: Math.round(years), gender, characterId });
  }

  const stepNames = ["Escolha", "Personagem", "Perfil"];
  const genderWord = gender === "menina" ? "gatinha" : "gatinho";

  return (
    <div className="intro-backdrop">
      <section className={`intro-card intro-step-${step}`} role="dialog" aria-modal="true" aria-labelledby="intro-title">
        <div className="intro-art">
          <span className="intro-glow" />
          <span className="intro-paw"><PawPrint size={25} fill="currentColor" /></span>
          <span className="intro-orbit orbit-one">✦</span><span className="intro-orbit orbit-two">✧</span>
          <img src={characterId ? GAME_ASSETS.characters[characterId] : GAME_ASSETS.kitten} alt={characterId ? `Personagem ${PET_CHARACTERS.find((item) => item.id === characterId)?.name}` : "Um gatinho aguardando para ser escolhido"} />
          <div className="intro-speech">{step === 0 ? "Miau! Vamos escolher quem vai viver esta aventura?" : step === 1 ? `Encontre o ${genderWord} que combina com você!` : `Quase lá! Como vou me chamar?`} <span>♥</span></div>
        </div>
        <div className="intro-form-wrap">
          <span className="intro-kicker"><Sparkles size={14} /> UMA NOVA HISTÓRIA COMEÇA</span>
          <div className="intro-stepper" aria-label={`Passo ${step + 1} de 3`}>
            {stepNames.map((label, index) => <span className={index === step ? "active" : index < step ? "done" : ""} key={label}><i>{index < step ? <Check size={12} /> : index + 1}</i>{label}</span>)}
          </div>
          {step === 0 && <>
            <h1 id="intro-title">Quem vai ser seu pet?</h1>
            <p className="intro-copy">Primeiro escolha se seu companheiro é menino ou menina. Depois você escolhe entre três gatinhos únicos.</p>
            <button className="intro-hear" type="button" onClick={onHearIntro}><Volume2 size={15} /> Ouvir a apresentação</button>
            <div className="onboarding-gender-grid" role="group" aria-label="Escolha o sexo do pet">
              <button className={`onboarding-gender-card boy ${gender === "menino" ? "selected" : ""}`} type="button" onClick={() => chooseGender("menino")} aria-pressed={gender === "menino"}><span>🧢</span><strong>Menino</strong><small>Com boné e três personagens</small></button>
              <button className={`onboarding-gender-card girl ${gender === "menina" ? "selected" : ""}`} type="button" onClick={() => chooseGender("menina")} aria-pressed={gender === "menina"}><span>🎀</span><strong>Menina</strong><small>Com lacinho e três personagens</small></button>
            </div>
          </>}
          {step === 1 && <>
            <h1 id="intro-title">Escolha seu personagem</h1>
            <p className="intro-copy">Cada gatinho tem uma carinha própria. O acessório combina com a escolha de {gender === "menina" ? "menina" : "menino"}.</p>
            <div className="character-picker" role="group" aria-label="Escolha um personagem">
              {choices.map((character) => <button key={character.id} type="button" className={`character-choice ${characterId === character.id ? "selected" : ""}`} aria-pressed={characterId === character.id} onClick={() => { setCharacterId(character.id); setError(""); if (gender) { onPreviewPet(gender, character.id); onHearPet(gender); } }}><span className="character-art"><img src={GAME_ASSETS.characters[character.id]} alt="" /></span><strong>{character.name}</strong><small>{character.description}</small><i>{characterId === character.id ? <Check size={13} /> : <PawPrint size={13} />}</i></button>)}
            </div>
          </>}
          {step === 2 && <>
            <h1 id="intro-title">Vamos nos conhecer?</h1>
            <p className="intro-copy">Conte um pouquinho sobre o seu {genderWord}. O perfil fica salvo só neste navegador.</p>
            <button className="intro-hear" type="button" onClick={() => onHearPet(gender)}><Volume2 size={15} /> Ouvir uma saudação</button>
            <form className="intro-form" onSubmit={submit}>
              <label className="intro-label" htmlFor="pet-name">Como vou me chamar?</label>
              <input id="pet-name" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} maxLength={18} autoComplete="off" placeholder="Ex.: Pudim" autoFocus />
              <div className="intro-age-field full-width-age">
                <label className="intro-label" htmlFor="pet-age">Qual é a minha idade?</label>
                <div className="intro-age-input"><input id="pet-age" type="number" min={1} max={25} value={age} onChange={(event) => { setAge(event.target.value); setError(""); }} /><span>anos</span></div>
              </div>
              {error && <p className="intro-error" role="alert">{error}</p>}
              <button className="intro-submit" type="submit">Conhecer meu pet <ArrowRight size={17} /></button>
            </form>
          </>}
          {step < 2 && <>
            {error && <p className="intro-error" role="alert">{error}</p>}
            <div className="intro-step-actions">
              {step > 0 && <button className="intro-back-button" type="button" onClick={() => { setStep(step - 1); setError(""); }}><ArrowLeft size={16} /> Voltar</button>}
              <button className="intro-submit" type="button" disabled={step === 0 ? !gender : !characterId} onClick={() => { setStep(step + 1); setError(""); }}>{step === 0 ? "Escolher meu gatinho" : "Continuar"} <ArrowRight size={17} /></button>
            </div>
          </>}
          <p className="intro-private"><span>🔒</span> Sua aventura fica salva só neste navegador.</p>
        </div>
      </section>
    </div>
  );
}
