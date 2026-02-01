# Documentation Index

This folder contains all project documentation. Start here to understand the codebase.

## Core Documentation

| Document | Description |
|----------|-------------|
| [BLUEPRINT.md](BLUEPRINT.md) | Feature anchors, milestones, and implementation status |
| [DECISIONS.md](DECISIONS.md) | Architecture decisions and rationale |
| [SCHEMA_SUPABASE.sql](SCHEMA_SUPABASE.sql) | Database schema (source of truth) |
| [CONTENT-SCHEMA.md](CONTENT-SCHEMA.md) | Question/paper content format specification |

## Operational Docs

| Document | Description |
|----------|-------------|
| [Milestone_Change_Log.md](Milestone_Change_Log.md) | Release notes and milestone history |
| [AUDIT_QUERY_PATHS.md](AUDIT_QUERY_PATHS.md) | API and data flow audit notes |

## Migrations

SQL migration scripts in [`migrations/`](migrations/) folder:
- `002_session_locking.sql` - Session locking mechanism
- `003_question_container_architecture.sql` - Question container design
- `004_fetch_attempt_solutions.sql` - Solution fetching RPC
- `005_attempt_state_lockdown.sql` - Attempt state management
- `006_response_flags.sql` - Response flag system
- `006_force_resume_session.sql` - Force resume functionality

Standalone migration files (legacy):
- `MIGRATION_CONTEXTS.sql`, `MIGRATION_M5_SCORING.sql`, `MIGRATION_M6_RBAC.sql`, `MIGRATION_RLS_VIEWS.sql`, `MIGRATION_STATS.sql`

## Archived / Historical

Documents in [`archive/`](archive/) are kept for reference but are **not canonical**:
- `SCHEMA_FIREBASE.md` - Firebase fallback schema (not in use)

## Research

Documents in [`research/`](research/) capture initial explorations:
- `stack-evaluation.md` - Original stack comparison (deployment now on Vercel)
- `convert_paper_metadata.py` - Paper conversion utility script
