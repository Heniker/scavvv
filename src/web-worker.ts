import './shim'
import type { UiListEntityT } from './_types'

import Fuse from 'fuse.js'
import * as Comlink from 'comlink'
import * as _ from 'radashi'
import { api } from './api'

const store = {
  items: [] as (typeof api.fetchItems)['$type'][],
  recipes: [] as (typeof api.fetchRecipes)['$type'][],
  liquids: [] as (typeof api.fetchLiquids)['$type'][],
}

let initPromise = Promise.withResolvers<void>()

const exposed = {
  init: async () => {
    const r = await init()
    Object.assign(store, r)

    initPromise.resolve()
  },

  getDoSearch: async (data: { searchTerm?: string }) => {
    await initPromise.promise
    const items = store.items
    const searchResult = await doSearch([...items, ...store.liquids], data)

    return { items: searchResult }
  },

  getItemUsedIn: (item: UiListEntityT) => {
    const resultQualities = item.qualities || []

    const itemsWithResultQualityReq = resultQualities.flatMap((it) =>
      exposed.getCraftingQualities(it.id, it.amount)
    )

    const itemsWithResultReq = store.recipes.filter(
      (it) =>
        it.items.filter((it) => 'specificId' in it).filter((it) => it.specificId === item.id)
          .length > 0
    )

    return [...itemsWithResultReq, ...itemsWithResultQualityReq].filter((it) => it.id !== item.id)
  },

  getCraftingQualities: function getCraftingQualities(q: string, amount = 0) {
    return store.recipes.filter((it) => {
      return (
        it.items
          .filter((it) => 'quality' in it)
          .filter((it) => it.quality.id === q && it.quality.amount <= amount).length > 0
      )
    })
  },

  getItemInfo: async function getItemInfo(id: string) {
    await initPromise.promise
    return store.items.find((it) => it.id === id)
  },

  getQualityItems: function getQualityItems(qualityId: string, amount = 0) {
    return store.items.filter((it) =>
      it.qualities?.find((it) => it.id === qualityId && it.amount >= amount)
    )
  },

  getCraftingInfo: function getCraftingInfo(id: string) {
    return store.recipes.filter((it) => it.id === id)
  },
}

Comlink.expose(exposed)

export type WorkerComlinkT = typeof exposed

async function doSearch(items: UiListEntityT[], data: { searchTerm?: string }) {
  // #dev>
  console.log('Data sent to worker')
  console.log(data)

  const searchTerm = data.searchTerm || ''

  console.log('items:')
  console.log(items)

  if (!searchTerm) {
    return items
  }

  const qualitySearchKey = /q\:(.+)/g.exec(searchTerm)?.[1]

  const fuseInstance = new Fuse(items, {
    keys: [
      ...(qualitySearchKey ? [{ name: 'qualities.id', weight: 0.3 }] : [{ name: 'translatedLabel', weight: 1 }]),
      // { name: 'qualities.id', weight: 10 },
      // { name: "items.quality.id", weight: 1 },
      // { name: "items.specificId", weight: 50 }
    ],
    threshold: 0.3,
    ignoreLocation: false,
    useExtendedSearch: true,
  })

  const s = fuseInstance.search(searchTerm).map((it) => it.item)
  const first = s[0]

  const qualities = first?.qualities?.map((it) => it.id) || []

  const res = fuseInstance.search(searchTerm).map((it) => it.item)

  if (qualitySearchKey) {
    return res.sort((a, b) => {
      const aa = a.qualities.find((it) => it.id === qualitySearchKey)?.amount
      const bb = b.qualities.find((it) => it.id === qualitySearchKey)?.amount

      return (bb || 0) - (aa || 0)
    })
  }

  // if (isQSearch) {
  //   return res.sort(it => it.qualities)
  // }

  return res
}

async function init() {
  let [recipes, items, liquids, translation] = await Promise.all([
    api.fetchRecipes(),
    api.fetchItems(),
    api.fetchLiquids(),
    api.fetchEnTranslationItem(),
  ])

  // typeof items.$type

  items.splice(
    items.findIndex((it) => it.id === 'craftingbottle'),
    1
  )

  items.forEach((it) => {
    it.translatedLabel = translation[it.id]
  })

  // Object.keys(items).forEach((i) => {
  //   const r = recipes.find(
  //     (it) => it.id === i
  //   ) /* note that some items do not have a crafting recipe */
  //   if (r && r.id === 'woodscraps') {
  //     r.category = 'Materials' // 'woodscraps' is special for some reason and does not have a category. I am not editing raw exported data.
  //   }

  //   const { category, ...rest } = items[i]
  //   Object.assign(r || {}, rest)
  // })

  return { recipes, items, liquids }
}
