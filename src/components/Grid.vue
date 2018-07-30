<template lang="pug">
v-flex(xs12, style="margin-bottom: 16px")
  v-alert(
    v-if="error"
    icon="warning"
    :value="true") {{error.message}}

  v-layout.row.wrap
    v-flex.xs12(style="margin-bottom: 8px")
      v-tooltip(bottom, v-if="options.create && !readonly")
        v-btn.green(
          slot="activator"
          @click.native="onCreate"
          router, dark, fab, small)
          v-icon add
        span Add new {{resource}}

      v-tooltip(bottom, v-if="options.create && !readonly")
        v-btn.red(
          slot="activator"
          @click.native="openDeleteDialog(onDeleteBulk)"
          router, dark, fab, small)
          v-icon delete
        span Delete selected {{resource}}

      v-tooltip.right(bottom, v-if="onOpenDeleted")
        v-btn(
          v-bind:class="{ amber: !isShowDeleted }"
          slot="activator"
          @click.native="onOpenDeleted"
          router, dark, fab, small)
          v-icon delete_sweep
        span Show deleted {{resource}}

      v-tooltip.right(bottom, v-if="onOpenDraft")
        v-btn(
          v-bind:class="{ amber: !isShowDraft }"
          slot="activator"
          @click.native="onOpenDraft"
          router, dark, fab, small)
          v-icon folder_open
        span {{!isShowDraft ? 'Show saved draft': 'Hide saved draft'}}

    v-flex.xs12(v-if="showSearch && !_.isEmpty(filters.fields)" style="margin-bottom: 16px")
      v-expansion-panel
        v-expansion-panel-content
          div(slot="header")
            v-icon search
            span SEARCH
          v-card
            v-card-text.pt-0
              v-form.row(
                v-if="filters.fields"
                v-model="filters.model"
                :inline="true"
                :formFields="filters.fields"
                :autoSubmit="true"
                @submit="doSearch"
                submitButtonText="Search"
                submitButtonIcon="search")

  v-layout(v-if="loading" flex align-center justify-center)
    v-progress-circular(
      :width="8"
      :size="96"
      color="primary"
      style="margin-left:auto; margin-right:auto;"
      indeterminate)

  v-data-table(
    v-model="selected"
    class="elevation-1"
    v-if="!loading"
    :headers="[{}, ...columns, {}]"
    :items='items'
    :total-items="pagination.totalItems"
    :pagination.sync="pagination"
    :loading="loading")

    template(slot="headers" slot-scope="props")
      tr
        th
          v-checkbox(
            hide-details
            @click.native="toggleAll"
            :input-value="props.all"
            :indeterminate="props.indeterminate")
        th(
          v-for="header in columns"
          :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
          style="min-width: 128px;"
          align="left"
          @click="changeSort(header.value)")
          b {{ header.text }}
          v-icon(small) arrow_upward
        th Action

    template(slot="items" slot-scope="props")
      tr(:active="props.selected" @click="props.selected=!props.selected")
        td
          v-checkbox(
            primary
            hide-details
            :input-value="props.selected")

        td(:class="'limited text-xs-' + (column.align !== undefined? column.align  : 'center')"
          v-for="column in columns")
          span(v-html="getColumnData(props.item, column)")

        td(v-if="!readonly" :width="100" align="center")
          v-menu(open-on-hover offset-y )
            v-btn(icon slot="activator")
              v-icon more_vert

            v-list
              v-list-tile(v-if="options.view && onView")
                v-list-tile-content
                  v-btn(icon, dark, color="green" @click.native="onView({item:props.item})")
                    v-icon visibility

              v-list-tile(v-if="options.update")
                v-list-tile-content
                  v-btn(icon, dark, color="primary" @click.native="onUpdate({item:props.item})")
                    v-icon edit

              v-list-tile(v-if="options.delete")
                v-list-tile-content
                  v-btn(icon, slot="activator" color="error" @click.native="openDeleteDialog(() => remove(props.item.id))" )
                    v-icon delete

              v-list-tile(v-if="typeof options.lock === 'object'")
                v-list-tile-content
                  v-btn(icon, @click="lock(props.item)")
                    v-icon lock

              v-list-tile(v-if="typeof options.custom === 'object'")
                v-list-tile-content
                  v-btn(icon, @click="customAction(options.custom, props.item)")
                    v-icon {{options.custom.icon}}

              v-list(v-if="options.customs")
                v-list-tile(v-for="(custom, key) in options.customs" :key="key")
                  v-list-tile-content
                    v-btn(icon, @click="customAction(custom, props.item)")
                      v-icon {{custom.icon}}

    template(slot="no-data")
      tr
        td(:colspan="2 + columns.length", align="center")
          span Sorry, nothing to display here :(

    template(slot="no-results")
      tr
        td(:colspan="2 + columns.length", align="center")
          span Sorry, nothing to display here :(

  v-dialog(id="modal" v-model="showDeleteDialog" max-width="300px")
    v-card
      v-toolbar(card dark color="primary")
        v-toolbar-title {{ isShowDeleted || isShowDraft? 'Delete Permanent' : 'Delete' }}
      v-card-text
        p(class="text-xs-center") Are you sure{{ isShowDeleted || isShowDraft? ' delete permanently' : '' }}?
      v-card-actions
        v-spacer
        v-btn(@click.native="showDeleteDialog = false") No
        v-btn(@click.native="() => {deleteAction(); showDeleteDialog = false;}") Yes
</template>

<script lang="ts">
export { default } from './Grid.controller';
</script>
