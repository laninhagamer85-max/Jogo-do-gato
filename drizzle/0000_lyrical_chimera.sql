CREATE TABLE `admin_audit_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorGuardianId` int,
	`targetGuardianId` int,
	`targetProfileId` int,
	`eventType` varchar(64) NOT NULL,
	`safeMetadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_audit_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auth_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(36) NOT NULL,
	`guardianId` int NOT NULL,
	`tokenHash` varchar(64) NOT NULL,
	`deviceType` enum('desktop','mobile','tablet','unknown') NOT NULL DEFAULT 'unknown',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	CONSTRAINT `auth_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `auth_sessions_sessionId_unique` UNIQUE(`sessionId`),
	CONSTRAINT `auth_sessions_tokenHash_unique` UNIQUE(`tokenHash`)
);
--> statement-breakpoint
CREATE TABLE `child_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guardianId` int NOT NULL,
	`nickname` varchar(20) NOT NULL,
	`avatarId` varchar(32) NOT NULL,
	`status` enum('active','deletion_requested') NOT NULL DEFAULT 'active',
	`stateJson` longtext,
	`revision` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`adventureStage` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deletionRequestedAt` timestamp,
	CONSTRAINT `child_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `guardian_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firebaseUid` varchar(128) NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('guardian','admin') NOT NULL DEFAULT 'guardian',
	`status` enum('pending_email','active','suspended','deletion_requested') NOT NULL DEFAULT 'pending_email',
	`loginMethod` enum('password','google') NOT NULL DEFAULT 'password',
	`emailVerifiedAt` timestamp,
	`guardianConsentWithdrawnAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp,
	`deletionRequestedAt` timestamp,
	CONSTRAINT `guardian_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `guardian_accounts_firebaseUid_unique` UNIQUE(`firebaseUid`)
);
--> statement-breakpoint
CREATE TABLE `notice_acknowledgements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guardianId` int NOT NULL,
	`noticeType` enum('terms','privacy','guardianConsent') NOT NULL,
	`version` varchar(32) NOT NULL,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`withdrawnAt` timestamp,
	CONSTRAINT `notice_acknowledgements_id` PRIMARY KEY(`id`),
	CONSTRAINT `notice_owner_type_version_uq` UNIQUE(`guardianId`,`noticeType`,`version`)
);
--> statement-breakpoint
CREATE TABLE `security_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`guardianId` int,
	`eventType` varchar(48) NOT NULL,
	`outcome` enum('success','failure','blocked') NOT NULL,
	`safeCode` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` varchar(255),
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `admin_audit_events` ADD CONSTRAINT `admin_audit_events_actorGuardianId_guardian_accounts_id_fk` FOREIGN KEY (`actorGuardianId`) REFERENCES `guardian_accounts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_audit_events` ADD CONSTRAINT `admin_audit_events_targetGuardianId_guardian_accounts_id_fk` FOREIGN KEY (`targetGuardianId`) REFERENCES `guardian_accounts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `admin_audit_events` ADD CONSTRAINT `admin_audit_events_targetProfileId_child_profiles_id_fk` FOREIGN KEY (`targetProfileId`) REFERENCES `child_profiles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `auth_sessions` ADD CONSTRAINT `auth_sessions_guardianId_guardian_accounts_id_fk` FOREIGN KEY (`guardianId`) REFERENCES `guardian_accounts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `child_profiles` ADD CONSTRAINT `child_profiles_guardianId_guardian_accounts_id_fk` FOREIGN KEY (`guardianId`) REFERENCES `guardian_accounts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notice_acknowledgements` ADD CONSTRAINT `notice_acknowledgements_guardianId_guardian_accounts_id_fk` FOREIGN KEY (`guardianId`) REFERENCES `guardian_accounts`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `security_events` ADD CONSTRAINT `security_events_guardianId_guardian_accounts_id_fk` FOREIGN KEY (`guardianId`) REFERENCES `guardian_accounts`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `admin_audit_created_idx` ON `admin_audit_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `admin_audit_actor_idx` ON `admin_audit_events` (`actorGuardianId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `auth_session_owner_active_idx` ON `auth_sessions` (`guardianId`,`revokedAt`,`expiresAt`);--> statement-breakpoint
CREATE INDEX `child_profile_owner_status_idx` ON `child_profiles` (`guardianId`,`status`);--> statement-breakpoint
CREATE INDEX `child_profile_progress_idx` ON `child_profiles` (`level`,`adventureStage`);--> statement-breakpoint
CREATE INDEX `guardian_status_created_idx` ON `guardian_accounts` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `guardian_last_signed_in_idx` ON `guardian_accounts` (`lastSignedIn`);--> statement-breakpoint
CREATE INDEX `guardian_email_idx` ON `guardian_accounts` (`email`);--> statement-breakpoint
CREATE INDEX `notice_owner_current_idx` ON `notice_acknowledgements` (`guardianId`,`noticeType`,`withdrawnAt`);--> statement-breakpoint
CREATE INDEX `security_event_created_idx` ON `security_events` (`createdAt`);--> statement-breakpoint
CREATE INDEX `security_event_guardian_idx` ON `security_events` (`guardianId`,`createdAt`);
