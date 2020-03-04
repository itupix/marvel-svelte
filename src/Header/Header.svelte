<script>
  import Navigation from '../Navigation';
  import './Header.scss';
  import { query, offset, details } from '../stores';

  let currentQuery = null;

  const onSubmit = e => {
    e.preventDefault();
    details.set(null);
    offset.set(0);
    query.set(currentQuery);
  };
</script>

<header>
  <h1>M<span>AR<b>S</b>VEL<b>TE</b></span></h1>
  <form class="search" on:submit={onSubmit}>
    <input type="text" bind:value={currentQuery} />
    <input type="submit" value="🔎" />
  </form>
  <Navigation />
</header>