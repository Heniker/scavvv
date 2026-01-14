<!-- https://svelte.dev/playground/hello-world?version=5.46.0#H4sIAAAAAAAACo1VTW_bOBD9KxNigUiAQKNXreU2SLcI0ObUAHuoemDFsS2EJgVy7Kwh6L8vKEo2JTuBfbE18958vfGoZVrskOXsCZUy8GaskpCgrAllyjK2rhU6lv9qGR0bj_MGlo2sh6bh7oCKvO2PcHjNXhlNqMmxnC1dZeuGVqUuqd41xhJ8R2weVH1AWFuzg3u-OFmGEPcR-icJwvVencCjIcYuFqCQwNcCBfzlPCS573u7T__2CO8ms9ko7PlnFNk99pAB9DrW8iLsBskDJdr6gDKJ-Z_PheWw1xLXtUbpAy0X55b18tws9fGKdpagWy3P_QfOnz2R0WB0perqtWiTFIrVrPq76LHrpxsMUJldYzRq8pWESCuWMcL_iOW-2S57R9q5ClOBr3gvZQYl9KYoGbmSrUoNMIjYws7sNWVg9Fd0ZM0xg73ubdANyp7kjFiVRUH4QCSq7Q41fcfjDL8QJ6eLuT913TRIL-ZxnMd5gS5c0Spp6DepHeTKgHNu0RF0OQh99OvQWNO4JA3gymhH4MhYsfG6aHyDf1G8PotmhPh4Q7NPQkuFFgoImradB5yGkgxWb4QZx0cD6CZpQ-_o8w6cX1cmlqS_c0hQ5fD08vzjH4XeHicCqNeQ3IWO07MVwCLtrR6fu1JPCEPXfIOUDOQJOxS5tmLjM0IB0lR7_5OHKr8Oj98GRGgx5lbbWkkowvYkl8JlcToYNMtPKbPY2cuWQwsuhMkvJY7w46DD5z354vih4sbiAYoZIYbdEuqESvoBpLGvm_aEh3hqXVz0KI87yZNBe57NMNwuvSIvKi6aBrV89JjkitB8jBPNKWzLZUMf0Yc8CeccFe9LsqjjmvqvXpluflxlfQBHR4VFyWTtGiWOOYxXqWTQcs7H_4i_s7I-rEp92zV890pMz-JHsBvuY7g1w0Z-eGwmnbdfLGqJdmR-5onnpd3N3U1forOeLpzvvNBve-1aoaXZPfp97hd-wD0L2vLgS9J5g8vtp9XzMbxjofZ_20mU7m652H660PJ3xkjU6q3WkuVroRx2_wOW95LM7wgAAA -->
<script lang="ts">
  import { mount, onDestroy, unmount, type Snippet } from 'svelte'
  import { createAttachmentKey } from 'svelte/attachments'
  import SnippetToComponent from './SnippetToComponent.svelte'
  import { assert } from 'radashi'

  let { target, ...rest }: { target?: Snippet<[any]> } = $props()

  const storage = new WeakMap<Snippet<any[]>, DocumentFragment>()

  let unmountHandler = () => {}
  onDestroy(() => {
    unmountHandler()
  })

  const attachee = {
    [createAttachmentKey()]: (el: HTMLElement) => {
      if (!target) {
        return
      }

      if (!storage.get(target)) {
        const fragment = document.createDocumentFragment()
        const child = mount(SnippetToComponent, {
          target: fragment as ShadowRoot,
          props: { children: target, ...rest },
        })

        unmountHandler = () => {
          const prev = unmountHandler
          unmountHandler = () => {
            unmount(child)
          }
          prev()
        }

        storage.set(target, fragment)
      }

      el.appendChild(storage.get(target) as Node)

      // fixes some fork issue
      const target_ = target
      return () => {
        const st = storage.get(target_)
        assert(st)
        st.append(...el.children)
      }
    },
  }
</script>

<div style="display: contents" {...attachee}></div>
