<script lang="ts">
  import { scale } from "svelte/transition";
  export let centered: boolean;
</script>

<div in:scale out:scale class="loader" class:centered>Chargement</div>

<style>
  .loader {
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    font-size: 0.5rem;
  }

  .loader:not(.centered) {
    position: relative;
  }

  .centered {
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
  }

  .loader:before,
  .loader:after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    box-shadow: 0 -5px 0 -1px #ec1d24;
    animation: rotate 1s infinite;
  }

  .loader:before {
    box-shadow: 0 -5px 0 -1px #ec1d24;
  }

  .loader:after {
    box-shadow: 0 5px 0 -1px #ec1d24;
  }

  @keyframes rotate {
    0% {
      transform: rotateZ(0);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
