<script lang="ts">
  import * as _ from 'radashi'
  import { type Snippet } from 'svelte'
  import type { UiGameItemT, UiGameLiquidT, UiListEntityT } from './_types'
  import { store } from './store.svelte'
  import SnippetToComponent from './SnippetToComponent.svelte'
  import { renderLabel } from './util/Util.svelte'
  import { useCountUp, computed } from './util/uutil.svelte'

  let {
    selectedItem = $bindable(),
    ..._rest
  }: {
    selectedItem: UiListEntityT
    onClickBack?: () => void
    onClickCategory?: (it: UiGameItemT['category']) => void
    onClickQuality?: (
      it: UiGameItemT['qualities'][number] | UiGameLiquidT['qualities'][number]
    ) => void
  } = $props()

  const prop = _rest

  {
    const _ = computed(() => store.getCraftingInfo(selectedItem.id))
    var craftingInfo = $derived(_.value)
  }
  {
    const _ = computed(() => store.getItemUsedIn(selectedItem))
    var usedIn = $derived(_.value)
  }

  const onClickItem = (id: string) => {
    const r = store.getItemInfo(id)
    if (r) {
      selectedItem = r
    }
  }

  const qualityItemsIconsRotation = (qualityId: string) => {
    const p = store.getQualityItems(qualityId).map((it) => it.id)
    const u = useCountUp(1000)

    const r = computed(() => p[u.value % p.length])
    return r
  }
</script>

