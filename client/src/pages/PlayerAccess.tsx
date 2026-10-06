import { useEffect, useState, type FormEvent } from "react";
import { browserLocalPersistence, browserSessionPersistence, createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, reload, sendEmailVerification, sendPasswordResetEmail, setPersistence, signInWithEmailAndPassword, signInWithPopup, signOut, type User } from "firebase/auth";
import { Eye, EyeOff, PawPrint } from "lucide-react";
import { firebaseAuth, firebaseAuthReady } from "@/lib/firebase";
import { guardianAuthErrorMessage } from "@/lib/authErrors";
import Home from "./Home";
import { GAME_ASSETS } from "@/game/assets";

export default function PlayerAccess() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!firebaseAuth) { setLoading(false); return; }
    return onAuthStateChanged(firebaseAuth, (value) => { setUser(value); setLoading(false); });
  }, []);
  async function run(action: () => Promise<unknown>) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); } catch (cause) { setError(guardianAuthErrorMessage(cause)); }
    finally { setBusy(false); }
  }
  async function prepare() {
    if (!firebaseAuth) throw new Error("Firebase indisponível");
    await firebaseAuthReady;
    await setPersistence(firebaseAuth, remember ? browserLocalPersistence : browserSessionPersistence);
    return firebaseAuth;
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      const auth = await prepare();
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email.trim());
        setMessage("Se este e-mail estiver cadastrado, você receberá as instruções de recuperação. Confira também o spam.");
      } else if (mode === "register") {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        setPassword("");
        await sendEmailVerification(result.user);
        setMessage("Cadastro criado. Confirme seu e-mail para começar a jogar.");
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        setPassword("");
      }
    });
  }
  if (loading) return <main className="grid min-h-screen place-items-center" role="status">Preparando seu acesso…</main>;
  if (user?.emailVerified) return <><div className="player-session-bar"><span>Progresso salvo neste navegador</span><button type="button" disabled={busy} onClick={() => void run(() => signOut(firebaseAuth!))}>Sair da conta</button></div><Home key={user.uid} localAccountId={user.uid} /></>;
  const inputClass = "pet-entry-input player-access-input";
  const buttonClass = "pet-entry-submit player-access-submit";
  return <main className="pet-entry-shell player-access"><div className="pet-entry-wrap">
    <header className="pet-entry-topbar"><a href="/" className="pet-entry-brand"><span className="pet-entry-brand-mark"><PawPrint size={25}/></span><span><strong>Meu Pet</strong><small>VIRTUAL</small></span></a><span className="pet-entry-safe">Acesso à aventura</span></header>
    <div className="pet-entry-layout"><aside className="pet-entry-hero"><div className="pet-entry-copy"><span className="pet-entry-kicker">CUIDADO, HISTÓRIA E AVENTURA</span><h1>Seu pet está esperando por você!</h1><p>Entre para cuidar do seu amigo e continuar a aventura no seu próprio ritmo.</p><div className="pet-entry-pills"><span>Cuidar</span><span>Explorar</span><span>Evoluir</span></div></div><div className="pet-entry-scene"><div className="pet-entry-speech">Miau! Que bom que voltou!</div><div className="pet-entry-pedestal"/><img src={GAME_ASSETS.characters["menina-calico"]} alt="Gatinha calico do Meu Pet Virtual" className="pet-entry-mascot"/></div><p className="pet-entry-footnote">Uma aventura para todas as idades.</p></aside><section className="pet-entry-card">
    <PawPrint className="mx-auto mb-3 text-[#334a73]" size={38} aria-hidden="true" />
    <h1 className="text-center text-3xl font-semibold text-[#293b60]">Meu Pet Virtual</h1>
    <p className="mb-6 mt-2 text-center text-sm text-slate-600">Uma aventura para todas as idades.</p>
    {!firebaseAuth && <p role="alert" className="mb-4 text-red-700">O acesso ainda não foi configurado. Tente novamente mais tarde.</p>}
    {error && <p role="alert" className="pet-entry-alert">{error}</p>}
    {message && <p role="status" className="pet-entry-notice">{message}</p>}
    {user ? <div className="space-y-3"><h2 className="text-xl font-semibold">Confirme seu e-mail</h2><p className="text-sm text-slate-600">Abra o link enviado para seu e-mail e depois confira a confirmação abaixo.</p><button className={buttonClass} disabled={busy} onClick={() => void run(async () => { await reload(user); setUser(firebaseAuth!.currentUser); setMessage(firebaseAuth!.currentUser?.emailVerified ? "E-mail confirmado." : "A confirmação ainda não foi encontrada."); })}>Já confirmei meu e-mail</button><button className={inputClass} disabled={busy} onClick={() => void run(async () => { await sendEmailVerification(user); setMessage("E-mail de confirmação enviado."); })}>Reenviar confirmação</button><button className={inputClass} disabled={busy} onClick={() => void run(() => signOut(firebaseAuth!))}>Voltar ao login</button></div> : <>
      <h2 className="player-access-title">{mode === "register" ? "Criar conta" : mode === "reset" ? "Recuperar senha" : "Entrar"}</h2>
      <form onSubmit={submit} className="space-y-4">
        <label className="player-access-label" htmlFor="player-email">E-mail<input id="player-email" className={`${inputClass} mt-1`} type="email" autoComplete="username" maxLength={254} required value={email} onChange={event => setEmail(event.target.value)} /></label>
        {mode !== "reset" && <><label className="player-access-label" htmlFor="player-password">Senha<div className="relative mt-1"><input id="player-password" className={`${inputClass} pr-14`} type={visible ? "text" : "password"} autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={mode === "register" ? 8 : undefined} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} /><button type="button" className="player-password-toggle" aria-label={visible ? "Ocultar senha" : "Mostrar senha"} aria-pressed={visible} onClick={() => setVisible(value => !value)}>{visible ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></label><label className="player-access-remember"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} />Lembrar de mim neste dispositivo</label><p className="text-xs text-slate-500">Seu navegador pode oferecer salvar a senha. O jogo mantém apenas a sessão de acesso.</p></>}
        <button className={buttonClass} disabled={busy || !firebaseAuth}>{busy ? "Aguarde…" : mode === "register" ? "Cadastrar" : mode === "reset" ? "Enviar recuperação" : "Entrar e jogar"}</button>
      </form>
      {mode !== "reset" && <button className="pet-entry-google player-access-google" disabled={busy || !firebaseAuth} onClick={() => void run(async () => { const auth = await prepare(); await signInWithPopup(auth, new GoogleAuthProvider()); })}>Continuar com Google</button>}
      <div className="pet-entry-links"><button onClick={() => { setMode(mode === "register" ? "login" : "register"); setPassword(""); setError(""); setMessage(""); }}>{mode === "register" ? "Já tenho uma conta" : "Criar conta"}</button><button onClick={() => { setMode(mode === "reset" ? "login" : "reset"); setPassword(""); setError(""); setMessage(""); }}>{mode === "reset" ? "Voltar ao login" : "Esqueci minha senha"}</button></div>
    </>}
    <p className="mt-6 text-center text-xs text-slate-500">O progresso fica neste navegador e não acompanha a troca de dispositivo. Menores devem usar o cadastro com acompanhamento de um responsável.</p>
    <p className="mt-3 text-center text-xs text-slate-500">Desenvolvido por Web Agência AD</p>
  </section></div></div></main>;
}
