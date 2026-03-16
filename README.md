# Tagliala Labs

Static GitHub Pages website for publishing AI experiments in a cinematic Attack on Titan-inspired visual style.

## Site Structure

- index.html: Home page with mission, featured logs, and manifesto.
- experiments/index.html: Archive page with filter and sort controls.
- experiment.html: Single experiment detail page.
- assets/css/style.css: Theme system, responsive layout, and motion.
- assets/js/main.js: Page reveal and shared card template helpers.
- assets/js/experiments.js: Markdown loading, frontmatter parsing, archive/detail rendering.
- content/experiments/index.json: Registry of experiment markdown files.
- content/experiments/*.md: Experiment source records.
- 404.html: Custom not-found route.

## Publish a New Experiment

1. Create a new markdown file under content/experiments/.
2. Add frontmatter keys:

```md
---
title: "My Experiment Title"
date: "2026-03-16"
status: "active"
tags: ["agents", "evaluation"]
summary: "One sentence summary for cards and previews."
---
## Objective
Describe the goal.

## Setup
- Include important environment details.

## Findings
Write the observed outcomes.

## Next Step
Document the next hypothesis.
```

3. Add an entry to content/experiments/index.json:

```json
{
  "slug": "my-experiment-title",
  "file": "my-experiment-title.md"
}
```

The slug is used in links like /experiment.html?slug=my-experiment-title.

## GitHub Pages Setup (Organization Root Site)

1. Ensure this repository name is exactly tagliala-labs.github.io for organization-root hosting.
2. Push the default branch to GitHub.
3. In GitHub repository settings:
   - Open Pages.
   - Set Source to Deploy from a branch.
   - Choose the default branch and root folder (/).
4. Save and wait for build completion.

Site URL will be:
https://tagliala-labs.github.io/

## Local Preview

From repository root, run any local static server. Example:

python3 -m http.server 8080

Then open:
http://localhost:8080/

## Accessibility and Motion

- Animations are disabled automatically for users with reduced-motion preference.
- Controls and links are keyboard accessible.
- Contrast targets are designed for dark atmospheric backgrounds.
