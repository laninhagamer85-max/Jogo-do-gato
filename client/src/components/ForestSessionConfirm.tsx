import { useEffect, useRef } from 'react';

export type ForestExit = 'map' | 'house' | 'adventure' | 'restart';
export default function ForestSessionConfirm({ action, onCancel, onConfirm }: {
  action: ForestExit | null; onCancel: () => void; onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (action && dialog && !dialog.open) dialog.showModal();
    if (!action && dialog?.open) dialog.close();
  }, [action]);
  return <dialog ref={ref} className="forest-session-confirm" onCancel={(event) => { event.preventDefault(); onCancel(); }} aria-labelledby="forest-confirm-title" aria-describedby="forest-confirm-copy">
    <h2 id="forest-confirm-title">{action === 'restart' ? 'Reiniciar esta sala?' : 'Sair desta partida?'}</h2>
    <p id="forest-confirm-copy">Os capítulos concluídos continuam salvos. O estado atual desta sala será descartado.</p>
    <div className="forest-dialog-actions">
      <button type="button" className="forest-primary" autoFocus onClick={onCancel}>Continuar jogando</button>
      <button type="button" className="forest-secondary" onClick={onConfirm}>{action === 'restart' ? 'Reiniciar sala' : 'Confirmar saída'}</button>
    </div>
  </dialog>;
}
