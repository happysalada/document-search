<script lang="ts">
  import "../app.postcss";
  import Loader from "$lib/Loader.svelte";
  import { onMount } from "svelte";

  let loaded = false;
  onMount(async () => {
    loaded = true;
  });
</script>

{#if !loaded}
  <Loader />
{:else}
  <main class="h-full bg-gray-100">
    <slot />
  </main>
{/if}
