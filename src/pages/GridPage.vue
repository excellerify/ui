<template lang="pug">
div.bg-white
  v-card-text
    v-grid(
      :resource="resource",
      :onCreate="onCreate",
      :onUpdate="onUpdate",
      :onView="onView"
    )
</template>

<script lang="ts">
export { default } from '@/pages/GridPage.controller';
</script>
