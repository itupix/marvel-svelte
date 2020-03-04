<script>
  import { offset, total, details } from '../stores';
  import { fetchCharacters } from '../services';
  import './Navigation.scss';

  const decrement = () => offset.update(n => n - 20);
  const increment = () => offset.update(n => n + 20);
  
  $: isFirst = $offset === 0;
  $: numberOfPages = Math.ceil($total / 20);
  $: currentPage = $offset / 20 + 1;
  $: isLast = numberOfPages === currentPage;
  $: isVisible = numberOfPages > 1 && !$details;
</script>


<nav class="navigation">
  {#if isVisible}
    <span>{currentPage} / {numberOfPages}</span>
    <button on:click={decrement} disabled={isFirst}>❮</button>
    <button on:click={increment} disabled={isLast}>❯</button>
  {/if}
</nav>