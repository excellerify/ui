<template lang="pug">
  v-app(standalone)
    v-snackbar(
        :top="true"
        :right="true"
        v-model="snackbar"
        color="red"
      ) {{ globalError }}
        v-btn(flat color="white" @click.native="snackbar=false") Close

    transition(mode="out-in")
      router-view
</template>

<style>
body,
.application--wrap {
  background: #ddd !important;
}
</style>

<script>
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      snackbar: false,
    };
  },
  computed: {
    ...mapGetters({
      globalError: 'getGlobalError',
    }),
  },
  watch: {
    globalError: function(val) {
      this.snackbar = !!val;
    },
  },
  methods: {},
  created() {},
};
</script>
