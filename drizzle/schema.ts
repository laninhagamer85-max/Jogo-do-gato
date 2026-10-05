import {
  index,
  int,
  json,
  longtext,
  mysqlEnum,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/** Legacy scaffold table retained for backwards-compatible framework migrations only. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const guardianAccounts = mysqlTable(
  "guardian_accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    firebaseUid: varchar("firebaseUid", { length: 128 }).notNull().unique(),
    email: varchar("email", { length: 320 }).notNull(),
    role: mysqlEnum("role", ["guardian", "admin"]).default("guardian").notNull(),
    status: mysqlEnum("status", ["pending_email", "active", "suspended", "deletion_requested"]).default("pending_email").notNull(),
    loginMethod: mysqlEnum("loginMethod", ["password", "google"]).default("password").notNull(),
    emailVerifiedAt: timestamp("emailVerifiedAt"),
    guardianConsentWithdrawnAt: timestamp("guardianConsentWithdrawnAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn"),
    deletionRequestedAt: timestamp("deletionRequestedAt"),
  },
  (table) => [
    index("guardian_status_created_idx").on(table.status, table.createdAt),
    index("guardian_last_signed_in_idx").on(table.lastSignedIn),
    index("guardian_email_idx").on(table.email),
  ],
);

export const childProfiles = mysqlTable(
  "child_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    guardianId: int("guardianId").notNull().references(() => guardianAccounts.id, { onDelete: "cascade" }),
    nickname: varchar("nickname", { length: 20 }).notNull(),
    avatarId: varchar("avatarId", { length: 32 }).notNull(),
    status: mysqlEnum("status", ["active", "deletion_requested"]).default("active").notNull(),
    stateJson: longtext("stateJson"),
    revision: int("revision").default(0).notNull(),
    level: int("level").default(1).notNull(),
    adventureStage: int("adventureStage").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    deletionRequestedAt: timestamp("deletionRequestedAt"),
  },
  (table) => [
    index("child_profile_owner_status_idx").on(table.guardianId, table.status),
    index("child_profile_progress_idx").on(table.level, table.adventureStage),
  ],
);

export const authSessions = mysqlTable(
  "auth_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: varchar("sessionId", { length: 36 }).notNull().unique(),
    guardianId: int("guardianId").notNull().references(() => guardianAccounts.id, { onDelete: "cascade" }),
    tokenHash: varchar("tokenHash", { length: 64 }).notNull().unique(),
    deviceType: mysqlEnum("deviceType", ["desktop", "mobile", "tablet", "unknown"]).default("unknown").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
    revokedAt: timestamp("revokedAt"),
  },
  (table) => [index("auth_session_owner_active_idx").on(table.guardianId, table.revokedAt, table.expiresAt)],
);

export const noticeAcknowledgements = mysqlTable(
  "notice_acknowledgements",
  {
    id: int("id").autoincrement().primaryKey(),
    guardianId: int("guardianId").notNull().references(() => guardianAccounts.id, { onDelete: "cascade" }),
    noticeType: mysqlEnum("noticeType", ["terms", "privacy", "guardianConsent"]).notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
    withdrawnAt: timestamp("withdrawnAt"),
  },
  (table) => [
    uniqueIndex("notice_owner_type_version_uq").on(table.guardianId, table.noticeType, table.version),
    index("notice_owner_current_idx").on(table.guardianId, table.noticeType, table.withdrawnAt),
  ],
);

export const securityEvents = mysqlTable(
  "security_events",
  {
    id: int("id").autoincrement().primaryKey(),
    guardianId: int("guardianId").references(() => guardianAccounts.id, { onDelete: "set null" }),
    eventType: varchar("eventType", { length: 48 }).notNull(),
    outcome: mysqlEnum("outcome", ["success", "failure", "blocked"]).notNull(),
    safeCode: varchar("safeCode", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("security_event_created_idx").on(table.createdAt), index("security_event_guardian_idx").on(table.guardianId, table.createdAt)],
);

export const adminAuditEvents = mysqlTable(
  "admin_audit_events",
  {
    id: int("id").autoincrement().primaryKey(),
    actorGuardianId: int("actorGuardianId").references(() => guardianAccounts.id, { onDelete: "set null" }),
    targetGuardianId: int("targetGuardianId").references(() => guardianAccounts.id, { onDelete: "set null" }),
    targetProfileId: int("targetProfileId").references(() => childProfiles.id, { onDelete: "set null" }),
    eventType: varchar("eventType", { length: 64 }).notNull(),
    safeMetadata: json("safeMetadata").$type<Record<string, string | number | boolean | null> | null>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("admin_audit_created_idx").on(table.createdAt),
    index("admin_audit_actor_idx").on(table.actorGuardianId, table.createdAt),
  ],
);

export type GuardianAccount = typeof guardianAccounts.$inferSelect;
export type ChildProfile = typeof childProfiles.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
