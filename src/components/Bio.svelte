<script lang="ts">
  import { getThumbnailSrc } from "shared/getThumbnailSrc";
  import { details } from "shared/stores";
</script>

<div class="bio">
  <img
    class="avatar"
    src={getThumbnailSrc($details.thumbnail, "standard_xlarge")}
    alt={$details.name}
  />
  <h2 class="title">{$details.name}</h2>
  <p class="description">{$details.description}</p>
</div>

<style>
  .bio {
    width: 200px;
  }

  .avatar {
    display: block;
    width: 200px;
    height: 200px;
    margin-top: -1.5rem;
    margin-bottom: 1rem;
    border-radius: 50%;
    border: 0.5rem solid #fff;
    box-shadow: 0 3px #eee;
  }

  .title {
    margin-top: 0;
    margin-bottom: 1rem;
    font-size: 1rem;
    text-align: center;
  }

  .description {
    margin-top: 0;
    margin-bottom: 2rem;
    font-size: 0.7rem;
  }
</style>
