<template lang="pug">
div.bg-white
  v-card-text
    v-layout
      v-flex(xs12)
        v-form(
          :id="id"
          :resource="resource"
          :subResource="subResource"
          @success="onSuccess")
</template>

<script lang="ts">
export { default } from './FormPage.controller';
</script>
