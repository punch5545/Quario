// @vitest-environment jsdom

import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import SchemaNodeIcon from "./SchemaNodeIcon.svelte";

describe("SchemaNodeIcon", () => {
  it("renders the schema tree node icon as svg", () => {
    const { container } = render(SchemaNodeIcon);

    const icon = container.querySelector('svg[data-tree-icon="schema"]');

    expect(icon).not.toBeNull();
    expect(icon?.querySelectorAll("path").length).toBeGreaterThan(0);
    expect(container.textContent?.trim()).toBe("");
  });
});
