// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
  clampPaneSize,
  getAdjacentPaneSizesFromHandle,
  resizeVerticalStack,
} from "./resizablePanes";

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

  it("reads the rendered adjacent pane heights from a splitter handle", () => {
    const before = document.createElement("section");
    const handle = document.createElement("button");
    const after = document.createElement("section");

    before.getBoundingClientRect = () => ({ height: 312 }) as DOMRect;
    after.getBoundingClientRect = () => ({ height: 148 }) as DOMRect;

    document.body.append(before, handle, after);

    expect(getAdjacentPaneSizesFromHandle(handle)).toEqual({
      before: 312,
      after: 148,
    });
  });
});