<div class="w-full p-4 md:p-6">
  <button
    class={[
      'py-3 pl-3 pr-5 text-sm font-medium cursor-pointer',
      'inline-flex absolute align-middle items-center gap-2 bg-gray-3 border border-gray-5 rounded text-gray-11',
      'transition-all duration-200 hover:border-gray-10',
    ]}
    accesskey="q"
    onclick={prop.onClickBack}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
    >
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
    Back to Search
  </button>
  <div class="mb-6 px-2 flex justify-center items-center gap-4 md:gap-6 text-gray-11">
    <img
      src={selectedItem.isLiquid
        ? import.meta.env.BASE_URL + `/game-assets/craftingbottle.png`
        : import.meta.env.BASE_URL + `/game-assets/${selectedItem.id}.png`}
      class="w-auto h-16 max-w-20 object-contain"
    />
    <div class="text-2xl md:text-3xl font-semibold tracking-tight text-left md:text-center">
      {store.t(selectedItem.id) || 'Unknown Item'}
    </div>
  </div>

  <div class="w-full">
    <div class="bg-gray-2 rounded p-6 md:p-8 shadow-lg border border-gray-3 w-full">
      <div class="mb-5 last:mb-0">
        <div class="text-xs font-medium text-gray-400 uppercase">Crafting Information</div>
        <div class="flex flex-col">
          {#if craftingInfo.length === 0 && usedIn.length === 0}
            <div class="text-center p-8 bg-gray-4 rounded border border-gray-500">
              <div class="text-sm text-gray-400 italic">No crafting recipe available</div>
            </div>
          {:else}
            <div class="flex justify-between mt-3 pb-3 border-b border-gray-4">
              <div class="flex flex-col justify-between">
                {#if craftingInfo.length > 0}
                  <div class="text-sm font-medium text-gray-11">
                    Crafting Category:&nbsp; <span
                      class="bg-gray-3 py-1 px-2 rounded-sm hover:bg-gray-5 cursor-pointer"
                      onclick={() => prop.onClickCategory?.(craftingInfo[0].category)}
                    >
                      {store.t(craftingInfo[0].category)}
                    </span>
                  </div>
                  <div class="text-sm text-gray-10 mt-2">
                    Intelligence Required: {craftingInfo[0].INT}
                  </div>
                {/if}
              </div>
              <div class="flex flex-col">
                {#if selectedItem?.qualities?.length}
                  <div class="text-gray-10 text-sm ml-auto">Qualities:</div>
                {/if}
                <div class="flex items-center flex-wrap gap-2 mt-2">
                  {#each selectedItem?.qualities as q (q.id)}
                    <span
                      onclick={() => prop.onClickQuality?.(q)}
                      class="bg-gray-3/80 text-green-1 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-6 hover:bg-gray-5 cursor-pointer"
                    >
                      {`${store.t(q.id)} (${q.amount})`}
                    </span>
                  {/each}
                </div>
              </div>
            </div>

            {#each craftingInfo as recipe}
              {@render CraftingItem(recipe)}
            {/each}

            <div class="pt-6 border-t border-gray-4">
              <h4 class="text-xs font-medium text-gray-10 mb-3 uppercase">Used in</h4>
              <div class="flex flex-row flex-wrap gap-3 *:w-[250px] *:grow">
                {#each usedIn as it}
                  {@render itemBadge({
                    onclick: () => {
                      onClickItem(it.id)
                    },
                    imageUrl: it.result.isLiquid
                      ? import.meta.env.BASE_URL + `/game-assets/craftingbottle.png`
                      : import.meta.env.BASE_URL + `/game-assets/${it.result.id}.png`,
                    label: store.t(it.result.id),
                    descText: [],
                  })}
                {:else}
                  <div class="text-sm text-gray-11 italic">N/A</div>
                {/each}
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

{#snippet CraftingItem(recipe: (typeof craftingInfo)[number])}
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 mt-6 mb-8">
    <!-- Ingredients -->
    <div class="">
      <h4 class="text-xs font-medium text-gray-400 mb-3 uppercase">Ingredients</h4>
      <div class="space-y-3">
        {#each recipe.items as item}
          <SnippetToComponent>
            {#if 'quality' in item}
              {@const qRotation = qualityItemsIconsRotation(item.quality.id)}

              {@render itemBadge({
                onclick: () => prop.onClickQuality?.(item.quality),
                descText: [
                  item.destroyItem ? `Consumed` : undefined,
                  item.minimumCondition === undefined
                    ? undefined
                    : item.minimumCondition <= 1
                      ? `Min Condition: ${item.minimumCondition * 100}%`
                      : undefined,
                  `Amount: ${item.quality.amount}`,
                ].filter(Boolean),
                imageUrl: item.isLiquid
                  ? import.meta.env.BASE_URL + '/game-assets/craftingbottle.png'
                  : import.meta.env.BASE_URL + `/game-assets/${qRotation.value}.png`,
                label,
              })}
            {:else}
              {@render itemBadge({
                onclick: () => onClickItem(item.specificId),
                descText: [
                  item.destroyItem ? `Consumed` : undefined,
                  item.minimumCondition === undefined
                    ? undefined
                    : item.minimumCondition <= 1
                      ? `Min Condition: ${item.minimumCondition * 100}%`
                      : `Amount: ${item.minimumCondition}`,
                ].filter(Boolean),
                imageUrl: item.isLiquid
                  ? import.meta.env.BASE_URL + '/game-assets/craftingbottle.png'
                  : import.meta.env.BASE_URL + `/game-assets/${item.specificId}.png`,
                label,
              })}
            {/if}

            {#snippet label()}
              {#if 'quality' in item}
                <span class="text-gray-11/70">
                  {'quality' in item ? `Quality:` : ''}
                </span>
                {store.t(item.quality.id)}
              {:else if 'specificId' in item}
                {store.t(item.specificId)}
              {/if}
            {/snippet}
          </SnippetToComponent>
        {/each}
      </div>
    </div>

    <div class="">
      <h4 class="text-xs font-medium text-gray-10 mb-3 uppercase">Result</h4>
      {@render itemBadge({
        imageUrl: recipe.result.isLiquid
          ? import.meta.env.BASE_URL + `/game-assets/craftingbottle.png`
          : import.meta.env.BASE_URL + `/game-assets/${recipe.result.id}.png`,
        label: store.t(recipe.result.id),
        descText: [
          `Amount: ${recipe.result.amount}`,
          ...(recipe.result.isLiquid ? [`Amount: ${recipe.result.resultCondition}`, 'Liquid'] : []),
          ...(recipe.result.resultCondition > 0 && !recipe.result.isLiquid
            ? [
                `Condition: ${
                  recipe.result.resultCondition <= 1
                    ? recipe.result.resultCondition * 100
                    : recipe.result.resultCondition
                }%`,
              ]
            : []),
        ],
      })}
    </div>

    <!--  -->
  </div>
{/snippet}

{#snippet itemBadge(prop: {
  imageUrl: string
  descText: Array<string | number>
  label: string | Snippet
  imgStyle?: string
  onclick?: () => void
})}
  <div
    class={[
      'px-4 bg-gray-3 rounded border border-gray-5 h-18 flex items-center transition-all',
      prop.onclick ? 'hover:border-gray-6 cursor-pointer hover:bg-gray-5' : '',
    ]}
    onclick={prop.onclick}
  >
    <div class={['flex items-center gap-3 my-auto']}>
      <img style={prop.imgStyle} src={prop.imageUrl} class="w-8 max-h-8 object-contain" />
      <div>
        <div class="text-sm font-medium text-gray-11">{@render renderLabel(prop.label)}</div>
        <div class="text-xs text-gray-10">
          {#each prop.descText as it}
            {it} &nbsp;&nbsp;&nbsp;
          {/each}
        </div>
      </div>
    </div>
  </div>
{/snippet}
