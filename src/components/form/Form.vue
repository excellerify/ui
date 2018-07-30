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

      v-alert.m-5(error, v-model="formErrors.length > 0", style="width: 100%;")
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
export { default } from './Form.controller';
</script>

