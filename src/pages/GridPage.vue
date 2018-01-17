<template lang="pug">
div
  v-grid(
    :resource="resource",
    :onCreate="onCreate"
  )
</template>

<script>
export default {
  computed: {
    resource() {
      return this.$route.params.resource;
    }
  },
  methods: {
    onCreate: function () {
      this.$router.push(
        {name: 'create', params: {resource: this.resource}});
    }
  },
  created: async function() {
    this.$store.commit(
      'setPageTitle',
      global.helper.i.titleize(global.helper.i.pluralize(this.resource))
    );
  }
};
</script>
