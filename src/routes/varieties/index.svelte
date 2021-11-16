<script lang="ts">
  import { goto } from '$app/navigation';
  import { Variety } from '$lib/db/Variety';

  import PollenIcon from '$lib/icons/PollenIcon.svelte';
  import CornIcon from '$lib/icons/CornIcon.svelte';
  import Header from '$lib/components/Header.svelte';

  let search = '';

  let varieties: Map<string, Variety[]> = new Map();
  $: {
    // TODO: Move this group by somewhere else??
    Variety.searchByProduct(search).then((v) => {
      const g = v.reduce(
        (map, e) => map.set(e.brand, [...(map.get(e.brand) || []), e]),
        new Map()
      );
      varieties = g;
    });
  }

  function handleCreateVariety() {
    goto(`varieties/new/edit?product=${encodeURIComponent(search)}`);
  }
</script>

<Header title="Varieties" />

<div class="form-control mx-2">
  <span class="text-sm pt-2 pb-1">Search variety</span>
  <label class="input-group">
    <span>
      <svg
        class="fill-current text-gray-500 w-6 h-6"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
      >
        <path
          d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"
        />
      </svg>
    </span>
    <input
      bind:value={search}
      id="search"
      type="text"
      placeholder="DKC63-..."
      class="input input-bordered w-full"
    />
  </label>
</div>

<!-- TODO: Replace with table? -->
<div class="w-full">
  <div class="bg-white px-3 py-2 mb-4">
    <div class="text-sm px-2">
      {#each Array.from(varieties.entries()) as [brand, vs]}
        <h2 class="uppercase text-xs font-extralight tracking-wide pt-6">
          {brand}
        </h2>
        <div class="divide-y divide-gray-100">
          {#each vs as variety (variety.brand + variety.product)}
            <div
              on:click={() =>
                goto(`varieties/${variety.id}/edit`, { replaceState: false })}
              class="flex-col items-center cursor-pointer text-gray-700
						hover:text-blue-400 hover:bg-blue-100 rounded-sm m-2 py-1"
            >
              <div class="flex-grow text-lg">{variety.product}</div>
              <div class="flex flex-row mt-2">
                <PollenIcon class="w-4 h-4 mr-2" />
                {#if variety.gduToTassel}
                  {variety.gduToTassel}
                {:else}
                  <span class="text-red-300">Unknown</span>
                {/if}
                <CornIcon class="w-4 h-4 ml-2 mr-2" />
                {#if variety.gduToBlack}
                  {variety.gduToBlack}
                {:else}
                  <span class="text-red-300">Unknown</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/each}

      {#if search.length > 0}
        <button class="mt-4" on:click={handleCreateVariety}>
          <p class="font-light tracking-wide">
            create <span class="normal-case text-normal font-normal"
              >{search} ...</span
            >
          </p>
        </button>
      {/if}
    </div>
  </div>
</div>
