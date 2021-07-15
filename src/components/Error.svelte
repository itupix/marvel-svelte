<script lang="ts">
  export let message: string;
</script>

<div class="error">
  <p>
    {message}
  </p>
</div>

<style>
  .error {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
</style>
