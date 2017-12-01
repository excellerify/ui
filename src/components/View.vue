<template lang="pug">
div
  v-tabs(grow, scroll-bars, v-model='active', dark, v-if="groupBy")
    v-tabs-bar(slot='activators')
      v-tabs-item(v-for='(field, key) in group.parents', :key='key', :href="'tab-' + key", ripple)
      v-tabs-slider
    v-tabs-content(v-for='(fields, key) in group.children', :key='key', :id="'tab-' + key")
      v-card(flat)
        v-card-text
          v-field(v-for='(field, name) in fields', :key='name', :name="name", :field="field", v-model="model[name]")

  v-layout(v-bind="{[inline? 'row': 'column wrap']: true}", v-if="!groupBy")

    v-field.pr-1(v-for='(field, name) in fields', :key='name', :name="name", :field="field", :readonly="true" v-model="model[name]")

    v-alert.py-2(error, v-model='hasError')
      div(v-for='error in errors')  {{error.message}}
    slot
    v-flex.pt-2.actions(xs12)
      slot(name='buttons')
        v-btn.ma-0(primary, dark, type='submit') {{$t(submitButtonText)}}
          v-icon(right, dark) {{submitButtonIcon}}
</template>

<script>
export default {
  props: {
    inline: {
      type: Boolean,
      default: false
    },
    groupBy: {
      required: false,
      type: String,
      default: null
    },
    value: {
      required: false,
      type: Object,
      default: () => { }
    },
    fields: {
      required: true,
      type: Object
    },
    messages: {
      required: false,
      type: Object,
      default: () => { }
    }

  },
  data() {
    return {
      model: this.value,
      hasError: false,
      errors: [],
      message: ''
    };
  },

  computed: {
    group() {
      if (!this.groupBy) {
        return null;
      }
      let parents = {};
      let children = {};
      for (let k in this.fields) {
        let field = this.fields[k];
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

    autoSubmit() {
      return !!this.action;
    }
  },
  watch: {
    'value'(val) {
      this.model = val;
    },
    'model': 'updateFields'
  },
  methods: {

    getGroupedFields() { },
    getFieldError(fieldName) {
      for (let k in this.errors) {
        let error = this.errors[k];
        if (error.field === fieldName) {
          return error.message;
        }
      }
    },
    updateFields() {

    }
  }
};
</script>
