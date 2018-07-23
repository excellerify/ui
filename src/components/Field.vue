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
              :name="name",
              v-for="option in dataField.choices",
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

    //- money input
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
import randomstring from 'randomstring';
import moment, { now } from 'moment';
import EventBus from '../eventBus';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import { config } from '@/config';

import 'vue2-dropzone/dist/vue2Dropzone.css';

@Component({ name: 'Field' })
export default class Field extends Vue {
  @Prop({
    type: String,
    required: true,
    default: '00000000-0000-0000-0000-000000000000',
  })
  resourceId!: string;

  @Prop({
    type: Object,
    required: true,
  })
  field!: string;

  @Prop({
    type: String,
  })
  name!: string;

  @Prop() value!: string;

  @Prop({
    type: Number,
  })
  width!: string;

  @Prop({
    type: Boolean,
  })
  readonly!: string;

  @Prop({
    type: Boolean,
  })
  inline!: string;

  @Prop({
    type: Number,
  })
  wizardIndex!: string;

  // data() {
  //   return {
  inputGroupClass: string = 'input-group input-group--dirty input-group--text-field';
  editorOption = {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'], // toggled buttons
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['blockquote', 'code-block'],
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
      ],
    },
  };
  passwordInvisible: boolean = true;
  addSubdata: boolean = false;
  tableForm = {};
  isError: boolean = false;
  errorMessage = [];
  isShowDialogForm: boolean = false;
  currentItem = null;
  parentData = {};
  loading: boolean = false;
  autoCompleteSync = null;
  menuShowTogle = {
    date: false,
    time: false,
  };
  dataField = this.field;

  // },
  // watch: {
  @Watch('errors.items', { deep: true })
  onErrorItems(val) {
    this.isError = val.length > 0;
    this.errorMessage = this.isError ? val[0].msg : [];

    this.emitError({
      isError: this.isError,
      msg: val.length > 0 ? val[0].msg : '',
    });
  }

  @Watch('autoCompleteSync')
  onAutoCompleteSync(val: string) {
    if (val) {
      this.doAutoCompleteSync(val);
    } else if (this.model) {
      this.dataField.choices = [this.populateAutocompleteChoices(this.model)];
    }
  }

  @Watch('value')
  onValue(val) {
    const isError = this.dataField.required && !val;
    this.emitError({ isError });
    if (
      ['select', 'select2'].includes(this.dataField.type) &&
      this.dataField.dataSource &&
      this.model
    ) {
      this.dataField.choices = [this.populateAutocompleteChoices(this.model)];
    }
  }

  get resource() {
    return this.$route.params.resource;
  }

  get model() {
    if (['money', 'number'].indexOf(this.dataField.type) > -1) {
      return global.helper.moneyFormatter(this.value);
    }
    const formatDate = date => {
      return date ? moment(String(date)).format(config.format.date) : null;
    };
    const formatTime = date => {
      return date ? moment(String(date)).format('HH:mm') : null;
    };
    if (['date'].indexOf(this.dataField.type) > -1) {
      const date = formatDate(this.value);
      return { date };
    }
    if (['time'].indexOf(this.dataField.type) > -1) {
      const time = formatTime(this.value);
      return { time };
    } else if (['datetime'].indexOf(this.dataField.type) > -1) {
      const date = formatDate(this.value);
      const time = formatTime(this.value);
      return { date, time };
    }
    return this.value;
  }

  set model(val) {
    if (['money', 'number'].indexOf(this.dataField.type) > -1) {
      val = Number(val.replace(/[^0-9\.-]+/g, ''));
    } else if (['datetime'].indexOf(this.dataField.type) > -1) {
      const { date, time } = val;
      const dateTime = moment(
        `${date || '0000-00-00'} ${time || '00:00'}`,
        `${config.format.date} ${config.format.time}`,
      );
      return this.$emit('input', dateTime.toDate());
    } else if (['time'].indexOf(this.dataField.type) > -1) {
      return this.$emit('input', val.time);
    } else if (['date'].indexOf(this.dataField.type) > -1) {
      return this.$emit('input', val.date);
    }
    return this.$emit('input', val);
  }

  get validationRules() {
    const rules = {
      required: !!this.dataField.required,
      email: this.dataField.type
        ? this.dataField.type.toLowerCase() === 'email'
        : false,
    };
    return rules;
  }

  emitError({ isError, msg } = {}) {
    this.$emit('fieldError', {
      field: this.name,
      wizardIndex: this.wizardIndex,
      isError,
      message: isError
        ? msg || `The ${this.dataField.label} field is required.`
        : [],
    });
  }

  onUploading(file, xhr, formData) {
    const extension = file.name.split('.');
    formData.append('id', this.resourceId);
    file.upload.filename = `${randomstring.generate()}.${
      extension[extension.length - 1]
    }`;
  }

  onUploadSuccess(file, response) {
    if (response.url) {
      const filename = response.url;
      this.model = `${response.url}`;
      return;
    }

    const filename = response.url || response.result.files.file[0].name;
    this.model = `${config.api}Files/${this.resource}/download/${filename}`;
  }

  getDropzoneOptions(field, model) {
    const uploadUrl = this.dataField.uploadUrl
      ? `${config.api}${this.dataField.uploadUrl}`
      : `${config.ajaxUploadUrl}/${this.resource}/upload`;

    return {
      url: `${uploadUrl}`,
      thumbnailWidth: 150,
      maxFilesize: 1024,
      acceptedFileTypes: field.acceptedFileTypes,
      id: 'dropzone_' + this.name,
      createThumbnailFromUrl: model,
      uploadMultiple: false,
      maxFiles: 1,
      init: function() {
        this.on('addedfile', function(file) {
          if (this.files.length > 1) {
            this.removeFile(this.files[0]);
          }
        });
      },
    };
  }

  onGridCreate() {
    this.prepareGridSubFormData();
  }

  onGridUpdate({ item }) {
    this.currentItem = item;
    this.prepareGridSubFormData();
  }

  prepareGridSubFormData() {
    this.parentData[this.resource] = {
      id: this.resourceId,
    };
    this.isShowDialogForm = true;
  }

  modalSubFormClose() {
    this.isShowDialogForm = false;
    this.$emit('refresh');
    EventBus.$emit('gridRefresh');
  }

  async doAutoCompleteSync(val) {
    try {
      this.loading = true;
      const data = await this.$store.dispatch('fetchAutoComplete', {
        dataSource: this.dataField.dataSource,
        searchVal: val,
      });
      if (data.length > 0) {
        this.dataField.choices = data.map(val =>
          this.populateAutocompleteChoices(val),
        );
      } else if (this.model) {
        this.dataField.choices = [this.populateAutocompleteChoices(this.model)];
      } else {
        this.dataField.choices = null;
      }
      this.loading = false;
    } catch (e) {
      this.loading = false;
      throw e;
    }
  }

  populateAutocompleteChoices(val) {
    let choice = '';
    this.dataField.dataSource.searchParams.map((param, key) => {
      choice += this._.get(val, param);
      if (key != this.dataField.dataSource.searchParams.length - 1) {
        choice += ' - ';
      }
    });
    return { value: val, text: choice };
  }

  created() {
    if (
      this.dataField.required &&
      !this.dataField.disabled &&
      !this.dataField.readonly &&
      !this.value &&
      ![
        'file',
        'pdf',
        'image',
        'video',
        'table',
        'array',
        'date',
        'datetime',
        'time',
        'hidden',
        'map',
      ].includes(this.dataField.type)
    ) {
      this.emitError({ isError: true });
    }

    if (['select', 'select2'].includes(this.dataField.type) && this.model) {
      this.dataField.choices = this.dataField.choices || [
        this.populateAutocompleteChoices(this.model),
      ];
    }
  }

  mounted() {
    if (['image'].includes(this.dataField.type) && this.model) {
      var url = `${config.api + this.value}`;
      this.$refs.dropzone.manuallyAddFile({}, url);
    }
  }
}
</script>
