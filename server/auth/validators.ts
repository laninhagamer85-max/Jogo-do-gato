import { z } from "zod";
import { PET_CHARACTERS } from "../../client/src/game/PetGame";
import { POLICY_VERSIONS } from "../../shared/policy";

export const AVATAR_IDS = PET_CHARACTERS.map((pet) => pet.id) as [string, ...string[]];
export const avatarIdSchema = z.enum(AVATAR_IDS as [string, ...string[]]);

export const registerSchema = z.object({
  idToken: z.string().min(100).max(12_000),
  guardianAttested: z.literal(true),
  termsVersion: z.literal(POLICY_VERSIONS.terms),
  privacyVersion: z.literal(POLICY_VERSIONS.privacy),
  guardianConsentVersion: z.literal(POLICY_VERSIONS.guardianConsent),
}).strict();

export const sessionSchema = z.object({ idToken: z.string().min(100).max(12_000) }).strict();
export const profileCreateSchema = z.object({
  nickname: z.string().trim().min(1).max(20).refine((value) => !/[\u0000-\u001f\u007f<>]/.test(value), "Apelido inválido."),
  avatarId: avatarIdSchema,
}).strict();
export const profileUpdateSchema = profileCreateSchema.extend({ profileId: z.number().int().positive() }).strict();
export const gameSaveSchema = z.object({
  profileId: z.number().int().positive(),
  revision: z.number().int().nonnegative(),
  stateJson: z.string().min(2).max(400_000),
}).strict();

export type ProfileCreateInput = z.infer<typeof profileCreateSchema>;
