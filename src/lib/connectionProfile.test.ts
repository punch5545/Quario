import { describe, expect, it } from "vitest";
import {
  CONNECTION_ENVIRONMENTS,
  CONNECTION_PALETTE,
  createConnectionProfile,
  getConnectionColor,
} from "./connectionProfile";

describe("connection profile model", () => {
  it("uses local environment and first palette color by default", () => {
    const profile = createConnectionProfile({
      name: "Local Postgres",
      type: "postgresql",
    });

    expect(profile.environment.kind).toBe("local");
    expect(profile.colorId).toBe(CONNECTION_PALETTE[0].id);
    expect(getConnectionColor(profile.colorId).id).toBe(CONNECTION_PALETTE[0].id);
  });

  it("supports custom environment labels", () => {
    const profile = createConnectionProfile({
      name: "Client Sandbox",
      type: "mongodb",
      environment: {
        kind: "custom",
        label: "client-a",
      },
    });

    expect(profile.environment.kind).toBe("custom");
    expect(profile.environment).toEqual({
      kind: "custom",
      label: "client-a",
    });
  });

  it("exposes the fixed MVP environment options and ten pastel colors", () => {
    expect(CONNECTION_ENVIRONMENTS).toEqual([
      "local",
      "develop",
      "staging",
      "production",
      "custom",
    ]);
    expect(CONNECTION_PALETTE).toHaveLength(10);
  });
});
