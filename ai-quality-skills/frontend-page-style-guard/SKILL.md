---
name: frontend-page-style-guard
description: Use when creating or updating frontend pages in this repo. Enforces the project's page-style guardrails: moderate corner radii, restrained card shapes, no oversized pill-like containers, and a check that new page layouts follow the repo's preferred visual density before finishing the task.
---

# Frontend Page Style Guard

Use this skill whenever you create or significantly update a frontend page in this repository.

## Goals

- Keep page visuals clean, modern, and readable.
- Avoid oversized rounded corners that make panels look inflated.
- Preserve a denser, more product-like admin feel instead of a toy-like landing-page feel.

## Mandatory Check

Before finishing a frontend page task, review the page and normalize radii:

- Large outer panels should usually stay in the `14-20px` range.
- Inner cards and information blocks should usually stay in the `10-16px` range.
- Buttons and inputs should usually stay in the `8-14px` range.
- Avoid `xl`/very pill-like radii by default unless the existing page clearly depends on that shape.

## Apply On Every Page Update

When you touch a page:

1. Inspect the page's main containers, cards, inputs, buttons, badges, and floating panels.
2. Reduce excessive radii first before adding more decoration.
3. Keep spacing and hierarchy stronger than corner styling.
4. If a page uses a bold visual theme, keep it intentional but still avoid oversized rounded corners.

## Repo-Specific Guidance

- For login, dashboard, settings, and management pages, prefer sharper admin-style geometry over soft landing-page bubbles.
- When using translucent or glass effects, keep corners moderate so transparency feels structured.
- If a page introduces a new visual direction, quickly sanity-check that it still matches the system's operational-product feel.

## Final Pass

Before you finish, explicitly check:

- Are the outermost containers too rounded?
- Do badges, buttons, and fields look more inflated than functional?
- Would reducing radius improve clarity without hurting friendliness?

If yes, reduce the radius before finalizing.
