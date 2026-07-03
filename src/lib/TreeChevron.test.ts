// @vitest-environment jsdom

import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TreeChevron from "./TreeChevron.svelte";

describe("TreeChevron", () => {
  it("renders a fixed svg chevron with expanded state styling", () => {
    const { container } = render(TreeChevron, {
      props: {
        expanded: true,
      },
    });

    const wrapper = container.querySelector(".tree-chevron.expanded");
    const icon = wrapper?.querySelector("svg");

    expect(wrapper).not.toBeNull();
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(container.textContent?.trim()).toBe("");
  });
});
