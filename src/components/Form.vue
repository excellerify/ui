<template lang="pug">
div
  form(:action='action', @submit.prevent='onSubmit', novalidate)
    v-tabs(grow, scroll-bars, v-model='active', dark, v-if="groupBy")
      v-tabs-bar(slot='activators')
        v-tabs-item(v-for='(field, key) in group.parents',
          :key='key',
          :href="'tab-' + key",
          ripple)
        v-tabs-slider

      v-tabs-content(v-for='(formFields, key) in group.children',
        :key='key',
        :id="'tab-' + key")
        v-card(flat)
          v-card-text
            v-field(
              v-for='(field, name) in formFields',
              :key='name',
              :name="name",
              :field="field",
              v-model="model[name]")

    v-layout(v-bind="{[inline? 'row': 'column wrap']: true}", v-if="!groupBy")
      v-field.pr-1(
        @onUpsert="onSubmit"
        @fieldError="updateFieldsError",
        v-for='(field, name) in formFields',
        :key='name',
        :name="name",
        :field="field",
        v-model="model[name]")

      v-alert.py-2(error, v-model='hasError', style="width: 100%; margin-top: 20px;")
        ul
          li(v-for='error in formErrors') {{error.message}}

      v-flex.pt-2.actions(xs12)
        slot(name='buttons')
          v-btn.ma-0(color="primary", dark, type="submit") {{$t(submitButtonText)}}
            v-icon(right, dark) {{submitButtonIcon}}
</template>

<script>
export default {
  props: {
    resource: {
      type: String
    },
    id: {
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
      default: 'Submit'
    },
    submitButtonIcon: {
      required: false,
      type: String,
      default: 'send'
    },
    value: {
      required: false,
      type: Object,
      default: () => { }
    },
    parrentFormFields: {
      type: Object
    },
    autoSubmit: {
      type: Boolean
    }
  },
  data() {
    return {
      model: this.value,
      hasError: false,
      formErrors: [],
      message: '',
      fieldErrors: [],
      rules: null,
      messages: null,
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

        if (ref === null) { // is parent
          parents[parentKey] = field;
        } else { // is child
          if (!children[ref]) {
            children[ref] = {};
          }
          children[ref][k] = field;
        }
      }
      return { parents, children };
    },
    method() {
      return this.isEdit ? 'patch' : 'post';
    },
    isEdit() {
      return !!this.id;
    },
    action() {
      if (this.isEdit) {
        return `${this.resource}/${this.id}`;
      } else {
        return `${this.resource}`;
      }
    }
  },
  watch: {
    'value'(val) {
      this.model = val;
    },
    '$route'() {
      this.fieldErrors = [];
      this.hasError = false;
      this.fetch();
    }
  },
  methods: {
    fetch: async function () {
      try {
        let data = await this.$http.get(`${this.resource}/form`, {
          params: { id: this.id }
        });

        data = data.data.schema;
        this.model = data.model;
        this.formFields = data.fields;
        this.rules = data.rules;
        this.messages = data.messages;

        Promise.resolve(data);
      } catch (e) {
        this.error = e;
        Promise.reject(e);
      }
    },
    getGroupedFields() { },
    updateFieldsError({field, isError, message}) {
      const index = this._.findIndex(this.fieldErrors, {field});

      if (isError) {
        if (index < 0) {
          this.fieldErrors.push({field, isError, message});
        }
      } else {
        if (index > -1) {
          this.fieldErrors.splice(index, 1);
        }
      }
    },
    onSubmit: async function({subForm, cb}) {
      try {
        if (this.fieldErrors.length > 0) {
          throw this.fieldErrors;
        }

        this.$store.commit('submitLoading');

        this.$emit('input', this.model);

        if (this.autoSubmit) {
          this.$emit('submit');
          return Promise.resolve();
        }

        const result = await this.$http[this.method](this.action, this.model);

        if (!subForm) {
          this.$emit('success', result.data);
        }

        this.fieldErrors = [];

        this.$store.commit('submitSuccess', {message: result.data});

        if (cb) {
          cb(result.data);
        }

        return Promise.resolve(result.data);
      } catch (e) {
        this.hasError = true;

        if (Array.isArray(e)) {
          this.formErrors = e;
        } else {
          this.formErrors = [e];
        }

        this.$emit('error', e);

        this.$store.commit('submitError', {message: e});

        Promise.reject(e);
      }
    }
  },
  mounted() {
    this.fieldErrors = [];
    if (!this.parrentFormFields) {
      this.fetch();
    } else {
      this.formFields = this.parrentFormFields;
    }
  },
  created() {
    // global.validator.extend('unique', function (data, field, message, args, get) {
    //   return new Promise(function (resolve, reject) {
    //     // const fieldValue = get(data, field)
    //     return resolve('Unsupported in client.')
    //   })
    // }, this.$t('Field should be unique.'))
  }
};
</script>
