export const CONNECTION_ENVIRONMENTS = [
  "local",
  "develop",
  "staging",
  "production",
  "custom",
] as const;

export type ConnectionEnvironmentKind = (typeof CONNECTION_ENVIRONMENTS)[number];

export type ConnectionEnvironment =
  | { kind: Exclude<ConnectionEnvironmentKind, "custom"> }
  | { kind: "custom"; label: string };

export type DatabaseType = "postgresql" | "mysql" | "sqlite" | "redis" | "mongodb";

export type ConnectionColor = {
  id: string;
  name: string;
  accent: string;
  soft: string;
  foreground: string;
};

export const CONNECTION_PALETTE: ConnectionColor[] = [
  { id: "rose", name: "Rose", accent: "#f59aa0", soft: "#fde8ea", foreground: "#7f1d1d" },
  { id: "coral", name: "Coral", accent: "#f6ad8f", soft: "#feeee6", foreground: "#7c2d12" },
  { id: "amber", name: "Amber", accent: "#efd27a", soft: "#fbf3d0", foreground: "#713f12" },
  { id: "mint", name: "Mint", accent: "#8ddfbd", soft: "#def8ed", foreground: "#064e3b" },
  { id: "teal", name: "Teal", accent: "#86d7d6", soft: "#ddf7f6", foreground: "#134e4a" },
  { id: "sky", name: "Sky", accent: "#95c8f3", soft: "#e4f1fd", foreground: "#1e3a8a" },
  { id: "blue", name: "Blue", accent: "#a7b9f6", soft: "#e9edfe", foreground: "#1e3a8a" },
  { id: "lavender", name: "Lavender", accent: "#c2adf5", soft: "#f0eafd", foreground: "#4c1d95" },
  { id: "pink", name: "Pink", accent: "#efadd4", soft: "#fceaf4", foreground: "#831843" },
  { id: "slate", name: "Slate", accent: "#b8c2cc", soft: "#eef1f4", foreground: "#334155" },
];

export type ConnectionProfile = {
  id: string;
  name: string;
  type: DatabaseType;
  environment: ConnectionEnvironment;
  colorId: string;
  host?: string;
  port?: number;
  database?: string;
};

export type CreateConnectionProfileInput = {
  name: string;
  type: DatabaseType;
  environment?: ConnectionEnvironment;
  colorId?: string;
  host?: string;
  port?: number;
  database?: string;
};

export function createConnectionProfile(input: CreateConnectionProfileInput): ConnectionProfile {
  return {
    id: crypto.randomUUID(),
    name: input.name,
    type: input.type,
    environment: input.environment ?? { kind: "local" },
    colorId: input.colorId ?? CONNECTION_PALETTE[0].id,
    host: input.host,
    port: input.port,
    database: input.database,
  };
}

export function getConnectionColor(colorId: string): ConnectionColor {
  return CONNECTION_PALETTE.find((color) => color.id === colorId) ?? CONNECTION_PALETTE[0];
}
