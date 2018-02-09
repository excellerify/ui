<template></template>

<script>
export default {
  async mounted() {
    try{
      await this.$store.dispatch("logout");
      await this.$store.dispatch('clearAuth');
    } catch(e){
      // TODO: call error
      console.error(e);
    }
  }
};
</script>
