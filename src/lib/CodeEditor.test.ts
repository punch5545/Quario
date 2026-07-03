// @vitest-environment jsdom

import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import CodeEditor from "./CodeEditor.svelte";

describe("CodeEditor", () => {
  it("renders a CodeMirror editor with the initial document", () => {
    const { container } = render(CodeEditor, {
      props: {
        value: "select 1;",
        mode: "sql",
        activeAccent: "#8ddfbd",
        ariaLabel: "Query editor",
      },
    });

    expect(container.querySelector(".cm-editor")).not.toBeNull();
    expect(container.textContent).toContain("select 1;");
  });

  it("shows line numbers and fold controls", () => {
    const { container } = render(CodeEditor, {
      props: {
        value: '{\n  "filter": {\n    "active": true\n  }\n}',
        mode: "mongo",
        activeAccent: "#8ddfbd",
        ariaLabel: "Mongo script editor",
      },
    });

    expect(container.querySelector(".cm-lineNumbers")).not.toBeNull();
    expect(container.querySelector(".cm-foldGutter")).not.toBeNull();
  });
});
