import { describe, expect, it } from "vitest";
import {
  createExplorerExpansionState,
  createExplorerNodeId,
  isExplorerNodeExpanded,
  toggleExplorerNode,
} from "./explorerTree";

describe("explorer tree state", () => {
  it("creates expanded state for provided node ids", () => {
    const state = createExplorerExpansionState(["connection-a", "connection-b"]);

    expect(isExplorerNodeExpanded(state, "connection-a")).toBe(true);
    expect(isExplorerNodeExpanded(state, "connection-b")).toBe(true);
    expect(isExplorerNodeExpanded(state, "missing")).toBe(false);
  });

  it("toggles a node between expanded and collapsed", () => {
    const expandedState = createExplorerExpansionState(["connection-a"]);
    const collapsedState = toggleExplorerNode(expandedState, "connection-a");
    const reexpandedState = toggleExplorerNode(collapsedState, "connection-a");

    expect(isExplorerNodeExpanded(collapsedState, "connection-a")).toBe(false);
    expect(isExplorerNodeExpanded(reexpandedState, "connection-a")).toBe(true);
  });

  it("creates stable nested node ids", () => {
    expect(createExplorerNodeId("connection-a", "database", "nsp_ai")).toBe(
      "connection-a:database:nsp_ai",
    );
    expect(createExplorerNodeId("connection-a", "schema", "nsp_ai", "public")).toBe(
      "connection-a:schema:nsp_ai:public",
    );
    expect(createExplorerNodeId("connection-a", "object", "nsp_ai", "public", "users")).toBe(
      "connection-a:object:nsp_ai:public:users",
    );
  });
});
