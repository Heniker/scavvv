<script lang="ts" generics="T">
  import { type Snippet } from 'svelte'

  // type SnippetProps<Snip extends Snippet<[any]>> =
  //   Snip extends Snippet<[infer Props]> ? Props : never

  //  use <Component {...{arg: value}} /> . Otherwise TS will not work
  let { children, ...rest }: { children: Snippet<[T]> } & NoInfer<T> & { [key: string]: any } =
    $props()
</script>

{@render children?.({ ...rest })}
