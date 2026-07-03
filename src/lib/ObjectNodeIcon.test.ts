// @vitest-environment jsdom

import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import ObjectNodeIcon from "./ObjectNodeIcon.svelte";

describe("ObjectNodeIcon", () => {
  it("renders the leaf object icon as svg", () => {
    const { container } = render(ObjectNodeIcon);

    const icon = container.querySelector('svg[data-tree-icon="object"]');

    expect(icon).not.toBeNull();
    expect(icon?.querySelectorAll("path").length).toBeGreaterThan(0);
    expect(container.textContent?.trim()).toBe("");
  });
});
