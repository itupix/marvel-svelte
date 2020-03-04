<script>
  import { details } from '../stores';
  import { fetchCollection } from '../services';
  import { categories } from '../constants';
  import Loader from '../Loader';
  import Error from '../Error';
  import Collection from '../Collection';

  import './References.scss';

  let current = 0;

  const setCurrent = index => {
    current = index;
  };

  $: promise = fetchCollection;
</script>

<div class="references">
  <nav class="tabs" data-current={current}>
    {#each categories as category, index}
      <button on:click={() => setCurrent(index)}>{category.label}</button>
    {/each}
  </nav>
  <div class="tab-content" data-current={current}>
    {#each categories as category}
      {#await promise($details[category.key].collectionURI)}
        <Loader centered />
      {:then collection}
        <Collection collection={collection} />
      {:catch}
        <Error message="Impossible d'afficher les références de ce personnage à cause d'une erreur technique." />
      {/await}
    {/each}
  </div>
</div>