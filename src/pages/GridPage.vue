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

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { IGridItem } from '@/interfaces/grid.interface';

@Component({ name: 'GridPage' })
export default class GridPage extends Vue {
  get resource() {
    return this.$route.params.resource;
  }

  // methods: {
  onCreate() {
    this.$router.push({
      name: 'create',
      params: { resource: this.resource },
    });
  }

  onDraft() {
    alert("will shows record  with _status='draft'");
  }

  onUpdate({ item }: IGridItem) {
    this.$router.push({
      name: 'edit',
      params: { resource: this.resource, id: item.id },
    });
  }

  onView({ item }: IGridItem) {
    this.$router.push({ name: 'view', params: { id: item.id } });
  }

  created() {
    this.$store.dispatch('checkPageTitle', { path: this.$route.path });
  }
}
</script>
