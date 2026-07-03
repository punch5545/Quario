<script lang="ts">
  import CodeEditor from "$lib/CodeEditor.svelte";
  import DatabaseNodeIcon from "$lib/DatabaseNodeIcon.svelte";
  import DbIcon from "$lib/DbIcon.svelte";
  import ObjectNodeIcon from "$lib/ObjectNodeIcon.svelte";
  import SchemaNodeIcon from "$lib/SchemaNodeIcon.svelte";
  import TreeChevron from "$lib/TreeChevron.svelte";
  import {
    createConnectionProfile,
    getConnectionColor,
    type ConnectionProfile,
  } from "$lib/connectionProfile";
  import {
    createExplorerExpansionState,
    createExplorerNodeId,
    isExplorerNodeExpanded,
    toggleExplorerNode,
  } from "$lib/explorerTree";
  import {
    createQueryTab,
    getActiveQueryTab,
    updateQueryTabText,
    type QueryTab,
  } from "$lib/queryTabs";
  import {
    clampPaneSize,
    getAdjacentPaneSizesFromHandle,
    resizeVerticalStack,
  } from "$lib/resizablePanes";

  type Theme = "light" | "dark";
  type DragHandler = (event: PointerEvent) => void;
  type ExplorerObject = {
    label: string;
    meta: string;
  };
  type ExplorerSchema = {
    name: string;
    meta: string;
    children: ExplorerObject[];
  };
  type ExplorerDatabase = {
    name: string;
    meta: string;
    schemas: ExplorerSchema[];
  };
  type ConnectionExplorer = {
    connectionId: string;
    databases: ExplorerDatabase[];
  };

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

  let tabs = $state<QueryTab[]>([
    createQueryTab({
      id: "tab-1",
      title: "users",
      connectionId: connections[0].id,
      databaseType: connections[0].type,
      text: `select id, email, created_at
from users
order by created_at desc
limit 100;`,
    }),
    createQueryTab({
      id: "tab-2",
      title: "products",
      connectionId: connections[1].id,
      databaseType: connections[1].type,
      text: `{
  "find": "products",
  "filter": { "status": "active" },
  "limit": 50
}`,
    }),
    createQueryTab({
      id: "tab-3",
      title: "session:*",
      connectionId: connections[2].id,
      databaseType: connections[2].type,
    }),
  ]);

  const explorerItems: ConnectionExplorer[] = [
    {
      connectionId: connections[0].id,
      databases: [
        {
          name: "local",
          meta: "database",
          schemas: [],
        },
        {
          name: "quario",
          meta: "database",
          schemas: [
            {
              name: "public",
              meta: "schema",
              children: [
                { label: "users", meta: "4 indexes" },
                { label: "orders", meta: "3 indexes" },
                { label: "audit_log", meta: "1 index" },
              ],
            },
          ],
        },
      ],
    },
    {
      connectionId: connections[1].id,
      databases: [
        {
          name: "local",
          meta: "database",
          schemas: [],
        },
        {
          name: "catalog",
          meta: "database",
          schemas: [
            {
              name: "collections",
              meta: "namespace",
              children: [
                { label: "products", meta: "4 indexes" },
                { label: "prices", meta: "2 indexes" },
                { label: "channels", meta: "3 indexes" },
              ],
            },
          ],
        },
      ],
    },
    {
      connectionId: connections[2].id,
      databases: [
        {
          name: "db0",
          meta: "database",
          schemas: [
            {
              name: "keys",
              meta: "namespace",
              children: [
                { label: "session:*", meta: "string" },
                { label: "queues:email", meta: "list" },
                { label: "hash:user:*", meta: "hash" },
              ],
            },
          ],
        },
      ],
    },
  ];

  let theme = $state<Theme>("light");
  let connectionWidth = $state(280);
  let editorHeight = $state(280);
  let resultHeight = $state(220);
  let consoleHeight = $state(140);
  let activeTabId = $state("tab-1");
  const defaultExpandedExplorerNodeIds = [
    ...connections.map((connection) => connection.id),
    ...explorerItems.flatMap((item) =>
      item.databases.flatMap((database) => [
        ...(database.schemas.length > 0
          ? [createExplorerNodeId(item.connectionId, "database", database.name)]
          : []),
        ...database.schemas
          .filter((schema) => schema.children.length > 0)
          .map((schema) =>
            createExplorerNodeId(item.connectionId, "schema", database.name, schema.name),
          ),
      ]),
    ),
  ];

  let expandedExplorerNodeIds = $state(createExplorerExpansionState(defaultExpandedExplorerNodeIds));

  const activeTab = $derived(getActiveQueryTab(tabs, activeTabId));
  const activeConnection = $derived(
    connections.find((connection) => connection.id === activeTab.connectionId) ?? connections[0],
  );
  const activeColor = $derived(getConnectionColor(activeConnection.colorId));

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
    const adjacentSizes = getAdjacentPaneSizesFromHandle(event.currentTarget);
    const startEditor = adjacentSizes?.before ?? editorHeight;
    const startResult = adjacentSizes?.after ?? resultHeight;

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
    const adjacentSizes = getAdjacentPaneSizesFromHandle(event.currentTarget);
    const startResult = adjacentSizes?.before ?? resultHeight;
    const startConsole = adjacentSizes?.after ?? consoleHeight;

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

  function toggleExplorerNodeState(nodeId: string): void {
    expandedExplorerNodeIds = toggleExplorerNode(expandedExplorerNodeIds, nodeId);
  }

  function updateActiveTabText(text: string): void {
    tabs = tabs.map((tab) => (tab.id === activeTab.id ? updateQueryTabText(tab, text) : tab));
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
        {@const isConnectionExpanded = isExplorerNodeExpanded(expandedExplorerNodeIds, connection.id)}
        {@const connectionExplorer = explorerItems.find((item) => item.connectionId === connection.id)}
        <section class="connection-node" style={connectionStyle(connection)}>
          <button
            class="tree-row connection-title"
            type="button"
            aria-expanded={isConnectionExpanded}
            onclick={() => toggleExplorerNodeState(connection.id)}
          >
            <TreeChevron expanded={isConnectionExpanded} />
            <DbIcon type={connection.type} />
            <strong class="connection-label">{connection.name}</strong>
            <small>{formatEnvironment(connection)}</small>
          </button>

          {#if isConnectionExpanded}
            <div class="database-list">
              {#each connectionExplorer?.databases ?? [] as database}
                {@const databaseNodeId = createExplorerNodeId(connection.id, "database", database.name)}
                {@const isDatabaseExpanded = isExplorerNodeExpanded(expandedExplorerNodeIds, databaseNodeId)}
                {@const hasSchemas = database.schemas.length > 0}
                <div class="database-node">
                  <button
                    class:tree-row-empty={!hasSchemas}
                    class="tree-row database-title"
                    type="button"
                    aria-expanded={hasSchemas ? isDatabaseExpanded : undefined}
                    onclick={() => {
                      if (hasSchemas) {
                        toggleExplorerNodeState(databaseNodeId);
                      }
                    }}
                  >
                    {#if hasSchemas}
                      <TreeChevron expanded={isDatabaseExpanded} />
                    {:else}
                      <span class="tree-chevron-placeholder" aria-hidden="true"></span>
                    {/if}
                    <DatabaseNodeIcon />
                    <span class="database-label">{database.name}</span>
                    <small>{database.meta}</small>
                  </button>

                  {#if isDatabaseExpanded}
                    <div class="schema-list">
                      {#each database.schemas as schema}
                        {@const schemaNodeId = createExplorerNodeId(
                          connection.id,
                          "schema",
                          database.name,
                          schema.name,
                        )}
                        {@const isSchemaExpanded = isExplorerNodeExpanded(
                          expandedExplorerNodeIds,
                          schemaNodeId,
                        )}
                        {@const hasObjects = schema.children.length > 0}
                        <div class="schema-node">
                          <button
                            class:tree-row-empty={!hasObjects}
                            class="tree-row schema-title"
                            type="button"
                            aria-expanded={hasObjects ? isSchemaExpanded : undefined}
                            onclick={() => {
                              if (hasObjects) {
                                toggleExplorerNodeState(schemaNodeId);
                              }
                            }}
                          >
                            {#if hasObjects}
                              <TreeChevron expanded={isSchemaExpanded} />
                            {:else}
                              <span class="tree-chevron-placeholder" aria-hidden="true"></span>
                            {/if}
                            <SchemaNodeIcon />
                            <span class="schema-label">{schema.name}</span>
                            <small>{schema.meta}</small>
                          </button>

                          {#if isSchemaExpanded}
                            <div class="object-list">
                              {#each schema.children as object}
                                <button class="tree-row object-item" type="button">
                                  <span class="tree-chevron-placeholder" aria-hidden="true"></span>
                                  <ObjectNodeIcon />
                                  <span class="object-label">{object.label}</span>
                                  <small>{object.meta}</small>
                                </button>
                              {/each}
                            </div>
                          {/if}
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
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
          <span class="tab-title">
            {tab.title}
            {#if tab.isDirty}
              <span class="dirty-indicator" aria-label="Unsaved changes"></span>
            {/if}
          </span>
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
        <div class="editor-surface">
          <CodeEditor
            ariaLabel={`${activeConnection.name} query editor`}
            activeAccent={activeColor.accent}
            mode={activeTab.mode}
            value={activeTab.text}
            onChange={updateActiveTabText}
          />
        </div>
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
          <div class="grid-head">
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
