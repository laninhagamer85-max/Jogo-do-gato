import { useState } from "react";
import type { User } from "firebase/auth";
import { Calendar, KeyRound, LogOut, Mail, ShieldCheck, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { firebaseAuth } from "@/lib/firebase";
import { authErrorCode, guardianAuthErrorMessage } from "@/lib/authErrors";
import { deletePlayerAccount, requestPlayerPasswordReset } from "@/lib/playerAccountActions";
import "./PublishedParity.css";

function dateLabel(value?: string) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date.toLocaleDateString("pt-BR") : "Não informado";
}

export default function PlayerAccountDialog({ user, saveKey, onClose, onSignOut }: {
  user: User; saveKey: string; onClose: () => void; onSignOut: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const passwordAccount = user.providerData.some(provider => provider.providerId === "password");
  const providers = [...new Set(user.providerData.map(provider => provider.providerId === "password" ? "E-mail e senha" : provider.providerId === "google.com" ? "Google" : provider.providerId))].join(" · ");
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true); setNotice(""); setError("");
    try { await action(); }
    catch (cause) {
      const code = authErrorCode(cause);
      setError(code === "auth/requires-recent-login" ? "Por segurança, saia e entre novamente na conta antes de excluí-la." : code ? guardianAuthErrorMessage(cause) : cause instanceof Error ? cause.message : "Não foi possível concluir. Tente novamente.");
    } finally { setBusy(false); }
  }
  return <Dialog open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent className="account-card" showCloseButton={false} onEscapeKeyDown={event => { if (busy) event.preventDefault(); }} onInteractOutside={event => { if (busy) event.preventDefault(); }}>
      <button type="button" className="modal-close" aria-label="Fechar minha conta" disabled={busy} onClick={onClose}><X size={18} /></button>
      <span className="modal-kicker">MEU PET VIRTUAL</span>
      <DialogTitle>Minha conta</DialogTitle>
      <DialogDescription className="account-description">Seus dados de acesso e opções de segurança.</DialogDescription>
      <dl className="account-details">
        <div><dt><Mail size={17} /> E-mail cadastrado</dt><dd>{user.email ?? "Não informado"}</dd></div>
        <div><dt><ShieldCheck size={17} /> Acesso</dt><dd>{providers || "Conta do jogo"} · {user.emailVerified ? "E-mail confirmado" : "Confirmação pendente"}</dd></div>
        <div><dt><Calendar size={17} /> Conta criada</dt><dd>{dateLabel(user.metadata.creationTime)}</dd></div>
        <div><dt>Último acesso</dt><dd>{dateLabel(user.metadata.lastSignInTime)}</dd></div>
      </dl>
      <p className="account-storage-note">O progresso fica salvo neste navegador, separado por conta. Ele não acompanha a troca de aparelho nem a limpeza dos dados do navegador.</p>
      {error && <p className="account-error" role="alert">{error}</p>}
      {notice && <p className="account-notice" role="status">{notice}</p>}
      {passwordAccount ? <button type="button" className="setting-row" disabled={busy} onClick={() => void run(async () => {
        if (!firebaseAuth) throw new Error("Acesso indisponível. Tente novamente.");
        await requestPlayerPasswordReset(user, firebaseAuth);
        setNotice("Enviamos um link para alterar sua senha. Confira seu e-mail e a pasta de spam.");
      })}><KeyRound size={19}/><span><strong>Alterar senha</strong><small>Receber um link seguro no e-mail cadastrado</small></span></button> : <p className="account-storage-note">A senha da conta Google é gerenciada pelo Google.</p>}
      <button type="button" className="setting-row" disabled={busy} onClick={() => void run(onSignOut)}><LogOut size={19}/><span><strong>Sair da conta</strong><small>Preservar o progresso neste navegador</small></span></button>
      {confirming ? <form className="account-delete-confirm" onSubmit={event => { event.preventDefault(); void run(() => deletePlayerAccount(user, confirmation, saveKey, localStorage)); }}>
        <h3>Excluir a conta definitivamente?</h3>
        <p>Seu acesso ao jogo e o progresso desta conta neste navegador serão apagados. Esta ação não pode ser desfeita. Dados locais em outros aparelhos precisam ser removidos nesses aparelhos.</p>
        <label htmlFor="delete-account-confirmation">Digite EXCLUIR para confirmar</label>
        <input id="delete-account-confirmation" autoComplete="off" maxLength={7} value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={busy}/>
        <div className="account-confirm-actions"><button type="button" disabled={busy} onClick={() => { setConfirming(false); setConfirmation(""); }}>Cancelar</button><button type="submit" className="account-delete" disabled={busy || confirmation.trim() !== "EXCLUIR"}>{busy ? "Aguarde…" : "Excluir definitivamente"}</button></div>
      </form> : <button type="button" className="account-delete" disabled={busy} onClick={() => setConfirming(true)}><Trash2 size={17}/> Excluir minha conta</button>}
    </DialogContent>
  </Dialog>;
}
