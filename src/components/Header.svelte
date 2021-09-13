<script lang="ts">
  import Logo from "./Logo.svelte";
  import Navigation from "./Navigation.svelte";
  import { details, offset, query } from "shared/stores";
  import Search from "./Search.svelte";

  const onSubmit = ({ detail }) => {
    details.set(null);
    offset.set(0);
    query.set(detail.query);
  };
</script>

<header>
  <Logo />
  <Search on:submit={onSubmit} disabled={!!$details} />
  <Navigation />
</header>

<style>
  header {
    position: sticky;
    top: 0;
    z-index: 1;
    display: grid;
    align-items: center;
    grid-template-columns: 1fr 1fr 1fr;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.8);
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }
</style>
