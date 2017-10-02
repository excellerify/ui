<template></template>

<style>
body {
  background: #666 !important;
}
</style>


<script>
export default {
  mounted() {
    this.$http
      .post('admins/logout').then(response => {
        global
          .store
          .dispatch('clearAuth')
      }, err => console.log(err))
  }
}
</script>
