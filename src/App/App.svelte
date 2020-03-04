<script>
  import Header from '../Header';
  import Characters from '../Characters';
  import Error from '../Error';
  import Loader from '../Loader';
  import CharacterDetails from '../CharacterDetails';
  import { fetchCharacters } from '../services';
  import { query, offset } from '../stores';
  import './App.scss';

  $: promise = fetchCharacters({ query: $query, offset: $offset });
</script>

<Header />
<main>
  {#await promise}
    <Loader centered />
  {:then characters}
    <Characters characters={characters} />
  {:catch}
    <Error message="Impossible de d'afficher la liste des personnages à cause d'une erreur technique." />
	{/await}
  <CharacterDetails/>
</main>