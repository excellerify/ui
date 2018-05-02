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

    template(v-if='(!groupBy && formType != "wizard") || inline')
      v-layout(v-bind="{[inline? 'row':'column wrap']: true}")
        v-field(v-bind:class="{[inline? 'pr-3':'']: true}")(
          v-for='(field, name) in getFields'
          @refresh='refresh'
          @onUpsert='onSubmit'
          @fieldError='updateFieldsError'
          v-model='model[name]'
          :inline="inline"
          :resourceId="id"
          :key="name"
          :name='field.label'
          :field='field'
          :readonly='readonly || field.readonly')

      v-alert.m-5(error, v-model='formErrors.length > 0', style='width: 100%;')
        ul.px-3
          li(v-for='error in formErrors') {{error.message}}

      v-flex.actions(xs12)
        slot(name='buttons')
          v-btn.mb-3(color='primary', dark, type='submit') {{$t(submitButtonText)}}
            v-icon(right, dark) {{submitButtonIcon}}

    v-layout(column, wrap, v-else-if='formType === "wizard"')
      div(slot="buttons", class="my-4")
          v-btn(dark, class="grey", @click.native="$root.back()")
            v-icon(dark, left) chevron_left
            span {{$t('Cancel')}}

      v-stepper(v-model="wizardData.wizardStep" vertical :non-linear="isView || isEdit")
        template(v-for='(wizard, index) in wizardData.wizardContent')
          v-stepper-step(
            :step="index + 1"
            :keys="index"
            :editable="wizardData.wizardStep > index || isView || isEdit"
            :complete="wizardData.wizardStep > index || isEdit") {{wizard.wizardTitle}}
          v-stepper-content(:step="index + 1")
            v-card
              v-card-text
                v-field(
                  v-for="(field) in wizard.fields"
                  @refresh="refresh"
                  @onUpsert="onSubmit"
                  @fieldError='updateFieldsError'
                  v-model='model[field.name]'
                  :wizardIndex='index'
                  :inline="inline"
                  :resourceId="id"
                  :key="field.name"
                  :name='field.label'
                  :field='field'
                  :readonly='readonly || field.readonly')

                v-spacer
                v-alert.m-5(error, v-model='formErrors.length > 0', style='width: 100%;')
                  ul.px-3
                    li(v-for='error in formErrors') {{error.message}}

              v-card-actions
                v-btn(v-if="index > 0", @click.native="wizardData.wizardStep = index ")
                  v-icon(left) chevron_left
                  span Back
                v-btn(color="primary" @click.native="wizardContinue(index)")
                  span Continue
                  v-icon(dark, left) chevron_right

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
      formFields: null,
      formType: "simple",
      wizardData: {
        wizardStep: 0,
        wizardContent: []
      }
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
    isCreate() {
      return !!!this.id;
    },
    isEdit() {
      return !!this.id;
    },
    isView() {
      return this.readonly;
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
      return this.filterFieldByMode(this.formFields);
    }
  },
  watch: {
    value(val) {
      this.model = val;
    },
    model: {
      handler: function(val) {
        this.formFields = this.filterFieldOptionalsOn();
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

        this.formFields = this.filterFieldByMode(this.formFields);
        this.formFields = this.filterFieldOptionalsOn();

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
    filterFieldByMode(fields) {
      // Show only available mode
      return this._.pickBy(fields, (val, key) => {
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
    },
    filterFieldOptionalsOn() {
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
        this.formType = data.type || this.formType;

        if (this.formType === "wizard") {
          const fields = this.filterFieldByMode(data.fields);
          const wizardContent = this._.chain(fields)
            .map((currentItem, key) => {
              // transform object key into property name,
              // to make fields can be stored in array
              currentItem.name = key;
              return currentItem;
            })
            .groupBy("wizardStepTitle")
            .toPairs()
            .map(currentItem => {
              let title =
                currentItem[0] != "undefined" ? currentItem[0] : "Final Step";

              return {
                wizardTitle: title,
                fields: currentItem[1]
              };
            })
            .value();

          this.wizardData = { wizardContent };
        }

        Promise.resolve(data);
      } catch (e) {
        this.error = e;
        Promise.reject(e);
      }
    },
    updateFieldsError({ field, isError, message, wizardIndex }) {
      const index = this._.findIndex(this.fieldErrors, { field });

      if (isError) {
        if (index < 0) {
          this.fieldErrors.push({ field, isError, message, wizardIndex });
        }
      } else {
        if (index > -1) {
          this.fieldErrors.splice(index, 1);
        }
      }
    },
    async onSubmit({ subForm, cb, index } = {}) {
      try {
        if (this.fieldErrors.length > 0) {
          if (this.formType != "wizard") {
            throw this.fieldErrors;
          } else {
            const checkFieldError = this._.filter(this.fieldErrors, {
              wizardIndex: index
            });

            if (checkFieldError.length > 0) {
              throw checkFieldError;
            }
          }
        }

        this.$emit("input", this.model);

        if (this.autoSubmit) {
          this.$emit("submit");
          return;
        }

        const result = await this.$http[this.method](this.action, this.model);

        if (!subForm && this.formType != "wizard") {
          this.$emit("success", result.data);
        }

        this.id = result.data.id;

        if (cb) {
          cb(result.data);
        }

        return result.data;
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

        console.error(e);

        Promise.reject(e);
      }
    },
    async wizardContinue(index) {
      await this.onSubmit({
        index,
        cb: () => {
          if (
            this.wizardData.wizardStep < this.wizardData.wizardContent.length
          ) {
            this.wizardData.wizardStep = index + 2;
            this.formErrors = [];
          } else {
            this.$emit("success", this.model);
          }
        }
      });
    }
  },
  created() {
    this.refresh();
  }
};
</script>

