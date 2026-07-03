// @vitest-environment jsdom

import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import DbIcon from "./DbIcon.svelte";

describe("DbIcon", () => {
  it("renders a database server svg for a known connection type", () => {
    const { container } = render(DbIcon, {
      props: {
        type: "postgresql",
      },
    });

    const icon = container.querySelector('svg[data-db-icon="postgresql"]');

    expect(icon).not.toBeNull();
    expect(icon?.querySelector("path")?.getAttribute("d")).toBeTruthy();
    expect(container.textContent?.trim()).toBe("");
  });
});
