import { extract, type MaybeGetter } from 'runed'
import * as _ from 'radashi'
import { onMount, untrack } from 'svelte'

export interface Ref<T> {
  value: T
}

export type MaybeRef<T> = T | Ref<T>

export const deref = <T>(v: MaybeRef<T>) =>
  typeof v === 'object' && v !== null && 'value' in v ? v.value : v

export const useAsyncState = <T>(p: Promise<T>, initValue: MaybeGetter<T>) => {
  let r = ref(extract(initValue), { raw: true })
  p.then((it) => {
    r.value = it
  })
  return r
}

export const useAsyncState2 = <T>(p: MaybeRef<Promise<T>>, initValue: MaybeRef<NoInfer<T>>) => {
  let currDefault = $derived(deref(initValue))

  const v = $derived(
    useAsyncState(
      deref(p),
      untrack(() => currDefault)
    )
  )

  $effect(() => {
    currDefault = v.value
  })
  return computed(() => v.value)
}

export const useCountUp = (time: number) => {
  const r = ref(0)
  onMount(() => {
    const i = setInterval(() => r.value++, time)
    return () => clearInterval(i)
  })
  return r
}

export const usePrevious = <T>(arg: Ref<T>) => {
  let prevValue = undefined as T
  const r = ref<T>(undefined as T)

  $effect(() => {
    r.value = prevValue
    prevValue = arg.value
  })

  return r
}

export const useCurrentUrl = () => {
  const r = ref(new URL(document.URL))
  onMount(() => {
    window.addEventListener('popstate', () => {
      r.value = new URL(document.URL)
    })
  })
  return r
}

export const ref = <T>(it: T, param = { raw: false }) => {
  if (param.raw) {
    let v = $state.raw(it)
    return computed({
      get: () => v,
      set: (arg) => (v = arg),
    })
  }

  const r = $state({
    value: it,
  })

  return r
}

export const computed = <T>(arg: { get: () => T; set: (v: T) => void } | (() => T)) => {
  if (typeof arg === 'function') {
    const v = $derived.by(arg)
    return {
      get value() {
        return v
      },
      set value(arg) {
        throw new Error('src/util/uutil.svelte.ts:83')
      },
    }
  }

  return {
    get value() {
      return arg.get()
    },
    set value(v) {
      arg.set(v)
    },
  }
}
