# Quario CodeMirror Query Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static editor placeholder with a real CodeMirror editor and introduce tested query tab state helpers for SQL, Redis command, and Mongo JSON command tabs.

**Architecture:** Query tab behavior lives in plain TypeScript helpers so tab creation, active lookup, editor mode, dirty state, and content updates are tested outside Svelte. CodeMirror is wrapped in a focused Svelte component that owns the EditorView lifecycle and exposes a simple `value`/`mode`/`onChange` interface to the app shell.

**Tech Stack:** SvelteKit, TypeScript, Vitest, Testing Library Svelte, CodeMirror 6.

---

## Scope

Included:

- Query tab state model with tests
- CodeMirror editor mode mapping for SQL, Redis, MongoDB
- CodeMirror Svelte wrapper with a rendering test
- App shell wired to tab-specific editor content
- Browser verification that CodeMirror renders and tab switching updates content

Excluded:

- Query execution
- DB metadata autocomplete
- Saved query persistence
- Local storage
- Real connection creation

## Files

- Create: `src/lib/queryTabs.ts`
- Create: `src/lib/queryTabs.test.ts`
- Create: `src/lib/CodeEditor.svelte`
- Create: `src/lib/CodeEditor.test.ts`
- Modify: `src/routes/+page.svelte`
- Modify: `src/app.css`
- Modify: `package.json`
- Modify: `package-lock.json`

## Task 1: Install CodeMirror Dependencies

- [x] Run `npm install @codemirror/state @codemirror/view @codemirror/commands @codemirror/language @codemirror/lang-sql @codemirror/lang-json`.
- [x] Confirm dependencies are added to `package.json`.

## Task 2: Add Query Tab State Model

- [x] Write failing tests in `src/lib/queryTabs.test.ts` for default editor mode, default text, active tab lookup, and dirty state updates.
- [x] Run `npm test -- src/lib/queryTabs.test.ts` and verify RED.
- [x] Implement `src/lib/queryTabs.ts`.
- [x] Run `npm test -- src/lib/queryTabs.test.ts` and verify GREEN.

## Task 3: Add CodeMirror Wrapper

- [x] Write failing render test in `src/lib/CodeEditor.test.ts`.
- [x] Run `npm test -- src/lib/CodeEditor.test.ts` and verify RED.
- [x] Implement `src/lib/CodeEditor.svelte`.
- [x] Run `npm test -- src/lib/CodeEditor.test.ts` and verify GREEN.

## Task 4: Wire Editor Into App Shell

- [x] Import query tab helpers and `CodeEditor` in `src/routes/+page.svelte`.
- [x] Replace static `<pre class="editor-surface">` with `<CodeEditor>`.
- [x] Store tabs in Svelte state so editor changes update the active tab text.
- [x] Mark edited tabs as dirty and display a small dirty indicator in the tab title.
- [x] Keep connection color accents in tabs and editor.
- [x] Update `src/app.css` so CodeMirror fills the editor body without layout shift.

## Task 5: Verify

- [x] Run `npm run check`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Verify in browser that `.cm-editor` exists.
- [x] Verify clicking Mongo/Redis tabs changes editor content.
- [x] Verify typing in the editor marks the active tab dirty.

## Self-Review Notes

- This plan implements editor state and rendering only.
- Query execution remains a later slice.
- DB autocomplete remains a later slice after metadata adapters exist.
