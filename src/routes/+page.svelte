<script lang="ts">
  import {
    createConnectionProfile,
    getConnectionColor,
    type ConnectionProfile,
  } from "$lib/connectionProfile";
  import { clampPaneSize, resizeVerticalStack } from "$lib/resizablePanes";

  type Theme = "light" | "dark";
  type DragHandler = (event: PointerEvent) => void;

  const connections: ConnectionProfile[] = [
    createConnectionProfile({
      name: "Local Postgres",
      type: "postgresql",
      host: "localhost",
      port: 5432,
      database: "quario",
      colorId: "mint",
    }),
    createConnectionProfile({
      name: "Develop Mongo",
      type: "mongodb",
      host: "dev.mongo.internal",
      port: 27017,
      database: "catalog",
      environment: { kind: "develop" },
      colorId: "sky",
    }),
    createConnectionProfile({
      name: "Production Redis",
      type: "redis",
      host: "redis.prod.internal",
      port: 6379,
      environment: { kind: "production" },
      colorId: "rose",
    }),
  ];

  const tabs = [
    { id: "tab-1", title: "users.sql", connectionId: connections[0].id },
    { id: "tab-2", title: "catalog.aggregate", connectionId: connections[1].id },
    { id: "tab-3", title: "cache.redis", connectionId: connections[2].id },
  ];

  const explorerItems = [
    {
      connectionId: connections[0].id,
      groups: [
        { label: "public.users", meta: "table · 12 columns" },
        { label: "public.orders", meta: "table · 18 columns" },
        { label: "idx_users_email", meta: "index" },
      ],
    },
    {
      connectionId: connections[1].id,
      groups: [
        { label: "catalog.products", meta: "collection · 4 indexes" },
        { label: "catalog.prices", meta: "collection · 2 indexes" },
      ],
    },
    {
      connectionId: connections[2].id,
      groups: [
        { label: "db0 session:*", meta: "string" },
        { label: "db0 queues:email", meta: "list" },
      ],
    },
  ];

  let theme = $state<Theme>("light");
  let connectionWidth = $state(280);
  let editorHeight = $state(280);
  let resultHeight = $state(220);
  let consoleHeight = $state(140);
  let activeTabId = $state(tabs[0].id);

  const activeTab = $derived(tabs.find((tab) => tab.id === activeTabId) ?? tabs[0]);
  const activeConnection = $derived(
    connections.find((connection) => connection.id === activeTab.connectionId) ?? connections[0],
  );
  const activeColor = $derived(getConnectionColor(activeConnection.colorId));
  const editorText = $derived.by(() => {
    if (activeConnection.type === "redis") {
      return "GET session:latest\nTTL session:latest";
    }

    if (activeConnection.type === "mongodb") {
      return `{
  "find": "products",
  "filter": { "status": "active" },
  "limit": 50
}`;
    }

    return `select id, email, created_at
from users
order by created_at desc
limit 100;`;
  });

  function connectionStyle(connection: ConnectionProfile): string {
    const color = getConnectionColor(connection.colorId);

    return [
      `--connection-accent: ${color.accent}`,
      `--connection-soft: ${color.soft}`,
      `--connection-foreground: ${color.foreground}`,
    ].join("; ");
  }

  function beginDrag(event: PointerEvent, onMove: DragHandler): void {
    event.preventDefault();

    const handle = event.currentTarget;
    if (handle instanceof HTMLElement) {
      handle.setPointerCapture(event.pointerId);
    }

    const stopDrag = (): void => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
  }

  function startConnectionResize(event: PointerEvent): void {
    const startX = event.clientX;
    const startWidth = connectionWidth;

    beginDrag(event, (moveEvent) => {
      connectionWidth = clampPaneSize(startWidth + moveEvent.clientX - startX, 220, 460);
    });
  }

  function startEditorResultResize(event: PointerEvent): void {
    const startY = event.clientY;
    const startEditor = editorHeight;
    const startResult = resultHeight;

    beginDrag(event, (moveEvent) => {
      const next = resizeVerticalStack({
        before: startEditor,
        after: startResult,
        delta: moveEvent.clientY - startY,
        minBefore: 180,
        minAfter: 160,
      });

      editorHeight = next.before;
      resultHeight = next.after;
    });
  }

  function startResultConsoleResize(event: PointerEvent): void {
    const startY = event.clientY;
    const startResult = resultHeight;
    const startConsole = consoleHeight;

    beginDrag(event, (moveEvent) => {
      const next = resizeVerticalStack({
        before: startResult,
        after: startConsole,
        delta: moveEvent.clientY - startY,
        minBefore: 160,
        minAfter: 120,
      });

      resultHeight = next.before;
      consoleHeight = next.after;
    });
  }

  function formatEnvironment(connection: ConnectionProfile): string {
    return connection.environment.kind === "custom"
      ? connection.environment.label
      : connection.environment.kind;
  }

  function setTheme(nextTheme: Theme): void {
    theme = nextTheme;
  }
