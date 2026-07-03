import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/app.css", "utf8");

function cssBlock(selector: string): string {
  const match = new RegExp(`${selector.replace(".", "\\.")}\\s*{([^}]*)}`).exec(css);

  return match?.[1] ?? "";
}

describe("connection tree CSS layout", () => {
  it("keeps chevron columns narrow and uses row margin for tree depth", () => {
    expect(css).toContain("--tree-chevron-column: 16px");
    expect(css).toMatch(
      /\.tree-row\s*{[\s\S]*margin-left:\s*var\(--tree-row-indent,\s*0px\)/,
    );
    expect(css).toMatch(
      /\.tree-row\s*{[\s\S]*width:\s*calc\(100%\s*-\s*var\(--tree-row-indent,\s*0px\)\)/,
    );

    expect(css).toMatch(
      /\.connection-title\s*{[\s\S]*grid-template-columns:\s*var\(--tree-chevron-column\)\s+20px\s+minmax\(0,\s*1fr\)\s+auto/,
    );
    expect(css).not.toContain(".connection-title > span:last-child");
    expect(css).toMatch(
      /\.database-title\s*{[\s\S]*--tree-row-indent:\s*0px/,
    );
    expect(css).toMatch(
      /\.database-title\s*{[\s\S]*grid-template-columns:\s*var\(--tree-chevron-column\)\s+18px\s+minmax\(0,\s*1fr\)\s+auto/,
    );
    expect(css).toMatch(
      /\.schema-title\s*{[\s\S]*--tree-row-indent:\s*20px/,
    );
    expect(css).toMatch(
      /\.object-item\s*{[\s\S]*--tree-row-indent:\s*40px/,
    );
  });

  it("uses a compact desktop-client font scale", () => {
    expect(css).toMatch(/\.app-shell\s*{[\s\S]*font-size:\s*13px/);
    expect(css).toMatch(/h1\s*{[\s\S]*font-size:\s*18px/);
    expect(css).toMatch(/\.code-editor \.cm-scroller\s*{[\s\S]*font-size:\s*12px/);
  });

  it("uses half-font vertical padding instead of fixed tree row heights", () => {
    expect(cssBlock(".tree-row")).toContain("padding-block: 0.3em");

    for (const selector of [".connection-title", ".database-title", ".schema-title", ".object-item"]) {
      expect(cssBlock(selector)).not.toContain("min-height");
    }
  });

  it("renders tabs without gaps or rounded corners", () => {
    expect(cssBlock(".tab-strip")).toContain("gap: 0");
    expect(cssBlock(".tab")).not.toContain("gap:");
    expect(cssBlock(".tab")).not.toContain("border-radius");
  });

  it("keeps the console pane on its explicit height and lets result absorb remaining space", () => {
    expect(css).toMatch(/\.result-pane\s*{[\s\S]*flex:\s*1 1 var\(--result-height\)/);
    expect(css).toMatch(/\.console-pane\s*{[\s\S]*flex:\s*0 0 var\(--console-height\)/);
  });
});
