<script lang="ts">
  import { onMount } from 'svelte';

  export let name = 'world';

  let shouldShow = true;

  onMount(() => {
    setTimeout(() => {
      name = 'Svelte';
    }, 5000);
  });
</script>

<div>
  {#if shouldShow}
    <h1>Hello {name}!</h1>
  {/if}
</div>

<button on:click={() => (shouldShow = !shouldShow)}>Toggle Content</button>

<style>
  div {
    background-color: black;
  }
  h1 {
    color: #ff3e00;
  }
</style>