</script>

<svelte:head>
  <title>Quario</title>
</svelte:head>

<main
  class:theme-dark={theme === "dark"}
  class="app-shell"
  style={`--connection-width: ${connectionWidth}px; --editor-height: ${editorHeight}px; --result-height: ${resultHeight}px; --console-height: ${consoleHeight}px; --active-accent: ${activeColor.accent};`}
>
  <aside class="connection-pane" aria-label="Connection tree">
    <div class="pane-header">
      <div>
        <p class="eyebrow">Connections</p>
        <h1>Quario</h1>
      </div>
      <div class="theme-toggle" aria-label="Theme">
        <button
          class:active={theme === "light"}
          type="button"
          aria-pressed={theme === "light"}
          onclick={() => setTheme("light")}
        >
          Light
        </button>
        <button
          class:active={theme === "dark"}
          type="button"
          aria-pressed={theme === "dark"}
          onclick={() => setTheme("dark")}
        >
          Dark
        </button>
      </div>
    </div>

    <div class="connection-list">
      {#each connections as connection}
        <section class="connection-node" style={connectionStyle(connection)}>
          <button class="connection-title" type="button">
            <span class="connection-dot"></span>
            <span>
              <strong>{connection.name}</strong>
              <small>{connection.type} · {formatEnvironment(connection)}</small>
            </span>
          </button>

          <div class="object-list">
            {#each explorerItems.find((item) => item.connectionId === connection.id)?.groups ?? [] as item}
              <button class="object-item" type="button">
                <span>{item.label}</span>
                <small>{item.meta}</small>
              </button>
            {/each}
          </div>
        </section>
      {/each}
    </div>
  </aside>

  <button
    class="splitter splitter-vertical"
    type="button"
    aria-label="Resize connection tree"
    onpointerdown={startConnectionResize}
  ></button>

  <section class="workspace" aria-label="Query workspace">
    <nav class="tab-strip" aria-label="Query tabs">
      {#each tabs as tab}
        {@const connection = connections.find((item) => item.id === tab.connectionId) ?? connections[0]}
        <button
          class:active={activeTabId === tab.id}
          class="tab"
          type="button"
          style={connectionStyle(connection)}
          onclick={() => {
            activeTabId = tab.id;
          }}
        >
          <span class="tab-accent"></span>
          <span class="tab-title">{tab.title}</span>
          <small>{formatEnvironment(connection)}</small>
        </button>
      {/each}
    </nav>

    <div class="workspace-body">
      <section class="editor-pane" aria-label="SQL, Redis command, or Mongo script editor">
        <div class="section-toolbar">
          <span>{activeConnection.name}</span>
          <div class="toolbar-actions">
            <button type="button">Run</button>
            <button type="button">Save</button>
          </div>
        </div>
        <pre class="editor-surface"><code>{editorText}</code></pre>
      </section>

      <button
        class="splitter splitter-horizontal"
        type="button"
        aria-label="Resize editor and result"
        onpointerdown={startEditorResultResize}
      ></button>

      <section class="result-pane" aria-label="Query results">
        <div class="section-toolbar">
          <span>Result</span>
          <small>100 rows · 38 ms</small>
        </div>
        <div class="result-grid">
          <div class="grid-row grid-head">
            <span>id</span>
            <span>email</span>
            <span>status</span>
            <span>created_at</span>
          </div>
          {#each Array.from({ length: 8 }) as _, index}
            <div class="grid-row">
              <span>{index + 1}</span>
              <span>user{index + 1}@quario.local</span>
              <span>active</span>
              <span>2026-07-03 15:{String(index).padStart(2, "0")}</span>
            </div>
          {/each}
        </div>
      </section>

      <button
        class="splitter splitter-horizontal"
        type="button"
        aria-label="Resize result and console"
        onpointerdown={startResultConsoleResize}
      ></button>

      <section class="console-pane" aria-label="Console output">
        <div class="section-toolbar">
          <span>Console</span>
          <small>Connection ready</small>
        </div>
        <pre class="console-output">[{new Date().toLocaleTimeString()}] Connected to {activeConnection.name}
[query] Executed current statement
[result] 100 rows fetched with row limit 100</pre>
      </section>
    </div>
  </section>
</main>
