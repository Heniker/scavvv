// the only items that have multiple crafting recipes are:
// disinfectant, saline, torch
// makes my life painful

import urlItems from './public/items.json?url'
import urlRecipes from './public/recipes.json?url'
import urlLiquids from './public/liquids.json?url'
import urlEnTranslation from './public/EN.json?url'

export const api = {
  fetchItems: fetchItems as typeof fetchItems & { $type: GameItemsT },
  fetchRecipes: fetchRecipes as typeof fetchRecipes & { $type: GameRecipesT },
  fetchLiquids: fetchLiquids as typeof fetchLiquids & { $type: GameLiquidsT },
  fetchEnTranslationItem: fetchEnTranslationItem,
}

interface GameItemsT {
  id: string
  isLiquid: false
  translatedLabel: string

  category: string
  tags: string
  weight: number
  scaleWeightWithCondition?: boolean
  qualities: { id: string; amount: number }[]
  slotRotation?: number
  usable?: boolean
  usableOnLimb?: boolean
  destroyAtZeroCondition?: boolean
  combineable?: boolean
  decayMinutes?: number
  wearable?: boolean
  wearSlotId?: string
  decayInfo?: number
  capacity?: number
  defaultContents?: { liquidId?: string; amount?: number }[]
  autoFill?: boolean
  /**
   * trade value
   */
  value?: number
  rec: {
    // INT requirement to know what that item is
    min: number
  }
}
function fetchItems() {
  return fetch(urlItems)
    .then((it) => it.json())
    .then((it) => {
      Object.entries(it).forEach(([k, v]: [any, any]) => {
        v.id = k
        v.isLiquid = false
      })
      return Object.values(it) as GameItemsT[]
    })
}

interface GameRecipesT {
  id: string

  INT: number
  result: {
    id: string
    amount: number
    isLiquid: boolean
    resultCondition: number
  }
  items:
    | {
        quality: {
          id: string
          amount: number
          isCrafting: boolean
        }
        minimumCondition: number
        destroyItem: boolean
        isLiquid: boolean
        ignoredId: string
      }[]
    | {
        specificId: string
        specific: boolean
        minimumCondition: number
        destroyItem: boolean
        isLiquid: boolean
        ignoredId: string
      }[]
  category: string
}
function fetchRecipes() {
  return fetch(urlRecipes)
    .then((it) => it.json())
    .then((it) => {
      it.forEach((it) => {
        it.result.id = it.result.isLiquid ? 'liq' + it.result.id : it.result.id
        it.id = it.result.id
        it.items
          .filter((it) => it.isLiquid)
          .forEach((it) => {
            it.specificId && (it.specificId = 'liq' + it.specificId)
            it.quality?.id && (it.quality.id = 'liq' + it.quality.id)
          })
      })
      return it as GameRecipesT[]
    })
}

interface GameLiquidsT {
  id: string
  category: string
  isLiquid: true

  color: { r: number; g: number; b: number }
  localeName: string
  qualities: { id: string; amount: number }[]
  valuePerLiter: number
  injectionSickness?: number
  injectable?: boolean
}
function fetchLiquids() {
  return fetch(urlLiquids)
    .then((it) => it.json())
    .then((it) => {
      it.forEach((it) => {
        if (it.localeName === 'cleanwater') {
          it.localeName = 'water'
        }

        it.id = 'liq' + it.localeName
        it.category = 'liquid'
        it.isLiquid = true
        it.qualities.forEach((it) => {
          it.id = 'liq' + it.id
        })
      })
      return it as GameLiquidsT[]
    })
}

function fetchEnTranslationItem() {
  return fetch(urlEnTranslation)
    .then((it) => it.json())
    .then((it) => it.main as Record<string, string>)
}
