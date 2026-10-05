import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { GuardianPrincipal, TrpcContext } from "./context";
import { FRESH_AUTH_MAX_AGE_SECONDS, isTotpMfaVerified } from "../auth/policy";

const t = initTRPC.context<TrpcContext>().create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;

function requireGuardian(guardian: GuardianPrincipal | null): GuardianPrincipal {
  if (!guardian) throw new TRPCError({ code: "UNAUTHORIZED", message: "Entre na conta do responsável para continuar." });
  return guardian as GuardianPrincipal;
}

export const authenticatedProcedure = t.procedure.use(t.middleware(({ ctx, next }) => {
  const guardian = requireGuardian(ctx.guardian);
  return next({ ctx: { ...ctx, guardian: guardian as GuardianPrincipal } });
}));

export const guardianProcedure = authenticatedProcedure.use(t.middleware(({ ctx, next }) => {
  const guardian = requireGuardian(ctx.guardian);
  if (guardian.status !== "active") throw new TRPCError({ code: "FORBIDDEN", message: "Esta conta não está ativa para acessar os perfis." });
  if (guardian.consentWithdrawn || !guardian.consentsCurrent) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Confirme os avisos e a autorização do responsável para acessar os perfis." });
  return next({ ctx: { ...ctx, guardian } });
}));

export const adminProcedure = guardianProcedure.use(t.middleware(({ ctx, next }) => {
  const guardian = requireGuardian(ctx.guardian);
  if (guardian.role !== "admin" || !isTotpMfaVerified(guardian.secondFactor)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "A área administrativa exige uma conta autorizada com MFA TOTP validado." });
  }
  return next({ ctx: { ...ctx, guardian } });
}));

export const freshAdminProcedure = adminProcedure.use(t.middleware(({ ctx, next }) => {
  const guardian = requireGuardian(ctx.guardian);
  const age = Math.floor(Date.now() / 1000) - guardian.authTimeSeconds;
  if (age < 0 || age > FRESH_AUTH_MAX_AGE_SECONDS) {
    throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Entre novamente com MFA antes desta ação sensível." });
  }
  return next({ ctx: { ...ctx, guardian } });
}));
