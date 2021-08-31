<script lang="ts">
  import Logo from "components/Logo.svelte";
  import Navigation from "components/Navigation.svelte";
  import Search from "components/Search.svelte";
  import { details, offset, query } from "shared/stores";

  const onSubmit = ({ detail }) => {
    details.set(null);
    offset.set(0);
    query.set(detail.query);
  };
</script>

<header>
  <Logo />
  <Search disabled={$details} on:submit={onSubmit} />
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
