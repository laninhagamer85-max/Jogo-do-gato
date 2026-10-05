import { createHash } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { clearSessionCookies } from "./auth/cookies";
import { getFirebaseAdminAuth } from "./auth/firebaseAdmin";
import { FRESH_AUTH_MAX_AGE_SECONDS, hasRecentAuthentication } from "./auth/policy";
import {
  acceptCurrentNotices,
  cancelGuardianDeletion,
  changeGuardianRole,
  createChildProfile,
  finalizeRequestedGuardianDeletion,
  finalizeRequestedProfileDeletion,
  getAdminOverview,
  getChildProfileSave,
  getGuardianById,
  getGuardianSessions,
  importChildProfileSave,
  listAdminAuditEvents,
  listAdminGuardians,
  listAdminSecurityEvents,
  listChildProfiles,
  listDeletionRequests,
  recordSecurityEvent,
  requestChildProfileDeletion,
  requestGuardianDeletion,
  revokeOtherGuardianSessions,
  saveChildProfileState,
  setGuardianStatusByAdmin,
  updateChildProfile,
  withdrawGuardianConsent,
} from "./db";
import { adminProcedure, authenticatedProcedure, freshAdminProcedure, guardianProcedure, publicProcedure, router } from "./_core/trpc";
import { gameSaveSchema, profileCreateSchema, profileUpdateSchema } from "./auth/validators";

const pageSchema = z.object({ offset: z.number().int().min(0).max(100_000).default(0), limit: z.number().int().min(1).max(100).default(25) });

const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    const guardian = ctx.guardian;
    if (!guardian) return null;
    return {
      id: guardian.id,
      email: guardian.email,
      role: guardian.role,
      status: guardian.status,
      loginMethod: guardian.loginMethod,
      needsConsent: guardian.status === "active" && !guardian.consentsCurrent,
      consentWithdrawn: guardian.consentWithdrawn,
      hasTOTP: guardian.secondFactor === "totp",
    };
  }),
  acceptCurrentNotices: authenticatedProcedure.mutation(async ({ ctx }) => {
    if (ctx.guardian.status !== "active") throw new TRPCError({ code: "FORBIDDEN", message: "Esta conta não está ativa." });
    await acceptCurrentNotices(ctx.guardian.id);
    return { ok: true };
  }),
  withdrawGuardianConsent: authenticatedProcedure.mutation(async ({ ctx }) => {
    if (ctx.guardian.status !== "active") throw new TRPCError({ code: "FORBIDDEN" });
    await withdrawGuardianConsent(ctx.guardian.id);
    return { ok: true, profileAccessPaused: true };
  }),
  requestDeletion: authenticatedProcedure.mutation(async ({ ctx }) => {
    if (ctx.guardian.status !== "active") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Esta conta já possui uma solicitação pendente." });
    await requestGuardianDeletion(ctx.guardian.id);
    return { ok: true, status: "deletion_requested" as const };
  }),
  cancelDeletion: authenticatedProcedure.mutation(async ({ ctx }) => {
    if (ctx.guardian.status !== "deletion_requested") throw new TRPCError({ code: "PRECONDITION_FAILED" });
    await cancelGuardianDeletion(ctx.guardian.id);
    return { ok: true, status: "active" as const };
  }),
  sessions: guardianProcedure.query(({ ctx }) => getGuardianSessions(ctx.guardian.id, ctx.guardian.sessionId)),
  revokeOtherSessions: authenticatedProcedure.mutation(async ({ ctx }) => {
    if (!hasRecentAuthentication(ctx.guardian.authTimeSeconds)) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Entre novamente para revogar outras sessões." });
    return { revoked: await revokeOtherGuardianSessions(ctx.guardian.id, ctx.guardian.sessionId) };
  }),
});

