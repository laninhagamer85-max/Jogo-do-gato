import { useState, type FormEvent } from "react";
import QRCode from "qrcode";
import {
  GoogleAuthProvider,
  TotpMultiFactorGenerator,
  multiFactor,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseAuth, firebaseAuthReady } from "@/lib/firebase";
import { authPost } from "@/lib/authApi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; email: string; loginMethod: "password" | "google"; onComplete: () => void };

export default function MfaSetupDialog({ open, onOpenChange, email, loginMethod, onComplete }: Props) {
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState<Awaited<ReturnType<typeof TotpMultiFactorGenerator.generateSecret>> | null>(null);
  const [enrollmentUser, setEnrollmentUser] = useState<User | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  function reset() {
    setPassword(""); setSecret(null); setEnrollmentUser(null); setQrDataUrl(""); setCode(""); setError(""); setComplete(false); setBusy(false);
  }

  async function startEnrollment(event: FormEvent) {
    event.preventDefault();
    if (!firebaseAuth) { setError("O provedor de identidade ainda não está configurado."); return; }
    setBusy(true); setError("");
    try {
      await firebaseAuthReady;
      const credential = loginMethod === "google"
        ? await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
        : await signInWithEmailAndPassword(firebaseAuth, email, password);
      const session = await multiFactor(credential.user).getSession();
      const generated = await TotpMultiFactorGenerator.generateSecret(session);
      const uri = generated.generateQrCodeUrl(email, "Meu Pet Virtual");
      const qr = await QRCode.toDataURL(uri, { width: 228, margin: 2, errorCorrectionLevel: "M" });
      setEnrollmentUser(credential.user); setSecret(generated); setQrDataUrl(qr);
    } catch {
      setError("Não foi possível confirmar a conta. Confira a senha ou tente novamente com o mesmo provedor de entrada.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyAndEnroll(event: FormEvent) {
    event.preventDefault();
    if (!firebaseAuth || !secret || !enrollmentUser || !/^\d{6}$/.test(code)) { setError("Digite o código atual de seis dígitos do aplicativo autenticador."); return; }
    setBusy(true); setError("");
    try {
      await multiFactor(enrollmentUser).enroll(TotpMultiFactorGenerator.assertionForEnrollment(secret, code), "Meu Pet Virtual");
      await authPost("/api/auth/logout");
      await signOut(firebaseAuth);
      setComplete(true);
      onComplete();
    } catch {
      setError("O código não foi aceito. Verifique se o relógio do aparelho está sincronizado e tente o próximo código.");
    } finally {
      setBusy(false);
    }
  }

  return <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); onOpenChange(next); }}>
    <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-[28px] border-amber-100 bg-[#fffdf8] p-5 text-slate-800 sm:max-w-[480px] sm:p-7">
      <DialogHeader>
        <DialogTitle className="font-[Baloo_2] text-2xl font-extrabold text-[#293b60]">Proteja a conta com MFA</DialogTitle>
        <DialogDescription>Adicione um código temporário gerado por um aplicativo autenticador. A chave aparece apenas nesta tela; salve-a no aplicativo e não a compartilhe.</DialogDescription>
      </DialogHeader>
      {complete ? <div className="space-y-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
        <p className="font-bold">MFA ativado. A sessão foi encerrada para que o próximo acesso valide o novo fator.</p>
        <Button className="w-full" onClick={() => { reset(); onOpenChange(false); }}>Concluir</Button>
      </div> : !secret ? <form onSubmit={startEnrollment} className="space-y-4">
        {loginMethod === "password" && <div className="space-y-2"><Label htmlFor="mfa-password">Confirme sua senha</Label><Input id="mfa-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></div>}
        {loginMethod === "google" && <p className="rounded-xl bg-sky-50 p-3 text-sm text-sky-900">Você confirmará sua conta na janela do Google, sem compartilhar sua senha com este jogo.</p>}
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? "Confirmando…" : "Gerar configuração do autenticador"}</Button>
      </form> : <form onSubmit={verifyAndEnroll} className="space-y-4">
        <div className="grid place-items-center rounded-2xl bg-white p-3 ring-1 ring-amber-100"><img src={qrDataUrl} alt="QR code privado para configurar TOTP" className="h-56 w-56" /></div>
        <div className="space-y-1 text-center text-sm"><p>Escaneie o QR no aplicativo autenticador.</p><p className="text-xs text-slate-500">Se necessário, a chave manual é <code className="break-all rounded bg-amber-50 px-1 py-0.5">{secret.secretKey}</code>.</p></div>
        <div className="space-y-2"><Label htmlFor="mfa-code">Código de seis dígitos</Label><Input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required /></div>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        <div className="flex gap-2"><Button type="button" variant="outline" className="flex-1" onClick={() => { setSecret(null); setEnrollmentUser(null); setQrDataUrl(""); setCode(""); }}>Voltar</Button><Button type="submit" disabled={busy || code.length !== 6} className="flex-1">{busy ? "Ativando…" : "Ativar MFA"}</Button></div>
      </form>}
    </DialogContent>
  </Dialog>;
}
