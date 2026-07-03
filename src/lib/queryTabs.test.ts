import { describe, expect, it } from "vitest";
import {
  createQueryTab,
  getActiveQueryTab,
  getDefaultQueryText,
  getEditorModeForDatabase,
  updateQueryTabText,
} from "./queryTabs";

describe("query tabs", () => {
  it("maps database types to editor modes", () => {
    expect(getEditorModeForDatabase("postgresql")).toBe("sql");
    expect(getEditorModeForDatabase("mysql")).toBe("sql");
    expect(getEditorModeForDatabase("sqlite")).toBe("sql");
    expect(getEditorModeForDatabase("redis")).toBe("redis");
    expect(getEditorModeForDatabase("mongodb")).toBe("mongo");
  });

  it("creates tabs with default query text and clean state", () => {
    const tab = createQueryTab({
      id: "tab-mongo",
      connectionId: "connection-mongo",
      databaseType: "mongodb",
      title: "catalog.aggregate",
    });

    expect(tab.mode).toBe("mongo");
    expect(tab.text).toContain('"find": "collection"');
    expect(tab.isDirty).toBe(false);
  });

  it("returns the active tab or falls back to the first tab", () => {
    const first = createQueryTab({
      id: "tab-sql",
      connectionId: "connection-sql",
      databaseType: "postgresql",
      title: "users.sql",
    });
    const second = createQueryTab({
      id: "tab-redis",
      connectionId: "connection-redis",
      databaseType: "redis",
      title: "cache.redis",
    });

    expect(getActiveQueryTab([first, second], "tab-redis")).toBe(second);
    expect(getActiveQueryTab([first, second], "missing")).toBe(first);
  });

  it("updates tab text and marks only changed content as dirty", () => {
    const tab = createQueryTab({
      id: "tab-sql",
      connectionId: "connection-sql",
      databaseType: "postgresql",
      title: "users.sql",
    });

    const unchanged = updateQueryTabText(tab, tab.text);
    const changed = updateQueryTabText(tab, "select 1;");

    expect(unchanged.isDirty).toBe(false);
    expect(changed.text).toBe("select 1;");
    expect(changed.isDirty).toBe(true);
  });

  it("provides Redis command defaults", () => {
    expect(getDefaultQueryText("redis")).toBe("GET session:latest\nTTL session:latest");
  });
});
