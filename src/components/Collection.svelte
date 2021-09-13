<script lang="ts">
  import BookList from "./BookList.svelte";
  import Error from "./Error.svelte";
  import Loader from "./Loader.svelte";
  import { fetchCollection } from "../shared/services";
  import { details } from "../shared/stores";

  export let category: string;
</script>

<div class="content">
  {#await fetchCollection($details[category].collectionURI)}
    <Loader centered />
  {:then collection}
    <BookList {collection} />
  {:catch}
    <Error
      message="Impossible d'afficher les références de ce personnage à cause d'une erreur technique."
    />
  {/await}
</div>

<style>
  .content {
    padding: 1rem;
    overflow: auto;
  }
</style>
