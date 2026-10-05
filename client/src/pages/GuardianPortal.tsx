import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getMultiFactorResolver,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  TotpMultiFactorGenerator,
  type MultiFactorResolver,
} from "firebase/auth";
import { ArrowLeft, BadgeCheck, BookOpenText, Check, CircleHelp, Gamepad2, Heart, KeyRound, LockKeyhole, LogOut, PawPrint, Plus, Shield, ShieldCheck, Sparkles, Star, Trash2, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authPost } from "@/lib/authApi";
import { authErrorCode, guardianAuthErrorMessage, isActionableResetError, needsGoogleEmailVerification } from "@/lib/authErrors";
import { firebaseAuth, firebaseAuthReady, firebaseConfigured } from "@/lib/firebase";
import { trpc } from "@/lib/trpc";
import { CURRENT_SAVE_KEY, LEGACY_SAVE_KEYS, migrateGameState, PET_CHARACTERS } from "@/game/PetGame";
import { GAME_ASSETS } from "@/game/assets";
import { POLICY_VERSIONS } from "@shared/policy";
import MfaSetupDialog from "@/components/MfaSetupDialog";
import AdminPanel from "@/components/AdminPanel";

type PortalTab = "profiles" | "security";
type LocalSavePreview = { raw: string; normalized: string; level: number; stage: number; size: number; key: string };
const GENERIC_AUTH_ERROR = "Não foi possível concluir o acesso. Confira os dados, a conexão e a confirmação de e-mail.";

function getLocalSavePreview(): LocalSavePreview | null {
  try {
    const key = [CURRENT_SAVE_KEY, ...LEGACY_SAVE_KEYS].find((candidate) => localStorage.getItem(candidate));
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw || raw.length > 400_000) return null;
    const state = migrateGameState(JSON.parse(raw));
    const normalized = JSON.stringify(state);
    if (normalized.length > 400_000) return null;
    return { raw, normalized, level: state.level, stage: state.platformProgress.unlockedStage, size: normalized.length, key };
  } catch {
    return null;
  }
}

function Avatar({ avatarId, size = "md" }: { avatarId: string; size?: "sm" | "md" | "lg" }) {
  const character = PET_CHARACTERS.find((item) => item.id === avatarId);
  const className = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-10 w-10" : "h-14 w-14";
  return <span className={`grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-rose-100 ${className}`}>
    {character ? <img src={GAME_ASSETS.characters[character.id]} alt="" className="h-full w-full object-contain"/> : <PawPrint className="text-amber-700"/>}
  </span>;
}

