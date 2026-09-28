import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Heart, ShoppingBag, Sparkles, Star, Trophy, X } from "lucide-react";

const STEPS = [
  { icon: <Heart size={24} />, kicker: "PASSO 1 DE 5 · CONHEÇA", title: "Como seu pet está?", copy: "As quatro barras mostram felicidade, fome, higiene e energia. Elas mudam um pouquinho com o tempo; cuide para manter seu amigo bem." },
  { icon: <PawPrintIcon />, kicker: "PASSO 2 DE 5 · CUIDADOS", title: "Carinho faz diferença", copy: "Use Alimentar, Banho, Carinho e Dormir. Cada cuidado custa algumas moedas ou é gratuito; o pet se move e responde ao que você faz." },
  { icon: <GamepadIcon />, kicker: "PASSO 3 DE 5 · BRINCADEIRAS", title: "Escolha um minijogo", copy: "O hub tem 11 jogos jogáveis: memória, reflexo, ritmo, busca e outros. Cada partida dá moedas e XP para avançar." },
  { icon: <Sparkles size={24} />, kicker: "PASSO 4 DE 5 · DESTAQUE", title: "Combine petiscos", copy: "No Colheita de Petiscos, toque em duas peças vizinhas para trocar. Faça linhas de 3 ou mais, cumpra os pedidos antes de acabar os movimentos e aproveite as cascatas." },
  { icon: <ShoppingBag size={24} />, kicker: "PASSO 5 DE 5 · SUA HISTÓRIA", title: "Explore cada nova casa", copy: "A missão do nível rende moedas, a loja troca moedas virtuais por itens e companheiros. A cada nível, um novo cenário e capítulo da história; o primeiro arco tem dez níveis." },
];

function PawPrintIcon() { return <span className="guide-emoji">🐾</span>; }
function GamepadIcon() { return <span className="guide-emoji">🎮</span>; }

type Props = { onComplete: () => void; onClose?: () => void; canClose?: boolean };

export default function TutorialOverlay({ onComplete, onClose, canClose = true }: Props) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const finish = () => { setStep(0); onComplete(); };
  return (
    <div className="guide-backdrop">
      <section className="guide-card" role="dialog" aria-modal="true" aria-labelledby="guide-title">
        {canClose && onClose && <button className="guide-close" onClick={onClose} aria-label="Fechar o guia"><X size={18} /></button>}
        <div className="guide-topline"><span className="guide-book"><BookOpen size={18} /></span><span>PRIMEIROS PASSOS</span><span className="guide-count">{step + 1}<i> / 5</i></span></div>
        <div className="guide-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
        <div className="guide-icon">{current.icon}</div>
        <span className="guide-kicker">{current.kicker}</span>
        <h2 id="guide-title">{current.title}</h2>
        <p>{current.copy}</p>
        {step === 4 && <div className="guide-reward"><Star size={16} fill="currentColor" /> <span>Meta da campanha</span><strong>nível 1 → 10</strong><Trophy size={18} /></div>}
        <div className="guide-dots" aria-label={`Passo ${step + 1} de 5`}>{STEPS.map((item, index) => <span key={item.kicker} className={index === step ? "active" : index < step ? "done" : ""} />)}</div>
        <div className="guide-actions">
          {step > 0 ? <button className="guide-back" onClick={() => setStep((value) => value - 1)}><ArrowLeft size={16} /> Voltar</button> : <span />}
          {step < STEPS.length - 1 ? <button className="guide-next" onClick={() => setStep((value) => value + 1)}>Próximo <ArrowRight size={16} /></button> : <button className="guide-next" onClick={finish}>Vamos jogar <Sparkles size={16} /></button>}
        </div>
      </section>
    </div>
  );
}
