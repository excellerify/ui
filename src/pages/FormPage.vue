<template lang="pug">
div.card
  v-card-text
    v-layout
      v-flex(xs12)
        v-form(
          :id="id",
          :resource="resource",
          :subResource="subResource"
          @success="onSuccess")

          div(slot="buttons", class="my-4")
            v-btn(dark, class="grey", @click.native="$root.back()")
              v-icon(dark, left) chevron_left
              span {{$t('Back')}}
            v-btn.orange(dark, @click.native="$root.back()") {{$t('Save as Draft')}}
              v-icon(dark, right) save
            v-btn(color="primary", dark, type='submit') {{$t('Submit')}}
              v-icon(right, dark) send
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
    isEdit() {
      return !!this.id;
    }
  },
  methods: {
    onSuccess(data) {
      this.$router.push({ name: "grid", params: { resource: this.resource } });
    }
  },
  created() {
    const pageTitle = this.isEdit ? "Update" : "Create";
    this.$store.dispatch("checkPageTitle", {
      path: this.$route.path,
      action: pageTitle
    });
  }
};
</script>
