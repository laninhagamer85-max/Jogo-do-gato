import { useState } from "react";
import { Activity, FileText, Fingerprint, LockKeyhole, ShieldAlert, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

type AdminTab = "overview" | "guardians" | "security" | "audit" | "deletions";
const tabs: Array<{ id: AdminTab; title: string; icon: typeof Users }> = [
  { id: "overview", title: "Visão geral", icon: Activity },
  { id: "guardians", title: "Responsáveis", icon: Users },
  { id: "security", title: "Segurança", icon: ShieldAlert },
  { id: "audit", title: "Auditoria", icon: FileText },
  { id: "deletions", title: "Pedidos de exclusão", icon: UserX },
];
const dateText = (value: Date | string | null | undefined) => value ? new Date(value).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" }) : "—";
const humanStatus: Record<string, string> = { active: "Ativa", pending_email: "E-mail pendente", suspended: "Suspensa", deletion_requested: "Exclusão solicitada" };

export default function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmTarget, setConfirmTarget] = useState<{ type: "guardian" | "profile"; id: number } | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const utils = trpc.useUtils();
  const overview = trpc.admin.overview.useQuery(undefined, { enabled: tab === "overview" });
  const guardians = trpc.admin.guardians.useQuery({ offset: 0, limit: 50, ...(search.trim() ? { search: search.trim() } : {}) }, { enabled: tab === "guardians" });
  const security = trpc.admin.securityEvents.useQuery({ offset: 0, limit: 50 }, { enabled: tab === "security" });
  const audit = trpc.admin.auditEvents.useQuery({ offset: 0, limit: 50 }, { enabled: tab === "audit" });
  const deletions = trpc.admin.deletionRequests.useQuery(undefined, { enabled: tab === "deletions" });
  const changeStatus = trpc.admin.setGuardianStatus.useMutation({ onSuccess: async () => { setNotice("Estado da conta atualizado."); await Promise.all([utils.admin.guardians.invalidate(), utils.admin.overview.invalidate()]); }, onError: () => setNotice("A alteração não foi concluída. Confirme a sessão MFA recente e tente novamente.") });
  const changeRole = trpc.admin.setGuardianRole.useMutation({ onSuccess: async () => { setNotice("Função administrativa atualizada."); await utils.admin.guardians.invalidate(); }, onError: (error) => setNotice(error.message || "A função não foi alterada.") });
  const fulfillProfile = trpc.admin.fulfillProfileDeletion.useMutation({ onSuccess: async () => { setNotice("Dados do perfil removidos."); setConfirmTarget(null); setConfirmation(""); await Promise.all([utils.admin.deletionRequests.invalidate(), utils.admin.overview.invalidate()]); }, onError: (error) => setNotice(error.message || "Não foi possível concluir a exclusão.") });
  const fulfillGuardian = trpc.admin.fulfillGuardianDeletion.useMutation({ onSuccess: async () => { setNotice("Conta e dados associados removidos."); setConfirmTarget(null); setConfirmation(""); await Promise.all([utils.admin.deletionRequests.invalidate(), utils.admin.overview.invalidate(), utils.admin.guardians.invalidate()]); }, onError: (error) => setNotice(error.message || "Não foi possível concluir a exclusão.") });

  const submitDeletion = () => {
    if (!confirmTarget) return;
    if (confirmTarget.type === "profile") fulfillProfile.mutate({ profileId: confirmTarget.id, confirmation });
    else fulfillGuardian.mutate({ targetId: confirmTarget.id, confirmation });
  };
  const expectedConfirmation = confirmTarget?.type === "profile" ? `EXCLUIR PERFIL ${confirmTarget.id}` : confirmTarget ? `EXCLUIR CONTA ${confirmTarget.id}` : "";

  return <section className="space-y-4" aria-label="Painel administrativo">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-amber-50 p-5">
      <div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-100 text-indigo-800"><LockKeyhole size={22} /></span><div><h2 className="font-[Baloo_2] text-2xl font-extrabold text-[#293b60]">Painel de administração</h2><p className="mt-1 max-w-xl text-sm text-slate-600">Somente estatísticas necessárias e trilhas sem credenciais, conteúdo de saves, IPs ou dados de crianças.</p></div></div>
      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">MFA exigido</span>
    </div>
    <nav className="flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 ring-1 ring-amber-100" aria-label="Seções administrativas">
      {tabs.map(({ id, title, icon: Icon }) => <button key={id} onClick={() => { setTab(id); setNotice(""); }} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${tab === id ? "bg-[#334a73] text-white" : "text-slate-600 hover:bg-amber-50"}`}><Icon size={16} />{title}</button>)}
    </nav>
    {notice && <p role="status" className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-900">{notice}</p>}

    {tab === "overview" && <div className="space-y-3">
      {overview.isLoading ? <div className="rounded-2xl bg-white p-5 text-sm text-slate-500">Carregando indicadores…</div> : overview.isError ? <div role="alert" className="rounded-2xl bg-rose-50 p-5 text-sm text-rose-800">Não foi possível carregar os indicadores.</div> : <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Contas de responsáveis", overview.data?.guardians ?? 0, Users, "slate"],
          ["Ativas", overview.data?.activeGuardians ?? 0, Fingerprint, "emerald"],
          ["Perfis ativos", overview.data?.activeProfiles ?? 0, Users, "amber"],
          ["Acessos nos últimos 30 dias", overview.data?.activeLast30Days ?? 0, Activity, "sky"],
          ["E-mails pendentes", overview.data?.pendingEmail ?? 0, ShieldAlert, "amber"],
          ["Contas suspensas", overview.data?.suspended ?? 0, LockKeyhole, "rose"],
          ["Pedidos de exclusão", (overview.data?.deletionRequests ?? 0) + (overview.data?.profilesForDeletion ?? 0), UserX, "rose"],
          ["Eventos de segurança (30 dias)", overview.data?.securityEventsLast30Days ?? 0, ShieldAlert, "indigo"],
        ].map(([title, value, Icon, color]) => {
          const IconComponent = Icon as typeof Users;
          const palette: Record<string, string> = { slate: "bg-slate-100 text-slate-700", emerald: "bg-emerald-100 text-emerald-800", amber: "bg-amber-100 text-amber-800", sky: "bg-sky-100 text-sky-800", rose: "bg-rose-100 text-rose-800", indigo: "bg-indigo-100 text-indigo-800" };
          return <article key={String(title)} className="rounded-2xl bg-white p-4 ring-1 ring-amber-100"><div className={`mb-3 grid h-9 w-9 place-items-center rounded-xl ${palette[String(color)]}`}><IconComponent size={17} /></div><p className="text-xs font-semibold text-slate-500">{String(title)}</p><p className="mt-1 text-2xl font-black text-[#293b60]">{String(value)}</p></article>;
        })}
      </div>}
      <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">Os números são agregados e não inspecionam o progresso detalhado. Esta versão ainda não executa purga automática de logs; defina e valide os prazos de retenção antes de tratar contas reais.</p>
    </div>}

    {tab === "guardians" && <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 ring-1 ring-amber-100 sm:flex-row"><Input aria-label="Buscar por e-mail" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar e-mail mascarado…" className="sm:max-w-sm" /><span className="self-center text-xs text-slate-500">Resultados limitados a 50 por página; endereços mascarados.</span></div>
      {guardians.isLoading ? <p className="p-5 text-sm text-slate-500">Carregando contas…</p> : guardians.isError ? <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Não foi possível carregar contas.</p> : guardians.data?.items.map((account) => <article key={account.id} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-amber-100 md:flex-row md:items-center md:justify-between">
        <div><p className="font-bold text-slate-800">{account.maskedEmail}</p><p className="mt-1 text-xs text-slate-500">#{account.id} · {humanStatus[account.status] ?? account.status} · {account.loginMethod} · último acesso {dateText(account.lastSignedIn)}</p></div>
        <div className="flex flex-wrap gap-2"><select aria-label={`Função da conta ${account.id}`} value={account.role} onChange={(event) => { const role = event.target.value as "guardian" | "admin"; if (role !== account.role && window.confirm(`Alterar a função desta conta para ${role === "admin" ? "administrador" : "responsável"}?`)) changeRole.mutate({ targetId: account.id, role }); }} className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm"><option value="guardian">Responsável</option><option value="admin">Administrador</option></select>{account.status === "active" ? <Button size="sm" variant="outline" disabled={changeStatus.isPending} onClick={() => { if (window.confirm("Suspender este responsável e revogar todas as sessões?")) changeStatus.mutate({ targetId: account.id, status: "suspended" }); }}>Suspender</Button> : account.status === "suspended" ? <Button size="sm" variant="outline" disabled={changeStatus.isPending} onClick={() => { if (window.confirm("Reativar o acesso deste responsável?")) changeStatus.mutate({ targetId: account.id, status: "active" }); }}>Reativar</Button> : null}</div>
      </article>)}
    </div>}

    {tab === "security" && <div className="space-y-2">
      {security.isLoading ? <p className="p-4 text-sm text-slate-500">Carregando eventos…</p> : security.isError ? <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Não foi possível carregar eventos.</p> : security.data?.map((event) => <article key={event.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-3 ring-1 ring-amber-100"><div className="flex items-center gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl ${event.outcome === "success" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}><ShieldAlert size={16} /></span><div><p className="text-sm font-bold text-slate-800">{event.eventType}</p><p className="text-xs text-slate-500">{event.outcome} · {event.safeCode ?? "sem código"} · responsável #{event.guardianId ?? "removido"}</p></div></div><time className="text-xs text-slate-500">{dateText(event.createdAt)}</time></article>)}
    </div>}

    {tab === "audit" && <div className="space-y-2">
      {audit.isLoading ? <p className="p-4 text-sm text-slate-500">Carregando auditoria…</p> : audit.isError ? <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Não foi possível carregar a auditoria.</p> : audit.data?.map((event) => <article key={event.id} className="rounded-2xl bg-white p-4 ring-1 ring-amber-100"><div className="flex flex-wrap justify-between gap-2"><p className="font-bold text-slate-800">{event.eventType}</p><time className="text-xs text-slate-500">{dateText(event.createdAt)}</time></div><p className="mt-1 text-xs text-slate-500">Admin #{event.actorGuardianId ?? "removido"} · alvo responsável #{event.targetGuardianId ?? "removido"} · perfil #{event.targetProfileId ?? "removido"}</p></article>)}
    </div>}

    {tab === "deletions" && <div className="space-y-4">
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">A exclusão definitiva só fica disponível após solicitação do responsável. A confirmação registra a ação e remove os dados associados; exige nova autenticação administrativa recente com TOTP.</p>
      {deletions.isLoading ? <p className="p-4 text-sm text-slate-500">Carregando pedidos…</p> : deletions.isError ? <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">Não foi possível carregar pedidos.</p> : <>
        {deletions.data?.guardians.map((item) => <article key={`guardian-${item.id}`} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-rose-100 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-800">Conta #{item.id} · {item.maskedEmail}</p><p className="text-xs text-slate-500">Solicitada em {dateText(item.deletionRequestedAt)}</p></div><Button size="sm" variant="destructive" onClick={() => { setConfirmTarget({ type: "guardian", id: item.id }); setConfirmation(""); }}>Revisar exclusão</Button></article>)}
        {deletions.data?.profiles.map((item) => <article key={`profile-${item.id}`} className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-rose-100 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-800">Perfil #{item.id} · conta #{item.guardianId}</p><p className="text-xs text-slate-500">Solicitado em {dateText(item.deletionRequestedAt)}</p></div><Button size="sm" variant="destructive" onClick={() => { setConfirmTarget({ type: "profile", id: item.id }); setConfirmation(""); }}>Revisar exclusão</Button></article>)}
        {!deletions.data?.guardians.length && !deletions.data?.profiles.length && <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">Nenhum pedido pendente.</p>}
      </>}
      {confirmTarget && <div role="dialog" aria-modal="true" aria-label="Confirmar remoção definitiva" className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50 p-4"><p className="font-bold text-rose-950">Confirmação para remoção definitiva</p><p className="text-sm text-rose-900">Digite exatamente <code className="rounded bg-white px-1 py-0.5">{expectedConfirmation}</code>. A conta/saves não poderão ser recuperados após a exclusão.</p><Input aria-label="Texto de confirmação" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off"/><div className="flex gap-2"><Button variant="outline" onClick={() => setConfirmTarget(null)}>Cancelar</Button><Button variant="destructive" disabled={confirmation !== expectedConfirmation || fulfillProfile.isPending || fulfillGuardian.isPending} onClick={submitDeletion}>Apagar dados solicitados</Button></div></div>}
    </div>}
  </section>;
}
