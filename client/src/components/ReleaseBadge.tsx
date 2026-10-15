import { GAME_RELEASE } from '@/game/release';
import './ReleaseBadge.css';

export default function ReleaseBadge() {
  return <span className="game-release" aria-label={`Versão do jogo: ${GAME_RELEASE}`}>Versão {GAME_RELEASE}</span>;
}
