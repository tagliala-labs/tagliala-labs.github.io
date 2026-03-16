---
title: "Titan Vision Captioning Loop"
date: "2026-03-08"
status: "paused"
tags: ["vision", "multimodal", "fine-tuning"]
summary: "Explored image-to-caption self-critique loops for synthetic dataset quality improvement."
---
## Objective
Use iterative critique prompts to improve descriptive quality of auto-generated image captions.

## Setup
- 12k image sample from internal creative datasets.
- Caption model with critique-refine loop limited to 2 turns.
- Quality judged by rubric and human spot checks.

## Findings
Fluency improved, but factual grounding degraded on crowded scenes. Precision remains below release threshold.

## Why Paused
Current loop amplifies subtle visual misreads. The team is collecting higher-quality alignment labels before resuming.
