import { useId } from "react";
import { Music2, Volume2 } from "lucide-react";

type Props = {
  musicVolume: number;
  effectsVolume: number;
  onMusicChange: (value: number) => void;
  onEffectsChange: (value: number) => void;
};

function VolumeSlider({ label, icon, value, onChange, inputId }: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
  inputId: string;
}) {
  const percent = Math.round(value * 100);
  return <label className="audio-volume-row" htmlFor={inputId}>
    <span className="audio-volume-icon" aria-hidden="true">{icon}</span>
    <span className="audio-volume-content">
      <span className="audio-volume-heading"><strong>{label}</strong><output htmlFor={inputId}>{percent}%</output></span>
      <input id={inputId} type="range" min="0" max="100" step="1" value={percent} onChange={(event) => onChange(Number(event.currentTarget.value) / 100)} />
    </span>
  </label>;
}

export default function AudioVolumeControls({ musicVolume, effectsVolume, onMusicChange, onEffectsChange }: Props) {
  const id = useId();
  return <div className="audio-volume-controls" role="group" aria-label="Volumes de áudio">
    <VolumeSlider inputId={`${id}-music`} label="Música de fundo" icon={<Music2 size={18} />} value={musicVolume} onChange={onMusicChange} />
    <VolumeSlider inputId={`${id}-effects`} label="Efeitos sonoros" icon={<Volume2 size={18} />} value={effectsVolume} onChange={onEffectsChange} />
    <p className="audio-volume-note">Os volumes são independentes e ficam salvos neste aparelho.</p>
  </div>;
}
