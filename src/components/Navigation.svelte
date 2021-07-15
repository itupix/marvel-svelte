<script lang="ts">
  import { details, offset, total } from "shared/stores";
  import { fade } from "svelte/transition";

  $: isFirst = $offset === 0;
  $: numberOfPages = Math.ceil($total / 20);
  $: currentPage = $offset / 20 + 1;
  $: isLast = numberOfPages === currentPage;
  $: isVisible = numberOfPages > 1 && !$details;
</script>

{#if isVisible}
  <nav class="navigation" in:fade={{ duration: 200 }} out:fade>
    <span>{currentPage} / {numberOfPages}</span>
    <button on:click={offset.decrement} disabled={isFirst}>❮</button>
    <button on:click={offset.increment} disabled={isLast}>❯</button>
  </nav>
{/if}

<style>
  .navigation {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 12rem;
    justify-self: end;
  }

  span {
    margin-right: 1rem;
    font-size: 0.8rem;
  }

  button {
    width: 2.5rem;
    height: 2.5rem;
    cursor: pointer;
    border-radius: 50%;
    border: 0;
    background-color: #eee;
    transition: background-color linear 0.2s;
  }

  button:not(:last-child) {
    margin-right: 0.5rem;
  }

  button:hover,
  button:focus {
    background-color: #ddd;
  }
</style>
