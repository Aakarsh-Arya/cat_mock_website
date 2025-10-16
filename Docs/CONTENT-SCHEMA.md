# CONTENT-SCHEMA (M0)

## Question Types
- **MCQ**: `id`, `paper_id`, `section`, `type: "MCQ"`, `text`, `options[]`, `answer_key`, optional `solution`, `difficulty`, `assets[]`.
- **TITA**: `id`, `paper_id`, `section`, `type: "TITA"`, `text`, `answer_key` (string or numeric), optional `solution`, `assets[]`.

## Formatting
- Math content uses KaTeX inline `$...$` and block `$$...$$` notation.
- Rich text stays Markdown-compatible for bold, italics, and ordered or unordered lists.

## Assets & Delivery
- Store diagrams and images in Supabase Storage with signed URLs; record paths within `assets[]`.
- Attach fallback copies under `docs/assets/*` if external sources become private.

## Versioning Notes
- Treat this schema as v0.1; update alongside blueprint anchors whenever question formats change.
