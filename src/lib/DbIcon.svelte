<script lang="ts">
  import {
    siMongodb,
    siMysql,
    siPostgresql,
    siRedis,
    siSqlite,
    type SimpleIcon,
  } from "simple-icons";
  import type { DatabaseType } from "./connectionProfile";

  type Props = {
    type: DatabaseType;
  };

  let { type }: Props = $props();

  const icons: Record<DatabaseType, SimpleIcon> = {
    mongodb: siMongodb,
    mysql: siMysql,
    postgresql: siPostgresql,
    redis: siRedis,
    sqlite: siSqlite,
  };

  const icon = $derived(icons[type]);
</script>

<svg
  aria-label={icon.title}
  class={`db-icon db-icon-${type}`}
  data-db-icon={type}
  role="img"
  viewBox="0 0 24 24"
>
  <path d={icon.path}></path>
</svg>
