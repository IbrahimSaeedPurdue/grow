<script lang="ts">
  import type { Field, Variety } from '$lib/db';

  import { goto } from '$app/navigation';
  import { format, differenceInDays, getDayOfYear } from 'date-fns';
  import { cornGDD } from '$lib/utils/gdd';
  import { weatherStore } from '$stores/weather';

  import Leaflet from '$lib/leaflet/Leaflet.svelte';
  import GeoJson from '$lib/leaflet/GeoJson.svelte';
  import UpIcon from '$lib/icons/UpIcon.svelte';
  import DownIcon from '$lib/icons/DownIcon.svelte';
  import CornIcon from '$lib/icons/CornIcon.svelte';

  export let field: Field;

  // Get field variety
  // TODO: Got to be a less ugly way?
  let variety: Variety | undefined;
  $: field.getVariety().then((v) => (variety = v));

  // Parameters of the weather computations
  const now = new Date('09/15/2021');
  const year = now.getFullYear();
  const todayDoY = getDayOfYear(now);
  const plantDoY = getDayOfYear(field.datePlanted || now);

  // Years to base weather insights from
  const years = Array.from(new Array(6), (_, i) => year - i);

  // Get the last N years of weather
  const weather = weatherStore(field.center, years);

  // TODO: Move most of this into a util???
  let gdu = 0;
  $: {
    const w = $weather.get(year);

    gdu = cornGDD(w)
      .slice(plantDoY, todayDoY + 1)
      .reduce((a, b) => a + b, 0);
  }

  let avgGdu = 0;
  $: {
    // TODO: We are showing GDU acculmation as of the last weather downloaded compared to the average up to today.
    //       For example: Weather downloaded 5 days ago includs only up to 5 days ago, but last years weather as the entire year
    const gduAverages = [...$weather.values()].map((w) =>
      cornGDD(w)
        .slice(plantDoY, todayDoY + 1)
        .reduce((a, b) => a + b, 0)
    );

    avgGdu = gduAverages.reduce((a, b) => a + b, 0) / gduAverages.length;
  }

  let rain = 0;
  $: {
    let thisYear = $weather.get(year);
    if (thisYear) {
      rain = thisYear.precipitation
        .slice(plantDoY, todayDoY + 1)
        .filter((a) => a !== -999)
        .reduce((a, b) => a + b, 0);
    }
  }

  let avgRain = 0;
  $: {
    // TODO: We are showing GDU acculmation as of the last weather downloaded compared to the average up to today.
    //       For example: Weather downloaded 5 days ago includs only up to 5 days ago, but last years weather as the entire year
    const rainAverages = [...$weather.values()].map((w) =>
      w.precipitation
        .slice(plantDoY, todayDoY + 1)
        .filter((a) => a !== -999)
        .reduce((a, b) => a + b, 0)
    );
    avgRain = rainAverages.reduce((a, b) => a + b, 0) / rainAverages.length;
  }
</script>

<div class="card rounded-none">
  <figure on:click={() => goto(`/fields/${encodeURIComponent(field.id)}`)}>
    <Leaflet class="h-56" zoomControl={false} dragable={false} zoomable={false}>
      <GeoJson geojson={field.geojson} zoomTo={true} />
    </Leaflet>
  </figure>
  <progress
    class="progress progress-secondary rounded-none"
    value={gdu}
    max={variety?.gduToBlack}
  />

  <div class="card-body p-4 pb-0">
    <div class="flex">
      <div class="flex-1">
        <h1 class="card-title text-2xl pb-0 mb-0">{field.name || ''}</h1>
        <div class="flex flex-row text-xs text-primary items-center">
          <CornIcon class="w-5 h-5 fill-current" />
          {Math.round(field.area)} ac.
        </div>
      </div>
      <div class="flex-1 text-center font-bold">
        <!-- TODO: Do an actual stage estimate -->
        <div class="badge badge-primary badge-lg font-bold h-8">R5</div>
      </div>
      <div class="text-right flex-1 text-">
        {variety?.product}
      </div>
    </div>

    <div class="stats">
      <div class="stat justify-items-center">
        <div>
          <div class="stat-title">Planted</div>
          <div class="stat-value text-xl font-semibold">
            {field.datePlanted ? format(field.datePlanted, 'MMM do') : ''}
          </div>
          <div class="stat-desc">
            {field.datePlanted
              ? `${differenceInDays(new Date(), field.datePlanted)} days ago`
              : ''}
          </div>
        </div>
      </div>

      <div class="stat justify-items-center">
        <div>
          <div class="stat-title">GDU</div>
          <div class="stat-value text-xl font-semibold">
            {gdu}<span class="text-xs text-gray-400"
              >/{variety?.gduToBlack}</span
            >
          </div>
          <div class="stat-desc">
            {#if gdu > avgGdu}
              {Math.floor(gdu - avgGdu)} ahead
            {:else}
              {Math.floor(avgGdu - gdu)} behind
            {/if}
          </div>
        </div>
      </div>

      <div class="stat justify-items-center">
        <div>
          <div class="stat-title">Rain</div>
          <div class="stat-value text-xl font-semibold">
            {rain.toFixed(1)} in.
          </div>
          <div class="stat-desc">
            {#if rain > avgRain}
              <UpIcon /> {(rain - avgRain).toFixed(1)} in.
            {:else}
              <DownIcon /> {(avgRain - rain).toFixed(1)} in.
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .stat {
    @apply px-2;
  }
</style>
