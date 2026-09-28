import { useState, type FormEvent } from "react";
import { ArrowRight, PawPrint, Sparkles, Volume2 } from "lucide-react";
import type { PetGender, PetProfile } from "@/game/PetGame";
import { GAME_ASSETS } from "@/game/assets";

type Props = {
  profile: PetProfile | null;
  onComplete: (profile: PetProfile) => void;
  onHearPet: () => void;
};

export default function OnboardingFlow({ profile, onComplete, onHearPet }: Props) {
  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(String(profile?.age ?? 1));
  const [gender, setGender] = useState<PetGender | null>(profile?.gender ?? null);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const years = Number(age);
    if (cleanName.length < 2) { setError("Escolha um nome com pelo menos 2 letras."); return; }
    if (!Number.isFinite(years) || years < 1 || years > 25) { setError("A idade precisa estar entre 1 e 25 anos."); return; }
    if (!gender) { setError("Escolha se seu pet é menino ou menina."); return; }
    onComplete({ name: cleanName.slice(0, 18), age: Math.round(years), gender });
  }

  return (
    <div className="intro-backdrop">
      <section className="intro-card" role="dialog" aria-modal="true" aria-labelledby="intro-title">
        <div className="intro-art">
          <span className="intro-glow" />
          <span className="intro-paw"><PawPrint size={25} fill="currentColor" /></span>
          <span className="intro-orbit orbit-one">✦</span><span className="intro-orbit orbit-two">✧</span>
          <img src={GAME_ASSETS.kitten} alt="Um gatinho curioso aguardando um nome" />
          <div className="intro-speech">Miau! Ainda não tenho nome…<br />você me ajuda? <span>♥</span></div>
        </div>
        <div className="intro-form-wrap">
          <span className="intro-kicker"><Sparkles size={14} /> UMA NOVA HISTÓRIA COMEÇA</span>
          <h1 id="intro-title">Vamos nos conhecer?</h1>
          <p className="intro-copy">Escolha meu nome e conte um pouquinho sobre mim. Depois, a gente vai explorar dez casas cheias de histórias.</p>
          <button className="intro-hear" type="button" onClick={onHearPet}><Volume2 size={15} /> Ouvir o gatinho falar</button>
          <form className="intro-form" onSubmit={submit}>
            <label className="intro-label" htmlFor="pet-name">Como vou me chamar?</label>
            <input id="pet-name" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} maxLength={18} autoComplete="off" placeholder="Ex.: Pudim" autoFocus />
            <div className="intro-field-row">
              <div className="intro-age-field">
                <label className="intro-label" htmlFor="pet-age">Idade</label>
                <div className="intro-age-input"><input id="pet-age" type="number" min={1} max={25} value={age} onChange={(event) => { setAge(event.target.value); setError(""); }} /><span>anos</span></div>
              </div>
              <div className="intro-gender-field">
                <span className="intro-label">Meu pet é</span>
                <div className="gender-choice" role="group" aria-label="Escolha se o pet é menino ou menina">
                  <button type="button" className={gender === "menino" ? "chosen" : ""} onClick={() => setGender("menino")} aria-pressed={gender === "menino"}><span aria-hidden="true">🧢</span> Menino</button>
                  <button type="button" className={gender === "menina" ? "chosen" : ""} onClick={() => setGender("menina")} aria-pressed={gender === "menina"}><span aria-hidden="true">🎀</span> Menina</button>
                </div>
              </div>
            </div>
            {error && <p className="intro-error" role="alert">{error}</p>}
            <button className="intro-submit" type="submit" disabled={!gender}>Conhecer meu pet <ArrowRight size={17} /></button>
          </form>
          <p className="intro-private"><span>🔒</span> O perfil fica salvo só neste navegador.</p>
        </div>
      </section>
    </div>
  );
}
