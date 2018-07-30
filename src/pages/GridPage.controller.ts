import { IGridItem } from '@/interfaces/grid.interface';
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({ name: 'GridPage' })
export default class GridPage extends Vue {
  get resource() {
    return this.$route.params.resource;
  }

  public onCreate() {
    this.$router.push({
      name: 'create',
      params: { resource: this.resource },
    });
  }

  public onUpdate({ item }: IGridItem) {
    this.$router.push({
      name: 'edit',
      params: { resource: this.resource, id: item.id },
    });
  }

  public onView({ item }: IGridItem) {
    this.$router.push({ name: 'view', params: { id: item.id } });
  }

  public created() {
    this.$store.dispatch('checkPageTitle', { path: this.$route.path });
  }
}
