---
title: "DocCompass: Local-First Document Search Agent"
date: 2026-03-21
description: "Semantic local document search system with lazy indexing, Ollama-powered query planning, fallback heuristics, and scored ranked results."
tags: ["python", "llm", "search", "information-retrieval", "ollama", "rag"]
---

## Overview

DocCompass is a local-first document discovery system built to find personal files by meaning, not only by filename. It is designed for natural requests like:

- "my marksheets"
- "visa related documents"
- "intro to psychology notes"

The project searches local directories, extracts text from multiple file formats, builds a reusable index, creates a structured query plan, and ranks results by relevance with transparent scoring.

Repository: [github.com/singhaditya8499/DocCompass](https://github.com/singhaditya8499/DocCompass)

## Problem Statement

Traditional local file search is often fragile because it depends heavily on exact filenames and folder memory. In real usage, users usually remember intent and partial context, not exact paths. DocCompass addresses this by combining:

- content extraction across heterogeneous file types
- semantic query planning with local LLM support
- weighted ranking tuned for natural document retrieval
- robust fallback behavior when LLM infrastructure is unavailable

## Core Capabilities

- Semantic-style document retrieval from local machine folders.
- Automatic lazy indexing on first query (no mandatory startup indexing step).
- Multi-format extraction support:
  - PDF (`pypdf`, `pdftotext`, printable fallback)
  - DOCX (XML extraction from `word/document.xml`)
  - DOC (`antiword` fallback path)
  - TXT/MD/JSON/YAML/XML and many text/code formats
- Structured query planning using local Ollama model (`qwen3-vl:4b`).
- Fallback local query planning for resilience during model outages/timeouts.
- Intent-aware ranking (`natural_document`, `code`, `mixed`) with extension-aware filtering.
- IDF-weighted scoring (rarer terms receive higher impact).
- Top-k result retrieval with concise output (`path | score`).
- Web chat interface and CLI entry points sharing one engine/index.

## Architecture

### 1) Search Engine (`system_search_agent.py`)

Main responsibilities:

- root discovery and recursive file walk
- extension-aware text extraction
- index build/update and cache reuse via mtime/size checks
- Ollama and fallback query planning
- scoring, ranking, filtering, and formatting

Key implementation choices:

- Runtime index file: `.system_doc_index.jsonl`
- Logs: `agent.log`
- Maximum extracted text cap: `MAX_TEXT_CHARS`
- Domain term expansions for targeted intents (e.g., visa/immigration terms)
- Cooldown after Ollama failures to prevent repeated long blocking calls

### 2) UI API Server (`ui_server.py`)

Provides a browser-accessible chat layer and endpoints:

- `GET /api/status` for environment and initialization state
- `POST /api/chat` for search requests and formatted responses
- `POST /api/reset` for clearing session chat history

### 3) Web Client (`ui.html`)

A lightweight HTML/CSS/JS chat interface that:

- sends query text and rebuild flags
- renders ranked results in a human-friendly format
- enables quick interactive search without command-line usage

## End-to-End Search Flow

1. User submits a query from CLI or web UI.
2. System verifies whether index is available and fresh.
3. Missing/stale index triggers build or incremental update.
4. Query planner attempts Ollama-based structured planning.
5. If Ollama fails (timeout/network/parse), local planner is used automatically.
6. Candidate documents are filtered through core-term gate rules.
7. Weighted relevance score is computed per candidate.
8. Results are sorted descending by score and returned as top-k list.

## Ranking and Relevance Design

DocCompass uses a transparent weighted formula where:

- Core terms have stronger importance than related terms.
- Content and path/filename hits are scored separately.
- IDF weighting emphasizes rarer, more discriminative terms.
- Document type preferences boost likely natural-document formats.
- Intent-aware filtering removes noisy file classes for `natural_document` queries.

Scoring characteristics:

- Score is a relative ranking metric within a query.
- It is not a probability/confidence percentage.
- Higher score indicates stronger intent-document alignment.

## Reliability and Safety Considerations

- Graceful model-failure fallback keeps search functional without Ollama.
- Runtime logs improve observability for indexing/search issues.
- Sensitive runtime artifacts are protected in `.gitignore`:
  - `.system_doc_index.jsonl`
  - `.system_doc_index*.jsonl`
  - `agent.log`
  - `*.log`
- Emphasis on local-first architecture reduces external data exposure.

## Tech Stack

- Python 3.10+
- Ollama (`qwen3-vl:4b`) for local LLM query planning
- `urllib` for model HTTP integration
- `http.server` for lightweight API hosting
- Plain HTML/CSS/JS frontend
- JSONL for persistent index storage
- Optional extraction tooling:
  - `pypdf`
  - `pdftotext` (Poppler)
  - `antiword`

## Why This Project Matters

This project demonstrates practical applied IR + LLM systems engineering with clear product value:

- converts ambiguous natural language intent into actionable local retrieval
- balances intelligence and reliability through deterministic fallbacks
- avoids over-complex infrastructure while still supporting semantic behavior
- keeps developer ergonomics high with both CLI and web UI access

## Setup and Usage

### Quick start

```bash
cd /Users/adityasingh/Documents/Projects/DocumentSearchAgent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
ollama serve
ollama pull qwen3-vl:4b
python3 ui_server.py
```

Open `http://127.0.0.1:8787`.

### CLI usage examples

```bash
python3 system_search_agent.py query "my marksheets"
python3 system_search_agent.py query "visa related documents" --top-k 20
python3 system_search_agent.py query "visa related documents" --rebuild
python3 system_search_agent.py stats
```

## Future Enhancements

- OCR for scanned-image PDFs.
- Embedding-based semantic retrieval layer.
- Hybrid retrieval (keyword + vector + reranking).
- Smarter domain expansion configuration and per-user tuning.
- Optional secure local metadata dashboard for search analytics.

