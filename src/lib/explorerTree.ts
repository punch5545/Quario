export type ExplorerExpansionState = Record<string, boolean>;
export type ExplorerNodeKind = "connection" | "database" | "schema" | "object";

export function createExplorerNodeId(
  connectionId: string,
  kind: Exclude<ExplorerNodeKind, "connection">,
  ...pathSegments: [string, ...string[]]
): string {
  return [connectionId, kind, ...pathSegments].join(":");
}

export function createExplorerExpansionState(nodeIds: string[]): ExplorerExpansionState {
  return Object.fromEntries(nodeIds.map((nodeId) => [nodeId, true]));
}

export function isExplorerNodeExpanded(state: ExplorerExpansionState, nodeId: string): boolean {
  return state[nodeId] ?? false;
}

export function toggleExplorerNode(
  state: ExplorerExpansionState,
  nodeId: string,
): ExplorerExpansionState {
  return {
    ...state,
    [nodeId]: !isExplorerNodeExpanded(state, nodeId),
  };
}
