import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, Backpack, BookOpen, Gamepad2, Heart, Home, PawPrint,
  Sparkles, Star, X,
} from "lucide-react";

type TourStep = {
  icon: ReactNode;
  kicker: string;
  title: string;
  copy: string;
  target?: string;
};

const STEPS: TourStep[] = [
  {
    icon: <PawPrint size={24} />,
    kicker: "PASSO 1 DE 6 · A SALA",
    title: "Passeie e conheça seu pet",
    copy: "Toque em um espaço livre para o pet andar. Toque nele para fazer carinho e revelar seu nome. Vamos conhecer os atalhos da sala?",
    target: '[data-room-tour="room"]',
  },
  {
    icon: <Heart size={24} />,
    kicker: "PASSO 2 DE 6 · CUIDADOS",
    title: "Cuide dele com um toque",
    copy: "Veja Felicidade, Fome, Higiene e Energia em Como estou?. Em Cuidar, escolha uma ação. Alimentar abre os petiscos: toque em um item para usar ou arraste até o pet.",
    target: '[data-room-tour="care"]',
  },
  {
    icon: <Star size={24} />,
    kicker: "PASSO 3 DE 6 · MISSÕES",
    title: "Jogue para evoluir",
    copy: "Acompanhe a missão do nível e toque em Minijogos para escolher uma brincadeira. No celular, a barra da missão fica logo acima dos atalhos inferiores.",
    target: '[data-room-tour="minigames"]',
  },
  {
    icon: <Backpack size={24} />,
    kicker: "PASSO 4 DE 6 · ITENS",
    title: "Loja e mochila",
    copy: "A Mochila guarda apenas itens de cuidado que você pode usar. As decorações únicas conquistadas ficam na aba Decoração; toque em um item em destaque para ver as opções da loja.",
    target: '[data-room-tour="inventory"]',
  },
  {
    icon: <Home size={24} />,
    kicker: "PASSO 5 DE 6 · SUA CASA",
    title: "Troque de casa e decore",
    copy: "Use Casas para visitar cenários já liberados. Em Decorar, escolha onde colocar suas peças conquistadas — cada decoração pertence a uma casa.",
    target: '[data-room-tour="room-tools"]',
  },
  {
    icon: <Gamepad2 size={24} />,
    kicker: "PASSO 6 DE 6 · AVENTURA",
    title: "Sua campanha principal",
    copy: "A Aventura é o jogo de plataforma: avance pelas fases, vença desafios e desbloqueie decorações. Na engrenagem ficam o volume, as vozes e este guia para rever quando quiser.",
    target: '[data-room-tour="adventure"]',
  },
];

type Props = { onComplete: () => void; onClose?: () => void; canClose?: boolean };
type Box = { left: number; top: number; width: number; height: number };

