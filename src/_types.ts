import type { api } from './api'

export type UiGameLiquidT = {} & (typeof api.fetchLiquids)['$type']

export type UiGameItemT = {} & (typeof api.fetchItems)['$type']

export type UiListEntityT = UiGameItemT | UiGameLiquidT
