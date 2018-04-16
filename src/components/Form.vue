<template lang='pug'>
div
  form(:action='action', @submit.prevent='onSubmit', novalidate)
    v-tabs(grow, scroll-bars, v-model='active', dark, v-if='groupBy')
      v-tabs-bar(slot='activators')
        v-tabs-item(
          v-for='(field, key) in group.parents'
          :key='key'
          :href='\'tab-\' + key'
          ripple)
        v-tabs-slider

      v-tabs-content(
        v-for='(getFields, key) in group.children'
        :key='key'
        :id='\'tab-\' + key')
        v-card(flat)
          v-card-text
            v-field(
              v-for='(field, name) in getFields'
              v-model='model[name]'
              :key='name'
              :name='field.label'
              :field='field'
              :readonly='readonly || field.readonly')

    v-layout(v-bind='{[inline? \'row\': \'column wrap\']: true}', v-if='!groupBy')
      v-field.pr-1(
        v-for='(field, name) in getFields'
        @refresh='refresh'
        @onUpsert='onSubmit'
        @fieldError='updateFieldsError'
        v-model='model[name]'
        :resourceId='id'
        :key='name'
        :name='field.label'
        :field='field'
        :readonly='readonly || field.readonly')

      v-alert.m-5(error, v-model='formErrors.length > 0', style='width: 100%;')
        ul.px-3
          li(v-for='error in formErrors') {{error.message}}

      v-layout
        v-flex.mt-2.actions(xs12)
          slot(name='buttons')
            v-btn.mt-3(color='primary', dark, type='submit', small) {{$t(submitButtonText)}}
              v-icon(right, dark) {{submitButtonIcon}}
</template>

