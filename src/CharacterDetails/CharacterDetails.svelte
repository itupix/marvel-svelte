<script>
  import References from '../References';
  import { details } from '../stores';
  import './CharacterDetails.scss';

  const close = () => details.set(null);
  const getAvatarSrc = ({ thumbnail }) => `${thumbnail.path}/standard_xlarge.${thumbnail.extension}`;
  
  $: className = $details ? 'character-details--visible' : '';
</script>

<div class={`character-details ${className}`}>
  {#if $details}
    <div class="bio">
      <img class="bio__avatar" src={getAvatarSrc($details)} alt={$details.name} />
      <h2 class="bio__title">{$details.name}</h2>
      <p class="bio__description">{$details.description}</p>
    </div>
    <References />
    <button class="character-details__close" on:click={close}>Fermer</button>
  {/if}
</div>