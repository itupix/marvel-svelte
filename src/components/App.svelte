<script lang="ts">
  import CharacterDetails from "components/CharacterDetails.svelte";
  import Characters from "components/Characters.svelte";
  import Error from "components/Error.svelte";
  import Header from "components/Header.svelte";
  import Loader from "components/Loader.svelte";
  import { fetchCharacters } from "shared/services";
  import { offset, query } from "shared/stores";
</script>

<Header />
<main>
  {#await fetchCharacters($query, $offset)}
    <Loader centered />
  {:then characters}
    <Characters {characters} />
  {:catch}
    <Error
      message="Impossible de d'afficher la liste des personnages à cause d'une erreur technique."
    />
  {/await}
  <CharacterDetails />
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(ul) {
    list-style: none;
  }

  :global(body) {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-family: sans-serif;
    color: #333;
    background-color: #eee;
  }

  main {
    position: relative;
    flex: 1 0 auto;
    padding: 1rem;
  }
</style>
