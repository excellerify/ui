<template lang="pug">
  v-app(standalone)
    v-progress-linear.progress-bar(
      :active="globalLoading"
      indeterminate
      color="blue")

    v-snackbar(
      :top="true"
      :right="true"
      :timeout="timeout"
      v-model="snackbar"
      color="red") {{ globalError }}
        v-btn(flat color="white" @click.native="snackbar=false") Close

    transition(mode="out-in")
      router-view
</template>

<script lang="ts">
export { default } from './App.controller';
</script>

<style>
body,
.application--wrap {
  background: #ddd !important;
}

.progress-bar {
  text-align: center;
  top: 0;
  position: absolute;
  z-index: 9999;
  margin: 0 !important;
}
</style>