<script lang="ts">
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
  import { json } from "@codemirror/lang-json";
  import { sql } from "@codemirror/lang-sql";
  import {
    defaultHighlightStyle,
    foldGutter,
    foldKeymap,
    syntaxHighlighting,
  } from "@codemirror/language";
  import { Compartment, EditorState, type Extension } from "@codemirror/state";
  import { EditorView, keymap, lineNumbers } from "@codemirror/view";
  import { onDestroy, onMount } from "svelte";
  import type { QueryEditorMode } from "./queryTabs";

  type Props = {
    value: string;
    mode: QueryEditorMode;
    activeAccent?: string;
    ariaLabel?: string;
    onChange?: (value: string) => void;
  };

  let {
    value,
    mode,
    activeAccent = "#95c8f3",
    ariaLabel = "Query editor",
    onChange,
  }: Props = $props();

  let host: HTMLDivElement;
  let view: EditorView | undefined;

  const languageCompartment = new Compartment();

  function languageExtension(nextMode: QueryEditorMode): Extension {
    if (nextMode === "mongo") {
      return json();
    }

    if (nextMode === "sql") {
      return sql();
    }

    return [];
  }

  function createExtensions(initialMode: QueryEditorMode): Extension[] {
    return [
      lineNumbers(),
      foldGutter(),
      history(),
      syntaxHighlighting(defaultHighlightStyle),
      keymap.of([...defaultKeymap, ...historyKeymap, ...foldKeymap]),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({
        "aria-label": ariaLabel,
      }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChange?.(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        "&": {
          height: "100%",
          background: "transparent",
        },
        ".cm-scroller": {
          fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
          fontSize: "13px",
          lineHeight: "1.6",
        },
        ".cm-content": {
          padding: "0",
          minHeight: "100%",
        },
        ".cm-gutters": {
          background: "transparent",
          borderRight: "1px solid var(--border)",
          color: "var(--text-muted)",
        },
        ".cm-activeLineGutter": {
          background: "color-mix(in srgb, var(--active-accent) 16%, transparent)",
        },
        ".cm-activeLine": {
          background: "color-mix(in srgb, var(--active-accent) 10%, transparent)",
        },
        ".cm-cursor": {
          borderLeftColor: "var(--active-accent)",
        },
        ".cm-selectionBackground": {
          background: "color-mix(in srgb, var(--active-accent) 28%, transparent) !important",
        },
      }),
      languageCompartment.of(languageExtension(initialMode)),
    ];
  }

  onMount(() => {
    view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: value,
        extensions: createExtensions(mode),
      }),
    });
  });

  $effect(() => {
    if (!view) {
      return;
    }

    const currentValue = view.state.doc.toString();
    if (value !== currentValue) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: value,
        },
      });
    }
  });

  $effect(() => {
    if (!view) {
      return;
    }

    view.dispatch({
      effects: languageCompartment.reconfigure(languageExtension(mode)),
    });
  });

  onDestroy(() => {
    view?.destroy();
  });
</script>

<div
  class="code-editor"
  style={`--editor-accent: ${activeAccent};`}
  bind:this={host}
></div>
