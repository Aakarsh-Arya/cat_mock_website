# CONTENT-SCHEMA

## Schema v3.0 (Sets-First)

Schema v3.0 mirrors the actual DB architecture: `question_sets` are the parent containers, and `questions` are children that reference sets via `set_ref`.

### Root Structure

```json
{
  "schema_version": "v3.0",
  "paper": { ... },
  "question_sets": [ ... ],
  "questions": [ ... ]
}
```

### Key Concepts

1. **Sets are inserted FIRST** — the importer creates all `question_sets` before any questions
2. **Questions link via `set_ref`** — each question's `set_ref` must match a `client_set_id` in `question_sets[]`
3. **Deterministic linking** — no text matching or UUID guessing; explicit client IDs

### `question_sets[]` Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `client_set_id` | string | Stable ID (e.g., `VARC_RC_1`, `DILR_SET_3`). Pattern: `^[A-Z0-9_]+$` |
| `section` | enum | `VARC`, `DILR`, or `QA` |
| `set_type` | enum | `VARC`, `DILR`, `CASELET`, or `ATOMIC` |
| `display_order` | integer | Order within section (for deterministic export) |
| `context_body` | string | **Required** for `VARC`/`DILR`/`CASELET`. The passage/data content. |

Optional: `context_title`, `context_image_url`, `context_type`, `content_layout`, `metadata`

### `questions[]` Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `client_question_id` | string | Stable ID (e.g., `Q1`, `VARC_RC1_Q3`). Unique within paper. |
| `set_ref` | string | Must match a `client_set_id` in `question_sets[]` |
| `sequence_order` | integer | Order within the set (1-based) |
| `question_number` | integer | Global question number in paper |
| `question_text` | string | The question content |
| `question_type` | enum | `MCQ` or `TITA` |

MCQ questions must also include `options[]` array.

### Example (minimal)

```json
{
  "schema_version": "v3.0",
  "paper": {
    "title": "CAT 2024 Mock",
    "slug": "cat-2024-mock"
  },
  "question_sets": [
    {
      "client_set_id": "VARC_RC_1",
      "section": "VARC",
      "set_type": "VARC",
      "display_order": 1,
      "context_body": "Reading passage text here..."
    },
    {
      "client_set_id": "QA_ATOMIC_1",
      "section": "QA",
      "set_type": "ATOMIC",
      "display_order": 1
    }
  ],
  "questions": [
    {
      "client_question_id": "Q1",
      "set_ref": "VARC_RC_1",
      "sequence_order": 1,
      "section": "VARC",
      "question_number": 1,
      "question_text": "What is the main idea?",
      "question_type": "MCQ",
      "options": [
        { "id": "A", "text": "Option A" },
        { "id": "B", "text": "Option B" }
      ],
      "correct_answer": "A"
    },
    {
      "client_question_id": "Q2",
      "set_ref": "QA_ATOMIC_1",
      "sequence_order": 1,
      "section": "QA",
      "question_number": 2,
      "question_text": "Find the value of x if $x^2 = 16$",
      "question_type": "TITA",
      "correct_answer": "4"
    }
  ]
}
```

### Full Schema Reference

See: `schemas/paper_schema_v3.json`

See: `data_sanitized/paper_schema_v3.template.json` (full example)

### How to Import v3

**CLI Import (Recommended for bulk imports):**
```bash
# Dry run to validate without writing
node scripts/import-paper-v3.mjs path/to/paper.json --dry-run

# Import as draft
node scripts/import-paper-v3.mjs path/to/paper.json

# Import and publish immediately
node scripts/import-paper-v3.mjs path/to/paper.json --publish

# Skip if identical JSON already imported
node scripts/import-paper-v3.mjs path/to/paper.json --skip-if-duplicate

# With notes
node scripts/import-paper-v3.mjs path/to/paper.json --notes "Initial import"

# Upsert mode (requires migration 008 semantic keys)
node scripts/import-paper-v3.mjs path/to/paper.json --upsert
```

**Admin UI Import:**
1. Navigate to `/admin/papers`
2. Click the green "Import JSON" button
3. Select options (publish, skip duplicates, notes)
4. Upload your Schema v3.0 JSON file
5. Review the import result

**API Import:**
```bash
curl -X POST /api/admin/papers/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "data": { /* Schema v3.0 payload */ },
    "publish": false,
    "skipIfDuplicate": true,
    "notes": "API import"
  }'
```

### Semantic Keys (Migration 008)

For idempotent imports (upsert mode), apply migration 008:

| Table | Column | Description |
|-------|--------|-------------|
| `papers` | `paper_key` | Global unique key (defaults to slug) |
| `question_sets` | `client_set_id` | Unique within paper |
| `questions` | `client_question_id` | Unique within paper |

With semantic keys, re-importing the same paper updates existing records instead of duplicating.

---

## Common Fields

### Formatting
- Math content uses KaTeX inline `$...$` and block `$$...$$` notation.
- Rich text stays Markdown-compatible for bold, italics, and ordered or unordered lists.

### Assets & Delivery
- Store diagrams and images in Supabase Storage with signed URLs; record paths within `assets[]`.
- Attach fallback copies under `docs/assets/*` if external sources become private.

### Taxonomy Types (Optional)

Common values for `taxonomy_type`:

**VARC:**
- `rc_main_idea`, `rc_inference`, `rc_tone`, `rc_vocab_in_context`
- `para_jumble`, `para_summary`, `odd_sentence`

**DILR:**
- `di_table_analysis`, `di_chart`, `di_caselets`
- `lr_arrangement`, `lr_puzzles`, `lr_syllogism`

**QA:**
- `arithmetic_percentages`, `arithmetic_profit_loss`, `arithmetic_time_work`
- `algebra_equations`, `algebra_inequalities`
- `geometry_triangles`, `geometry_circles`
- `number_theory_divisibility`, `modern_math_permutations`
