<script lang="ts">
  import Bio from "components/Bio.svelte";
  import CloseButton from "components/CloseButton.svelte";
  import References from "components/References.svelte";
  import { details } from "shared/stores";
  import { fly } from "svelte/transition";

  $: isOpen = !!$details;

  const flyParams = { y: 500, duration: 500 };
  const close = () => (isOpen = false);
  const onCloseAnimationEnds = () => details.set(null);
</script>

{#if isOpen}
  <div
    class="details"
    in:fly={flyParams}
    out:fly={flyParams}
    on:outroend={onCloseAnimationEnds}
  >
    <Bio />
    <References />
    <CloseButton class="close-details" on:click={close} />
  </div>
{/if}

<style>
  .details {
    position: fixed;
    left: 1rem;
    right: 1rem;
    top: 5.5rem;
    bottom: 0;
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-gap: 2rem;
    padding: 1rem 1rem 0;
    border-radius: 1rem 1rem 0 0;
    background-color: #fff;
  }

  .details :global(.close-details) {
    position: absolute;
    right: 1rem;
    top: 1rem;
  }
</style>
