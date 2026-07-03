# Quario App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first runnable Quario desktop app slice: Tauri v2 + SvelteKit, the resizable five-region shell, Light/Dark theme, and connection environment/color profile model.

**Architecture:** SvelteKit owns the app shell, layout state, and theme state. Plain TypeScript modules own connection profile types and resize calculations so they can be unit-tested before UI wiring. Tauri owns the desktop shell and will host backend DB capabilities in later milestones.

**Tech Stack:** Tauri v2, Rust, SvelteKit, TypeScript, Vite, Vitest.

---

## Scope

This plan implements the first vertical slice only.

Included:

- Tauri v2 SvelteKit TypeScript scaffold
- App shell layout matching the feature spec
- Resizable Connection Tree, Editor, Result, and Console regions
- Light/Dark theme toggle
- Connection environment and pastel color palette model
- Sample connection tree and tabs using connection color accents
- Unit tests for the profile model and pane sizing

Excluded from this milestone:

- Real DB drivers
- Real SSH tunneling
- CodeMirror package integration
- Query execution
- Persistent local storage
- OS Keychain integration

## Implemented Files

- `package.json`: npm scripts and frontend dependencies.
- `src/routes/+layout.svelte`: global CSS import and SvelteKit layout wrapper.
- `src/routes/+layout.ts`: SPA mode for Tauri.
- `src/routes/+page.svelte`: app shell composition and demo state.
- `src/app.css`: global reset, theme tokens, layout, splitters, tree, tabs, editor/result/console styles.
- `src/app.html`: app document title.
- `src/lib/connectionProfile.ts`: connection profile types, environment options, pastel palette, profile factory.
- `src/lib/connectionProfile.test.ts`: Vitest tests for profile defaults, custom environment behavior, palette size.
- `src/lib/resizablePanes.ts`: pane sizing helpers.
- `src/lib/resizablePanes.test.ts`: Vitest tests for clamped pane sizing.
- `src-tauri/*`: generated Tauri v2 shell files.

## Task 1: Scaffold Tauri/SvelteKit App

- [x] Run `npm create tauri-app@latest . -- --template svelte-ts --manager npm --tauri-version 2 --identifier app.quario.desktop --yes --force`.
- [x] Run `npm install`.
- [x] Install test dependencies with `npm install -D vitest @testing-library/svelte @testing-library/jest-dom jsdom`.
- [x] Add `test` and `test:watch` scripts.
- [x] Rename package to `quario`.

## Task 2: Add Connection Profile Model With Tests

- [x] Write failing tests in `src/lib/connectionProfile.test.ts`.
- [x] Verify RED with `npm test -- src/lib/connectionProfile.test.ts`.
- [x] Implement `src/lib/connectionProfile.ts`.
- [x] Verify GREEN with `npm test -- src/lib/connectionProfile.test.ts`.

## Task 3: Add Resizable Pane Helper With Tests

- [x] Write failing tests in `src/lib/resizablePanes.test.ts`.
- [x] Verify RED with `npm test -- src/lib/resizablePanes.test.ts`.
- [x] Implement `src/lib/resizablePanes.ts`.
- [x] Verify GREEN with `npm test -- src/lib/resizablePanes.test.ts`.

## Task 4: Build Resizable App Shell

- [x] Replace starter page with `src/routes/+page.svelte` app shell.
- [x] Add `src/routes/+layout.svelte` to import global CSS.
- [x] Add `src/app.css` with Light/Dark theme tokens, shell layout, panes, tree, tabs, splitters, result grid, and console styles.
- [x] Use connection accent colors in tree nodes and tabs.
- [x] Keep wireframe colors out of production CSS.
- [x] Implement pointer-driven splitter resizing.
- [x] Update app title to `Quario`.

## Task 5: Verify App Foundation

- [x] Run `npm run check`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Open `http://127.0.0.1:1420/` in the in-app browser.
- [x] Verify five regions render.
- [x] Verify theme toggle changes app theme.
- [x] Verify vertical and horizontal splitters resize panes.
- [ ] Run `cargo check --manifest-path src-tauri/Cargo.toml`.

## Current Blocker

Rust is not installed or not available in PATH in the current environment, so Tauri/Rust verification is blocked until `rustc` and `cargo` are available.
