---
title: "Dialectic: Two-LLM Debate Studio"
date: 2026-03-30
description: "Debate-first AI system where two models argue opposite sides with evidence anchors, live streaming transcript, and structured high-fidelity summaries."
projectType: "Project"
tags: ["llm", "prompt-engineering", "nodejs", "sse", "reasoning", "ai"]
---

Dialectic is an adversarial reasoning application built to improve decision quality on complex questions by forcing two AI agents to debate opposing sides instead of generating a single one-shot answer.

GitHub: [github.com/singhaditya8499/Dialectic](https://github.com/singhaditya8499/Dialectic)

## What We Built

We built a complete end-to-end debate platform with:

- Two-agent structured debate loop (`for` vs `against`, or `A vs B`)
- Provider-agnostic model layer supporting OpenAI, Anthropic, and Ollama
- Live streamed debate transcript over SSE for real-time UX
- Evidence-anchored turn schema (facts, figure/date, source, reliability)
- Structured summary pipeline that preserves major claims and evidence ledger
- Local debate archive with reload support from the UI
- Browser-compatible mode for GitHub Pages deployments

## Product and Technical Design

### Core architecture

- `src/server.js`: HTTP API, SSE stream endpoint, static asset serving, persistence APIs
- `src/debateEngine.js`: debate orchestration, turn normalization/validation, summary generation
- `src/providers.js`: common completion abstraction across providers
- `public/*`: setup form, transcript renderer, summary view, saved debate browser

### Debate lifecycle

1. User submits question, side models, and round budget.
2. Engine alternates turns between both sides.
3. Each turn is validated for stance, rebuttal quality, novelty, and evidence quality.
4. Streaming events update UI in real time (`thinking`, `turn`, `summary`, `complete`).
5. Final structured summary and debate artifact can be saved locally.

## Quality and Alignment Guardrails

Dialectic focuses on controlled generation rather than raw free-form output:

- Schema-constrained JSON outputs for machine-checkable turn structure
- Role conditioning and stance locking to avoid side drift
- Novelty gating to reduce repetitive arguments and stale citations
- Evidence requirements to push concrete claims and stronger attribution
- Early-stop and rewrite-budget controls for robust debate termination

These controls created significantly better transcript quality than unconstrained free-form prompting in early iterations.

## What We Learned

### 1) Structured output is non-negotiable for reliability

Requiring JSON schemas for turns and summaries made downstream rendering, filtering, and analytics dramatically more stable than parsing plain text.

### 2) Multi-agent systems need strong coordination policies

Without stance locks, novelty checks, and counter-target requirements, debates quickly collapse into repetitive generic prose. Explicit control policies are essential.

### 3) “Evidence-like” output still needs verification strategy

Even with evidence slots and reliability fields, model-provided references are not guaranteed truth. We learned to treat this as evidence-structured reasoning, not factual proof.

### 4) UX quality depends on streaming feedback

SSE-based incremental updates and per-side thinking states make the product feel interactive and understandable, especially for longer debates.

### 5) Portability matters early

Supporting both server-backed mode and browser-hosted mode (GitHub Pages path) forced cleaner boundaries between orchestration logic and rendering, which improved maintainability.

## Engineering Tradeoffs

- Chosen: lexical/heuristic novelty checks for speed and simplicity
- Deferred: retrieval-backed citation verification and judge-model scoring
- Chosen: local JSON storage for fast iteration
- Deferred: database-backed multi-user collaboration and auth

## Outcomes

- Built a reusable debate engine that supports multiple providers and model combinations.
- Produced richer, more inspectable outputs than one-model single-response flows.
- Established a strong foundation for future retrieval-verified, judge-scored debate workflows.

