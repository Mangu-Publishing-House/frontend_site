# MANGU Publishers — Microsoft 365 Integration Catalog

> **Status:** Active planning — 2026-09-18
> **Owner:** accounting@mangu-publishers.com
> **Scope:** 25 Microsoft platform items evaluated for MANGU Publishers integration

---

## Evaluation Legend

| Symbol      | Verdict                                               |
| ----------- | ----------------------------------------------------- |
| ✅ ADOPT    | Integrate now — clear ROI, available licensing        |
| 🟡 EVALUATE | Worth prototyping; licensing/scope needs confirmation |
| ⛔ SKIP     | Overlaps with existing stack or insufficient ROI      |

---

## Catalog

### 1. Copilot Studio — Author Concierge Bot

**Verdict:** ✅ ADOPT (Priority 3)
**Architecture:** Power Platform bot embedded in MANGU author portal via iframe/Direct Line channel. Queries MongoDB author + manuscript data via Power Automate HTTP connector.
**Licensing:** Copilot Studio (per-bot + per-session message packs, or M365 Copilot E5 add-on).
**Runbook:** `RUNBOOKS/copilot-studio.md`
**Capabilities:** manuscript status checks, royalty queries, submission guidance, EQS rubric explanations.

### 2. Power Automate — Top 10 Flows

**Verdict:** ✅ ADOPT (Priority 4)
**Architecture:** Cloud flows connecting MANGU webhooks → SharePoint/Teams/Dataverse. See §Top 10 Flows below.
**Licensing:** Power Automate per-user plan (Premium connectors needed for HTTP → MANGU API).

### 3. Microsoft Teams — Author Workspace

**Verdict:** ✅ ADOPT
**Architecture:** Dedicated Team for editorial workflow; channels per manuscript; Planner for tasks; tabs embed MANGU author portal.
**Licensing:** M365 Business Standard or higher.

### 4. SharePoint Online — Manuscript Repository

**Verdict:** ✅ ADOPT
**Architecture:** SharePoint document library as cold-storage backup for manuscripts; synced to Vercel Blob via Power Automate flow.
**Licensing:** Included in M365.

### 5. Microsoft Dataverse — Core Tables

**Verdict:** ✅ ADOPT (Priority 5)
**Architecture:** Supplementary CRM-style tables: Leads, Submissions, Royalty Agreements, Partner Contacts. MANGU app continues on MongoDB for runtime; Dataverse for business ops/reporting.
**Licensing:** Dataverse for Teams (free with M365) or standalone Power Platform.

### 6. Power BI — Publishing Analytics

**Verdict:** ✅ ADOPT
**Architecture:** Power BI workspace connected to MongoDB Atlas via Power BI connector (MongoDB Atlas connector or ODBC bridge). Real-time dashboards for sales, reader engagement.
**Licensing:** Power BI Pro per user.

### 7. Microsoft Entra ID — SSO/SAML

**Verdict:** 🟡 EVALUATE
**Architecture:** Entra ID as external identity provider for admin/staff logins; Better Auth supports OIDC. Reader-facing login stays Better Auth + email.
**Licensing:** Entra ID P1.

### 8. Azure Communication Services — Transactional Email

**Verdict:** ⛔ SKIP
**Architecture:** MANGU already uses Resend for transactional email. ACS would add cost and migration complexity with no net benefit.

### 9. Microsoft Purview — Data Governance

**Verdict:** 🟡 EVALUATE
**Architecture:** Data catalog for PII mapping (reader profiles, payment data). Useful for GDPR compliance posture.
**Licensing:** Purview Compliance included in M365 E3+.

### 10. Microsoft Viva — Author Engagement

**Verdict:** ⛔ SKIP
**Architecture:** Viva Engage / Yammer is aimed at enterprise employees. MANGU's author community is better served by Teams + the author portal.

### 11. Azure OpenAI — Book Recommendations

