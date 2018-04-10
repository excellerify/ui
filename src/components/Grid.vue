<template lang="pug">
v-flex(xs12)
  v-alert(
    v-if="error",
    icon="warning",
    :value="true") {{error.message}}

  v-flex(v-if="showSearch && !_.isEmpty(filters.fields)", xs12, style="margin-bottom: 15px")
    v-expansion-panel
      v-expansion-panel-content
        div(slot="header")
          v-icon search
          span SEARCH
        v-card(style="padding: 0 25px")
          v-carrd-text
            v-form.row.jr(
              v-if="filters.fields",
              v-model='filters.model',
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
        class="elevation-1"
        :headers="columns.concat({text: 'Action', align: 'center', sortable: false})",
        :items='items',
        :total-items="pagination.totalItems",
        :pagination.sync="pagination",
        :loading="loading")

        template(slot='items', slot-scope='props')
          tr
            td(:class="'text-xs-' + (column.align !== undefined? column.align  : 'center')",
              v-for='column in columns',
              v-html="getColumnData(props.item, column)")

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
</template>

<script>
import moment from "moment";
import numeral from "numeral";

import EventBus from "../eventBus.js";
import config from "../config";

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
    "$route.params": "refresh",
    pagination: {
      handler() {
        this.fetchData();
      },
      deep: true
    }
  },

  methods: {
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

            if (key.indexOf(".") > -1) {
              let nestedFilter = {
                regexp: `/${val}/i`
              };
              const splitedKey = key.split(".").reverse();

              this._.map(splitedKey, val => {
                const prevNestedFilter = Object.assign(nestedFilter);
                nestedFilter = {};
                nestedFilter[val] = prevNestedFilter;
              });

              this._.merge(filters, nestedFilter);
            } else {
              const column = this._.find(this.columns, { value: key });

              if (column && column.type === "date") {
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
        order: sortBy ? [`${sortBy} ${descending ? "DESC" : "ASC"}`] : null,
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
    fetch() {
      if (this.columns.length <= 0) {
        // fetch grid params from server: e.g. /crud/users/grid
        this.fetchGrid();
      } else {
        // or define grid params manually
        this.fetchData();
      }
    },
    getColumnData: (row, field) => {
      // process fields like `type.name`
      let [l1, l2] = field.value.split(".");
      let value = row[l1];
      if (l2) {
        value = row[l1] ? row[l1][l2] : null;
      }
      if (field.type === "image") {
        value = `<v-avatar size="36px">
          <img src="${value}" class="crud-grid-thumb" controls />
          </v-avatar>`;
      }
      if (field.type === "date") {
        value = value ? moment(String(value)).format("YYYY-MM-DD") : "";
      }
      if (field.type === "money") {
        value = value ? numeral(value).format("0,0.0") : 0.0;
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

        const data = await this.$store.dispatch("fetchGridSchema", {
          resource: this.resource,
          filter: this.filters
        });

        if (!Array.isArray(data.columns) && typeof data.columns === "object") {
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
          let sortData = this.options.sort.split("-");
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

        this.items = result.data;

        this.pagination.totalItems = parseInt(result.headers["x-total-count"]);

        return {
          items: result.data,
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
    next() {
      this.pagination.page++;
    },
    customAction: async function(option, item) {
      const { resource } = this;

      let subResource,
        name = "customAction";

      if (option.type === "form") {
        subResource = option.formUrl;
        name = `${name}Form`;
      } else if (option.type === "grid") {
        subResource = option.gridUrl;
        name = `${name}Grid`;
      } else {
        throw new Error("Invalid action type");
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
          action: option.action || subResource,
          method: option.method || "POST"
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
