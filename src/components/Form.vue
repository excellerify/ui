<template lang='pug'>
div
  v-layout(v-if="loading" flex align-center justify-center)
    v-progress-circular(
      :width="8"
      :size="96"
      color="primary"
      style="margin-left:auto; margin-right:auto;"
      indeterminate)

  form(:action='action', @submit.prevent='onSubmit', novalidate)
    v-tabs(grow, scroll-bars, v-model='active', dark, v-if='groupBy')
      v-tabs-bar(slot='activators')
        v-tabs-item(
          v-for="(field, key) in group.parents"
          :key="key"
          :href="'tab-' + key"
          ripple)
        v-tabs-slider

      v-tabs-content(
        v-for="(getFields, key) in group.children"
        :key="key"
        :id="'tab-' + key")
        v-card(flat)
          v-card-text
            v-field(
              v-for="(field, name) in getFields"
              v-model="model[name]"
              :key="name"
              :name="field.label"
              :field="field"
              :readonly="readonly || field.readonly")

    template(v-if='(!groupBy && formType != "wizard") && inline')
      v-layout.row.wrap(style="padding: 8px")
        v-flex(v-for='(field, name, index) in getFields' :key="name")
          v-field(
            v-bind:class="{'pr-3': index != Object.keys(getFields).length-1}"
            @refresh="refresh"
            @onUpsert="onSubmit"
            @fieldError='updateFieldsError'
            v-model='model[name]'
            hide-details
            :inline="inline"
            :resourceId="model.id"
            :name='field.label'
            :field='field'
            :readonly='readonly || field.readonly')

      v-alert.m-5(error, v-model='formErrors.length > 0', style='width: 100%;')
        ul.px-3
          li(v-for='error in formErrors') {{error.message}}

      v-flex.actions(xs12)
        slot(name='buttons')
          v-btn(color='primary', dark, type='submit') {{$t(submitButtonText)}}
            v-icon(right, dark) {{submitButtonIcon}}

    template(v-else-if='(!groupBy && formType != "wizard") && !inline')
      v-layout.column.wrap
        v-field(
          v-for='(field, name) in getFields'
          @refresh='refresh'
          @onUpsert='onSubmit'
          @fieldError='updateFieldsError'
          v-model='model[name]'
          :inline="inline"
          :resourceId="model.id"
          :key="name"
          :name='field.label'
          :field='field'
          :readonly='readonly || field.readonly')

      v-alert.m-5(error, v-model='formErrors.length > 0', style='width: 100%;')
        ul.px-3
          li(v-for='error in formErrors') {{error.message}}

      v-flex.mt-5.actions(xs12)
        slot(name='buttons')
          v-btn.grey(dark, @click.native="$root.back()")
            v-icon(dark, left) chevron_left
            span {{$t('Cancel')}}
          v-btn.orange(dark, @click.native="onSaveAsDraft") {{$t('Save as Draft')}}
            v-icon(dark, right) save
          v-btn.primary(dark, type='submit') {{$t(isCreate? 'Submit': 'Save')}}
            v-icon(right, dark) send

          // v-btn(color='primary', dark, type='submit') {{$t(submitButtonText)}}
          //   v-icon(right, dark) {{submitButtonIcon}}

    v-layout(column, wrap, v-else-if='formType === "wizard"')
      v-stepper(v-model="wizardData.wizardStep" vertical :non-linear="isView || isEdit")
        template(v-for='(wizard, index) in getWizardContent')
          v-stepper-step(
            :step="index + 1"
            :keys="index"
            :rules="[()=> checkWizardStepError(index)]"
            :editable="wizardData.wizardStep > index || isView || isEdit"
            :complete="wizardData.wizardStep > index || isEdit") {{wizard.wizardTitle}}
            small(v-if="!checkWizardStepError(index)") One or more fields have an error or empty

          v-stepper-content(:step="index + 1")
            v-card
              v-card-text
                v-field(
                  v-for="(field) in wizard.fields"
                  v-model="model[field.name]"
                  @refresh="refresh"
                  @onUpsert="onSubmit"
                  @fieldError='updateFieldsError'
                  :value='model[field.name]'
                  :wizardIndex='index'
                  :inline="inline"
                  :resourceId="model.id"
                  :key="field.name"
                  :name='field.label'
                  :field='field'
                  :readonly='readonly || field.readonly')

                v-alert.m-5(error
                  v-model="formErrors.length > 0 && getWizardStepError(index).length > 0"
                  style='width: 100%;')
                  ul.px-3
                    li(v-for='error in getWizardStepError(index)') {{error.message}}

              v-card-actions
                v-btn(v-if="index > 0", @click.native="wizardData.wizardStep -= 1 ")
                  v-icon(left) chevron_left
                  span Back
                v-btn(v-if="wizardData.wizardStep < getWizardContent.length" color="primary" @click.native="onWizardContinue({index})")
                  span Continue
                  v-icon(dark, left) chevron_right

      v-alert.m-5(error, v-model='formErrors.length > 0', style='width: 100%;')
        ul.px-3
          li(v-for='error in formErrors') {{error.message}}

      v-flex.actions(xs12)
        slot(name="buttons")
          v-btn.grey(dark, @click.native="$root.back()")
            v-icon(dark, left) chevron_left
            span {{$t('Cancel')}}
          v-btn.orange(dark, @click.native="onSaveAsDraft") {{$t('Save as Draft')}}
            v-icon(dark, right) save
          v-btn.primary(dark, type='submit') {{$t(isCreate? 'Submit': 'Save')}}
            v-icon(right, dark) send
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import { Prop, Watch } from 'vue-property-decorator';

