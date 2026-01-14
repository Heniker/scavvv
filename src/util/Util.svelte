<script lang="ts" module>
  import type { Snippet } from 'svelte'

  export { renderLabel }
</script>

{#snippet renderLabel(arg: Snippet | string)}
  {#if typeof arg === 'function'}
    {@render arg()}
  {:else}
    {arg}
  {/if}
{/snippet}