const profilesRouter = router({
  list: guardianProcedure.query(({ ctx }) => listChildProfiles(ctx.guardian.id)),
  create: guardianProcedure.input(profileCreateSchema).mutation(async ({ ctx, input }) => {
    const profiles = await listChildProfiles(ctx.guardian.id);
    if (profiles.length >= 8) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Esta conta já atingiu o limite de perfis." });
    const created = await createChildProfile(ctx.guardian.id, input);
    if (!created) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível criar o perfil." });
    return created;
  }),
  update: guardianProcedure.input(profileUpdateSchema).mutation(async ({ ctx, input }) => {
    const { profileId, nickname, avatarId } = input;
    const updated = await updateChildProfile(ctx.guardian.id, { profileId, nickname, avatarId });
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "O perfil não foi encontrado." });
    return { ok: true };
  }),
  requestDeletion: guardianProcedure.input(z.object({ profileId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
    const requested = await requestChildProfileDeletion(ctx.guardian.id, input.profileId);
    if (!requested) throw new TRPCError({ code: "NOT_FOUND", message: "O perfil não foi encontrado." });
    return { ok: true, status: "deletion_requested" as const };
  }),
  getSave: guardianProcedure.input(z.object({ profileId: z.number().int().positive() })).query(async ({ ctx, input }) => {
    const save = await getChildProfileSave(ctx.guardian.id, input.profileId);
    if (!save) throw new TRPCError({ code: "NOT_FOUND", message: "O perfil não foi encontrado." });
    return save;
  }),
  save: guardianProcedure.input(gameSaveSchema).mutation(async ({ ctx, input }) => {
    const result = await saveChildProfileState({ guardianId: ctx.guardian.id, profileId: input.profileId, revision: input.revision, rawState: input.stateJson });
    if (!result.ok) throw new TRPCError({ code: result.reason === "conflict_or_missing" ? "CONFLICT" : "BAD_REQUEST", message: result.reason === "conflict_or_missing" ? "O progresso mudou em outra sessão. Recarregue o perfil antes de continuar." : "O arquivo do jogo não passou pela validação." });
    await recordSecurityEvent({ guardianId: ctx.guardian.id, eventType: "profile_save", outcome: "success", safeCode: "bounded_save" });
    return result;
  }),
  importLocalSave: guardianProcedure.input(gameSaveSchema.extend({ replaceExisting: z.boolean() })).mutation(async ({ ctx, input }) => {
    const result = await importChildProfileSave({ guardianId: ctx.guardian.id, profileId: input.profileId, revision: input.revision, rawState: input.stateJson, replaceExisting: input.replaceExisting });
    if (!result.ok) throw new TRPCError({ code: result.reason === "conflict_or_existing_save" ? "CONFLICT" : "BAD_REQUEST", message: result.reason === "conflict_or_existing_save" ? "O perfil já possui progresso ou foi alterado. Atualize a página e confirme a substituição." : "O save local não passou pela validação." });
    await recordSecurityEvent({ guardianId: ctx.guardian.id, eventType: "local_save_import", outcome: "success", safeCode: input.replaceExisting ? "explicit_replace" : "empty_profile" });
    return result;
  }),
});

