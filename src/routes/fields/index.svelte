<script context="module" lang="ts">
  import { Field } from '$lib/db';
  import FieldCard from '$lib/components/FieldCard.svelte';
  import Header from '$lib/components/Header.svelte';
</script>

<!-- TODO: Remove component ?
<header class="sticky top-0 bg-purdue-gray shadow z-500">
  <h1 class="p-3 text-white font-semibold">Fields</h1>
</header>
-->

<Header title="Fields" backPath={false}>
  <div slot="right" class="flex items-stretch">
    <div>
      <div class="form-control">
        <input
          type="text"
          placeholder="Search"
          class="input input-sm bg-primary-focus text-base-content placeholder-gray-900 input-primary"
        />
      </div>
    </div>
    <div class="dropdown dropdown-end">
      <div tabindex="0" class="btn btn-sm btn-ghost rounded-btn">Sort</div>
      <ul
        tabindex="0"
        class="p-2 shadow menu dropdown-content bg-base-100 rounded-box w-52"
      >
        <li>
          <button class="btn btn-ghost">Name</button>
        </li>
        <li>
          <button class="btn btn-ghost">GDU</button>
        </li>
        <li>
          <button class="btn btn-ghost">Rain</button>
        </li>
      </ul>
    </div>
  </div>
</Header>

{#await Field.getAll()}
  <!-- Fetching from IndexedDB -->
{:then fields}
  <div class="flex flex-col">
    {#each fields as field (field.id)}
      <FieldCard {field} />
      <div class="divider w-11/12 place-self-center" />
    {/each}
  </div>
{/await}
