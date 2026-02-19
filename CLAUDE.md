# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — TypeScript check (`tsc -b`) then Vite production build
- `npm run preview` — Serve production build locally

No test runner or linter is configured.

## Tech Stack

React 19, TypeScript ~5.9, Vite 7, Tailwind CSS v4 (via `@tailwindcss/vite` plugin), Zustand 5 for state, Recharts 3 for charts. No routing — single-page app.

## Architecture

**State management:** A single Zustand store in `src/hooks/useCalculator.ts` holds all app state: the scenario (investment amount, exit price, time horizon), up to 5 offers, and derived results/sensitivity data. State is persisted to localStorage. Every mutation to scenario or offers triggers a synchronous recomputation of all results.

**Calculation engine (`src/lib/`):**
- `calculations.ts` — Core fee/return computation. Uses a European waterfall model: return of capital → preferred return (hurdle) → catch-up → carry. Computes management fees annually (on committed, invested, or NAV basis), admin fees, placement fees, and setup fees. Finds break-even exit price via binary search.
- `irr.ts` — Newton-Raphson IRR solver with bisection fallback.
- `sensitivity.ts` — Generates exit-price sensitivity curves across all offers.
- `validation.ts` / `formatting.ts` — Input validation and number formatting utilities.
- `defaults.ts` — Default scenario/offer values and offer color cycling.

**Types:** All domain types are in `src/types/index.ts` — `Scenario`, `Offer`, `CalculationResult`, `FeeBreakdown`, `SensitivityPoint`.

**Components (`src/components/`):**
- `ScenarioInputs` — Global scenario parameters
- `OfferCard` — Per-offer fee configuration with collapsible advanced settings
- `ComparisonTable` — Side-by-side results table
- `FeeBreakdownChart` / `SensitivityChart` — Recharts visualizations
- `NumberInput` — Reusable numeric input with validation
- `HurdleTierEditor` — Tiered hurdle rate configuration
- `Tooltip` — Info tooltip component

## Key Patterns

- Recharts tooltip formatters must use explicit type annotations (not generic callback types) to satisfy strict TypeScript. See commit `1f67997` for the pattern.
- Offer colors are assigned sequentially from a fixed palette in `defaults.ts`; `resetColorIndex` keeps colors consistent after rehydration from localStorage.
