<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import CloseButton from "./CloseButton.svelte";
    export let disabled: boolean = false;

    const dispatch = createEventDispatcher();

    let query: string = null;

    const onSubmit = () => {
        dispatch("submit", { query });
    };

    const reset = () => {
        query = null;
    };

    $: console.log({ query });
</script>

<form class="search" on:submit|preventDefault={onSubmit}>
    <input {disabled} type="text" bind:value={query} />
    {#if query}
        <CloseButton on:click={reset} />
    {/if}
</form>
