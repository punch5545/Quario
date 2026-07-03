<script lang="ts">
  type Props = {
    expanded?: boolean;
  };

  let { expanded = false }: Props = $props();
</script>

<span aria-hidden="true" class:expanded class="tree-chevron">
  <svg focusable="false" viewBox="0 0 16 16">
    <path d="M6 3.75 10.25 8 6 12.25"></path>
  </svg>
</span>
