<template lang="pug">
div.card
  v-card-text
    v-layout
      v-flex(xs12)
        v-form(
          :id="id"
          :resource="resource"
          :subResource="subResource"
          :doSaveAsDraft="doSaveAsDraft"
          :doSubmit="doSubmit"
          @success="onSuccess")
</template>

<script>
export default {
  data() {
    return {};
  },
  computed: {
    id() {
      return this.$route.params.id;
    },
    resource() {
      return this.$route.params.resource;
    },
    subResource() {
      return this.$route.params.subResource;
    },
    isCreate() {
      return !this.id;
    },
    isEdit() {
      return !!this.id;
    }
  },
  methods: {
    onSuccess(data) {
      this.$router.push({ name: 'grid', params: { resource: this.resource } });
    },
    doSaveAsDraft() {},
    doSubmit() {}
  },
  created() {
    const pageTitle = this.isEdit ? 'Update' : 'Create';
    this.$store.dispatch('checkPageTitle', {
      path: this.$route.path,
      action: pageTitle
    });
  }
};
</script>
