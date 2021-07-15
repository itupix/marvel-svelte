<script lang="ts">
  import { getThumbnailSrc } from "shared/getThumbnailSrc";
  import type { CollectionType } from "types/Collectiontype";
  export let collection: CollectionType[];
</script>

{#if collection.length}
  <ul class="list">
    {#each collection as item}
      <li>
        <img
          src={getThumbnailSrc(item.thumbnail, "portrait_medium")}
          alt={item.title}
        />
        {item.title}
      </li>
    {/each}
  </ul>
{:else}
  <p class="message">Cette collection est vide.</p>
{/if}

<style>
  .message {
    margin-top: 2rem;
    text-align: center;
  }

  .list {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: 100px 100px 100px 100px 100px 100px 100px 100px;
  }

  li {
    font-size: 0.6rem;
  }

  img {
    width: 100px;
    height: 150px;
    margin-bottom: 0.5rem;
  }
</style>