const adminRouter = router({
  overview: adminProcedure.query(() => getAdminOverview()),
  guardians: adminProcedure.input(pageSchema.extend({
    status: z.enum(["pending_email", "active", "suspended", "deletion_requested"]).optional(),
    search: z.string().max(80).optional(),
  })).query(({ input }) => listAdminGuardians(input)),
  securityEvents: adminProcedure.input(pageSchema).query(({ input }) => listAdminSecurityEvents(input.offset, input.limit)),
  auditEvents: adminProcedure.input(pageSchema).query(({ input }) => listAdminAuditEvents(input.offset, input.limit)),
  deletionRequests: adminProcedure.query(() => listDeletionRequests()),
  setGuardianStatus: freshAdminProcedure.input(z.object({ targetId: z.number().int().positive(), status: z.enum(["active", "suspended"]) })).mutation(async ({ ctx, input }) => {
    if (input.targetId === ctx.guardian.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Não é possível alterar o próprio acesso por este painel." });
    const target = await getGuardianById(input.targetId);
    if (!target) throw new TRPCError({ code: "NOT_FOUND" });
    const auth = getFirebaseAdminAuth();
    if (!auth) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Firebase Admin não está configurado." });
    try {
      await auth.updateUser(target.firebaseUid, { disabled: input.status === "suspended" });
      await auth.revokeRefreshTokens(target.firebaseUid);
    } catch {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Não foi possível atualizar o estado de identidade." });
    }
    const changed = await setGuardianStatusByAdmin({ actorId: ctx.guardian.id, targetId: input.targetId, status: input.status });
    if (!changed) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A conta possui um pedido de exclusão pendente e precisa ser tratado nesse fluxo." });
    return { ok: true };
  }),
  setGuardianRole: freshAdminProcedure.input(z.object({ targetId: z.number().int().positive(), role: z.enum(["guardian", "admin"]) })).mutation(async ({ ctx, input }) => {
    if (input.targetId === ctx.guardian.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Não é possível alterar a própria função." });
    const target = await getGuardianById(input.targetId);
    if (!target) throw new TRPCError({ code: "NOT_FOUND" });
    if (input.role === "admin") {
      const auth = getFirebaseAdminAuth();
      if (!auth) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Firebase Admin não está configurado." });
      const user = await auth.getUser(target.firebaseUid);
      if (user.disabled || !user.emailVerified || !(user.multiFactor?.enrolledFactors ?? []).some((factor) => factor.factorId === "totp")) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Antes da promoção, a conta precisa ter e-mail verificado e MFA TOTP configurado." });
      }
    }
    const changed = await changeGuardianRole({ actorId: ctx.guardian.id, targetId: input.targetId, role: input.role });
    if (!changed) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A conta não está ativa." });
    await recordSecurityEvent({ guardianId: ctx.guardian.id, eventType: "administrator_role_changed", outcome: "success", safeCode: input.role === "admin" ? "promoted" : "demoted" });
    return { ok: true };
  }),
  fulfillProfileDeletion: freshAdminProcedure.input(z.object({ profileId: z.number().int().positive(), confirmation: z.string().max(80) })).mutation(async ({ ctx, input }) => {
    if (input.confirmation !== `EXCLUIR PERFIL ${input.profileId}`) throw new TRPCError({ code: "BAD_REQUEST", message: "A confirmação digitada não corresponde." });
    const deleted = await finalizeRequestedProfileDeletion({ actorId: ctx.guardian.id, profileId: input.profileId });
    if (!deleted) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "O perfil não está aguardando exclusão." });
    return { ok: true };
  }),
  fulfillGuardianDeletion: freshAdminProcedure.input(z.object({ targetId: z.number().int().positive(), confirmation: z.string().max(80) })).mutation(async ({ ctx, input }) => {
    if (input.targetId === ctx.guardian.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Não é possível excluir a própria conta administrativa." });
    if (input.confirmation !== `EXCLUIR CONTA ${input.targetId}`) throw new TRPCError({ code: "BAD_REQUEST", message: "A confirmação digitada não corresponde." });
    const target = await getGuardianById(input.targetId);
    if (!target || target.status !== "deletion_requested") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "A conta não está aguardando exclusão." });
    const auth = getFirebaseAdminAuth();
    if (!auth) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Firebase Admin não está configurado." });
    try {
      await auth.revokeRefreshTokens(target.firebaseUid);
      await auth.deleteUser(target.firebaseUid);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== "auth/user-not-found") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Não foi possível apagar a identidade; os dados continuam preservados para nova tentativa." });
    }
    const targetRef = createHash("sha256").update(`${target.firebaseUid}:${target.id}`).digest("hex").slice(0, 20);
    const deleted = await finalizeRequestedGuardianDeletion({ actorId: ctx.guardian.id, targetId: target.id, targetRef });
    if (!deleted) throw new TRPCError({ code: "CONFLICT", message: "A identidade foi removida, mas a solicitação de dados mudou. Acione a equipe técnica para concluir a limpeza." });
    return { ok: true };
  }),
});

export const appRouter = router({
  auth: authRouter,
  profiles: profilesRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
