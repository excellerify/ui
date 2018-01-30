<template lang="pug">
v-flex(xs12)
  v-alert(
    v-if="error",
    outline color="error",
    icon="warning",
    :value="true") {{error.statusCode}} - {{error.message}}

  v-flex(v-if="showSearch", xs12)
    v-form.row.jr(
      v-model='filters.model',
      v-if="filters.fields",
      :inline='true',
      :FormFields='filters.fields',
      :autoSubmit='true'
      @submit='doSearch',
      submitButtonText='Search',
      submitButtonIcon='search')

  v-card
    div
      v-btn(
        v-if="options.create && !readonly",
        router, fab, absolute, top, right, dark,
        class="green",
        @click.native="onCreate")
        v-icon add

      v-data-table(
        :headers='columns',
        :items='items',
        :total-items="pagination.totalItems",
        hide-actions,
        :pagination.sync="pagination",
        :loading="loading")

        template(slot='items', slot-scope='props')
          tr
            td(:class="'text-xs-' + (column.align !== undefined? column.align  : 'center')",
              v-for='column in columns',
              v-html="getColumnData(props.item, column)")
            td(v-if="!readonly", :width='Object.keys(options).length * 55', align="center")
              template(v-for="(value, action) in actions")
                v-btn(v-if="['edit', 'delete'].indexOf(action) < 0", router, color="primary",fab,small,dark,:to="{name: action, params: {resource,id:props.item.id}}")
                  v-icon {{action.icon ? action.icon : action}}

              v-btn(v-if="options.view && onView",fab,dark,small,class="green", @click.native="onView({item:props.item})")
                v-icon visibility

              v-btn(v-if="options.update",dark,color="primary",fab,small, @click.native="onUpdate({item:props.item})")
                v-icon edit
              //-- also you can try this: inline edit
              //-- v-btn(v-if="options.edit",dark,fab,success,small,@click.native.stop="showEdit(props.item)")
              //--   v-icon() edit
              v-dialog(v-if="options.delete", id="modal" v-model="deleteModal[props.item.id]")
                v-btn(slot="activator", dark, color="error", fab, small)
                  v-icon delete
                v-card
                  v-card-text
                    p(class="text-xs-center") Are you sure?
                  v-card-actions
                    v-spacer
                    v-btn(small,@click.native="deleteModal = []") No
                    v-btn(small,@click.native="remove(props.item.id)") Yes

              v-btn(v-if="typeof options.lock === 'object'", fab, small,@click="lock(props.item)")
                v-icon lock

              v-btn(v-if="typeof options.custom === 'object'",fab,small,@click="customAction(options.custom, props.item)")
                v-icon {{options.custom.icon}}

      v-pagination.ma-3(v-model='pagination.page', :length='totalPages', circle)
</template>

<script>
import moment from "moment";

import { EventBus } from "../eventBus.js";
import config from "../config";

