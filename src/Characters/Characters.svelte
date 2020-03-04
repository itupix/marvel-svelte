<script>
  import Character from '../Character';
  import Error from '../Error';
  import './Characters.scss';
  export let characters;
</script>

{#if characters.length}
  <ul class="characters">
    {#each characters as character}
      <li>
        <Character character={character} />
      </li>
    {/each}
  </ul>
{:else}
  <Error message="Aucun résultat." />
{/if}