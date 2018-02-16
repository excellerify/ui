<template lang="pug">
  v-app(:dark="dark", standalone)
    transition(mode="out-in")
      router-view
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {},
  created() {},
};
</script>
