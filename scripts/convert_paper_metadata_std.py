#!/usr/bin/env python3
"""
Parse a CAT paper metadata DOCX (tables) into the JSON schema expected by scripts/import-paper.mjs.
Pure-stdlib parser (no external deps).

Usage:
  python scripts/convert_paper_metadata_std.py --docx "PAPER METADATA_CAT2024_slot1.docx" --out data/cat-2024-slot1.json
  # then upload using Node importer:
  node scripts/import-paper.mjs data/cat-2024-slot1.json --publish
"""

import argparse
import json
import re
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Sequence
import xml.etree.ElementTree as ET

W_NS = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"


def _normalize_key(key: str) -> str:
    key = re.sub(r"[^A-Za-z0-9]+", "_", key).strip("_").lower()
    return key


def _clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _cell_text(cell_el: ET.Element) -> str:
    texts: List[str] = []
    for t in cell_el.iter(f"{W_NS}t"):
        if t.text:
            texts.append(t.text)
    return _clean_text(" ".join(texts))


def _iter_tables(doc_root: ET.Element) -> List[ET.Element]:
    return list(doc_root.iter(f"{W_NS}tbl"))


def _table_to_rows(tbl: ET.Element) -> List[List[str]]:
    rows: List[List[str]] = []
    for tr in tbl.iter(f"{W_NS}tr"):
        cells = [ _cell_text(tc) for tc in tr.iter(f"{W_NS}tc") ]
        if cells:
            rows.append(cells)
    return rows


def parse_meta(rows: Sequence[Sequence[str]]) -> Dict[str, Any]:
    meta: Dict[str, Any] = {}
    for row in rows:
        if len(row) < 2:
            continue
        key = _normalize_key(row[0])
        if not key:
            continue
        meta[key] = row[1]
    return meta


def parse_sections(meta: Dict[str, Any]) -> List[Dict[str, Any]]:
    sections: List[Dict[str, Any]] = []
    raw = meta.get("sections") or meta.get("section_breakup") or meta.get("sectionwise_breakup")
    if not raw:
        return sections
    lines = [p for chunk in raw.split("\n") for p in chunk.split(";") if p.strip()]
    for line in lines:
        parts = [p.strip() for p in re.split(r"[|,:]", line) if p.strip()]
        if len(parts) < 2:
            continue
        name = parts[0].upper()
        def as_int(val):
            try:
                return int(float(val))
            except Exception:
                return None
        questions = as_int(parts[1])
        time_val = as_int(parts[2]) if len(parts) > 2 else None
        marks_val = as_int(parts[3]) if len(parts) > 3 else None
        sections.append({"name": name, "questions": questions, "time": time_val, "marks": marks_val})
    return sections


def detect_question_table(rows: Sequence[Sequence[str]]) -> bool:
    if not rows:
        return False
    headers = [_normalize_key(h) for h in rows[0]]
    needed = {"question", "question_text", "question_number", "qno", "sno"}
    has_needed = any(h in needed for h in headers)
    has_answer = any("answer" in h for h in headers)
    return has_needed and has_answer


def parse_questions(tables: Sequence[ET.Element]) -> List[Dict[str, Any]]:
    questions: List[Dict[str, Any]] = []
    for tbl in tables:
        rows = _table_to_rows(tbl)
        if not detect_question_table(rows):
            continue
        headers = [_normalize_key(h) for h in rows[0]]
        for data_row in rows[1:]:
            row_map = {headers[i]: data_row[i] for i in range(min(len(headers), len(data_row)))}
            q_text = row_map.get("question_text") or row_map.get("question")
            if not q_text:
                continue
            section = (row_map.get("section") or "").upper() or "VARC"
            q_type = (row_map.get("type") or row_map.get("question_type") or "MCQ").upper()
            q_num_raw = row_map.get("question_number") or row_map.get("qno") or row_map.get("sno")
            try:
                q_number = int(float(q_num_raw)) if q_num_raw else len(questions) + 1
            except Exception:
                q_number = len(questions) + 1

            option_keys = [k for k in headers if re.match(r"option[a-d]", k)]
            options = [row_map.get(k) for k in option_keys if row_map.get(k)]
            if q_type == "MCQ" and not options:
                options = [row_map.get(k) for k in ["a", "b", "c", "d"] if row_map.get(k)]

            answer = row_map.get("answer") or row_map.get("correct_answer") or ""
            difficulty = row_map.get("difficulty") or None
            topic = row_map.get("topic") or None
            subtopic = row_map.get("subtopic") or None
            solution = row_map.get("solution") or row_map.get("solution_text") or None

            questions.append({
                "section": section or "VARC",
                "question_number": q_number,
                "question_text": q_text,
                "question_type": "TITA" if q_type == "TITA" else "MCQ",
                "options": options or None,
                "correct_answer": answer,
                "positive_marks": 3.0,
                "negative_marks": 0 if q_type == "TITA" else 1.0,
                "difficulty": difficulty,
                "topic": topic,
                "subtopic": subtopic,
                "solution_text": solution,
            })
    return questions


def build_json(meta: Dict[str, Any], questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    slug = meta.get("slug") or meta.get("paper_slug") or "cat-2024"
    title = meta.get("title") or meta.get("paper_title") or "CAT 2024"
    description = meta.get("description") or meta.get("desc")
    year_val = meta.get("year") or meta.get("exam_year") or datetime.now().year
    total_questions = meta.get("total_questions") or len(questions)
    total_marks = meta.get("total_marks") or None
    duration = meta.get("duration_minutes") or meta.get("duration") or 120

    sections = parse_sections(meta)
    if not sections and questions:
        counts: Dict[str, int] = {}
        for q in questions:
            sec = q.get("section", "VARC")
            counts[sec] = counts.get(sec, 0) + 1
        sections = [{"name": k, "questions": v, "time": None, "marks": None} for k, v in counts.items()]

    paper = {
        "slug": slug,
        "title": title,
        "description": description,
        "year": int(float(year_val)) if year_val else datetime.now().year,
        "total_questions": int(float(total_questions)) if total_questions else len(questions),
        "total_marks": int(float(total_marks)) if total_marks else None,
        "duration_minutes": int(float(duration)) if duration else 120,
        "sections": sections,
        "default_positive_marks": 3.0,
        "default_negative_marks": 1.0,
        "difficulty_level": meta.get("difficulty_level") or "cat-level",
        "is_free": True,
        "published": False,
        "available_from": None,
        "available_until": None,
    }

    return {"paper": paper, "questions": questions}


def convert_docx(docx_path: Path) -> Dict[str, Any]:
    with zipfile.ZipFile(docx_path, "r") as zf:
        with zf.open("word/document.xml") as f:
            xml_bytes = f.read()
    root = ET.fromstring(xml_bytes)
    tables = _iter_tables(root)
    if not tables:
        raise ValueError("DOCX contains no tables to parse")
    meta_rows = _table_to_rows(tables[0])
    meta = parse_meta(meta_rows)
    questions = parse_questions(tables[1:]) if len(tables) > 1 else []
    return build_json(meta, questions)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert CAT paper DOCX to JSON (stdlib)")
    parser.add_argument("--docx", required=True, help="Path to PAPER METADATA docx")
    parser.add_argument("--out", required=True, help="Where to write the JSON")
    args = parser.parse_args()

    docx_path = Path(args.docx)
    out_path = Path(args.out)

    data = convert_docx(docx_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"✅ JSON written to {out_path}")


if __name__ == "__main__":
    main()
