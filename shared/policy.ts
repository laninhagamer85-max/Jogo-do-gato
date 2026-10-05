/** Draft versions must be reviewed and approved before production release. */
export const POLICY_VERSIONS = {
  terms: "0.1.0-preview",
  privacy: "0.1.0-preview",
  guardianConsent: "0.1.0-preview",
} as const;

export type NoticeType = keyof typeof POLICY_VERSIONS;

export const DATA_RETENTION_DAYS = {
  securityEvents: 90,
  adminAuditEvents: 365,
  deletionRequestReview: 30,
} as const;