@Component({ name: 'Form' })
export default class Grid extends Vue {
  @Prop({ type: String })
  id!: string;

  @Prop({ type: String })
  resource!: string;

  @Prop({ type: String })
  subResource!: string;

  @Prop({ type: Boolean, default: false })
  inline!: boolean;

  @Prop({ type: String })
  groupBy!: string;

  @Prop({ type: String, default: 'Submit' })
  submitButtonText!: string;

  @Prop({ type: String, default: 'send' })
  submitButtonIcon!: string;

  @Prop({ type: Object, default: () => {} })
  value!: object;

  @Prop({ type: Object, default: () => {} })
  parentData!: object;

  @Prop({ type: Object, default: () => {} })
  formFields!: object;

  @Prop({ type: Boolean })
  autoSubmit!: boolean;

  @Prop({ type: String, default: 'form' })
  type!: string;

  @Prop({ type: Boolean, default: false })
  readonly!: string;

  error: Error;

  loading = false;

  model = this.value;

  hasError = false;

  formErrors = [];

  message = '';

  fieldErrors = [];

  rules = null;

  dataFormFields = null;

  formType = 'simple';

  wizardData = {
    wizardStep: 0,
    wizardContent: [],
  };

  get group() {
    if (!this.groupBy) {
      return null;
    }
    let parents = {};
    let children = {};

    for (let k in this.dataFormFields) {
      let field = this.dataFormFields[k];
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
  }

  get method() {
    return (
      this.$route.query.method || (this.isEdit ? 'patch' : 'post')
    ).toLowerCase();
  }

  get isCreate() {
    return !!!this.id;
  }

  get isEdit() {
    return !!this.id;
  }

  get isView() {
    return this.readonly;
  }

  get action() {
    if (this.$route.query.action) {
      return `${this.resource}/${this.$route.query.action}`;
    } else if (this.isEdit) {
      return `${this.resource}/${this.id}`;
    } else {
      return `${this.resource}`;
    }
  }

  get getFields() {
    return this.filteredFields();
  }

  get getWizardContent() {
    if (this.formType === 'wizard') {
      const wizardContent = this._.chain(this.filteredFields())
        .map((currentItem, key) => {
          // transform object key into property name,
          // to make fields can be stored in array
          currentItem.name = key;
          return currentItem;
        })
        .groupBy('wizardStepTitle')
        .toPairs()
        .map(currentItem => {
          let title =
            currentItem[0] != 'undefined' ? currentItem[0] : 'Final Step';

          return {
            wizardTitle: title,
            fields: currentItem[1],
          };
        })
        .orderBy('wizardTitle')
        .value();

      this.wizardData.wizardContent = wizardContent;

      return wizardContent;
    }

    return [];
  }

  @Watch('value')
  onValue(val: object) {
    this.model = val;
  }

  @Watch('$route')
  onRoute() {
    this.fieldErrors = [];
    this.hasError = false;
    this.refresh();
  }

  @Watch('formFields')
  onFormFields() {
    this.refresh();
  }

  async refresh() {
    try {
      this.fieldErrors = [];

      if (this.formFields) {
        this.dataFormFields = this.formFields;
      } else {
        await this.fetchFormSchema();
      }

      if (this.type === 'subForm' && this.parentData) {
        // resolve parent FK
        this._.forEach(this.filteredFields(), (val, key) => {
          // if field is marked as FK, resolve FK data
          if (val.fk) {
            this._.forEach(this.parentData, (valData, keyData) => {
              const fkData = valData[val.fk[keyData]];

              // if FK data not found, raise error
              if (!fkData) {
                console.error(
                  `Field "${val.fk}" \
                    not found in parent data or table "${keyData}"`,
                );
              }

              // assign FK data, from parrent to form field
              this.model[key] = fkData;
            });
          }
        });
      }
    } catch (e) {
      throw e;
    }
  }

  filteredFields() {
    if (!this.dataFormFields) return;

    const fields = Object.assign(this.dataFormFields);

    // Show only available mode
    let result = this._.pickBy(fields, (val, key) => {
      if (val.mode) {
        if (this.isEdit) {
          return val.mode.indexOf('isEdit') > -1;
        } else if (this.isView) {
          return val.mode.indexOf('isView') > -1;
        } else {
          return val.mode.indexOf('isCreate') > -1;
        }
      }

      return true;
    });

    result = this._.pickBy(result, (val, key) => {
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

    return result;
  }

  async fetchFormSchema() {
    try {
      this.loading = true;

      const data = await this.$store.dispatch('fetchFormSchema', {
        id: this.model ? this.model.id : this.id,
        resource: `${this.resource}`,
        subResource: `${this.subResource || 'form'}`,
      });

      this.dataFormFields = data.fields;
      this.model = data.model || {};
      this.rules = data.rules || {};

      if (this.isCreate) {
        this.formType = data.type || this.formType;
      }

      return data;
    } catch (e) {
      this.error = e;
      throw e;
    } finally {
      this.loading = false;
    }
  }

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
  }

  async onSubmit({ subForm, cb } = {}) {
    try {
      if (this.fieldErrors.length > 0) {
        throw this.fieldErrors;
      }

      this.$emit('input', this.model);

      if (this.autoSubmit) {
        this.$emit('submit');
        return;
      }

      const result = await this.$http[this.method](this.action, this.model);

      if (!subForm) {
        this.$emit('success', result.data);
      }

      this.model = result.data;
      this.model.id = result.data.id;

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

      this.$emit('error', e);
    }
  }

  async onSaveAsDraft({ subForm, cb } = {}) {
    try {
      if (this.fieldErrors.length > 0) {
        throw this.fieldErrors;
      }

      this.$emit('input', this.model);

      const result = await this.$http['post'](
        `${this.resource}/draft`,
        this.model,
      );

      if (!subForm) {
        this.$emit('success', result.data);
      }

      this.model = result.data;
      this.model.id = result.data.id;

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

      this.$emit('error', e);
    }
  }

  async onWizardContinue({ index, cb } = {}) {
    try {
      if (cb) {
        cb();
        return;
      }
      if (this.wizardData.wizardStep >= this.wizardData.wizardContent.length) {
        this.onSubmit();
      }

      if (this.fieldErrors.length > 0) {
        const checkFieldError = this._.filter(this.fieldErrors, {
          wizardIndex: index,
        });

        if (checkFieldError.length > 0) {
          throw checkFieldError;
        }
      }

      this.$emit('input', this.model);

      const result = await this.$http['post'](
        `${this.resource}/draft`,
        this.model,
      );

      this.model = result.data;
      this.model.id = result.data.id;

      this.wizardData.wizardStep = index + 2;
      this.formErrors = [];

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

      this.$emit('error', e);

      throw e;
    }
  }

  checkWizardStepError(index) {
    const errorStep = this.getWizardStepError(index);
    return !(errorStep && errorStep.length > 0);
  }

  getWizardStepError(index) {
    const errorStep = this._.filter(this.fieldErrors, {
      wizardIndex: index,
    });

    return errorStep;
  }

  created() {
    this.refresh();
  }
}
</script>

