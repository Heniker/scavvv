<script module lang="ts">
</script>

<script lang="ts">
  import type { UiListEntityT } from './_types'
  import { store } from './store.svelte'
  import * as _ from 'radashi'
  import { computed } from './util/uutil.svelte'
  import { createAttachmentKey, type Attachment } from 'svelte/attachments'
  import { tick } from 'svelte'

  let {
    searchTerm = $bindable(),
    ..._rest
  }: {
    searchTerm: string
    onClickItem?: (it: UiListEntityT) => void
    lastSelectedItem?: UiListEntityT
  } = $props()
  const prop = _rest

  {
    const _ = computed(() => store.getDoSearch({ searchTerm }))
    var { items: searchedItems } = $derived(_.value)
  }

  let initialCategories = $state([]) as string[]
  let activeCategories = $state([]) as string[]

  const categories = $derived.by(() => {
    return Object.assign(
      {},
      Object.fromEntries(initialCategories.map((it) => [it, []])),
      _.group(searchedItems, (it) => it.category)
    )
  })

  let displayItems = $derived(
    _.isEmpty(activeCategories)
      ? searchedItems
      : searchedItems.filter((it) => activeCategories.includes(it.category))
  )

  const scrollAttachment = (condition: () => boolean): Attachment => {
    return (el) => {
      if (condition()) {
        tick().then(() => {
          el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' })
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' })
          })
        })
      }
    }
  }

  const destroy = $effect.root(() => {
    $effect(() => {
      if (_.isEmpty(categories)) {
        return
      }
      initialCategories = Object.keys(categories)
      destroy()
    })
  })
</script>

<div
  {...prop}
  class="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-4 bg-gray-2 p-5 md:p-6 rounded mb-6 shadow-lg border border-gray-4"
>
  <label class="flex flex-col gap-2 text-sm font-medium w-full md:w-auto relative">
    <svg
      onclick={() => (searchTerm = '')}
      style={`display: ${!searchTerm ? 'none' : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="text-white/50 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
    <input
      bind:value={searchTerm}
      accesskey="q"
      type="text"
      id="searchInput"
      placeholder="Search"
      class={[
        'p-3 px-4 border border-gray-6 rounded text-sm bg-gray-4 transition-all duration-200 text-gray-11',
        'w-full md:w-auto md:min-w-50 placeholder:text-gray-6 focus:outline-none focus:ring-2 focus:ring-blue-1',
      ]}
    />
  </label>
  <div class="flex items-center flex-wrap gap-3 flex-1 justify-end wrap ml-4">
    {#each Object.entries(categories).sort() as [k, it] (k)}
      <button
        onclick={() => {
          prop.onClickItem(undefined)
          activeCategories = _.toggle(activeCategories, k)
        }}
        class={[
          'inline-flex items-center gap-[8px] px-4 py-2 rounded-[16px]',
          'text-xs font-medium cursor-pointer whitespace-nowrap border',
          'hover:bg-blue-1 hover:border-gray-400 transition-all duration-200',
          activeCategories.includes(k)
            ? 'bg-blue-1 border-blue-1 text-white'
            : 'bg-gray-3 border-gray-5 text-gray-100',
        ]}
      >
        <span>{k}</span>
        <span class="text-xs text-gray-10 bg-gray-2 px-1.5 py-0.5 rounded-full w-7">
          {it?.length}
        </span>
      </button>
    {/each}
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(380px,1fr))] gap-6">
  {#each displayItems as it (it.isLiquid ? 'liq.' + it.id : it.id)}
    <div
      {@attach scrollAttachment(() => prop.lastSelectedItem && it === prop.lastSelectedItem)}
      class={[
        'bg-gray-2 rounded p-5 md:p-6 shadow-lg transition-all duration-300 ease-in-out [content-visibility:auto] cursor-pointer',
        'overflow-hidden border border-gray-4 hover:shadow-xl hover:-translate-y-0.5 hover:border-blue-1',
      ]}
      onclick={() => {
        prop.onClickItem?.(it)
      }}
    >
      <div
        class="flex md:flex-row md:justify-between md:items-center gap-4 md:gap-0 mb-5 pb-4 border-b border-gray-4"
      >
        <img
          src={it.isLiquid
            ? import.meta.env.BASE_URL + `/game-assets/craftingbottle.png`
            : import.meta.env.BASE_URL + `/game-assets/${it.id}.png`}
          style="height: 32px; max-width: 40px; object-fit: contain;"
        />
        <h6
          class="text-white text-xl font-bold tracking-tight p-0 *:mx-auto flex-grow text-center"
          onclick={(ev) => {
            const selection = document.getSelection()
            if (selection?.type === 'Range') {
              ev.stopPropagation()
            }
          }}
        >
          {`${store.t(it?.id) || 'N/A'}`}
        </h6>
        <div
          class="bg-gray-3 px-4 py-1.5 rounded-full text-xs font-medium text-gray-10 uppercase tracking-wider max-w-min"
        >
          {store.t(it.category)}
        </div>
      </div>
      <div class="flex items-center flex-wrap gap-2">
        {#each it.qualities as q (it.id + q.id)}
          <span
            class="bg-gray-3/80 text-green-1 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-6"
          >
            {`${store.t(q.id)} (${q.amount})`}
          </span>
        {/each}
      </div>
    </div>
  {/each}
</div>
