<script lang="ts">
  import { goto } from '$app/navigation';

  import BackArrow from '$lib/icons/BackArrow.svelte';

  export let title = '';
  export let backPath: string | false = false;

  function handleBack() {
    if (backPath) {
      goto(backPath);
    }
  }
</script>

<div
  class="navbar sticky top-0 h-2 bg-primary-focus text-base-content border-b-2 border-primary shadow z-[500]"
>
  <div class=" px-2">
    {#if backPath}
      <BackArrow on:click={handleBack} class="w-6 h-6 mr-2" />
    {/if}
    <span class="text-lg font-bold">{title}</span>
  </div>

  <div class="flex justify-end flex-1 px-2">
    <slot name="right" />
  </div>
</div>
