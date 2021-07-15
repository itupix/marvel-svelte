<script lang="ts">
  import { createEventDispatcher } from "svelte";

  let className = "";
  export { className as class };

  const dispatch = createEventDispatcher();
  const onClose = () => dispatch("click");
</script>

<button class={`close ${className}`} on:click={onClose}>Fermer</button>

<style>
  .close {
    width: 2rem;
    height: 2rem;
    padding: 0;
    font-size: 0;
    cursor: pointer;
    border: 0;
    outline: none;
    border-radius: 50%;
    background-color: #eee;
    transition: background-color linear 0.2s;
  }

  .close:focus,
  .close:hover {
    background-color: #ddd;
  }

  .close:before {
    content: "✕";
    font-size: 1rem;
  }
</style>
