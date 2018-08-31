<template lang="pug">
div.field-container
  div(v-if="readonly && ['table', 'map', 'select', 'image', 'file'].indexOf(dataField.type) === -1")
    v-text-field(
      :label="fieldLabel"
      :value="typeof model === 'object' ? JSON.stringify(model) : model"
      readonly)

  div(v-else-if="dataField.type === 'automatic'")
    v-text-field(
      :label="fieldLabel"
      :value="model || 'AUTO'"
      disabled)

  div(v-else-if="dataField.disabled")
    v-text-field(
      :label="dataField.label"
      :value="model"
      disabled)

  //- if select2
  div(v-else-if="['select', 'select2'].includes(dataField.type)")
    v-select(
      v-if="!dataField.dataSource"
      v-validate="validationRules"
      v-model="model"
      v-bind="dataField"
      :label="fieldLabel"
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
      :label="fieldLabel"
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
      label {{$t(fieldLabel)}}
      v-flex(xs12)
        v-radio-group(v-model="model", column, wrap, :readonly="readonly")
          v-radio(
            v-for="option in dataField.choices",
            :name="name",
            :key="option.value",
            :label="option.text",
            :value="option.value",
            :disabled="readonly",
            :required="dataField.required"
            v-validate="validationRules")

  //- if checkbox
  template(v-else-if="['checkbox'].indexOf(dataField.type) > -1")
    v-layout(row, wrap, class="input-group")
      v-checkbox(
        :label="dataField.label"
        :name="name",
        :key="dataField.value",
        :value='dataField.value',
        :disabled="readonly",
        v-model="model",
        hide-details,
        v-validate="validationRules")

  template(v-else-if="['checkboxes'].indexOf(dataField.type) > -1")
    v-layout(row, wrap, class="input-group")
      label {{$t(fieldLabel)}}
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
      label(v-if="!inline") {{$t(fieldLabel)}}
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
    label {{$t(fieldLabel)}}
    div.pt-2
      quill-editor(v-model='model', :options="editorOption")

  //- if input type is file
  div.mt-2.mb-4(:class="inputGroupClass", v-else-if="['file', 'pdf'].includes(dataField.type)")
    label {{$t(fieldLabel)}}
    v-layout.row.wrap
      v-flex.xs12.sm6(v-if="model" style="border: 2px solid #E5E5E5 ")
        object(
          style="margin-left: auto; margin-right: auto; background: #eee"
          height="190" width="100%"
          :data="`https://drive.google.com/viewerng/viewer?embedded=true&url=${apiUrl}${model}`")
        v-btn.success(@click="tempModel=Object.assign(model); model=null" small) Change File

      v-flex.xs12.sm6(v-else-if="!model" style="border: 2px solid #E5E5E5 ")
        dropzone(
          :id="`dropzone_${name}`"
          :options="getDropzoneOptions(dataField, 'file')"
          ref="dropzone"
          @vdropzone-sending="onUploading"
          @vdropzone-success="onUploadSuccess")
          input(type="hidden" v-model="model" v-validate="validationRules")
        v-btn.warning(v-if="tempModel" @click="model=Object.assign(tempModel); tempModel=null" small) 
          v-icon(dark) cancel
          span Cancel

  div.mt-2(:class="inputGroupClass", v-else-if="['image'].includes(dataField.type)")
    label {{$t(fieldLabel)}}
    v-layout.row.wrap
      v-flex.xs12.sm6(v-if="model" style="border: 2px solid #E5E5E5 ")
        div.text-xs-center(style="width:100%; background: #eee")
          img(
            style="margin-left: auto; margin-right: auto;"
            height="190"
            :src="`${apiUrl}${model}`")

        v-btn.success(@click="tempModel=Object.assign(model); model=null" small) Change Image

      v-flex.xs12.sm6(v-else-if="!model" style="border: 2px solid #E5E5E5 ")
        dropzone(
          :id="`dropzone_${name}`"
          :options="getDropzoneOptions(dataField, 'image')"
          ref="dropzone"
          @vdropzone-sending="onUploading"
          @vdropzone-success="onUploadSuccess")
          input(type="hidden" v-model="model" v-validate="validationRules")
        v-btn.warning(v-if="tempModel" @click="model=Object.assign(tempModel); tempModel=null" small) 
          v-icon(dark) cancel
          span Cancel

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
    :label="fieldLabel"
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
    :label="$t(fieldLabel)"
    :placeholder="$t(dataField.placeholder)"
    :error="isError"
    :error-messages="errorMessage")

  //- if hidden
  input(
    v-else-if="dataField.type == 'hidden'"
    type='hidden'
    v-model='model'
    :name="name")

  //- default input
  v-text-field(
    v-else,
    v-model.lazy='model'
    v-bind='dataField'
    v-validate="validationRules"
    :name="name"
    :readonly="readonly"
    :label="$t(fieldLabel)"
    :placeholder="$t(dataField.placeholder)"
    :type="dataField.type"
    :multiLine="dataField.type == 'textarea'"
    :error="isError"
    :error-messages="errorMessage")

</template>

<script lang="ts">
import 'vue2-dropzone/dist/vue2Dropzone.css';
import { config } from '@/config';
import EventBus from '@/eventBus';
import moment from 'moment';
import randomstring from 'randomstring';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';
import {
  IFormField,
  IFormFieldUpload,
  IFormFieldAutocomplete,
  IFormFieldCheckbox,
  IFormFieldTable,
  IFormFieldFk,
} from '@/interfaces/form.interface';
import { file } from 'babel-types';

@Component({ name: 'Field' })
export default class Field extends Vue {
  @Prop({
    type: String,
    required: true,
    default: '00000000-0000-0000-0000-000000000000',
  })
  public resourceId!: string;

