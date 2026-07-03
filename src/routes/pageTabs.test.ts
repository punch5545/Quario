import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("src/routes/+page.svelte", "utf8");

describe("page query tabs", () => {
  it("uses only selected object names as tab labels", () => {
    expect(page).toContain('title: "users"');
    expect(page).toContain('title: "products"');
    expect(page).toContain('title: "session:*"');
    expect(page).not.toContain('title: "users.sql"');
    expect(page).not.toContain('title: "catalog.aggregate"');
    expect(page).not.toContain('title: "cache.redis"');
  });

  it("does not render connection environment metadata inside query tabs", () => {
    const tabStrip = page.match(/<nav class="tab-strip"[\s\S]*?<\/nav>/)?.[0] ?? "";

    expect(tabStrip).not.toContain("<small>");
    expect(tabStrip).not.toContain("formatEnvironment(connection)");
  });
});
