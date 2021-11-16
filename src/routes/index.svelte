<script lang="ts">
  import { Field } from '$lib/db';
  import Leaflet from '$lib/leaflet/Leaflet.svelte';
  import GeoJson from '$lib/leaflet/GeoJson.svelte';
  import { goto } from '$app/navigation';

  function redirect_to_field(field: Field) {
    goto(`/fields/${field.id}`);
  }
</script>

<main class="w-full">
  {#await Field.getAll()}
    <!-- This is a crappy screen. The data is local, this will _always_ just flash quickly -->
    <p>Loading ...</p>
  {:then fields}
    <Leaflet class="h-screen">
      {#each fields as field (field.id)}
        <GeoJson
          geojson={field.geojson}
          zoomTo={true}
          on:click={() => redirect_to_field(field)}
        />
      {/each}
    </Leaflet>
  {/await}
</main>