<script>
export default {
  props: {
    id: {
      type: String
    },
    resource: {
      type: String
    },
    subResource: {
      type: String
    },
    inline: {
      type: Boolean,
      default: false
    },
    groupBy: {
      required: false,
      type: String,
      default: null
    },
    submitButtonText: {
      required: false,
      type: String,
      default: "Submit"
    },
    submitButtonIcon: {
      required: false,
      type: String,
      default: "send"
    },
    value: {
      required: false,
      type: Object,
      default: () => {}
    },
    ParentData: {
      required: false,
      type: Object
    },
    FormFields: {
      type: Object
    },
    autoSubmit: {
      type: Boolean
    },
    type: {
      type: String,
      default: "form"
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      model: this.value,
      hasError: false,
      formErrors: [],
      message: "",
      fieldErrors: [],
      rules: null,
      formFields: null
    };
  },

  computed: {
    group() {
      if (!this.groupBy) {
        return null;
      }
      let parents = {};
      let children = {};

      for (let k in this.formFields) {
        let field = this.formFields[k];
        let ref = field[this.groupBy];
        let parentKey = field.id;

        if (ref === null) {
          // is parent
          parents[parentKey] = field;
        } else {
          // is child
          if (!children[ref]) {
            children[ref] = {};
          }
          children[ref][k] = field;
        }
      }
      return { parents, children };
    },
    method() {
      return (
        this.$route.query.method || (this.isEdit ? "patch" : "post")
      ).toLowerCase();
    },
    isEdit() {
      return !!this.id;
    },
    isCreate() {
      return !!!this.id;
    },
    action() {
      if (this.$route.query.action) {
        return `${this.resource}/${this.$route.query.action}`;
      } else if (this.isEdit) {
        return `${this.resource}/${this.id}`;
      } else {
        return `${this.resource}`;
      }
    },
    getFields() {
      this.formFields = this.filterFieldByMode();
      return this.formFields;
    }
  },
  watch: {
    value(val) {
      this.model = val;
    },
    model: {
      handler: function(val) {
        this.formFields = this.togleFieldOptionalsOn();
      },
      deep: true
    },
    $route() {
      this.fieldErrors = [];
      this.hasError = false;
      this.refresh();
    },
    FormFields() {
      this.refresh();
    }
  },
  methods: {
    refresh: async function() {
      try {
        this.fieldErrors = [];

        if (this.FormFields) {
          this.formFields = this.FormFields;
        } else {
          await this.fetchFormSchema();
        }

        this.formFields = this.filterFieldByMode();
        this.formFields = this.togleFieldOptionalsOn();

        if (this.type === "subForm" && this.ParentData) {
          // resolve parent FK
          this._.forEach(
            this.formFields,
            function(val, key) {
              // if field is marked as FK, resolve FK data
              if (val.fk) {
                this._.forEach(this.ParentData, (valData, keyData) => {
                  const fkData = valData[val.fk[keyData]];

                  // if FK data not found, raise error
                  if (!fkData) {
                    console.error(
                      `Field "${val.fk}" \
                      not found in parent data or table "${keyData}"`
                    );
                  }

                  // assign FK data, from parrent to form field
                  this.model[key] = valData[val.fk[keyData]];
                });
              }
            }.bind(this)
          );
        }

        Promise.resolve();
      } catch (e) {
        Promise.reject(e);
      }
    },
    filterFieldByMode() {
      // Show only available mode
      const filteredField = this._.pickBy(this.formFields, (val, key) => {
        if (val.mode) {
          if (this.isEdit) {
            return val.mode.indexOf("isEdit") > -1;
          } else if (this.isView) {
            return val.mode.indexOf("isView") > -1;
          } else {
            return val.mode.indexOf("isCreate") > -1;
          }
        }

        return true;
      });

      return filteredField;
    },
    togleFieldOptionalsOn() {
      const filteredField = this._.pickBy(this.FormFields, (val, key) => {
        if (val.optionalsOn) {
          let isShow = false;

          val.optionalsOn.map(optional => {
            isShow =
              !isShow &&
              this.model[optional.property] &&
              (this.model[optional.property] === optional.value ||
                this.model[optional.property].toLowerCase() ===
                  optional.value.toLowerCase());
          });

          return isShow;
        }

        return true;
      });

      return filteredField;
    },
    fetchFormSchema: async function() {
      try {
        const data = await this.$store.dispatch("fetchFormSchema", {
          resource: `${this.resource}`,
          subResource: `${this.subResource || "form"}`,
          id: this.id
        });

        this.FormFields = data.fields;
        this.model = data.model || {};
        this.rules = data.rules || {};

        Promise.resolve(data);
      } catch (e) {
        this.error = e;
        Promise.reject(e);
      }
    },
    getGroupedFields() {},
    updateFieldsError({ field, isError, message }) {
      const index = this._.findIndex(this.fieldErrors, { field });

      if (isError) {
        if (index < 0) {
          this.fieldErrors.push({ field, isError, message });
        }
      } else {
        if (index > -1) {
          this.fieldErrors.splice(index, 1);
        }
      }
    },
    onSubmit: async function({ subForm, cb }) {
      try {
        if (this.fieldErrors.length > 0) {
          throw this.fieldErrors;
        }

        this.$emit("input", this.model);

        if (this.autoSubmit) {
          this.$emit("submit");
          return Promise.resolve();
        }

        const result = await this.$http[this.method](this.action, this.model);

        this.fieldErrors = [];

        if (!subForm) {
          this.$emit("success", result.data);
        }

        if (cb) {
          cb(result.data);
        }

        return Promise.resolve(result.data);
      } catch (e) {
        this.hasError = true;

        if (Array.isArray(e)) {
          this.formErrors = e;
        } else {
          let err;

          if (e.response && e.response.data) {
            err = e.response.data.error || e.response.data;
          } else {
            err = e;
          }
          this.formErrors = [err];
        }

        this.$emit("error", e);

        this.$store.commit("submitError", { message: e });

        Promise.reject(e);
      }
    }
  },
  created() {
    this.refresh();
  }
};
</script>