export default function GuardianPortal() {
  const me = trpc.auth.me.useQuery(undefined, { staleTime: 5_000 });
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [portalTab, setPortalTab] = useState<PortalTab>("profiles");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adultAttested, setAdultAttested] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedConsent, setAcceptedConsent] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const [profileEditor, setProfileEditor] = useState<{ id: number | null; nickname: string; avatarId: string } | null>(null);
  const [deleteConfirmProfile, setDeleteConfirmProfile] = useState<number | null>(null);
  const [deleteConfirmAccount, setDeleteConfirmAccount] = useState(false);
  const [accountDeleteText, setAccountDeleteText] = useState("");
  const [migrationProfileId, setMigrationProfileId] = useState<number | null>(null);
  const [migrationReplaceConfirmed, setMigrationReplaceConfirmed] = useState(false);
  const [localSave, setLocalSave] = useState<LocalSavePreview | null>(null);

  const profileList = trpc.profiles.list.useQuery(undefined, { enabled: me.data?.status === "active" && !me.data.needsConsent, staleTime: 10_000 });
  const profileSave = trpc.profiles.getSave.useQuery({ profileId: migrationProfileId ?? 0 }, { enabled: migrationProfileId !== null, staleTime: 0 });
  const sessions = trpc.auth.sessions.useQuery(undefined, { enabled: portalTab === "security" && Boolean(me.data && me.data.status === "active") });

  const saveProfile = trpc.profiles.create.useMutation({ onSuccess: async () => { setProfileEditor(null); setNotice("Perfil criado. Somente apelido e avatar foram salvos."); await profileList.refetch(); }, onError: () => setError("Não foi possível criar o perfil. Confira os dados e tente novamente.") });
  const updateProfile = trpc.profiles.update.useMutation({ onSuccess: async () => { setProfileEditor(null); setNotice("Apelido e avatar atualizados."); await profileList.refetch(); }, onError: () => setError("Não foi possível atualizar o perfil.") });
  const requestProfileDelete = trpc.profiles.requestDeletion.useMutation({ onSuccess: async () => { setDeleteConfirmProfile(null); setNotice("Solicitação registrada. O perfil foi bloqueado enquanto aguarda remoção."); await profileList.refetch(); }, onError: () => setError("Não foi possível registrar a solicitação.") });
  const importSave = trpc.profiles.importLocalSave.useMutation({ onSuccess: async () => { setNotice("Save copiado para o perfil. A cópia local foi preservada neste navegador."); setMigrationProfileId(null); setMigrationReplaceConfirmed(false); await Promise.all([profileList.refetch(), profileSave.refetch()]); }, onError: (cause) => setError(cause.message || "Não foi possível importar o save.") });
  const acceptNotices = trpc.auth.acceptCurrentNotices.useMutation({ onSuccess: async () => { setNotice("Avisos e autorização atualizados."); await me.refetch(); await profileList.refetch(); }, onError: () => setError("Não foi possível registrar a autorização.") });
  const withdrawConsent = trpc.auth.withdrawGuardianConsent.useMutation({ onSuccess: async () => { setNotice("O acesso aos perfis foi pausado. Você pode confirmar novamente enquanto a sessão estiver ativa."); await me.refetch(); await profileList.refetch(); }, onError: () => setError("Não foi possível pausar o acesso aos perfis.") });
  const requestAccountDeletion = trpc.auth.requestDeletion.useMutation({ onSuccess: async () => { setNotice("Solicitação registrada. Os perfis ficam bloqueados até a remoção ou cancelamento."); setDeleteConfirmAccount(false); setAccountDeleteText(""); await me.refetch(); }, onError: () => setError("Não foi possível registrar a solicitação.") });
  const cancelAccountDeletion = trpc.auth.cancelDeletion.useMutation({ onSuccess: async () => { setNotice("Solicitação cancelada. A conta está ativa novamente."); await me.refetch(); await profileList.refetch(); }, onError: (cause) => setError(cause.message || "Não foi possível cancelar a solicitação.") });
  const revokeSessions = trpc.auth.revokeOtherSessions.useMutation({ onSuccess: async ({ revoked }) => { setNotice(`${revoked} outra(s) sessão(ões) revogada(s).`); await sessions.refetch(); }, onError: (cause) => setError(cause.message || "Entre novamente para revogar outras sessões.") });

  useEffect(() => { setLocalSave(getLocalSavePreview()); }, []);
  useEffect(() => { setError(""); }, [mode]);

  const localSaveTooLarge = localSave ? localSave.size > 400_000 : false;
  const selectedProfile = useMemo(() => profileList.data?.find((profile) => profile.id === migrationProfileId) ?? null, [profileList.data, migrationProfileId]);
  const destinationHasSave = Boolean(profileSave.data?.stateJson);

  async function finishFirebaseSession(user: { getIdToken: (forceRefresh?: boolean) => Promise<string> }) {
    const idToken = await user.getIdToken(true);
    await authPost("/api/auth/session", { idToken });
    if (firebaseAuth) await signOut(firebaseAuth);
    setMfaResolver(null); setMfaCode(""); setPassword("");
    await utils.auth.me.invalidate();
    setNotice("Acesso iniciado com sessão segura. Agora escolha um perfil para jogar ou crie o primeiro.");
  }

  function catchMfaOrGeneric(cause: unknown) {
    const code = cause instanceof FirebaseError ? cause.code : authErrorCode(cause);
    if (code === "auth/multi-factor-auth-required" && firebaseAuth) {
      try {
        const resolver = getMultiFactorResolver(firebaseAuth, cause as Parameters<typeof getMultiFactorResolver>[1]);
        if (resolver.hints.some((hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID)) {
          setMfaResolver(resolver);
          setNotice("Digite o código atual do aplicativo autenticador.");
          return;
        }
      } catch { /* Show the generic auth error below. */ }
    }
    const message = guardianAuthErrorMessage(cause);
    const safeDiagnosticCode = typeof code === "string"
      && /^(auth\/(operation-not-allowed|unauthorized-domain|popup-blocked|popup-closed-by-user|cancelled-popup-request|network-request-failed|invalid-api-key|app-not-authorized|web-storage-unsupported|invalid-oauth-client-id|invalid-oauth-provider|internal-error)|APP_CHECK_REQUIRED|APP_CHECK_REJECTED|CSRF_INIT_FAILED|CSRF_REJECTED|IDENTITY_NOT_CONFIGURED|SESSION_REJECTED|MFA_REQUIRED)$/.test(code);
    setError(import.meta.env.DEV && safeDiagnosticCode ? `${message} (código técnico: ${code})` : message);
  }

  async function submitEmailAuth(event: FormEvent) {
    event.preventDefault(); setError(""); setNotice("");
    if (!firebaseAuth) { setError("O provedor de identidade ainda não foi configurado neste ambiente."); return; }
    if (mode === "register" && (!adultAttested || !acceptedTerms || !acceptedPrivacy || !acceptedConsent)) {
      setError("Para criar a conta, confirme que é responsável adulto e leia/aceite os três avisos."); return;
    }
    setBusy(true);
    try {
      await firebaseAuthReady;
      if (mode === "register") {
        const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
        await sendEmailVerification(credential.user);
        const idToken = await credential.user.getIdToken(true);
        await authPost("/api/auth/register", {
          idToken,
          guardianAttested: true,
          termsVersion: POLICY_VERSIONS.terms,
          privacyVersion: POLICY_VERSIONS.privacy,
          guardianConsentVersion: POLICY_VERSIONS.guardianConsent,
        });
        await signOut(firebaseAuth);
        setNotice("Conta criada. Confirme o endereço pelo e-mail enviado; só então será possível iniciar uma sessão.");
        setMode("login");
      } else {
        const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
        if (!credential.user.emailVerified) {
          let verificationSent = false;
          try {
            await sendEmailVerification(credential.user);
            verificationSent = true;
          } catch {
            setError("O endereço ainda não foi confirmado e não foi possível reenviar o link. Tente novamente mais tarde.");
          } finally {
            await signOut(firebaseAuth);
          }
          if (verificationSent) setNotice("Enviámos um novo link de verificação. Confirme o endereço e volte a entrar.");
        } else await finishFirebaseSession(credential.user);
      }
    } catch (cause) { catchMfaOrGeneric(cause); }
    finally { setBusy(false); }
  }

  async function loginGoogle() {
    if (!firebaseAuth) { setError("O provedor de identidade ainda não foi configurado neste ambiente."); return; }
    setBusy(true); setError(""); setNotice("");
    try {
      await firebaseAuthReady;
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(firebaseAuth, provider);
      if (needsGoogleEmailVerification(credential.providerId, credential.user.emailVerified)) {
        let verificationSent = false;
        try {
          if (!credential.user.email) throw new Error("Missing email");
          await sendEmailVerification(credential.user);
          verificationSent = true;
        } catch {
          setError("O Google não confirmou este endereço e não foi possível enviar o link de verificação. Tente novamente mais tarde ou confirme o endereço na sua conta Google.");
        } finally {
          await signOut(firebaseAuth);
        }
        if (verificationSent) setNotice("O Firebase ainda não confirmou este endereço. Enviámos um link de verificação para o e-mail da conta; abra-o e depois volte a entrar com Google. Ainda não foi criada uma sessão de jogo.");
        return;
      }
      await finishFirebaseSession(credential.user);
    } catch (cause) { catchMfaOrGeneric(cause); }
    finally { setBusy(false); }
  }

  async function submitTotp(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!mfaResolver || !/^\d{6}$/.test(mfaCode)) { setError("Digite o código atual de seis dígitos."); return; }
    const hint = mfaResolver.hints.find((item) => item.factorId === TotpMultiFactorGenerator.FACTOR_ID);
    if (!hint) { setError(GENERIC_AUTH_ERROR); return; }
    setBusy(true);
    try {
      const credential = await mfaResolver.resolveSignIn(TotpMultiFactorGenerator.assertionForSignIn(hint.uid, mfaCode));
      await finishFirebaseSession(credential.user);
    } catch { setError("O código TOTP não foi aceito. Verifique o horário do aparelho e tente novamente."); }
    finally { setBusy(false); }
  }

  async function sendResetEmail() {
    if (!firebaseAuth || !email.trim()) { setError("Digite seu e-mail. Se houver uma conta, você receberá instruções."); return; }
    setError(""); setNotice("");
    try { await firebaseAuthReady; await sendPasswordResetEmail(firebaseAuth, email.trim()); }
    catch (cause) {
      if (isActionableResetError(cause)) { setError(guardianAuthErrorMessage(cause)); return; }
      // For account-specific outcomes, keep the same response to prevent address enumeration.
    }
    setNotice("Se houver uma conta com esse endereço, as instruções de redefinição foram enviadas.");
  }

  async function logout() {
    setBusy(true);
    try { await authPost("/api/auth/logout"); } catch { /* Cookie is still removed by reload if the endpoint is unavailable. */ }
    if (firebaseAuth) await signOut(firebaseAuth).catch(() => undefined);
    window.location.reload();
  }

  function submitProfileEditor(event: FormEvent) {
    event.preventDefault();
    if (!profileEditor) return;
    const payload = { nickname: profileEditor.nickname.trim(), avatarId: profileEditor.avatarId };
    setError("");
    if (profileEditor.id) updateProfile.mutate({ ...payload, profileId: profileEditor.id });
    else saveProfile.mutate(payload);
  }

  function beginImport(profileId: number) {
    setMigrationProfileId(profileId); setMigrationReplaceConfirmed(false); setError("");
  }

  function confirmImport() {
    if (!localSave || !selectedProfile || localSaveTooLarge || (destinationHasSave && !migrationReplaceConfirmed)) return;
    const revision = profileSave.data?.revision ?? selectedProfile.revision;
    importSave.mutate({ profileId: selectedProfile.id, revision, stateJson: localSave.normalized, replaceExisting: destinationHasSave });
  }

  async function signUpConsent() {
    setError("");
    if (!acceptedTerms || !acceptedPrivacy || !acceptedConsent || !adultAttested) { setError("Confirme que é responsável adulto e aceite os três avisos para prosseguir."); return; }
    acceptNotices.mutate();
  }

  const isAuthenticated = Boolean(me.data);
  const showLogin = !isAuthenticated && !me.isLoading;

  if (!me.data) return <main className="pet-entry-shell">
    <div className="pet-entry-wrap">
      <header className="pet-entry-topbar">
        <a href="/" className="pet-entry-brand" aria-label="Meu Pet Virtual - início"><span className="pet-entry-brand-mark"><PawPrint size={25}/></span><span><strong>Meu Pet</strong><small>VIRTUAL</small></span></a>
        <span className="pet-entry-safe"><ShieldCheck size={15}/> Área segura do responsável</span>
      </header>

      <section className="pet-entry-layout">
        <aside className="pet-entry-hero">
          <span className="pet-entry-orbit pet-entry-orbit-one" aria-hidden="true">✦</span><span className="pet-entry-orbit pet-entry-orbit-two" aria-hidden="true">🐾</span><span className="pet-entry-orbit pet-entry-orbit-three" aria-hidden="true">✧</span>
          <div className="pet-entry-copy">
            <span className="pet-entry-kicker"><Sparkles size={14}/> CUIDADO, HISTÓRIA E AVENTURA</span>
            <h1>Seu pet está esperando por você!</h1>
            <p>Entre para escolher um perfil, voltar à sua casa e continuar a aventura no seu próprio ritmo.</p>
            <div className="pet-entry-pills"><span><Heart size={14}/> Cuidar</span><span><Gamepad2 size={14}/> Explorar</span><span><Star size={14}/> Evoluir</span></div>
          </div>
          <div className="pet-entry-scene" aria-label="Gatinha do Meu Pet Virtual">
            <div className="pet-entry-speech">Miau! Que bom que voltou!</div>
            <div className="pet-entry-pedestal"/>
            <img src={GAME_ASSETS.characters["menina-calico"]} alt="Gatinha calico do jogo Meu Pet Virtual" className="pet-entry-mascot"/>
            <span className="pet-entry-toy" aria-hidden="true">🧶</span><span className="pet-entry-treat" aria-hidden="true">🐟</span>
          </div>
          <p className="pet-entry-footnote"><LockKeyhole size={13}/> Os perfis infantis usam apenas apelido e avatar.</p>
        </aside>

        <section className="pet-entry-card" aria-labelledby="entry-title">
          <div className="pet-entry-card-top"><span className="pet-entry-card-icon"><PawPrint size={19}/></span><span>Vamos começar?</span><span className="pet-entry-card-star" aria-hidden="true">✦</span></div>
          <p className="pet-entry-eyebrow">CONTA DO RESPONSÁVEL</p>
          <h2 id="entry-title">{mode === "login" ? "Entre para jogar" : "Crie sua conta"}</h2>
          <p className="pet-entry-subtitle">{mode === "login" ? "Seus perfis e progressos ficam organizados em um só lugar." : "O cadastro é feito pelo responsável adulto."}</p>

          {me.isError && <p role="alert" className="pet-entry-alert">Não foi possível conferir a sessão agora. Você ainda pode tentar entrar novamente.</p>}
          {!firebaseConfigured ? <div role="status" className="pet-entry-alert">A autenticação ainda não foi ativada neste ambiente. Nenhuma credencial será solicitada até a configuração do provedor.</div> : <>
            {mfaResolver ? <form onSubmit={submitTotp} className="space-y-4">
              <div className="pet-entry-mfa"><KeyRound size={20}/><div><strong>Verificação em duas etapas</strong><p>Digite o código atual de seis dígitos do aplicativo autenticador.</p></div></div>
              <Input aria-label="Código TOTP" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}/>
              {error && <p role="alert" className="pet-entry-alert">{error}</p>}
              <div className="flex gap-2"><Button type="button" variant="outline" onClick={() => { setMfaResolver(null); setMfaCode(""); }}>Voltar</Button><Button disabled={busy || mfaCode.length !== 6} className="pet-entry-submit flex-1">{busy ? "Conferindo…" : "Verificar e entrar"}</Button></div>
            </form> : <>
              <form onSubmit={submitEmailAuth} className="space-y-3">
                <div className="space-y-1.5"><Label htmlFor="guardian-email">E-mail</Label><Input id="guardian-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" className="pet-entry-input"/></div>
                <div className="space-y-1.5"><Label htmlFor="guardian-password">Senha</Label><Input id="guardian-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" className="pet-entry-input"/></div>
                {mode === "register" && <div className="pet-entry-consent">
                  <label><input type="checkbox" checked={adultAttested} onChange={(event) => setAdultAttested(event.target.checked)}/><span>Confirmo que sou adulto e responsável legal.</span></label>
                  <label><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)}/><span>Aceito os <details className="inline"><summary>Termos (rascunho)</summary><span className="block p-2 text-xs leading-5 text-slate-600">Rascunho para revisão; não é parecer jurídico. Versão {POLICY_VERSIONS.terms}.</span></details>.</span></label>
                  <label><input type="checkbox" checked={acceptedPrivacy} onChange={(event) => setAcceptedPrivacy(event.target.checked)}/><span>Li o <details className="inline"><summary>Aviso de privacidade (rascunho)</summary><span className="block p-2 text-xs leading-5 text-slate-600">Coletamos dados do responsável e apelido/avatar/progresso do perfil. Não pedimos dados identificáveis da criança. Versão {POLICY_VERSIONS.privacy}.</span></details>.</span></label>
                  <label><input type="checkbox" checked={acceptedConsent} onChange={(event) => setAcceptedConsent(event.target.checked)}/><span>Autorizo a criação e gestão de perfis de jogo infantis.</span></label>
                </div>}
                {error && <p role="alert" className="pet-entry-alert">{error}</p>}
                {notice && <p role="status" className="pet-entry-notice">{notice}</p>}
                <Button disabled={busy} className="pet-entry-submit w-full">{busy ? "Só um instante…" : mode === "login" ? "Entrar na aventura" : "Criar conta e verificar e-mail"}<ArrowLeft size={16} className="rotate-180"/></Button>
              </form>
              <div className="pet-entry-divider"><span/>ou<span/></div>
              <Button type="button" variant="outline" disabled={busy} className="pet-entry-google w-full" onClick={loginGoogle}><span className="pet-entry-google-mark">G</span>Continuar com Google</Button>
              <div className="pet-entry-links"><button onClick={() => { setMode(mode === "login" ? "register" : "login"); setNotice(""); }}>{mode === "login" ? "Criar conta do responsável" : "Já tenho uma conta"}</button>{mode === "login" && <button onClick={sendResetEmail}>Esqueci a senha</button>}</div>
              <p className="pet-entry-privacy"><LockKeyhole size={14}/> E-mail/senha e Google permanecem identidades separadas; não vinculamos contas automaticamente pelo e-mail.</p>
            </>}
          </>}
        </section>
      </section>
      <footer className="pet-entry-footer">Um mundo de carinho, brincadeiras e descobertas. <span aria-hidden="true">🐾</span></footer>
    </div>
  </main>;

  return <main className="min-h-[100dvh] bg-[#f4f1ea] px-3 py-4 text-slate-800 sm:px-6 sm:py-7">
    <div className="mx-auto max-w-6xl">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <a href="/" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#334a73] shadow-sm ring-1 ring-amber-100 hover:bg-amber-50"><ArrowLeft size={16}/>Área do responsável</a>
        <div className="flex items-center gap-2 text-sm font-bold text-[#334a73]"><span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-rose-500 shadow-sm"><PawPrint size={20}/></span>Meu Pet Virtual · Área dos responsáveis</div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="relative overflow-hidden rounded-[30px] bg-[#2d4168] p-6 text-white shadow-[0_24px_60px_rgba(34,54,89,.18)] sm:p-8">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-rose-300/20 blur-2xl"/><div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-amber-200/20 blur-2xl"/>
          <div className="relative"><span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-amber-100"><ShieldCheck size={14}/>Privacidade por perfil</span><h1 className="mt-5 font-[Baloo_2] text-3xl font-extrabold leading-tight sm:text-4xl">Um espaço seguro para cuidar das contas da família.</h1><p className="mt-3 max-w-lg text-sm leading-6 text-slate-200">O responsável mantém a conta e cria perfis de jogo separados. Cada perfil infantil guarda apenas apelido, avatar e progresso do jogo.</p>
            <div className="mt-6 grid gap-3">
              {[{icon:LockKeyhole,title:"Sessão protegida",text:"Cookie HttpOnly/Secure em produção; tokens Firebase não ficam no armazenamento do navegador."},{icon:Users,title:"Progresso separado",text:"Cada save é lido e gravado no servidor apenas pelo responsável proprietário do perfil."},{icon:KeyRound,title:"MFA TOTP",text:"Autenticador disponível para responsáveis e obrigatório para o painel administrativo."}].map((item) => <div key={item.title} className="flex gap-3 rounded-2xl bg-white/10 p-3"><span className="mt-0.5 text-amber-200"><item.icon size={18}/></span><div><p className="text-sm font-extrabold">{item.title}</p><p className="mt-0.5 text-xs leading-5 text-slate-200">{item.text}</p></div></div>)}
            </div>
            <div className="mt-6 rounded-2xl border border-white/15 bg-[#203252]/70 p-3 text-xs leading-5 text-slate-200"><strong className="text-white">Importante:</strong> use apenas apelido e avatar nos perfis. Não informe nome real da criança, escola, data de nascimento, fotos ou localização.</div>
          </div>
        </aside>

        <section className="min-w-0 rounded-[30px] bg-[#fffdf8] p-4 shadow-[0_24px_60px_rgba(34,54,89,.08)] ring-1 ring-amber-100 sm:p-6">
          {showLogin && <div className="mx-auto max-w-xl">
            <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.18em] text-rose-500">Conta do responsável</p><h2 className="mt-1 font-[Baloo_2] text-3xl font-extrabold text-[#293b60]">{mode === "login" ? "Entrar" : "Criar conta"}</h2><p className="mt-1 text-sm text-slate-600">{mode === "login" ? "Entre para gerenciar os perfis e saves deste grupo familiar." : "Cadastro reservado a um responsável adulto."}</p></div>
            {!firebaseConfigured ? <div role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Autenticação ainda não habilitada.</strong> O provedor Firebase precisa ser configurado no ambiente do projeto antes de aceitar contas. O jogo local continua disponível; os campos de entrada não recebem credenciais enquanto a configuração estiver ausente.</div> : <>
              {mfaResolver ? <form onSubmit={submitTotp} className="space-y-4 rounded-2xl border border-indigo-100 bg-indigo-50 p-4"><div className="flex gap-3"><span className="text-indigo-700"><KeyRound size={22}/></span><div><h3 className="font-bold text-indigo-950">Verificação em duas etapas</h3><p className="mt-1 text-sm text-indigo-900">Digite o código atual de seis dígitos gerado pelo aplicativo autenticador.</p></div></div><Input aria-label="Código TOTP" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={mfaCode} onChange={(event) => setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}/>{error && <p role="alert" className="text-sm text-rose-700">{error}</p>}<div className="flex gap-2"><Button type="button" variant="outline" onClick={() => { setMfaResolver(null); setMfaCode(""); }}>Cancelar</Button><Button disabled={busy || mfaCode.length !== 6} className="flex-1">{busy ? "Verificando…" : "Verificar e entrar"}</Button></div></form> : <>
                <form onSubmit={submitEmailAuth} className="space-y-3">
                  <div className="space-y-1.5"><Label htmlFor="guardian-email">E-mail do responsável</Label><Input id="guardian-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" /></div>
                  <div className="space-y-1.5"><Label htmlFor="guardian-password">Senha</Label><Input id="guardian-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" /></div>
                  {mode === "register" && <div className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={adultAttested} onChange={(event) => setAdultAttested(event.target.checked)} className="mt-1 accent-rose-500"/><span>Confirmo que sou adulto e responsável legal, e que autorizo a criação e gestão de perfis de jogo infantis.</span></label>
                    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 accent-rose-500"/><span>Li e aceito os <details className="inline"><summary className="inline cursor-pointer font-bold text-indigo-800 underline">Termos (rascunho)</summary><span className="block p-2 text-xs leading-5 text-slate-600">Rascunho para revisão: conta destinada ao responsável; o jogo é de entretenimento e não deve receber dados de identificação de crianças; o responsável administra e pode solicitar encerramento. Não é parecer jurídico. Versão {POLICY_VERSIONS.terms}.</span></details>.</span></label>
                    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={acceptedPrivacy} onChange={(event) => setAcceptedPrivacy(event.target.checked)} className="mt-1 accent-rose-500"/><span>Li o <details className="inline"><summary className="inline cursor-pointer font-bold text-indigo-800 underline">Aviso de privacidade (rascunho)</summary><span className="block p-2 text-xs leading-5 text-slate-600">Coletamos o e-mail do adulto para autenticação e apelido/avatar/progresso nos perfis do jogo. Não solicitamos nome real, idade, fotos, escola ou localização da criança. O progresso é guardado por perfil, sob a conta do responsável. Os prazos de retenção e a purga automática ainda precisam ser definidos e implementados antes do uso com contas reais. Aviso preliminar, precisa de revisão jurídica e operacional. Versão {POLICY_VERSIONS.privacy}.</span></details>.</span></label>
                    <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={acceptedConsent} onChange={(event) => setAcceptedConsent(event.target.checked)} className="mt-1 accent-rose-500"/><span>Dou autorização parental para processar apelido, avatar e progresso de jogo do perfil, podendo retirar a autorização.</span></label>
                  </div>}
                  {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
                  {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
                  <Button disabled={busy} className="w-full rounded-xl bg-[#334a73] py-5 text-white hover:bg-[#293b60]">{busy ? "Aguarde…" : mode === "login" ? "Entrar com e-mail" : "Criar conta e enviar verificação"}</Button>
                </form>
                <div className="my-4 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-amber-100"/>ou<span className="h-px flex-1 bg-amber-100"/></div>
                <Button type="button" variant="outline" disabled={busy} className="w-full rounded-xl py-5" onClick={loginGoogle}><span className="mr-2 grid h-5 w-5 place-items-center rounded-full bg-white font-black text-[#4285f4]">G</span>Continuar com Google</Button>
                <div className="mt-3 flex flex-wrap justify-between gap-2 text-sm"><button className="font-semibold text-indigo-800 underline" onClick={() => { setMode(mode === "login" ? "register" : "login"); setNotice(""); }}>{mode === "login" ? "Criar conta do responsável" : "Já tenho uma conta"}</button>{mode === "login" && <button className="text-slate-600 underline" onClick={sendResetEmail}>Esqueci a senha</button>}</div>
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600"><strong>Contas separadas:</strong> e-mail/senha e Google são identidades distintas; este app não tenta vincular contas automaticamente por e-mail. A configuração de múltiplas contas por endereço também precisa ser habilitada no Firebase.</p>
              </>}
            </>}
          </div>}

          {me.isLoading && <div className="grid min-h-56 place-items-center text-sm text-slate-500">Verificando sessão segura…</div>}
          {me.isError && <div role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">Não foi possível verificar sua sessão. Atualize a página; não mostramos nem registramos dados de autenticação no navegador.</div>}

          {me.data && <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.18em] text-rose-500">Conta protegida</p><h2 className="mt-1 font-[Baloo_2] text-3xl font-extrabold text-[#293b60]">Olá, responsável</h2><p className="mt-1 text-sm text-slate-600">{me.data.email}</p><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">{me.data.status === "active" ? "Ativa" : "Exclusão solicitada"}</span><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-800">{me.data.loginMethod === "google" ? "Google" : "E-mail e senha"}</span>{me.data.hasTOTP && <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-800">MFA TOTP verificado</span>}</div></div><Button variant="outline" onClick={logout} disabled={busy}><LogOut size={16} className="mr-2"/>Sair</Button></div>
            {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

            {me.data.needsConsent && <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-2"><BookOpenText className="text-amber-800"/><div><h3 className="font-bold text-amber-950">Revisar avisos e autorização parental</h3><p className="mt-1 text-sm text-amber-900">O acesso aos perfis fica pausado até o responsável confirmar as versões atuais. Estes textos são rascunhos, não substituem revisão jurídica.</p></div></div><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={adultAttested} onChange={(event) => setAdultAttested(event.target.checked)} className="mt-1 accent-rose-500"/><span>Confirmo que sou responsável adulto e li os avisos acima.</span></label><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 accent-rose-500"/><span>Aceito os Termos rascunho {POLICY_VERSIONS.terms}.</span></label><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={acceptedPrivacy} onChange={(event) => setAcceptedPrivacy(event.target.checked)} className="mt-1 accent-rose-500"/><span>Li o Aviso de privacidade rascunho {POLICY_VERSIONS.privacy}.</span></label><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={acceptedConsent} onChange={(event) => setAcceptedConsent(event.target.checked)} className="mt-1 accent-rose-500"/><span>Autorizo o tratamento de apelido, avatar e progresso do jogo no perfil, podendo retirar a autorização.</span></label><Button onClick={signUpConsent} disabled={acceptNotices.isPending} className="w-full sm:w-auto">{acceptNotices.isPending ? "Salvando…" : "Confirmar como responsável"}</Button></div>}

            {me.data.status === "deletion_requested" && <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"><div className="flex items-start gap-2"><Trash2 className="mt-0.5 text-rose-800"/><div><h3 className="font-bold text-rose-950">Solicitação de exclusão pendente</h3><p className="text-sm text-rose-900">O acesso aos perfis está pausado enquanto a solicitação é analisada. Se mudar de ideia, você pode cancelar.</p></div></div><Button variant="outline" onClick={() => cancelAccountDeletion.mutate()} disabled={cancelAccountDeletion.isPending}>Cancelar solicitação</Button></div>}

            {me.data.status === "active" && <>
              <nav className="flex gap-2 rounded-2xl bg-amber-50 p-1.5" aria-label="Gerenciamento da conta"><button onClick={() => setPortalTab("profiles")} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${portalTab === "profiles" ? "bg-white text-[#293b60] shadow-sm" : "text-slate-600"}`}><Users size={15} className="mr-2 inline"/>Perfis</button><button onClick={() => setPortalTab("security")} className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold ${portalTab === "security" ? "bg-white text-[#293b60] shadow-sm" : "text-slate-600"}`}><Shield size={15} className="mr-2 inline"/>Segurança</button></nav>

              {portalTab === "profiles" && !me.data.needsConsent && <div className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-[Baloo_2] text-2xl font-extrabold text-[#293b60]">Perfis de jogo</h3><p className="mt-1 max-w-lg text-sm text-slate-600">Cada perfil tem apelido/avatar e save isolado. Não inclua dados reais de crianças.</p></div><Button onClick={() => setProfileEditor({ id: null, nickname: "", avatarId: "menina-creme" })} disabled={(profileList.data?.length ?? 0) >= 8}><Plus size={16} className="mr-1"/>Novo perfil</Button></div>
                {profileList.isLoading ? <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">Carregando perfis…</p> : profileList.isError ? <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">Não foi possível carregar seus perfis.</p> : <div className="grid gap-3 sm:grid-cols-2">
                  {profileList.data?.map((profile) => <article key={profile.id} className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><Avatar avatarId={profile.avatarId}/><div className="min-w-0 flex-1"><h4 className="truncate font-bold text-[#293b60]">{profile.nickname}</h4><p className="mt-0.5 text-xs text-slate-500">Casa {profile.level} · fase {profile.adventureStage} · perfil #{profile.id}</p></div><BadgeCheck size={18} className="text-emerald-600" aria-label="Perfil ativo"/></div><div className="mt-4 flex flex-wrap gap-2"><a href={`/game?profile=${profile.id}`} className="inline-flex h-9 items-center justify-center rounded-xl bg-[#334a73] px-3 text-sm font-bold text-white hover:bg-[#293b60]">Abrir jogo</a><Button size="sm" variant="outline" onClick={() => setProfileEditor({ id: profile.id, nickname: profile.nickname, avatarId: profile.avatarId })}>Editar</Button><Button size="sm" variant="outline" onClick={() => beginImport(profile.id)} disabled={!localSave}>Importar save local</Button><Button size="sm" variant="ghost" className="text-rose-700" onClick={() => setDeleteConfirmProfile(profile.id)}>Solicitar exclusão</Button></div>
                    {deleteConfirmProfile === profile.id && <div className="mt-3 space-y-2 rounded-xl bg-rose-50 p-3"><p className="text-xs text-rose-900">Isso pausa o perfil e envia solicitação para remoção de nickname, avatar e progresso. Continuar?</p><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setDeleteConfirmProfile(null)}>Cancelar</Button><Button size="sm" variant="destructive" disabled={requestProfileDelete.isPending} onClick={() => requestProfileDelete.mutate({ profileId: profile.id })}>Solicitar remoção</Button></div></div>}
                  </article>)}
                  {!profileList.data?.length && <div className="col-span-full rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-6 text-center"><PawPrint className="mx-auto text-rose-400"/><p className="mt-2 font-bold text-[#293b60]">Ainda não há perfis</p><p className="mt-1 text-sm text-slate-600">Crie o primeiro com apelido e avatar.</p></div>}
                </div>}

                {localSave && <div className="rounded-2xl bg-sky-50 p-4"><div className="flex items-start gap-2"><CircleHelp className="mt-0.5 text-sky-800"/><div><h4 className="font-bold text-sky-950">Save encontrado neste navegador</h4><p className="mt-1 text-sm text-sky-900">Casa {localSave.level}, próxima fase {localSave.stage} · ~{Math.ceil(localSave.size / 1024)} KB. O save local não será enviado até você escolher Importar e confirmar o perfil de destino. A cópia original não será apagada.</p></div></div></div>}
                {!localSave && <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">Não encontramos um save local importável neste navegador.</p>}
                {localSaveTooLarge && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">Este save excede o limite seguro atual de 400 KB e não pode ser importado.</p>}
              </div>}

              {portalTab === "security" && <div className="space-y-4">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-amber-100"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-[Baloo_2] text-xl font-extrabold text-[#293b60]">Autenticação em duas etapas</h3><p className="mt-1 text-sm text-slate-600">Use TOTP em aplicativo autenticador. Obrigatório para administradores.</p></div>{me.data.hasTOTP ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">Ativo nesta sessão</span> : <Button onClick={() => setShowMfaSetup(true)}><KeyRound size={16} className="mr-2"/>Configurar MFA</Button>}</div></div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-amber-100"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-[Baloo_2] text-xl font-extrabold text-[#293b60]">Sessões ativas</h3><p className="mt-1 text-sm text-slate-600">São exibidos apenas tipo de aparelho e horários, sem IP nem agente completo.</p></div><Button variant="outline" onClick={() => revokeSessions.mutate()} disabled={revokeSessions.isPending}>Revogar outras sessões</Button></div>{sessions.isLoading ? <p className="mt-3 text-sm text-slate-500">Carregando sessões…</p> : sessions.isError ? <p role="alert" className="mt-3 text-sm text-rose-800">Não foi possível carregar sessões.</p> : <div className="mt-3 space-y-2">{sessions.data?.map((session) => <div key={session.sessionId} className="flex flex-wrap justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm"><span>{session.deviceType}{session.isCurrent ? " · Esta sessão" : ""}</span><span className="text-xs text-slate-500">Acesso {new Date(session.lastSeenAt).toLocaleString("pt-BR")} · expira {new Date(session.expiresAt).toLocaleDateString("pt-BR")}</span></div>)}</div>}</div>
                <div className="rounded-2xl bg-amber-50 p-4"><h3 className="font-bold text-amber-950">Dados e autorização</h3><p className="mt-1 text-sm text-amber-900">Você pode pausar a autorização para interromper o acesso aos perfis ou solicitar a exclusão da conta e dos dados associados.</p><div className="mt-3 flex flex-wrap gap-2"><Button variant="outline" onClick={() => withdrawConsent.mutate()} disabled={withdrawConsent.isPending}>Pausar autorização parental</Button><Button variant="destructive" onClick={() => setDeleteConfirmAccount(true)}>Solicitar exclusão da conta</Button></div></div>
                {deleteConfirmAccount && <div role="dialog" aria-modal="true" className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"><p className="font-bold text-rose-950">Solicitar exclusão de todos os dados da conta</p><p className="text-sm text-rose-900">Digite <code className="rounded bg-white px-1">EXCLUIR</code>. O acesso aos perfis será pausado; a equipe administrativa concluirá a remoção e registrará somente um evento mínimo de auditoria.</p><Input value={accountDeleteText} onChange={(event) => setAccountDeleteText(event.target.value)} aria-label="Digite EXCLUIR" autoComplete="off"/><div className="flex gap-2"><Button variant="outline" onClick={() => setDeleteConfirmAccount(false)}>Cancelar</Button><Button variant="destructive" disabled={accountDeleteText !== "EXCLUIR" || requestAccountDeletion.isPending} onClick={() => requestAccountDeletion.mutate()}>Confirmar solicitação</Button></div></div>}
              </div>}

              {me.data.role === "admin" && <div className="border-t border-amber-100 pt-5"><AdminPanel/></div>}
            </>}
          </div>}
        </section>
      </div>
    </div>

    {profileEditor && <div role="dialog" aria-modal="true" aria-labelledby="profile-editor-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-3"><form onSubmit={submitProfileEditor} className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-[#fffdf8] p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-3"><div><h2 id="profile-editor-title" className="font-[Baloo_2] text-2xl font-extrabold text-[#293b60]">{profileEditor.id ? "Editar perfil" : "Criar perfil"}</h2><p className="mt-1 text-sm text-slate-600">Somente apelido e avatar. Não informe identidade real de criança.</p></div><button type="button" aria-label="Fechar" onClick={() => setProfileEditor(null)} className="rounded-full p-2 hover:bg-amber-50"><X size={18}/></button></div><div className="mt-4 space-y-2"><Label htmlFor="profile-nickname">Apelido</Label><Input id="profile-nickname" maxLength={20} minLength={1} required value={profileEditor.nickname} onChange={(event) => setProfileEditor({ ...profileEditor, nickname: event.target.value })} placeholder="Ex.: Gatinho Azul"/><p className="text-xs text-slate-500">Até 20 caracteres. Nada de sobrenome, escola, idade ou localização.</p></div><fieldset className="mt-4"><legend className="mb-2 text-sm font-semibold">Avatar</legend><div className="grid grid-cols-3 gap-2">{PET_CHARACTERS.map((pet) => <button type="button" key={pet.id} onClick={() => setProfileEditor({ ...profileEditor, avatarId: pet.id })} className={`flex flex-col items-center gap-1 rounded-2xl border p-2 text-xs font-semibold ${profileEditor.avatarId === pet.id ? "border-rose-400 bg-rose-50 text-rose-900" : "border-amber-100 bg-white text-slate-600"}`}><img className="h-14 w-14 object-contain" src={GAME_ASSETS.characters[pet.id]} alt=""/>{pet.name}</button>)}</div></fieldset><div className="mt-5 flex gap-2"><Button type="button" variant="outline" className="flex-1" onClick={() => setProfileEditor(null)}>Cancelar</Button><Button type="submit" className="flex-1" disabled={saveProfile.isPending || updateProfile.isPending}>{profileEditor.id ? "Salvar" : "Criar perfil"}</Button></div></form></div>}

    {migrationProfileId !== null && <div role="dialog" aria-modal="true" aria-labelledby="migration-title" className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-3"><div className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-[#fffdf8] p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-3"><div><h2 id="migration-title" className="font-[Baloo_2] text-2xl font-extrabold text-[#293b60]">Importar save local</h2><p className="mt-1 text-sm text-slate-600">Cópia explícita para <strong>{selectedProfile?.nickname ?? `perfil #${migrationProfileId}`}</strong>. O original fica neste navegador.</p></div><button aria-label="Fechar" onClick={() => setMigrationProfileId(null)} className="rounded-full p-2 hover:bg-amber-50"><X size={18}/></button></div><div className="mt-4 rounded-2xl bg-sky-50 p-3 text-sm text-sky-950">{localSave ? `Casa ${localSave.level}, próxima fase ${localSave.stage}, ${Math.ceil(localSave.size / 1024)} KB.` : "Nenhum save disponível."}</div>{profileSave.isLoading && <p className="mt-3 text-sm text-slate-500">Verificando o destino…</p>}{profileSave.isError && <p role="alert" className="mt-3 text-sm text-rose-800">Não foi possível verificar o perfil. Atualize a página.</p>}{destinationHasSave && <label className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"><input type="checkbox" className="mt-1 accent-rose-600" checked={migrationReplaceConfirmed} onChange={(event) => setMigrationReplaceConfirmed(event.target.checked)}/><span>O perfil já tem progresso. Confirmo substituir o save atual pelo save local mostrado acima.</span></label>}<div className="mt-5 flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setMigrationProfileId(null)}>Cancelar</Button><Button className="flex-1" disabled={!localSave || localSaveTooLarge || profileSave.isLoading || profileSave.isError || (destinationHasSave && !migrationReplaceConfirmed) || importSave.isPending} onClick={confirmImport}>{importSave.isPending ? "Copiando…" : destinationHasSave ? "Confirmar substituição" : "Copiar para este perfil"}</Button></div><p className="mt-3 text-xs leading-5 text-slate-500">A cópia passa por normalização e limite de 400 KB no servidor. Nada é enviado até você apertar o botão acima.</p></div></div>}

    <MfaSetupDialog open={showMfaSetup} onOpenChange={setShowMfaSetup} email={me.data?.email ?? email} loginMethod={me.data?.loginMethod ?? "password"} onComplete={() => { setNotice("MFA ativado; entre novamente usando o novo fator."); setShowMfaSetup(false); utils.auth.me.invalidate(); }}/>
  </main>;
}
