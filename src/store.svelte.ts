import type { UiListEntityT } from './_types'
import * as _ from 'radashi'
import { api } from './api'
import Fuse from 'fuse.js'

const storedState = $state({
  items: [] as (typeof api.fetchItems)['$type'][],
  recipes: [] as (typeof api.fetchRecipes)['$type'][],
  liquids: [] as (typeof api.fetchLiquids)['$type'][],
  translation: {} as Awaited<ReturnType<typeof api.fetchEnTranslationItem>>,
})

export const store = {
  init: async () => {
    let [recipes, items, liquids, translation] = await Promise.all([
      api.fetchRecipes(),
      api.fetchItems(),
      api.fetchLiquids(),
      api.fetchEnTranslationItem(),
    ])

    items.splice(
      items.findIndex((it) => it.id === 'craftingbottle'),
      1
    )

    const categoryMap = [
      'craftingcategorymaterials',
      'craftingcategorytools',
      'craftingcategorymedicine',
      'craftingcategoryutilities',
      'craftingcategoryfood',
    ]

    recipes.forEach((it) => {
      it.category = categoryMap[Number(it.category)] || 'craftingcategorymaterials'
    })

    Object.assign(storedState, { recipes, items, liquids, translation })
  },

  isInit: () => storedState.items.length > 0,

  t: (key: string) => {
    return storedState.translation[key] || key
  },

  getDoSearch: (data: { searchTerm: string }) => {
    const items = storedState.items

    const searchResult = doSearch([...items, ...storedState.liquids], data)

    return { items: searchResult }
  },

  getItemUsedIn: (item: UiListEntityT) => {
    const resultQualities = item.qualities || []

    const itemsWithResultQualityReq = resultQualities.flatMap((it) =>
      store.getCraftingQualities(it.id, item.isLiquid ? 100000 : it.amount)
    )

    const itemsWithResultReq = storedState.recipes.filter(
      (it) =>
        it.items.filter((it) => 'specificId' in it).filter((it) => it.specificId === item.id)
          .length > 0
    )

    return [...itemsWithResultReq, ...itemsWithResultQualityReq].filter((it) => it.id !== item.id)
  },

  getCraftingQualities: (q: string, amount = 0) => {
    return storedState.recipes.filter((it) => {
      return (
        it.items
          .filter((it) => 'quality' in it)
          .filter((it) => it.quality.id === q && it.quality.amount <= amount).length > 0
      )
    })
  },

  getItemInfo: (id: string) => {
    return (
      storedState.items.find((it) => it.id === id) || storedState.liquids.find((it) => it.id === id)
    )
  },

  getQualityItems: (qualityId: string, amount = 0) => {
    return [
      ...storedState.items.filter((it) =>
        it.qualities.find((it) => it.id === qualityId && it.amount >= amount)
      ),
      ...storedState.liquids.filter((it) =>
        it.qualities.find((it) => it.id === qualityId && it.amount >= amount)
      ),
    ]
  },

  getCraftingInfo: (id: string) => {
    return storedState.recipes.filter((it) => it.id === id)
  },
}

function doSearch(items: UiListEntityT[], data: { searchTerm: string }) {
  const qualitySearchKey = data.searchTerm.startsWith('q:')
    ? /q\:(.+)/g.exec(data.searchTerm)?.[1] || '!*'
    : false
  const categorySearchKey = data.searchTerm.startsWith('c:')
    ? /c\:(.+)/g.exec(data.searchTerm)?.[1] || '!*'
    : false
  const searchTerm = qualitySearchKey || categorySearchKey || data.searchTerm

  if (!searchTerm) {
    return items
  }

  const fuseInstance = new Fuse(items, {
    keys: (() => {
      if (qualitySearchKey) {
        return [
          {
            name: 'qualities.id',
            weight: 1,
            getFn: (it) => it.qualities.map((it) => store.t(it.id)),
          },
        ]
      } else if (categorySearchKey) {
        return [
          {
            name: 'category',
            weight: 1,
            getFn: (it) => store.getCraftingInfo(it.id).map((it) => store.t(it.category)),
          },
        ]
      } else {
        return [{ name: 'id', weight: 1, getFn: (it) => store.t(it.id) }]
      }
    })(),

    threshold: qualitySearchKey || categorySearchKey ? 0.1 : 0.3,
    ignoreLocation: false,
    isCaseSensitive: false,
    useExtendedSearch: true,
  })

  const res = fuseInstance.search(searchTerm).map((it) => it.item)

  if (qualitySearchKey) {
    return res.sort((a, b) => {
      const aa = a.qualities.find((it) => it.id === qualitySearchKey)?.amount
      const bb = b.qualities.find((it) => it.id === qualitySearchKey)?.amount

      return (bb || 0) - (aa || 0)
    })
  }

  return res
}
