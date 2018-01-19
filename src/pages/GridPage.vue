<template lang="pug">
div
  v-grid(
    :resource="resource",
    :onCreate="onCreate",
    :onUpdate="onUpdate",
    :onView="onView"
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
      this.$router.push({name: 'create', params: {resource: this.resource}});
    },
    onUpdate: function ({item}) {
      this.$router.push({name: 'edit', params: {id: item.id}});
    },
    onView: function ({item}) {
      this.$router.push({name: 'view', params: {id: item.id}});
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
