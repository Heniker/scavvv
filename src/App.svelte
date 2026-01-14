<script lang="ts">
  import ItemInfo from './ItemInfo.svelte'
  import ItemSearch from './ItemSearch.svelte'
  import type { UiListEntityT } from './_types'
  import { store } from './store.svelte'
  import KeepAlive from './KeepAlive.svelte'
  import { computed, useCurrentUrl, usePrevious } from './util/uutil.svelte'
  import { untrack } from 'svelte'

  history.scrollRestoration = 'manual'
  store.init()

  let selectedItem = $state(undefined as UiListEntityT | undefined)
  let searchTerm = $state('')

  let lastSelectedItem = usePrevious(computed(() => selectedItem))

  $effect.pre(() => {
    if (searchTerm) {
      untrack(() => {
        selectedItem = undefined
        lastSelectedItem.value = undefined
      })
    }
  })

  const url = useCurrentUrl()
  $effect(() => {
    if (!store.isInit()) {
      return
    }

    console.log(url.value.hash.slice(2))
    selectedItem = store.getItemInfo(url.value.hash.slice(2))
  })

  const updateUrl = () => {
    if (selectedItem?.id !== url.value.pathname.slice(1 + import.meta.env.BASE_URL.length + 3)) {
      history.pushState({}, '', import.meta.env.BASE_URL + `/#/${selectedItem?.id || ''}`)
      // idk
      globalThis.dispatchEvent(new Event('popstate'))
    }
  }
</script>

{#snippet ItemSearchState()}
  <ItemSearch
    bind:searchTerm
    lastSelectedItem={lastSelectedItem.value}
    onClickItem={(it) => {
      lastSelectedItem.value = undefined
      selectedItem = it
      updateUrl()
    }}
  ></ItemSearch>
{/snippet}

<main class="max-w-7xl my-10 mx-auto px-3 relative">
  <KeepAlive target={selectedItem ? undefined : ItemSearchState}></KeepAlive>

  {#if selectedItem}
    <ItemInfo
      bind:selectedItem={
        () => selectedItem!,
        (arg) => {
          selectedItem = arg
          updateUrl()
        }
      }
      onClickCategory={(it) => {
        searchTerm = `c:${store.t(it)}`
        selectedItem = undefined
        updateUrl()
      }}
      onClickQuality={(it) => {
        searchTerm = `q:${store.t(it.id)}`
        selectedItem = undefined
        updateUrl()
      }}
      onClickBack={() => {
        selectedItem = undefined
        updateUrl()
      }}
    ></ItemInfo>
  {/if}
</main>

<style>
  :global {
    @import 'tailwindcss';

    /* 50 shades of gray */
    @theme {
      --color-gray-12: hsl(0 0% 95%);
      --color-gray-11: hsl(0 0% 88%);
      --color-gray-10: hsl(0 0% 69%);
      --color-gray-6: hsl(0 0% 32%);
      --color-gray-5: hsl(0 0% 26%);
      --color-gray-4: hsl(0 0% 20%);
      --color-gray-3: hsl(0 0% 20%);
      --color-gray-2: hsl(0 0% 12%);
      --color-gray-1: hsl(0 0% 7%);

      --color-blue-1: hsl(232, 33%, 33%);
      /* --color-blue-1: hsl(0.64 0.64 0.54); */
      /* --color-blue-1: #061e30; */

      --color-green-1: hsl(123, 38%, 64%);

      --text-xs--weight: 400;
      /* --text-xs--line-height: 1; */
      --text-xs: 11.5px;
    }

    @layer base {
      * {
        text-rendering: optimizeLegibility;
      }

      html,
      body {
        overflow: auto;
        overflow-y: scroll;
      }

      body {
        font-family:
          'Roboto',
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Oxygen,
          Ubuntu,
          Cantarell,
          sans-serif;
      }

      img {
        image-rendering: pixelated;
      }

      ::-webkit-scrollbar {
        max-width: 10px;
        max-height: 10px;
        background: #1d1d1d;
      }
      ::-webkit-scrollbar-track,
      ::-webkit-scrollbar-corner {
        background: #1d1d1d;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(175, 175, 175, 0.5);
      }
      ::-webkit-scrollbar-thumb:hover {
        background: rgba(65, 131, 196, 0.8);
      }
    }
  }
</style>
