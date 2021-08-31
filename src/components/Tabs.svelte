<script lang="ts">
  import { createEventDispatcher } from "svelte";
  export let items: string[] = [];
  export let current: string = null;

  const dispatch = createEventDispatcher();
  const onClick = (item: string) => () => dispatch("change", { item });

  let selected: HTMLElement = null;

  $: shift = selected?.offsetLeft;
  $: width = selected?.offsetWidth;
</script>

<nav class="tabs">
  {#each items as item}
    {#if item === current}
      <button bind:this={selected} on:click={onClick(item)}>{item}</button>
    {:else}
      <button on:click={onClick(item)}>{item}</button>
    {/if}
  {/each}
  <div style={`width: ${width}px; transform: translateX(${shift}px)`} />
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
    left: 0;
    bottom: -3px;
    width: 5.5rem;
    height: 5px;
    border-radius: 4px;
    background-color: #ec1d24;
    transition: transform ease-in-out 0.3s, width ease-in-out 0.3s;
    will-change: transform;
  }

  button {
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
