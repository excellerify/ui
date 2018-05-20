<template lang="pug">
v-flex(xs12)
  v-alert(
    v-if="error",
    icon="warning",
    :value="true") {{error.message}}

  v-layout
    v-flex(xs4, sm4, md3)
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
          @click.native="onDeleteBulk"
          router, dark, fab, small)
          v-icon delete

        span Delete selected {{resource}}

      v-tooltip(bottom, v-if="onDraft")
        v-btn.amber(
          slot="activator"
          @click.native="onDraft"
          router, dark, fab, small)
          v-icon folder_open
        span Open saved draft

    v-flex(v-if="showSearch && !_.isEmpty(filters.fields)", xs8, sm8, md9, style="margin-bottom: 24px")
      v-expansion-panel
        v-expansion-panel-content
          div(slot="header")
            v-icon search
            span SEARCH
          v-card
            v-card-text
              v-form.row.jr(
                v-if="filters.fields",
                v-model='filters.model',
                :inline='true',
                :formFields='filters.fields',
                :autoSubmit='true'
                @submit='doSearch',
                submitButtonText='Search',
                submitButtonIcon='search')

  v-data-table(
    v-model="selected"
    class="elevation-1"
    :headers="columns",
    :items='items',
    :total-items="pagination.totalItems",
    :pagination.sync="pagination",
    :loading="loading")

    template(slot="headers" slot-scope="props")
      tr
        th
          v-checkbox(
            primary
            hide-details
            @click.native="toggleAll"
            :input-value="props.all"
            :indeterminate="props.indeterminate"
          )
        th(
          v-for="header in columns"
          :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
          align="left"
          @click="changeSort(header.value)"
        )
          b {{ header.text }}
          v-icon(small) arrow_upward
        th Action

    template(slot="items", slot-scope="props")
      tr(:active="props.selected" @click="props.selected=!props.selected")
        td
          v-checkbox(
            primary
            hide-details
            :input-value="props.selected")

        td(:class="'text-xs-' + (column.align !== undefined? column.align  : 'center')"
          v-for='column in columns')
          span(v-html="getColumnData(props.item, column)")

        td(v-if="!readonly", :width='100', align="center")
          v-menu(open-on-hover offset-y )
            v-btn(icon slot="activator")
              v-icon more_vert

            v-list
              v-list-tile(v-if="options.view && onView", )
                v-list-tile-content
                  v-btn(icon, dark, color="green", @click.native="onView({item:props.item})")
                    v-icon visibility

              v-list-tile(v-if="options.update")
                v-list-tile-content
                  v-btn(icon, dark, color="primary", @click.native="onUpdate({item:props.item})")
                    v-icon edit

              v-list-tile(v-if="options.delete")
                v-list-tile-content
                  v-dialog(id="modal", v-model="deleteModal[props.item.id]", max-width="300px")
                    v-btn(icon, slot="activator",  color="error")
                      v-icon delete
                    v-card
                      v-toolbar(card dark color="primary")
                        v-toolbar-title Delete
                      v-card-text
                        p(class="text-xs-center") Are you sure?
                      v-card-actions
                        v-spacer
                        v-btn(@click.native="deleteModal = []") No
                        v-btn(@click.native="remove(props.item.id)") Yes

              v-list-tile(v-if="typeof options.lock === 'object'")
                v-list-tile-content
                  v-btn(icon, @click="lock(props.item)")
                    v-icon lock

              v-list-tile(v-if="typeof options.custom === 'object'")
                v-list-tile-content
                  v-btn(icon, @click="customAction(options.custom, props.item)")
                    v-icon {{options.custom.icon}}

              v-list(v-if="options.customs")
                v-list-tile(v-for="(custom, key) in options.customs", :key="key")
                  v-list-tile-content
                    v-btn(icon, @click="customAction(custom, props.item)")
                      v-icon {{custom.icon}}

    template(slot="no-data")
      tr
        td(:colspan="2 + columns.length", align="center")
          span Sorry, nothing to display here :(
</template>

<script>
import moment from 'moment';
import numeral from 'numeral';

import EventBus from '../eventBus.js';
import config from '../config';

const getDefaultData = () => {
  return {
    deleteModal: [],
    filters: {
      model: {},
      limit: config.grid.limit
    },
    loading: false,
    columns: [], // fetch grid setup params from server if `columns` is empty
    actions: {},
    options: {
      sort: 'id',
      create: false,
      update: true,
      delete: false
    },
    pagination: {
      page: 1,
      rowsPerPage: 10,
      sortBy: 'id',
      descending: true,
      totalItems: 0
    },
    foreignKey: {},
    items: [],
    error: null,
    selected: []
  };
};

export default {
  props: {
    resource: {
      type: String,
      required: true
    },
    filterByFk: {
      type: Object
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    type: {
      type: String
    },
    onCreate: {
      type: Function,
      required: true
    },
    onUpdate: {
      type: Function,
      required: true
    },
    onView: {
      type: Function
    }
  },

  data: getDefaultData,

  watch: {
    '$i18n.locale'(val) {
      this.fetchGrid();
    },
    'pagination.page'(val) {
      this.fetchData();
    },
    'pagination.sortBy'(val) {
      this.fetchData();
    },
    'pagination.descending'(val) {
      this.fetchData();
    },
    '$route.params': 'refresh',
    pagination: {
      handler(val) {
        if (this.columns.length > 0) {
          this.fetchData();
        }
      },
      deep: true
    }
  },

  methods: {
    toggleAll() {
      if (this.selected.length) this.selected = [];
      else this.selected = this.items.slice();
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    },
    preFetch() {
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
        this._.forEach(
          this.filters.model,
          function(val, key) {
            if (!val) {
              return;
            }

            if (key.indexOf('.') > -1) {
              let nestedFilter = {
                regexp: `/${val}/i`
              };
              const splitedKey = key.split('.').reverse();

              this._.map(splitedKey, val => {
                const prevNestedFilter = Object.assign(nestedFilter);
                nestedFilter = {};
                nestedFilter[val] = prevNestedFilter;
              });

              this._.merge(filters, nestedFilter);
            } else {
              const column = this._.find(this.columns, { value: key });

              if (column && column.type === 'date') {
                filters[key] = val;
              } else {
                filters[key] = {
                  regexp: `/${val}/i`,
                  plain: val
                };
              }
            }
          }.bind(this)
        );
      }

      const { sortBy, descending, page, rowsPerPage } = this.pagination;

      this.$route.query.filter = {
        order: sortBy ? [`${sortBy} ${descending ? 'DESC' : 'ASC'}`] : null,
        where: filters,
        limit: rowsPerPage > 0 ? rowsPerPage : 0,
        offset: (page - 1) * rowsPerPage
      };
    },
    updateRoute() {
      this.$route.query.keepLayout = true;
      this.$router.go({
        path: this.$route.path,
        params: this.$route.params,
        query: this.$route.query
      });
    },
    doSearch() {
      this.pagination.page = 1;
      this.fetchData();
    },
    refresh: async function() {
      Object.assign(this.$data, getDefaultData());
      await this.fetchGrid();
      await this.fetchData();
    },
    getColumnData(row, field) {
      let value = row[field.value];

      if (field.type === 'image') {
        const image = value ? global.config.api + value : 'static/noimage.png';

        value = `<div class="avatar grey lighten-4" style="height: 36px; width: 36px;">
          <img src="${image}" alt="avatar">
        </div>`;
      } else if (field.type === 'date') {
        value = value ? moment(String(value)).format('YYYY-MM-DD') : '';
      } else if (field.type === 'time') {
        value = value ? moment(String(value)).format('HH:mm') : '';
      } else if (field.type === 'datetime') {
        value = value ? moment(String(value)).format('YYYY-MM-DD HH:mm') : '';
      } else if (['money', 'number'].indexOf(field.type) > -1) {
        value = value ? global.helper.moneyFormatter(value) : 0;
      } else {
        // process fields like `type.name`
        const split = field.value.split('.');

        if (split.length > 0) {
          value = this._.get(row, field.value);
        }
      }

      return value;
    },
    convertColumnObjToArray(columns) {
      const columnsArr = [];

      this._.forEach(columns, function(value, key) {
        if (!value.value) {
          value.value = key;
        }

        columnsArr.push(value);
      });

      return columnsArr;
    },
    async fetchGrid() {
      try {
        this.loading = true;

        const data = await this.$store.dispatch('fetchGridSchema', {
          resource: this.resource,
          filter: this.filters
        });

        if (!Array.isArray(data.columns) && typeof data.columns === 'object') {
          data.columns = this.convertColumnObjToArray(data.columns);
        }

        // convert to html safe
        for (let k in data.columns) {
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
          let sortData = this.options.sort.split('-');
          let desc = sortData.length > 1;
          let sortField = sortData.pop();

          this.pagination.sort = sortField;
          this.pagination.descending = desc;
        }

        this.loading = false;
        return;
      } catch (err) {
        this.error = err;
        return err;
      }
    },
    fetchData: async function() {
      try {
        this.preFetch();

        const result = await this.$http.get(`${this.resource}`, {
          params: this.$route.query
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
          count: this.pagination.totalItems
        };
      } catch (err) {
        this.error = err;
        return err;
      }
    },
    remove: async function(itemId) {
      await this.$http.delete(`${this.resource}/${itemId}`);
      this.refresh();
    },
    onDraft: async function() {
      try {
        this.preFetch();

        const result = await this.$http.get(`${this.resource}/draft`, {
          params: this.$route.query
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
          count: this.pagination.totalItems
        };
      } catch (err) {
        this.error = err;
        return err;
      }
    },
    onDeleteBulk: async function() {
      if (this.selected.length > 0) {
        const itemIds = this.selected.map(item => item.id);
        await this.$http.delete(`${this.resource}/multi/${JSON.stringify(itemIds)}`);
        this.refresh();
      }
    },
    next() {
      this.pagination.page++;
    },
    customAction: async function(option, item) {
      let name = 'customAction';
      let path, resource, subResource;

      if (option.type === 'form') {
        path = option.formUrl;
        name = `${name}Form`;
      } else if (option.type === 'grid') {
        path = option.formUrl;
        name = `${name}Grid`;
      } else {
        throw new Error('Invalid action type');
      }

      const split = path.split('/');

      if (path.split('/').length > 1) {
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
          type: option.type,
          id: item.id
        },
        query: {
          action: option.action,
          method: option.method || 'POST'
        }
      });
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage);
    }
  },
  async mounted() {
    await this.refresh();
  },
  created() {
    EventBus.$on('gridRefresh', this.refresh);
  }
};
</script>
