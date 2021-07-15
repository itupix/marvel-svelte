<script lang="ts">
  import Collection from "components/Collection.svelte";
  import Tabs from "components/Tabs.svelte";
  import { CategoriesEnum } from "enums/CategoriesEnum";

  let current: string = CategoriesEnum.comics;

  const onTabChange = ({ detail }) => {
    current = detail.item;
  };
</script>

<div class="references">
  <Tabs
    items={Object.values(CategoriesEnum)}
    {current}
    on:change={onTabChange}
  />
  <Collection category={current} />
</div>

<style>
  .references {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 6.5rem);
  }
</style>
