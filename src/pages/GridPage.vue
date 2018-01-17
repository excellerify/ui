<template lang="pug">
div
  v-grid(:resource="resource")
</template>

<script>
export default {
  computed: {
    resource() {
      return this.$route.params.resource;
    }
  }
};
</script>
