import { Info } from "lucide-react";

type Props = { onOpen: () => void };

/** Atalho discreto da homenagem: a foto e o texto ficam somente no modal. */
export default function CreatorPlaquePicker({ onOpen }: Props) {
  return (
    <button
      className="creator-about-button"
      type="button"
      onClick={(event) => { event.stopPropagation(); onOpen(); }}
      aria-label="Sobre a idealizadora do jogo"
      title="Sobre a idealizadora"
    >
      <Info size={16} aria-hidden="true" />
      <span>Sobre</span>
    </button>
  );
}
