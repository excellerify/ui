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
import Component from 'vue-class-component';
import Vue from 'vue';
import { Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { Getter } from 'vuex-class';

@Component({})
export default class App extends Vue {
  public timeout: number = 3000;

  @Getter('getGlobalLoading') globalLoading!: boolean;

  @Getter('getGlobalError') globalError!: string;

  public snackbar: boolean = false;

  @Watch('globalError')
  public onGlobalError(value: string) {
    this.snackbar = !!value;

    setTimeout(() => this.$store.commit('setGlobalError', ''), this.timeout);
  }
}
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