  @Prop({
    type: Object,
    required: true,
  })
  public field!:
    | IFormField
    | IFormFieldUpload
    | IFormFieldAutocomplete
    | IFormFieldCheckbox
    | IFormFieldTable
    | IFormFieldFk;

  @Prop({
    type: String,
  })
  public name!: string;

  @Prop() public value!: string;

  @Prop({
    type: Number,
  })
  public width!: string;

  @Prop({
    type: Boolean,
  })
  public readonly!: string;

  @Prop({
    type: Boolean,
  })
  public inline!: string;

  @Prop({
    type: Number,
  })
  public wizardIndex!: string;

  public inputGroupClass: string = 'input-group input-group--dirty input-group--text-field';

  public editorOption = {
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
  public passwordInvisible: boolean = true;

  public addSubdata: boolean = false;

  public tableForm = {};

  public isError: boolean = false;

  public errorMessage = [];

  public isShowDialogForm: boolean = false;

  public currentItem = null;

  public parentData = {};

  public loading: boolean = false;

  public autoCompleteSync = null;

  public autoCompleteSerachVal: string;

  public menuShowTogle = {
    date: false,
    time: false,
  };

  public dataField = this.field;

  public apiUrl = config.api;

  public tempModel: string | null = null;

  @Watch('errors.items', { deep: true })
  public onErrorItems(val) {
    this.isError = val.length > 0;
    this.errorMessage = this.isError ? val[0].msg : [];

    this.emitError({
      isError: this.isError,
      msg: val.length > 0 ? val[0].msg : '',
    });
  }

  @Watch('autoCompleteSync')
  public onAutoCompleteSync(val: string) {
    if (val && this.autoCompleteSerachVal !== val) {
      this.autoCompleteSerachVal = val;
      this.doAutoCompleteSync(val);
    } else if (!val && this.model) {
      this.dataField.choices = [this.populateAutocompleteChoices(this.model)];
    }
  }

  @Watch('value')
  public onValue(val: object) {
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

  get validationRules(): boolean {
    const rules = {
      required: !!this.dataField.required,
      email: this.dataField.type
        ? this.dataField.type.toLowerCase() === 'email'
        : false,
    };
    return rules;
  }

  get fieldLabel(): string {
    return this.dataField.label + (this.dataField.required ? ' *' : '');
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
      this.$emit('input', val);
    } else if (['datetime'].indexOf(this.dataField.type) > -1) {
      const { date, time } = val;
      const dateTime = moment(
        `${date || '0000-00-00'} ${time || '00:00'}`,
        `${config.format.date} ${config.format.time}`,
      );
      this.$emit('input', dateTime.toDate());
    } else if (['time'].indexOf(this.dataField.type) > -1) {
      this.$emit('input', val.time);
    } else if (['date'].indexOf(this.dataField.type) > -1) {
      this.$emit('input', val.date);
    } else {
      this.$emit('input', val);
    }
  }

  public emitError({ isError, msg } = {}) {
    this.$emit('fieldError', {
      field: this.name,
      wizardIndex: this.wizardIndex,
      isError,
      message: isError
        ? msg || `The ${this.dataField.label} field is required.`
        : [],
    });
  }

  public onUploading(file, xhr, formData) {
    const extension = file.name.split('.');
    formData.append('id', this.resourceId);
    file.upload.filename = `${randomstring.generate()}.${
      extension[extension.length - 1]
    }`;
  }

  public onUploadSuccess(file, response) {
    if (response.url) {
      const filename = response.url;
      this.model = `${response.url}`;
      return;
    }

    const filename = response.url || response.result.files.file[0].name;
    this.model = `${config.api}Files/${this.resource}/download/${filename}`;
  }

  public getDropzoneOptions(field, type: 'file' | 'image') {
    const uploadUrl = field.uploadUrl
      ? `${config.api}${field.uploadUrl}`
      : `${config.ajaxUploadUrl}/${this.resource}/upload`;

    const options = {
      url: `${uploadUrl}`,
      headers: {
        Authorization: JSON.parse(localStorage.getItem('token') || '""'),
      },
      maxFilesize: 1024,
      acceptedFiles:
        type === 'image'
          ? 'image/*'
          : 'application/pdf, .doc, .docs, .xls, .xlsx',
      id: 'dropzone_' + this.name,
      uploadMultiple: false,
      maxFiles: 1,
      init() {
        this.on('addedfile', function(file) {
          if (this.files.length > 1) {
            this.removeFile(this.files[0]);
          }
        });
      },
    };

    return options;
  }

  public onGridCreate() {
    this.prepareGridSubFormData();
  }

  public onGridUpdate({ item }) {
    this.currentItem = item;
    this.prepareGridSubFormData();
  }

  public prepareGridSubFormData() {
    this.parentData[this.resource] = {
      id: this.resourceId,
    };
    this.isShowDialogForm = true;
  }

  public modalSubFormClose() {
    this.isShowDialogForm = false;
    this.$emit('refresh');
    EventBus.$emit('gridRefresh');
  }

  public async doAutoCompleteSync(val) {
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

  public populateAutocompleteChoices(val) {
    let choice = '';
    this.dataField.dataSource.searchParams.map((param, key) => {
      choice += this._.get(val, param);
      if (key !== this.dataField.dataSource.searchParams.length - 1) {
        choice += ' - ';
      }
    });
    return { value: val, text: choice };
  }

  public created() {
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

  public mounted() {
    if (['image'].includes(this.dataField.type) && this.model) {
      const url = `${config.api + this.value}`;
      this.$refs.dropzone.manuallyAddFile({}, url);
    }
  }
}
</script>