**Verdict:** ✅ ADOPT
**Architecture:** Azure-hosted GPT-4o-mini for recommendation embeddings. MANGU already calls OpenAI; Azure endpoint provides VNet-bound, enterprise SLA. See `ANALYTICS.md`.
**Licensing:** Azure OpenAI (pay-per-token, no seat license).

### 12. Power Pages — Partner Extranet

**Verdict:** 🟡 EVALUATE
**Architecture:** Low-code partner/distributor portal built on Power Pages; reads Dataverse partner tables. Reduces custom dev for B2B flows.
**Licensing:** Power Pages per-session capacity.

### 13. Microsoft Bookings — Editorial Consultations

**Verdict:** ✅ ADOPT
**Architecture:** Public Bookings page for author editorial consultation slots; auto-creates Teams meetings.
**Licensing:** Included in M365 Business.

### 14. Microsoft Lists — Editorial Pipeline Tracker

**Verdict:** ✅ ADOPT
**Architecture:** Lists as lightweight task board for managing manuscript review pipeline; integrates with Teams tab.
**Licensing:** Included in M365.

### 15. Microsoft Loop — Collaborative Briefs

**Verdict:** 🟡 EVALUATE
**Architecture:** Loop components embedded in Teams for real-time co-authoring of editorial briefs. Good for distributed editorial team.
**Licensing:** Included in M365 E3+.

### 16. Azure Blob Storage — Media Archive

**Verdict:** ⛔ SKIP
**Architecture:** MANGU uses Vercel Blob (already migrated via Phoenix WS3). Azure Blob would duplicate infrastructure.

### 17. Microsoft Defender for Cloud Apps — SaaS Security

**Verdict:** 🟡 EVALUATE
**Architecture:** CASB posture for M365 data accessed by staff. Not required until team exceeds ~10 people.
**Licensing:** Defender for Cloud Apps (M365 E5).

### 18. Power Virtual Agents (legacy) → Copilot Studio

**Verdict:** ⛔ SKIP
**Note:** PVA is superseded by Copilot Studio (item 1). Do not use PVA for new bots.

### 19. Microsoft Clarity — Reader UX Analytics

**Verdict:** ✅ ADOPT
**Architecture:** Free heatmap + session-recording tool. Add Clarity tracking snippet to Next.js layout. Supplements Vercel Analytics.
**Licensing:** Free.

### 20. Azure CDN — Static Asset Acceleration

**Verdict:** ⛔ SKIP
**Architecture:** Vercel Edge Network already serves static assets globally. Azure CDN adds cost without benefit.

### 21. Microsoft Syntex — Document AI

**Verdict:** 🟡 EVALUATE
**Architecture:** AI-powered extraction of manuscript metadata (author name, genre, word count) from uploaded DOCX files. Could automate MANGU intake.
**Licensing:** Syntex per-capacity or per-use.

### 22. Teams Toolkit — Developer Workflow

**Verdict:** ✅ ADOPT
**Architecture:** Teams Toolkit (VS Code extension) for developing the Author Concierge bot and any Teams tab apps.
**Licensing:** Free (open source).

### 23. Microsoft Graph API — User & Calendar Data

**Verdict:** ✅ ADOPT
**Architecture:** Graph API for reading staff calendar availability (editorial scheduling), Teams presence, and SharePoint file metadata. Used by Copilot Studio flows.
**Licensing:** Included in any M365 subscription.

### 24. Azure Monitor + Application Insights

**Verdict:** 🟡 EVALUATE
**Architecture:** MANGU uses Sentry for error tracking. Application Insights could consolidate performance + log data if running Azure workloads. Not needed while on Vercel + Atlas.
**Licensing:** Pay-per-GB ingest.

### 25. Microsoft Authenticator — MFA for Staff

**Verdict:** ✅ ADOPT
**Architecture:** Enforce MFA via Entra ID conditional access for all MANGU staff accounts. Pairs with item 7 (Entra SSO).
**Licensing:** Included in Entra ID Free.

---

