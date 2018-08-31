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

      v-tooltip(bottom, v-if="options.delete && !readonly")
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
    :loading="loading"
    editable)

    template(slot="headers" slot-scope="props")
      tr
        th(v-if="options.delete")
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
        td(v-if="options.delete")
          v-checkbox(
            primary
            hide-details
            :input-value="props.selected")

        td(:class="'limited text-xs-' + (column.align !== undefined? column.align  : 'center')" v-for="column in columns")
          v-avatar(v-if="column.type === 'image'" :size="32" color="grey lighten-4")
            img(:src="getColumnData(props.item, column)" alt="avatar")

          v-switch(v-else-if="['boolean', 'bool'].indexOf(column.type) > -1"
            value :input-value="getColumnData(props.item, column)" readonly)

          span(v-else) {{ getColumnData(props.item, column) }}

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
        td(:colspan="columns.length + (options.delete? 2 : 1)", align="center")
          span Sorry, nothing to display here :(

    template(slot="no-results")
      tr
        td(:colspan="columns.length + (options.delete? 2 : 1)", align="center")
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
import { config } from '@/config';
import EventBus from '@/eventBus';
import { helper } from '@/helper';
import { http } from '@/http';
import { ICustomGridAction, IGridColumn } from '@/interfaces/grid.interface';
import moment from 'moment';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { Location } from 'vue-router';

@Component({ name: 'Grid' })
export default class Grid extends Vue {
  @Prop({ type: String, required: true })
  public resource!: string;

  @Prop({ type: Boolean, default: true })
  public showSearch!: object;

  @Prop({ type: Boolean, default: false })
  public readonly!: object;

  @Prop({ type: String })
  public type!: object;

  @Prop(Object) public filterByFk!: object;

  @Prop({ type: Function, required: true })
  public onCreate!: () => void;

  @Prop({ type: Function, required: true })
  public onUpdate!: () => void;

  @Prop({ type: Function, required: true })
  public onView!: () => void;

  public filters = {
    model: {},
    limit: config.grid.limit,
  };

  public loading = false;

  public columns = [];

  public actions = {};

  public options = {
    sort: 'id',
    create: false,
    update: true,
    delete: false,
  };

  public pagination = {
    page: 1,
    rowsPerPage: config.grid.limit,
    sortBy: 'id',
    descending: true,
    totalItems: 0,
  };

  public foreignKey = {};

  public items = [];

  public error = null;

  public selected: Array<{ id: string }> = [];

  public isShowDraft = false;

  public isShowDeleted = false;

  public showDeleteDialog = false;

  public deleteAction: (ids: string | string[]) => void;

  @Getter('getPageTitle') public pageTitle!: boolean;

  @Watch('$i18n.locale')
  @Watch('pagination.page')
  @Watch('pagination.sortBy')
  @Watch('pagination.descending')
  @Watch('pagination.rowsPerPage')
  public onPaginationChange() {
    this.fetchData();
  }

  @Watch('$route.params')
  public onRouteChange() {
    this.refresh();
  }

  public openDeleteDialog(action: (ids: string | string[]) => void) {
    this.deleteAction = action;
    this.showDeleteDialog = true;
  }

  public toggleAll() {
    if (this.selected.length) {
      this.selected = [];
    } else {
      this.selected = this.items.slice();
    }
  }

  public changeSort(column) {
    if (this.pagination.sortBy === column) {
      this.pagination.descending = !this.pagination.descending;
    } else {
      this.pagination.sortBy = column;
      this.pagination.descending = false;
    }
  }

  public preFetch() {
    const filters = {};

    if (this.filterByFk && this.filterByFk.value) {
      const fkKey = this.foreignKey[this.filterByFk.model];

      if (fkKey) {
        if (!this.filters.model) {
          this.filters.model = {};
        }

        this.filters.model[fkKey] = this.filterByFk.value;
      }
    }

    if (this.filters.model) {
      this._.forEach(this.filters.model, (val, key) => {
        if (!val) {
          return;
        }

        if (key.indexOf('.') > -1) {
          let nestedFilter = {
            regexp: `/${val}/i`,
          };
          const splitedKey = key.split('.').reverse();

          this._.map(splitedKey, val => {
            const prevNestedFilter = Object.assign(nestedFilter);
            nestedFilter = {};
            nestedFilter[val] = prevNestedFilter;
          });

          this._.merge(filters, nestedFilter);
        } else {
          const column = this._.find(this.columns, { key }) || {
            value: '',
            type: '',
          };

          let filterKey = key;

          const split = column.value.split('.');
          if (split.length > 1) {
            filterKey = split.join('.');
          }

          if (column && column.type === 'date') {
            filters[filterKey] = val;
          } else {
            filters[filterKey] = {
              regexp: `/${val}/i`,
              plain: val,
            };
          }
        }
      });
    }

    const { sortBy, descending, page, rowsPerPage } = this.pagination;

    this.$route.query.filter = {
      order: sortBy ? [`${sortBy} ${descending ? 'DESC' : 'ASC'}`] : undefined,
      where: filters,
      limit: rowsPerPage > 0 ? rowsPerPage : 0,
      offset: (page - 1) * rowsPerPage,
    };
  }

  public doSearch() {
    this.pagination.page = 1;
    this.fetchData();
  }

  public async refresh() {
    this.filters = {
      model: {},
      limit: config.grid.limit,
    };
    this.pagination = {
      page: 1,
      rowsPerPage: config.grid.limit,
      sortBy: 'id',
      descending: true,
      totalItems: 0,
    };
    this.foreignKey = {};
    this.selected = [];
    this.error = null;
    this.isShowDraft = false;
    this.isShowDeleted = false;

    await this.fetchGrid();
    await this.fetchData();
  }

  public getColumnData(row, column) {
    let value = row[column.value];

    if (column.type === 'image') {
      value = value ? global.config.api + value : 'static/noimage.png';
    } else if (column.type === 'date') {
      value = value ? moment(String(value)).format(config.format.date) : '';
    } else if (column.type === 'time') {
      value = value ? moment(String(value)).format(config.format.time) : '';
    } else if (column.type === 'datetime') {
      value = value
        ? moment(String(value)).format(
            `${config.format.date} ${config.format.time}`,
          )
        : '';
    } else if (['money', 'number'].indexOf(column.type) > -1) {
      value = value ? helper.moneyFormatter(value) : 0;
    } else {
      // process cpolumn with format like `type.name`
      const split = column.value.split('.');

      if (split.length > 0) {
        value = this._.get(row, column.value);
      }

      if (value && value.length > 100) {
        value = `${value.substring(0, 96)}...`;
      }
    }

    return value;
  }

  public convertColumnObjToArray(columns: { [key: string]: IGridColumn }) {
    const columnsArr: IGridColumn[] = [];

    this._.forEach(columns, (value: IGridColumn, key: string) => {
      if (!value.value) {
        value.value = key;
      }

      value.key = key;

      columnsArr.push(value);
    });

    return columnsArr;
  }

  public async fetchGrid() {
    try {
      this.loading = true;

      const data = await this.$store.dispatch('fetchGridSchema', {
        resource: this.resource,
        filter: this.filters,
      });

      if (!Array.isArray(data.columns) && typeof data.columns === 'object') {
        data.columns = this.convertColumnObjToArray(data.columns);
      }

      // convert to html safe
      for (const k in data.columns) {
        data.columns[k].text = this.$t(data.columns[k].text);
      }

      this.columns = data.columns;
      this.actions = data.actions;
      this.foreignKey = data.foreignKey || {};

      // keep limit
      const limit = data.filters.limit || this.filters.limit;
      this.filters = data.filters || {};
      this.filters.limit = limit;

      this.options = data.options || {};

      if (this.options && this.options.sort) {
        const sortData = this.options.sort.split('-');
        const desc = sortData.length > 1;
        const sortField = sortData.pop();

        this.pagination.sort = sortField;
        this.pagination.descending = desc;
      }

      return;
    } catch (err) {
      this.error = err;
      return err;
    } finally {
      this.loading = false;
    }
  }

  public async remove(itemId: string) {
    await http.delete(`${this.resource}/${itemId}`);
    this.refresh();
  }

  public async fetchData() {
    try {
      this.loading = true;

      let type: '' | 'draft' | 'deleted' = '';

      await this.$store.dispatch('checkPageTitle', { path: this.$route.path });

      if (this.isShowDraft || this.isShowDeleted) {
        this.$store.commit(
          'setPageTitle',
          this.pageTitle + (this.isShowDraft ? ' Draft' : ' Deleted'),
        );

        type = this.isShowDraft ? 'draft' : 'deleted';
      }

      this.preFetch();

      const url = this.resource + (type ? `/${type}/` : '');

      const result = await http.get(url, {
        params: this.$route.query,
      });

      if (result.data.items) {
        this.items = result.data.items;
        this.pagination.totalItems = parseInt(result.data.totalCount);
      } else {
        this.items = result.data;
        this.pagination.totalItems = parseInt(result.headers['x-total-count']);
      }

      return {
        items: this.items,
        count: this.pagination.totalItems,
      };
    } catch (err) {
      console.error(err);
      this.error = err;
      return err;
    } finally {
      this.loading = false;
    }
  }

  public async onOpenDraft() {
    this.isShowDeleted = false;

    if (this.isShowDraft) {
      this.isShowDraft = false;
      this.refresh();
      return;
    }

    this.isShowDraft = true;

    return this.fetchData();
  }

  public async onOpenDeleted() {
    this.isShowDraft = false;

    if (this.isShowDeleted) {
      this.isShowDeleted = false;
      this.refresh();

      return;
    }

    this.isShowDeleted = true;

    return this.fetchData();
  }

  public async onDeleteBulk() {
    if (this.selected.length > 0) {
      const itemIds = this.selected.map(item => item.id);
      await http.delete(`${this.resource}/multi/${JSON.stringify(itemIds)}`);
      this.refresh();
    }
  }

  public next() {
    this.pagination.page++;
  }

  public async customAction(option: ICustomGridAction, item: { id: string }) {
    let name = 'customAction';
    let path: string | undefined;
    let resource: string | undefined;
    let subResource: string | undefined;

    if (option.type === 'form') {
      path = option.formUrl;
      name = `${name}Form`;
    } else if (option.type === 'grid') {
      path = option.formUrl;
      name = `${name}Grid`;
    } else {
      throw new Error('Invalid action type');
    }

    const split = path && path.split('/');

    if (split && split.length > 1) {
      resource = split[0];
      subResource = split[1];
    } else {
      resource = this.resource;
      subResource = path;
    }

    this.$router.push({
      name,
      params: {
        resource,
        subResource,
        type: option.type as string,
        id: item.id,
      },
      query: {
        action: option.action,
        method: option.method || 'POST',
      },
    } as Location);
  }

  get totalPages() {
    return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
  }

  public mounted() {
    this.refresh();
  }

  public created() {
    EventBus.$on('gridRefresh', this.refresh);
  }
}
</script>
