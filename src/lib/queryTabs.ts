import type { DatabaseType } from "./connectionProfile";

export type QueryEditorMode = "sql" | "redis" | "mongo";

export type QueryTab = {
  id: string;
  connectionId: string;
  databaseType: DatabaseType;
  title: string;
  mode: QueryEditorMode;
  text: string;
  savedText: string;
  isDirty: boolean;
};

export type CreateQueryTabInput = {
  id: string;
  connectionId: string;
  databaseType: DatabaseType;
  title: string;
  text?: string;
};

export function getEditorModeForDatabase(databaseType: DatabaseType): QueryEditorMode {
  if (databaseType === "redis") {
    return "redis";
  }

  if (databaseType === "mongodb") {
    return "mongo";
  }

  return "sql";
}

export function getDefaultQueryText(databaseType: DatabaseType): string {
  if (databaseType === "redis") {
    return "GET session:latest\nTTL session:latest";
  }

  if (databaseType === "mongodb") {
    return `{
  "find": "collection",
  "filter": {},
  "limit": 100
}`;
  }

  return `select *
from table_name
limit 100;`;
}

export function createQueryTab(input: CreateQueryTabInput): QueryTab {
  const text = input.text ?? getDefaultQueryText(input.databaseType);

  return {
    id: input.id,
    connectionId: input.connectionId,
    databaseType: input.databaseType,
    title: input.title,
    mode: getEditorModeForDatabase(input.databaseType),
    text,
    savedText: text,
    isDirty: false,
  };
}

export function getActiveQueryTab(tabs: QueryTab[], activeTabId: string): QueryTab {
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  if (activeTab) {
    return activeTab;
  }

  if (tabs.length === 0) {
    throw new Error("Cannot resolve an active query tab from an empty tab list.");
  }

  return tabs[0];
}

export function updateQueryTabText(tab: QueryTab, text: string): QueryTab {
  return {
    ...tab,
    text,
    isDirty: text !== tab.savedText,
  };
}
