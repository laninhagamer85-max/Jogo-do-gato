import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getSecurityHeaders } from "./lib/authApi";
import { trpc } from "./lib/trpc";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

const trpcClient = trpc.createClient({
  links: [httpBatchLink({
    url: "/api/trpc",
    transformer: superjson,
    headers: getSecurityHeaders,
    fetch(input, init) {
      return globalThis.fetch(input, { ...(init ?? {}), credentials: "include", cache: "no-store" });
    },
  })],
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <App />
    </trpc.Provider>
  </QueryClientProvider>,
);
