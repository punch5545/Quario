import { describe, expect, it } from "vitest";
import { clampPaneSize, resizeVerticalStack } from "./resizablePanes";

describe("resizable panes", () => {
  it("clamps a pane size between min and max", () => {
    expect(clampPaneSize(80, 160, 500)).toBe(160);
    expect(clampPaneSize(640, 160, 500)).toBe(500);
    expect(clampPaneSize(320, 160, 500)).toBe(320);
  });

  it("resizes adjacent vertical panes while preserving total size", () => {
    const result = resizeVerticalStack({
      before: 360,
      after: 260,
      delta: 80,
      minBefore: 180,
      minAfter: 140,
    });

    expect(result.before).toBe(440);
    expect(result.after).toBe(180);
  });

  it("respects adjacent pane minimum size", () => {
    const result = resizeVerticalStack({
      before: 360,
      after: 180,
      delta: 100,
      minBefore: 180,
      minAfter: 140,
    });

    expect(result.before).toBe(400);
    expect(result.after).toBe(140);
  });
});