export default function TutorialOverlay({ onComplete, onClose, canClose = true }: Props) {
  const [step, setStep] = useState(0);
  const [spotlight, setSpotlight] = useState<Box | null>(null);
  const [cardPosition, setCardPosition] = useState<{ left: number; top: number } | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const current = STEPS[step];
  const finish = () => { setStep(0); onComplete(); };

  useLayoutEffect(() => {
    let frame = 0;
    const update = () => {
      const card = cardRef.current;
      if (!card) return;
      const cardRect = card.getBoundingClientRect();
      const width = window.innerWidth;
      const height = window.innerHeight;
      const target = current.target ? document.querySelector<HTMLElement>(current.target) : null;
      const rect = target?.getBoundingClientRect();
      const desktopTour = width >= 1000 && rect && rect.width > 0 && rect.height > 0;

      if (!desktopTour || !rect) {
        setSpotlight(null);
        setCardPosition({ left: Math.max(14, (width - cardRect.width) / 2), top: Math.max(14, (height - cardRect.height) / 2) });
        return;
      }

      const pad = 9;
      const left = Math.max(8, rect.left - pad);
      const top = Math.max(8, rect.top - pad);
      const right = Math.min(width - 8, rect.right + pad);
      const bottom = Math.min(height - 8, rect.bottom + pad);
      setSpotlight({ left, top, width: right - left, height: bottom - top });

      const gutter = 22;
      const rightCandidate = right + gutter;
      const leftCandidate = left - gutter - cardRect.width;
      const cardLeft = rightCandidate + cardRect.width <= width - 14
        ? rightCandidate
        : leftCandidate >= 14
          ? leftCandidate
          : Math.max(14, (width - cardRect.width) / 2);
      const maxTop = Math.max(14, height - cardRect.height - 14);
      const cardTop = Math.min(maxTop, Math.max(14, (top + bottom - cardRect.height) / 2));
      setCardPosition({ left: cardLeft, top: cardTop });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
    };
  }, [current.target, step]);

  const shades: CSSProperties[] = spotlight ? [
    { left: 0, top: 0, width: "100vw", height: spotlight.top },
    { left: 0, top: spotlight.top + spotlight.height, width: "100vw", height: `calc(100vh - ${spotlight.top + spotlight.height}px)` },
    { left: 0, top: spotlight.top, width: spotlight.left, height: spotlight.height },
    { left: spotlight.left + spotlight.width, top: spotlight.top, width: `calc(100vw - ${spotlight.left + spotlight.width}px)`, height: spotlight.height },
  ] : [{ left: 0, top: 0, width: "100vw", height: "100vh" }];

  return (
    <div className="guide-backdrop" onKeyDown={(event) => {
      if (event.key === "ArrowRight" && step < STEPS.length - 1) setStep((value) => value + 1);
      if (event.key === "ArrowLeft" && step > 0) setStep((value) => value - 1);
      if (event.key === "Escape" && canClose && onClose) onClose();
    }}>
      {shades.map((style, index) => <div key={index} className={`guide-shade ${spotlight ? "" : "guide-shade-full"}`} style={style} aria-hidden="true" />)}
      {spotlight && <div className="guide-focus-frame" style={spotlight} aria-hidden="true" />}
      <section
        ref={cardRef}
        className="guide-card"
        style={cardPosition ? { left: cardPosition.left, top: cardPosition.top } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        aria-describedby="guide-copy"
        onClick={(event) => event.stopPropagation()}
      >
        {canClose && onClose && <button className="guide-close" type="button" onClick={onClose} aria-label="Fechar o guia"><X size={18} /></button>}
        <div className="guide-topline"><span className="guide-book"><BookOpen size={18} /></span><span>GUIA RÁPIDO DA SALA</span><span className="guide-count">{step + 1}<i> / {STEPS.length}</i></span></div>
        <div className="guide-progress" aria-hidden="true"><span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
        <div className="guide-icon">{current.icon}</div>
        <span className="guide-kicker">{current.kicker}</span>
        <h2 id="guide-title" aria-live="polite">{current.title}</h2>
        <p id="guide-copy">{current.copy}</p>
        <div className="guide-dots" aria-label="Ir para um passo do guia">{STEPS.map((item, index) => <button key={item.kicker} type="button" className={index === step ? "active" : index < step ? "done" : ""} aria-label={`Ir para o passo ${index + 1}: ${item.title}`} aria-current={index === step ? "step" : undefined} onClick={() => setStep(index)} />)}</div>
        <div className="guide-actions">
          <div className="guide-actions-start">
            {step > 0 && <button className="guide-back" type="button" onClick={() => setStep((value) => value - 1)}><ArrowLeft size={16} /> Voltar</button>}
            {canClose && onClose && <button className="guide-skip" type="button" onClick={onClose}>Pular</button>}
          </div>
          {step < STEPS.length - 1 ? <button className="guide-next" type="button" onClick={() => setStep((value) => value + 1)}>Próximo <ArrowRight size={16} /></button> : <button className="guide-next" type="button" onClick={finish}>Vamos jogar <Sparkles size={16} /></button>}
        </div>
      </section>
    </div>
  );
}
