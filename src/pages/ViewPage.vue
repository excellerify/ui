<template lang="pug">
div.bg-white
  v-card-text
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
    return {};
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
    },
  },
  created() {
    this.$store.dispatch('checkPageTitle', {
      path: this.$route.path,
      action: 'View',
    });
  },
};
</script>
