# Meu Pet Virtual — guardian authentication setup

**Status: staging integration, not production-ready.** The server auth routes, guardian/profile schema, portal, and admin console are implemented in the project preview. The correct read-only Identity Platform v2 APIs confirm Google and email/password sign-in enabled; the Google provider has a client ID configured. Firebase Authentication Authorized Domains contains both the canonical official hostname and the exact preview host; the preview hostname is in the matching reCAPTCHA v3 key, but allowlisting of the official hostname in that key is not yet verified. The project's `allowDuplicateEmails` policy is now `true`, changed and verified through a field-scoped update, as required to keep Google and password identities separate; the application does not link accounts. The preview CSP allows the App Check token-exchange host, but the last recheck remained provider-throttled, so token issuance is unverified. TOTP is disabled and a permission/plan-gated enable attempt was rejected. No successful login, signup, reset email delivery, guardian test account, or first-admin promotion has been performed. The game route requires a guardian session and owned profile; existing browser-local saves remain untouched for explicit import. The project domain responds with the login screen; this task has not deployed the current workspace changes.

**Canonical website:** `https://meupetgame-4hwhw32b.manus.space/` is the project's single assigned official site domain. The `*.manus.computer` URL is a temporary QA preview, not another official domain; the app marks development responses `noindex` and redirects alternate production page hosts to the canonical host. `meu-pet-gamer.firebaseapp.com` is the Firebase authentication handler domain, not a second website.

## Sites migration review — 2026-10-05

This review supersedes the historical Manus provider/domain observations below for the Sites migration. The staging app is registered with Enterprise (Fraud Defense), with a one-hour token TTL. Authentication App Check enforcement is currently not applied. The prepared client uses `ReCaptchaEnterpriseProvider`, waits up to 15 seconds for token retrieval, and caches only successful token headers; failed requests can retry immediately. Production backend token verification remains unchanged.

The intended Sites hostname is `meupet.aquimeusite.chatgpt.site`. It is present in Firebase Authentication Authorized Domains, but its inclusion in the Enterprise key's allowed domains is unverified because this cloud browser cannot access Google Cloud Console. Configure build-time Firebase values from this staging web app, using the same Enterprise public site key registered in App Check. Do not reuse the historical production Firebase configuration below. No Sites deployment, live token issuance, login, or end-to-end validation is confirmed.

## Firebase / Identity Platform prerequisites

Use a **separate staging Firebase project** until the owner explicitly approves a production environment.

1. Enable Firebase Authentication with Identity Platform.
2. Enable **Email/Password** and **Google** as sign-in providers; require verified email and keep email-enumeration protection enabled.
3. Choose **multiple accounts per email address** if the product requirement is to keep Google and password identities separate. The client does not call account-linking APIs; test duplicate-email behavior before accepting real accounts.
4. Enable TOTP MFA. TOTP enrollment is offered to guardians and is mandatory for administrative access and sensitive admin actions.
5. Keep the canonical official host and the exact temporary preview host in Firebase Authentication Authorized Domains while preview QA is active. Both are confirmed present. The Firebase `authDomain` (`meu-pet-gamer.firebaseapp.com`) is the authentication callback host, not another public game site.
6. Register the staging web app with Firebase App Check / reCAPTCHA Enterprise (Fraud Defense), using a Web score-based key without a checkbox challenge and `ReCaptchaEnterpriseProvider` in the client. Verify every deployed hostname in the allowed-domain list of that same key; Firebase Authentication Authorized Domains is a separate setting. Monitor provider metrics before enabling provider-side enforcement. The app API requires a valid App Check token in production; do not use or expose a production debug token.
7. Create a dedicated Firebase service account with only the Firebase Authentication and App Check permissions the server needs. Do not use a broad project-owner credential.

Provider details and source links are in [FIREBASE_PROVIDER_NOTES.md](./FIREBASE_PROVIDER_NOTES.md).

## Protected project environment configuration

Use the project's protected environment/secret settings, not source files, Git, or chat.

| Variable | Scope | Purpose |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | Browser config (public identifier) | Firebase web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Browser config (public identifier) | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Browser config (public identifier) | Firebase project ID |
| `VITE_FIREBASE_APP_ID` | Browser config (public identifier) | Firebase web app ID |
| `VITE_RECAPTCHA_SITE_KEY` | Browser config (public site key) | Firebase App Check reCAPTCHA Enterprise |
| `FIREBASE_PROJECT_ID` | Server config | Project used by Firebase Admin |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server-only config | Dedicated service-account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | **Secret** | Dedicated service-account private key; multiline PEM or `\\n`-escaped PEM is accepted |
| `FIREBASE_APP_CHECK_REQUIRED` | Server config | Set to `true` when production App Check enforcement is enabled |

