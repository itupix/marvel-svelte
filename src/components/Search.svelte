<script lang="ts">
  import { createEventDispatcher } from "svelte";
  let query = null;

  const dispatch = createEventDispatcher();
  const onSubmit = (e: Event) => {
    e.preventDefault();
    dispatch("submit", { query });
  };
</script>

<form class="search" on:submit={onSubmit}>
  <input type="text" bind:value={query} />
  <input type="submit" value="🔎" />
</form>

<style>
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
    padding: 0.5rem 3rem 0.5rem 1.25rem;
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
    right: 1px;
    width: calc(2.5rem - 2px);
    height: calc(2.5rem - 2px);
    cursor: pointer;
    border-radius: 50%;
    transition: background-color linear 0.2s;
  }

  [type="submit"]:focus {
    background-color: #ddd;
  }
</style>
