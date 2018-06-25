<template lang="pug">
div.card
  v-card-text
    v-grid(
      :resource="resource",
      :onCreate="onCreate",
      :onDraft="onDraft"
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
    onCreate: function() {
      this.$router.push({
        name: 'create',
        params: { resource: this.resource }
      });
    },
    onDraft: function() {
      alert("will shows record  with _status='draft'");
    },
    onUpdate: function({ item }) {
      this.$router.push({
        name: 'edit',
        params: { resource: this.resource, id: item.id }
      });
    },
    onView: function({ item }) {
      this.$router.push({ name: 'view', params: { id: item.id } });
    }
  },
  created() {
    this.$store.dispatch('checkPageTitle', { path: this.$route.path });
  }
};
</script>
