<script>
  import { details } from '../stores';
  import './Character.scss';
  export let character;

  const getAvatarSrc = ({ thumbnail }) => `${thumbnail.path}/standard_medium.${thumbnail.extension}`;
  const displayDetails = () => details.set(character);
</script>

<button class="character" on:click={displayDetails}>
  <img class="avatar" src={getAvatarSrc(character)} alt={character.name}/>
  <span class="name">{character.name}</span>
</button>