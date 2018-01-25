<template></template>

<script>
export default {
  mounted() {
    this.$http
      .post('admins/logout').then(response => {
        global
          .store
          .dispatch('clearAuth');
      }, err => console.log(err));
  }
};
</script>
