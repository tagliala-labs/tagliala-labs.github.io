---
title: "Wallwatch Automation Audit"
date: "2026-02-27"
status: "archived"
tags: ["automation", "ops", "observability"]
summary: "Measured LLM-driven runbook automation across incident categories and rollback confidence."
---
## Objective
Assess whether agentic runbook execution can reduce on-call handling time without increasing operational risk.

## Setup
- 9 incident archetypes with deterministic replay fixtures.
- Mandatory rollback plan generation before any action.
- Human approval in shadow mode.

## Findings
Time-to-diagnosis dropped by **21%** in repetitive incidents, but high-variance incidents required too much human correction.

## Outcome
Archived as a reference architecture. Revisit after introducing stronger policy validation before action execution.
