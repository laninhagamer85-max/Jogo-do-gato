import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import GuardianPortal from "./pages/GuardianPortal";
import { trpc } from "@/lib/trpc";
import { canAccessGameProfile } from "@/lib/gameAccess";

function ProtectedGame() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const demoMode = import.meta.env.DEV && ["1", "platformer"].includes(params.get("demo") ?? "");
  const profileId = Number(params.get("profile"));
  const hasProfileId = Number.isSafeInteger(profileId) && profileId > 0;
  const me = trpc.auth.me.useQuery(undefined, { retry: false });
  const profiles = trpc.profiles.list.useQuery(undefined, {
    enabled: !demoMode && Boolean(me.data && me.data.status === "active" && !me.data.needsConsent),
    retry: false,
  });

  useEffect(() => {
    if (!demoMode && !me.isLoading && !me.data) navigate("/");
  }, [demoMode, me.isLoading, me.data, navigate]);

  if (demoMode) return <Home />;
  if (me.isLoading || (me.data && profiles.isLoading)) {
    return <main className="grid min-h-[100dvh] place-items-center bg-[#101d3b] p-6 text-center text-white"><div role="status" className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl"><span className="mb-3 block text-4xl" aria-hidden="true">🐾</span><p className="font-bold">Preparando a aventura…</p><p className="mt-1 text-sm text-white/70">Conferindo seu perfil com segurança.</p></div></main>;
  }
  if (!me.data || me.data.status !== "active" || me.data.needsConsent) return null;
  if (profiles.isError) return <main className="grid min-h-[100dvh] place-items-center bg-[#f4f1ea] p-5 text-center text-slate-800"><div className="max-w-md rounded-3xl bg-white p-6 shadow-xl"><h1 className="text-xl font-extrabold">Não foi possível validar o perfil</h1><p className="mt-2 text-sm">Volte à área do responsável e tente novamente.</p><a className="mt-4 inline-flex rounded-xl bg-[#334a73] px-4 py-2 font-bold text-white" href="/">Área do responsável</a></div></main>;
  if (!hasProfileId || !canAccessGameProfile(me.data, profileId, profiles.data?.map((profile) => profile.id) ?? [])) {
    return <main className="grid min-h-[100dvh] place-items-center bg-[#f4f1ea] p-5 text-center text-slate-800"><div className="max-w-md rounded-3xl bg-white p-6 shadow-xl"><span className="text-4xl" aria-hidden="true">🐱</span><h1 className="mt-2 text-xl font-extrabold">Escolha um perfil para jogar</h1><p className="mt-2 text-sm">O progresso da aventura fica separado para cada perfil.</p><a className="mt-4 inline-flex rounded-xl bg-[#334a73] px-4 py-2 font-bold text-white" href="/">Ver meus perfis</a></div></main>;
  }
  return <Home />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={GuardianPortal} />
      <Route path={"/guardian"} component={GuardianPortal} />
      <Route path={"/game"} component={ProtectedGame} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
