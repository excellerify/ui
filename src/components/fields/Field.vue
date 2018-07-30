<template lang="pug">
div
  div(v-if="readonly && ['table', 'map', 'select'].indexOf(dataField.type) === -1")
    v-text-field(
      :label="dataField.label"
      :value="typeof model === 'object' ? JSON.stringify(model) : model"
      readonly)

  div(v-else-if="dataField.type === 'automatic'")
    v-text-field(
      :label="dataField.label"
      :value="model || 'AUTO'"
      disabled)

  div(v-else-if="dataField.disabled")
    v-text-field(
      :label="dataField.label"
      :value="model"
      disabled)

  div(v-else)
    //- if select2
    div(v-if="['select', 'select2'].includes(dataField.type)")
      v-select(
        v-if="!dataField.dataSource"
        v-validate="validationRules"
        v-model="model"
        v-bind="dataField"
        :name="name"
        :items="dataField.choices"
        :readonly="readonly")

      //- if autocomplete
      v-autocomplete(
        placeholder="Start typing to Search"
        v-else-if="dataField.dataSource"
        v-validate="validationRules"
        v-model="model"
        v-bind="dataField"
        browser-autocomplete="off"
        item-text="text"
        item-value="value"
        :loading="loading"
        :name="name"
        :search-input.sync="autoCompleteSync"
        :items="dataField.choices"
        :readonly="readonly")

    //- if map
    template(v-else-if="['map'].indexOf(dataField.type) > -1")
      v-field-google-map(
        v-bind="dataField"
        @input="(val) => {model = val}"
        :name="name"
        :value="model"
        :required="dataField.required"
        :readonly="readonly")

    //- if radio
    v-layout(v-else-if="['radios', 'radio'].indexOf(dataField.type) > -1", row)
      div.input-group
        label {{$t(dataField.label)}}
        v-flex(xs12)
          v-radio-group(v-model="model", column, wrap, :readonly="readonly")
            v-radio(
              v-for="option in dataField.choices",
              :name="name",
              :key="option.value",
              :label="option.text",
              :value="option.value",
              :disabled="readonly",
              v-validate="validationRules")

    //- if checkbox
    template(v-else-if="['checkbox'].indexOf(dataField.type) > -1")
      v-layout(row, wrap, class="input-group")
        v-checkbox(
          :name="name",
          :key='dataField.value',
          :value='dataField.value',
          :label='dataField.text',
          :disabled="readonly",
          v-model="model",
          hide-details,
          v-validate="validationRules")
        label {{$t(dataField.label)}}

    template(v-else-if="['checkboxes'].indexOf(dataField.type) > -1")
      v-layout(row, wrap, class="input-group")
        label {{$t(dataField.label)}}
        v-flex(v-bind="{[dataField.width]: true}", xs12)
          span(v-for='option in dataField.choices', :key="dataField.value")
            v-checkbox(
              :name="name",
              :key='option.value',
              :value='option.value',
              :label='option.text',
              :disabled="readonly",
              v-model="model",
              hide-details,
              v-validate="validationRules")

    //- if input type is date or time
    template(v-else-if="['date', 'time', 'datetime'].indexOf(dataField.type) > -1")
      v-flex.xs12(class="input-group" style="padding: 0")
        label(v-if="!inline") {{$t(dataField.label)}}
        v-layout.row.wrap
          v-flex(v-if="['date', 'datetime'].indexOf(dataField.type) > -1")
            v-menu(
              ref="menuDate"
              v-model="menuShowTogle.date"
              :return-value.sync="model"
              :close-on-content-click="false")
              v-text-field.xs12(
                readonly
                slot='activator'
                prepend-icon="event"
                v-model='model.date'
                :label="inline? dataField.label : 'Date'")
              v-date-picker(
                scrollable
                no-title
                v-model="model.date"
                v-validate="validationRules")
                  v-spacer
                  v-btn(flat color="primary" @click="menuShowTogle.date=false") Cancel
                  v-btn(flat color="primary" @click="$refs.menuDate.save({time: model.time, date: model.date})") OK

          v-flex(v-if="['time', 'datetime'].indexOf(dataField.type) > -1")
            v-menu(
              ref="menuTime"
              v-model="menuShowTogle.time"
              :return-value.sync="model"
              :close-on-content-click="false")
              v-text-field.xs12(
                readonly
                slot='activator'
                prepend-icon="schedule"
                v-model='model.time'
                :label="inline? dataField.label : 'Time'")
              v-time-picker(
                scrollable
                v-model="model.time"
                v-validate="validationRules")
                v-card-actions
                  v-spacer
                  v-btn(flat color="primary" @click="menuShowTogle.time=false") Cancel
                  v-btn(flat color="primary" @click="$refs.menuTime.save({time: model.time, date: model.date})") OK

    //- if input type is html
    div(:class="inputGroupClass",v-else-if="dataField.type == 'html'")
      label {{$t(dataField.label)}}
      div.pt-2
        quill-editor(v-model='model', :options="editorOption")

    //- if input type is file
    //- TODO dropzone
    div(:class="inputGroupClass", v-else-if="['file', 'pdf', 'image', 'video'].includes(dataField.type)")
      label {{$t(dataField.label)}}
      div.pt-2
        dropzone(
          :id="`dropzone_${name}`"
          :options="getDropzoneOptions(dataField, model)"
          ref="dropzone"
          @vdropzone-sending="onUploading"
          @vdropzone-success="onUploadSuccess")
          input(type="hidden" v-model="model" v-validate="validationRules")

    //- if hidden
    input(v-else-if="dataField.type == 'hidden'", type='hidden', v-model='model', :name="name")

    //- if table
    template(v-else-if="['table'].indexOf(dataField.type) > -1")
      v-layout(row, wrap, class="input-group")
        label {{dataField.label}}
        v-grid(
          type="dataField"
          :name="name"
          :resource="dataField.model || name"
          :filterByFk="{ model: resource, value : resourceId }"
          :readonly="readonly"
          :onCreate="onGridCreate"
          :onUpdate="onGridUpdate")
      v-spacer
        v-dialog(v-model="isShowDialogForm", max-width="60%")
          v-card(v-if="isShowDialogForm")
            v-toolbar(style="flex: 0 0 auto;", dark, class="primary")
              v-btn(icon, @click.native="isShowDialogForm = false", dark)
                v-icon close
              v-toolbar-title {{$t(currentItem? 'Edit':'Add')}}
            v-spacer
            v-card-text
              v-form(
                type="subForm"
                :parentData="parentData"
                :id="currentItem ? currentItem.id : null"
                :resource="dataField.model || name"
                @success="modalSubFormClose")

    //- password input
    v-text-field(
      v-else-if="['password'].indexOf(dataField.type) > -1"
      :name="name"
      v-model='model'
      v-bind="dataField"
      v-validate="validationRules"
      :readonly="readonly"
      :label="$t(dataField.label)"
      :placeholder="$t(dataField.placeholder)"
      :error="isError"
      :error-messages="errorMessage"
      :append-icon="passwordInvisible ? 'visibility' : 'visibility_off'"
      :append-icon-cb="() => (passwordInvisible = !passwordInvisible)"
      :type="passwordInvisible ? 'password' : 'text'")

    //- money and number input
    v-text-field(
      v-else-if="['money', 'number'].indexOf(dataField.type) > -1"
      v-model='model'
      v-bind='dataField'
      v-validate="validationRules"
      type="text"
      :name="name"
      :readonly="readonly"
      :label="$t(dataField.label)"
      :placeholder="$t(dataField.placeholder)"
      :error="isError"
      :error-messages="errorMessage")

    //- default input
    v-text-field(
      v-else,
      v-model.lazy='model'
      v-bind='dataField'
      v-validate="validationRules"
      :name="name"
      :readonly="readonly"
      :label="$t(dataField.label)"
      :placeholder="$t(dataField.placeholder)"
      :type="dataField.type"
      :multiLine="dataField.type == 'textarea'"
      :error="isError"
      :error-messages="errorMessage")

</template>

<script lang="ts">
import 'vue2-dropzone/dist/vue2Dropzone.css';
export { default } from './Field.controller';
</script>
