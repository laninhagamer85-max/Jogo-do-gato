import { X } from "lucide-react";
import { GAME_ASSETS } from "@/game/assets";

const TRIBUTE = <>Este jogo foi idealizado e criado com muito carinho e criatividade pela jovem desenvolvedora <strong>Allana Gabriela</strong>, de apenas <strong>11 Anos</strong>, no ano de <strong>2026</strong>. Ela provou que não há limite de idade para transformar imaginação em arte e código!</>;

export default function CreatorTributeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop creator-info-backdrop" onClick={onClose}>
      <section
        className="modal-card creator-info-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="creator-info-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar homenagem">
          <X size={18} />
        </button>
        <div className="creator-info-layout">
          <figure className="creator-info-frame">
            <div className="creator-info-photo-mat">
              <img src={GAME_ASSETS.creatorPlaque} alt="Retrato de Allana Gabriela, idealizadora do jogo" />
            </div>
            <figcaption>Allana Gabriela <span>IDEALIZADORA · 2026</span></figcaption>
          </figure>
          <div className="creator-info-copy">
            <span className="modal-kicker">UMA IDEIA QUE VIROU JOGO</span>
            <h2 id="creator-info-title">Allana Gabriela</h2>
            <p>{TRIBUTE}</p>
            <button className="primary-action" type="button" onClick={onClose}>Voltar ao jogo</button>
          </div>
        </div>
      </section>
    </div>
  );
}
