// @vitest-environment jsdom

import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import DatabaseNodeIcon from "./DatabaseNodeIcon.svelte";

describe("DatabaseNodeIcon", () => {
  it("renders the database tree node icon as svg", () => {
    const { container } = render(DatabaseNodeIcon);

    const icon = container.querySelector('svg[data-tree-icon="database"]');

    expect(icon).not.toBeNull();
    expect(icon?.querySelectorAll("path").length).toBeGreaterThan(0);
    expect(container.textContent?.trim()).toBe("");
  });
});
