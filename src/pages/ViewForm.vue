<template lang="pug">
div
  v-alert(v-if="error" outline color="error" icon="warning" :value="true") {{error.statusCode}} - {{error.message}}
  v-layout
    v-flex(xs12)
      v-form(
        :id="id",
        :resource="resource",
        :readonly="true"
        @success="onSuccess")
        div(slot="buttons", class="my-4")
          v-btn(dark, class="grey", @click.native="$root.back()")
            v-icon(dark, left) chevron_left
            span {{$t('Back')}}
</template>

<script>
export default {
  data() {
    return {
      rules: {},
      messages: {},
      error: null,
    };
  },
  computed: {
    resource() {
      return this.$route.params.resource;
    },
    id() {
      return this.$route.params.id;
    },
  },
  methods: {
    onSuccess(data) {
      this.$router.push({ name: 'grid', params: { resource: this.resource } });
      if (data.id) {
        // this.$router.go(-1);
      }
    },
  },
  created() {
    let pageTitle = `View
      ${global.helper.i.titleize(global.helper.i.singularize(this.resource))}`;
    this.$store.commit('setPageTitle', pageTitle);
  },
};
</script>
