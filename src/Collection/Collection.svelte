<script>
  export let collection;
  
  const getThumbnailSrc = ({ thumbnail }) => thumbnail ? `${thumbnail.path}/portrait_medium.${thumbnail.extension}` : "http://i.annihil.us/u/prod/marvel/i/mg/b/40/image_not_available/portrait_medium.jpg";
</script>

<div class="tab-content__item">
  {#if collection.length}
    <ul class="references-list">
      {#each collection as item}
        <li>
          <img src={getThumbnailSrc(item)} alt={item.title}/>
          {item.title}
        </li>
      {/each}
    </ul>
  {:else}
    <p class="tab-content__message">Cette collection est vide.</p>
  {/if}
</div>