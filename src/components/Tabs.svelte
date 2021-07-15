<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let items;
  export let current;

  const dispatch = createEventDispatcher();
  const onClick = (item) => () => dispatch("change", { item });

  $: index = items.findIndex((item) => item === current);
</script>

<nav class="tabs">
  {#each items as item}
    <button on:click={onClick(item)}>{item}</button>
  {/each}
  <div style={`transform: translateX(${5.5 * index}rem)`} />
</nav>

<style>
  .tabs {
    position: relative;
    display: flex;
    padding-left: 1rem;
    padding-right: 1rem;
    border-bottom: 1px solid #ddd;
  }

  div {
    content: "";
    position: absolute;
    left: 1rem;
    bottom: -3px;
    width: 5.5rem;
    height: 5px;
    border-radius: 4px;
    background-color: #ec1d24;
    transition: transform ease-in-out 0.3s;
    will-change: transform;
  }

  button {
    width: 5.5rem;
    padding: 1rem;
    text-align: center;
    font-size: 1rem;
    text-transform: capitalize;
    cursor: pointer;
    border: 0;
    outline: none;
    background-color: transparent;
    transition: opacity linear 0.2s;
  }

  button:hover,
  button:focus {
    opacity: 0.5;
  }
</style>
