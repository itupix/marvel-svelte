<script lang="ts">
  import Character from "components/Character.svelte";
  import Error from "components/Error.svelte";
  import { fade } from "svelte/transition";
  import type { CharacterDetailsType } from "types/CharacterDetailsType";

  export let characters: CharacterDetailsType[];
</script>

<ul out:fade={{ duration: 200 }} in:fade={{ duration: 200 }}>
  {#each characters as character}
    <li>
      <Character {character} />
    </li>
  {:else}
    <Error message="Aucun résultat." />
  {/each}
</ul>

<style>
  ul {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 1rem;
  }

  li {
    padding: 1rem;
    text-align: center;
  }
</style>