## Top 10 Power Automate Flows

| #   | Flow Name                    | Trigger                                   | Action                                                                              | Connector                             |
| --- | ---------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------- |
| 1   | New Manuscript Received      | MANGU webhook `manuscript.submitted`      | Create Teams channel + SharePoint folder + Planner task                             | HTTP + SharePoint + Teams + Planner   |
| 2   | Manuscript Status Changed    | MANGU webhook `manuscript.status_updated` | Notify author via Teams/Email + update Dataverse row                                | HTTP + Teams + Dataverse              |
| 3   | New Purchase                 | MANGU webhook `order.completed`           | Log to Dataverse Orders + send receipt to Teams finance channel                     | HTTP + Dataverse + Teams              |
| 4   | Weekly Sales Report          | Schedule: every Monday 08:00              | Query MANGU API → generate Excel → post to Teams analytics channel                  | HTTP + Excel + Teams                  |
| 5   | Author Royalty Payout        | MANGU webhook `royalty.approved`          | Update Dataverse royalty record + trigger SharePoint payment doc                    | HTTP + Dataverse + SharePoint         |
| 6   | Review Moderation Alert      | MANGU webhook `review.flagged`            | Post to Teams moderation channel with approve/reject adaptive card                  | HTTP + Teams (Adaptive Cards)         |
| 7   | New Author Registration      | MANGU webhook `author.created`            | Create Dataverse Lead + send welcome email + schedule onboarding meeting (Bookings) | HTTP + Dataverse + Outlook + Bookings |
| 8   | Manuscript Deadline Reminder | Schedule: daily                           | Query Dataverse for manuscripts with due date T-7 days → send Teams reminders       | Dataverse + Teams                     |
| 9   | SharePoint → Blob Sync       | SharePoint: document created/modified     | Download file → PUT to MANGU API `/api/manuscripts/upload`                          | SharePoint + HTTP                     |
| 10  | Partner Payout Statement     | Schedule: monthly last day                | Query MANGU API partner data → generate PDF → email to partner                      | HTTP + PDF + Outlook                  |

---

## Dataverse Core Tables

| Table                     | Key Columns                                                                          | Relationships              |
| ------------------------- | ------------------------------------------------------------------------------------ | -------------------------- |
| `mangu_author`            | `author_id` (MANGU MongoDB ref), `display_name`, `email`, `status`, `onboarded_at`   | → `mangu_manuscript` (1:N) |
| `mangu_manuscript`        | `ms_id`, `title`, `genre`, `word_count`, `status`, `submitted_at`, `review_deadline` | → `mangu_author` (N:1)     |
| `mangu_royalty_agreement` | `agreement_id`, `author_id`, `percentage`, `effective_date`, `signed`                | → `mangu_author` (N:1)     |
| `mangu_partner`           | `partner_id`, `org_name`, `contact_email`, `partnership_type`, `active`              | standalone                 |
| `mangu_payout`            | `payout_id`, `partner_id`, `amount`, `period`, `status`, `processed_at`              | → `mangu_partner` (N:1)    |
| `mangu_order_log`         | `order_id` (Stripe PI ref), `buyer_email`, `book_title`, `amount`, `created_at`      | standalone (read replica)  |

---

## Licensing Summary

| Item              | License                 | Estimated Monthly Cost       |
| ----------------- | ----------------------- | ---------------------------- |
| Copilot Studio    | Per-bot + message packs | ~$200/mo base                |
| Power Automate    | Per-user Premium        | ~$15/user/mo                 |
| Power BI Pro      | Per-user                | ~$10/user/mo                 |
| Dataverse (Teams) | Free with M365          | $0                           |
| Microsoft Clarity | Free                    | $0                           |
| Teams Toolkit     | Free                    | $0                           |
| Azure OpenAI      | Pay-per-token           | ~$20-50/mo at current volume |

---

_Last updated: 2026-09-18 | Generated for feat/grok-workspace-tanstack_
