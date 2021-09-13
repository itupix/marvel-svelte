<!-- import Search from "components/Search.svelte";
import { details, offset, query } from "shared/stores";

const onSubmit = ({ detail }) => {
    details.set(null);
    offset.set(0);
    query.set(detail.query);
};

<Search disabled={!!$details} on:submit={onSubmit} /> -->
<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import CloseButton from "./CloseButton.svelte";
  export let disabled = false;

  let query = null;

  const dispatch = createEventDispatcher();

  const onSubmit = (e: Event) => {
    e.preventDefault();
    dispatch("submit", { query });
  };

  const clear = (e: Event) => {
    query = null;
    onSubmit(e);
  };
</script>

<form class="search" on:submit={onSubmit} class:disabled>
  <input {disabled} type="text" bind:value={query} />
  <input {disabled} type="submit" value="🔎" />
  {#if query}
    <CloseButton class="clear" on:click={clear} />
  {/if}
</form>

<style>
  form {
    transition: opacity linear 0.2s;
  }
  .disabled {
    opacity: 0.5;
  }

  .search {
    flex: 0 1 20rem;
    position: relative;
    margin: 0 0.5rem;
  }

  input {
    -webkit-appearance: none;
    appearance: none;
    font-size: 1rem;
    border: none;
    background-color: transparent;
    outline: none;
  }

  [type="text"] {
    width: 100%;
    padding: 0.5rem 3rem;
    border: 1px solid #ccc;
    border-radius: 1.25rem;
    height: 2.5rem;
    border: 0;
    background-color: #eee;
    transition: box-shadow linear 0.2s;
  }

  [type="text"]:focus {
    box-shadow: inset 0 0 0 4px #ddd;
  }

  [type="submit"] {
    position: absolute;
    top: 1px;
    left: 0.5rem;
    width: calc(2.5rem - 2px);
    height: calc(2.5rem - 2px);
    cursor: pointer;
    border-radius: 50%;
    transition: background-color linear 0.2s;
  }

  [type="submit"]:focus {
    background-color: #ddd;
  }

  :global(.clear) {
    position: absolute;
    right: 4px;
    top: 50%;
    background-color: #ccc;
    transform: translateY(-50%);
  }
</style>
