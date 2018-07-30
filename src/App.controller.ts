import Vue from 'vue';
import Component from 'vue-class-component';
import { Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';

@Component({})
export default class App extends Vue {
  public timeout: number = 3000;

  @Getter('getGlobalLoading') public globalLoading!: boolean;

  @Getter('getGlobalError') public globalError!: string;

  public snackbar: boolean = false;

  @Watch('globalError')
  public onGlobalError(value: string) {
    this.snackbar = !!value;

    setTimeout(() => this.$store.commit('setGlobalError', ''), this.timeout);
  }
}
