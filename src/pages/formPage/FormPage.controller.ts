import Vue from 'vue';
import Component from 'vue-class-component';

@Component({ name: 'FormPage' })
export default class FormPage extends Vue {
  get id() {
    return this.$route.params.id;
  }

  get resource() {
    return this.$route.params.resource;
  }

  get subResource() {
    return this.$route.params.subResource;
  }

  get isCreate() {
    return !this.id;
  }

  get isEdit() {
    return !!this.id;
  }

  public onSuccess() {
    this.$router.push({ name: 'grid', params: { resource: this.resource } });
  }

  public created() {
    const pageTitle = this.isEdit ? 'Update' : 'Create';
    this.$store.dispatch('checkPageTitle', {
      path: this.$route.path,
      action: pageTitle,
    });
  }
}
