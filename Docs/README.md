# Documentation Index

This folder contains all project documentation. Start here to understand the codebase.

## Core Documentation

| Document | Description |
|----------|-------------|
| [BLUEPRINT.md](BLUEPRINT.md) | Feature anchors, milestones, and implementation status |
| [DECISIONS.md](DECISIONS.md) | Architecture decisions and rationale |
| [SCHEMA_SUPABASE.sql](SCHEMA_SUPABASE.sql) | Database schema snapshot (see migrations for latest) |
| [CONTENT-SCHEMA.md](CONTENT-SCHEMA.md) | Question/paper content format specification |

## Operational Docs

| Document | Description |
|----------|-------------|
| [Milestone_Change_Log.md](Milestone_Change_Log.md) | Release notes and milestone history |
| [AUDIT_QUERY_PATHS.md](AUDIT_QUERY_PATHS.md) | API and data flow audit notes |

## Migrations

SQL migration scripts in [`migrations/`](migrations/) folder (apply in numeric order):
- `002_session_locking.sql` - Session locking mechanism
- `003_question_container_architecture.sql` - Question container design
- `004_fetch_attempt_solutions.sql` - Solution fetching RPC
- `005_attempt_state_lockdown.sql` - Attempt state management
- `006_response_flags.sql` - Response flag system
- `006_force_resume_session.sql` - Force resume functionality
- `007_content_ingestion_phases.sql` - Export/import + versioned ingestion
- `008_ingestion_semantic_keys.sql` - Semantic keys + upsert support
- `009_attempt_submit_rls.sql` - Submit transition RLS
- `010_force_resume_lenient.sql` - Lenient force resume threshold
- `011_prevent_paper_delete_with_attempts.sql` - Prevent delete with attempts
- `012_phase1_security_hardening.sql` - Deprecated (use 013)
- `013_phase1_security_complete.sql` - Full Phase 1 security hardening
- `014_soften_submit_rls.sql` - Optional relaxations (use with care)
- `015_landing_assets.sql` - Landing assets table
- `016_bug_reports.sql` - Bug report table
- `017_bug_report_status.sql` - Bug report status enum
- `018_purge_attempts_on_auth_delete.sql` - Cleanup on auth delete
- `019_force_resume_ultra_lenient.sql` - Ultra lenient resume
- `020_pause_tracking.sql` - Pause tracking
- `021_validate_session_token_atomic.sql` - Session validation updates
- `022_validate_session_token_single_signature.sql` - Token signature hardening
- `023_access_control_foundations.sql` - Signup mode + user access + waitlist
- `024_access_control_rls.sql` - RLS gating for attempts/responses

Standalone migration files (legacy):
- `MIGRATION_CONTEXTS.sql`, `MIGRATION_M5_SCORING.sql`, `MIGRATION_M6_RBAC.sql`, `MIGRATION_RLS_VIEWS.sql`, `MIGRATION_STATS.sql`

## Archived / Historical

Documents in [`archive/`](archive/) are kept for reference but are **not canonical**:
- `SCHEMA_FIREBASE.md` - Firebase fallback schema (not in use)

## Research

Documents in [`research/`](research/) capture initial explorations:
- `stack-evaluation.md` - Original stack comparison (deployment now on Netlify)
- `convert_paper_metadata.py` - Paper conversion utility script