The server does not fall back to ambient credentials. The Admin private key must never be prefixed with `VITE_` or included in a browser bundle.

## Current staging verification status

- Firebase Admin credentials successfully authenticated to Identity Platform. The preview hostname was appended to the existing `authorizedDomains` list through the documented `updateMask=authorizedDomains` API and read back successfully; no other domains were removed. The same hostname was saved in the reCAPTCHA key settings.
- The documented Identity Platform `projects.getConfig` and `projects.defaultSupportedIdpConfigs.get` reads confirm email/password enabled, Google enabled, and a Google client ID present. `signIn.allowDuplicateEmails` was changed from false to true with an update mask limited to that exact field and read back successfully. No secret/client ID value was output or stored in this repository.
- The client Firebase app initializes and the guardian sign-in form renders. A Google popup attempt from the preview did not complete; the UI now maps common Firebase provider/domain/popup/network errors to actionable messages and displays only a safe technical code in development. No guardian account has been created or used in QA; no first administrator has been promoted.
- The first App Check exchange attempt exposed a CSP violation for `content-firebaseappcheck.googleapis.com`; this exact host is now allowed in `connect-src` and covered by Vitest. No CSP violation was observed after the change. A single recheck after a long idle still returned `appCheck/throttled` (`tokenPresent: false`), so token issuance is not verified; stop repeated retries and inspect the reCAPTCHA/App Check project-key configuration and quota before another attempt.
- A read-only Identity Platform config check found the TOTP provider disabled. An attempt to enable it returned `auth/operation-not-allowed`; the development MFA QA checks provider state before creating any synthetic accounts and exits without side effects when TOTP is unavailable. The owner must verify the Identity Platform plan/permissions and enable TOTP before running `pnpm test:guardian-mfa`.
- The production API remains fail-closed: it rejects missing or invalid App Check tokens. Before release, authorize the hostname on the reCAPTCHA key, verify token issuance, test the protected API end to end, and validate enforcement behavior. Never disable production App Check to bypass a missing token.

## First administrator bootstrap

The project includes an operator-only, one-shot command: `pnpm admin:bootstrap`. Set `INITIAL_ADMIN_EMAIL` in the protected server environment to the intended administrator's verified account email, then run the command from an authorized private environment after that guardian has accepted the current notices and enrolled TOTP. The command refuses to run if any admin already exists, validates the Firebase identity and TOTP enrollment, binds the account to the exact Firebase UID and email, serializes concurrent attempts, and writes an audit event. It is not exposed as a public API and does not print email, UID, tokens, or credentials. It never creates or verifies an account on the operator's behalf.

The regular admin panel can then manage other admins, and its server procedure rejects promotions unless the target has verified email plus enrolled TOTP. The application itself requires the resulting admin session to carry a verified TOTP second-factor claim. Do not put the target email, password, TOTP seed/code, service-account key, or Firebase tokens in source control or chat.

## Development-only profile isolation QA

Run `MPV_PROFILE_QA_CONFIRM=development-only pnpm test:profile-isolation` only when `DATABASE_URL` points to this project's development database; the script also refuses `NODE_ENV=production`. It creates two synthetic guardians and profiles with reserved `.invalid` e-mail addresses, checks owner-only reads/writes and deletion request behavior, exercises the audited data-erasure finalizer, and removes all fixture rows in `finally`. It does not create Firebase identities or touch production. Stop if the configured database is not the development project.

## Data boundaries and remaining release work

- Child profiles accept only a nickname and a game avatar; the server binds every profile/save operation to the authenticated guardian and uses revision checks to prevent cross-session overwrite.
- Browser guest saves are **not uploaded automatically**. A guardian must select a profile and explicitly confirm import; an existing server save requires a second replacement confirmation. The browser copy is preserved.
- The additive guardian/profile/session/consent/security schema has been applied to the **development** database. The legacy scaffold `users` table is retained but is not an authentication source.
- Terms, privacy notice, and parental-consent text are marked as drafts and need legal/operational review. No compliance certification is claimed.
- Automated log-retention/purge is not configured. Define and implement approved retention periods before processing real accounts; the current UI must not claim retention is already active.
- Validate provider domain settings, App Check, MFA enrollment/sign-in, profile isolation, and recovery flows in staging before any release. No publication or deployment was performed.