const getDefaultData = () => {
  return {
    deleteModal: [],
    form: {
      fields: {},
      rules: {},
      messages: {}
    },
    filters: {
      model: {},
      limit: config.grid.limit
    },
    loading: false,
    columns: [], // fetch grid setup params from server if `columns` is empty
    actions: {},
    options: {
      sort: "id",
      create: false,
      update: true,
      delete: false
    },
    pagination: {
      page: 1,
      rowsPerPage: 10,
      sortBy: "id",
      descending: true,
      totalItems: 0
    },
    foreignKey: {},
    items: [],
    error: null
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
    "$i18n.locale"(val) {
      this.fetchGrid();
    },
    "pagination.page"(val) {
      this.fetchData();
    },
    "pagination.sortBy"(val) {
      this.fetchData();
    },
    "pagination.descending"(val) {
      this.fetchData();
    },
    "$route.params": "refresh"
  },

  methods: {
    preFetch() {
      const filters = {};

      if (this.filterByFk && this.filterByFk.value) {
        if (!this.filters.model) {
          this.filters.model = {};
        }

        const fkKey = this.foreignKey[this.filterByFk.model];

        this.filters.model[fkKey] = this.filterByFk.value;
      }

      if (this.filters.model) {
        this._.forEach(this.filters.model, (val, key) => {
          if (key.indexOf(".") > -1) {
            let nestedFilter = {
              regexp: `/${val}/i`
            };
            const splitedKey = key.split(".").reverse();

            this._.map(splitedKey, (val) => {
              const prevNestedFilter = Object.assign(nestedFilter);
              nestedFilter = {};
              nestedFilter[val] = prevNestedFilter;
            });

            this._.merge(filters, nestedFilter);
          } else {
            filters[key] = {
              regexp: `/${val}/i`
            };
          }
        });
      }

      const offset = (this.pagination.page - 1) * this.filters.limit;

      this.$route.query.filter = {
        where: filters,
        limit: this.filters.limit,
        offset
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
    fetch() {
      if (this.columns.length <= 0) {
        // fetch grid params from server: e.g. /crud/users/grid
        this.fetchGrid();
      } else {
        // or define grid params manually
        this.fetchData();
      }
    },
    getColumnData(row, field) {
      // process fields like `type.name`
      let [l1, l2] = field.value.split(".");
      let value = row[l1];
      if (l2) {
        value = row[l1] ? row[l1][l2] : null;
      }
      if (field.type === "image") {
        value = `<v-avatar size="36px"><img src="${value}" class="crud-grid-thumb" controls /></v-avatar>`;
      }
      if (field.type === "date") {
        value = value ? moment(String(value)).format('YYYY-MM-DD') : "" ;
      }
      return value;
    },
    fetchGrid: async function() {
      try {
        const result = await this.$http.get(`${this.resource}/grid`);

        const data = result.data.schema;

        if (!Array.isArray(data.columns) && typeof data.columns === "object") {
          const columnsArr = [];

          this._.forEach(data.columns, function(value, key) {
            if (!value.value) {
              value.value = key;
              columnsArr.push(value);
            }
          });

          data.columns = columnsArr;
        }

        // convert to html safe
        for (let k in data.columns) {
          data.columns[k].text = this.$t(data.columns[k].text);
        }

        this.columns = data.columns || {};
        this.actions = data.actions || {};
        this.foreignKey = data.foreignKey || {};

        // keep limit
        const limit = data.filters.limit || this.filters.limit;
        this.filters = data.filters || {};
        this.filters.limit = limit;

        this.options = data.options || {};

        if (this.options && this.options.sort) {
          let sortData = this.options.sort.split("-");
          let desc = sortData.length > 1;
          let sortField = sortData.pop();

          // if (sortField.indexOf('.') < 0) {
          //   sortField = sortField
          // }

          this.pagination.sort = sortField;
          this.pagination.descending = desc;
        }

        Promise.resolve();
      } catch (err) {
        this.error = err;
        Promise.reject(err);
      }
    },
    fetchData: async function() {
      try {
        this.preFetch();

        const result = await this.$http.get(`${this.resource}`, {
          params: this.$route.query
        });

        this.items = result.data;

        this.pagination.totalItems = parseInt(result.headers["x-total-count"]);

        Promise.resolve({
          items: result.data,
          count: this.pagination.totalItems
        });
      } catch (err) {
        this.error = err;
        Promise.reject(err);
      }
    },
    remove: async function(itemId) {
      await this.$http.delete(`${this.resource}/${itemId}`);
      this.refresh();
    },
    next() {
      this.pagination.page++;
    },
    customAction: async function(option, item) {
      this.$router.push({
        name: "customAction",
        params: {
          resource: this.resource,
          subResource: option.formUrl,
          id: item.id
        }
      });
    }
  },

  computed: {
    totalPages() {
      return Math.ceil(
        this.pagination.totalItems / this.pagination.rowsPerPage
      );
    }
  },

  mounted() {},

  created: async function() {
    await this.fetchGrid();
    await this.fetchData();
    EventBus.$on("gridRefresh", this.refresh);
  }
};
</script>
