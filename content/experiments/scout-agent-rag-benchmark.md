---
title: "Scout Agent RAG Benchmark"
date: "2026-03-12"
status: "active"
tags: ["rag", "agent", "evaluation"]
summary: "Compared retrieval grounding strategies under strict response-time limits for production support flows."
---
## Objective
Stress test retrieval-augmented generation for an incident assistant where response latency must stay below 1.2 seconds.

## Setup
- 24k curated operational records.
- Two embedding families and three chunking strategies.
- Agent planner constrained to 3 retrieval hops.

## Findings
The hybrid chunking strategy improved faithfulness by **14%** while keeping average latency at *1.06s*.

## Next Step
Run the same benchmark with multilingual queries and stricter hallucination penalties.
