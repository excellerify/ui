<template lang="pug">
v-flex(xs12)
  //- if select2
  v-select(
    v-if="['select', 'select2'].includes(field.type)", 
    :items='field.choices', 
    v-model='model', 
    v-bind='field',
    :readonly="readonly"
  )

  //- if radio
  v-layout(v-else-if="['radios', 'radio'].indexOf(field.type) > -1", row)
    div.input-group
      label {{$t(field.label)}}
      v-flex(xs12)
        v-radio-group(v-model="model", column, wrap, :readonly="readonly")
          v-radio(
            v-for='option in field.choices',
            :key="option.value",
            :label="option.text",
            :value="option.value",
            :disabled="readonly")

  //- if checkboxes
  template(v-else-if="['checkboxes'].indexOf(field.type) > -1")
    v-layout(row, wrap, class="input-group")
      label {{$t(field.label)}}
      v-flex(v-bind="{[field.width]: true}", xs12)
        span(v-for='option in field.choices', :key="field.value")
          component(
            v-model='model',
            hide-details,
            :is="field.type == 'radios' || 'radio' ? 'v-radio' : 'v-checkbox'",
            :key='option.value',
            :value='option.value',
            :label='option.text',
            :disabled="readonly")

  //- if input type is date or time
  template(v-else-if="['date', 'datetime', 'time'].indexOf(field.type) > -1")
    v-menu
      v-text-field(slot='activator', v-model='model', :label="$t(field.label)")
      v-date-picker(v-model='model', no-title, scrollable, actions)

  //- if input type is html
  div(:class="inputGroupClass",v-else-if="field.type == 'html'")
    label {{$t(field.label)}}
    div.pt-2
      quill-editor(v-model='model', :options="editorOption")

  //- if input type is file
  //- TODO dropzone
  div(:class="inputGroupClass",v-else-if="['file', 'pdf', 'image', 'video'].includes(field.type)")
    label {{$t(field.label)}}
    div.pt-2
      dropzone(
        :options="getDropzoneOptions(field, model)"
        @vdropzone-sending="onUploading"
        @vdropzone-success="onUploadSuccess")
        input(type='hidden', v-model='model')

  //- if hidden
  input(v-else-if="field.type == 'hidden'", type='hidden', v-model='model')

  //- if email
  v-text-field(
    v-else-if="field.type == 'email'", 
    v-model='model', v-bind='field', 
    :readonly="readonly", 
    field="$t(field.label)", 
    :label="$t(field.label)", 
    :placeholder="$t(field.placeholder)", 
    :type="field.type", 
    v-validate="{'required': field.required, 'email': true}")

  //- if table
  template(v-else-if="['table', 'array'].indexOf(field.type) > -1")
    v-layout(row, wrap, class="input-group")
      div(v-if="!readonly")
        v-btn(@click.native="getSubTableForm()",primary,fab,small,dark,absolute,right,class="green")
          v-icon add

      label {{field.label}}
      v-data-table(v-bind:headers="field.headers", :items="model", hide-actions, class="elevation-1")
        template(slot="items", slot-scope="props")
          tr
            td(
              :class="'text-xs-' + (column.align !== undefined? column.align  : 'left')", 
              v-for='column in field.headers',
              v-html="getColumnData(props.item, column.field)")
    
    v-dialog(v-model="addSubdata", width="50%")
      v-card
        v-card-text
          v-form(v-model="tableForm.model", v-bind="tableForm", method="POST", :action="action")
            div(slot="buttons", class="my-4")
              v-btn(dark, class="grey", @click.native="addSubdata=false")
                v-icon(dark, left) chevron_left
                span {{$t('Cancel')}}
              v-btn(primary, dark, type='submit') {{$t('Save')}}
                v-icon(right, dark) save

  //- default input
  v-text-field(
    v-else,
    v-model='model',
    v-bind='field',
    :readonly="readonly",
    :label="$t(field.label)",
    :placeholder="$t(field.placeholder)",
    :type="field.type",
    :multiLine="field.type == 'textarea'",
    :v-validate="{required: field.required}")
</template>

<script>
import 'vue2-dropzone/dist/vue2Dropzone.css';
import randomstring from 'randomstring';
import config from '../config';

export default {
  props: {
    field: {
      type: Object,
      required: true
    },
    name: {
      type: String,
      required: false
    },
    value: {
      required: false
    },
    width: {
      type: Number,
      required: false
    },
    readonly: {
      type: Boolean
    }
  },
  data() {
    return {
      inputGroupClass: 'input-group input-group--dirty input-group--text-field',
      editorOption: {
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'], // toggled buttons
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['blockquote', 'code-block'],
            [{ header: 1 }, { header: 2 }], // custom button values
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ align: [] }]
          ]
        }
      },
      addSubdata: false,
      tableForm: {}
    };
  },
  computed: {
    resource() {
      return this.$route.params.resource;
    },
    model: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  },
  methods: {
    onUploading(file, xhr, formData) {
      const extension = file.name.split('.');
      file.upload.filename = `${randomstring.generate()}.${extension[extension.length - 1]}`;
    },
    onUploadSuccess(file, response) {
      const filename = response.result.files.file[0].name;
      this.$emit(
        'input',
        `${config.api}Files/${this.resource}/download/${filename}`
      );
    },
    getColumnData(row, field) {
      // process fields like `type.name`
      let [l1, l2] = field.split('.');
      if (l2) {
        return row[l1] ? row[l1][l2] : null;
      } else {
        return row[l1];
      }
    },
    getDropzoneOptions(field, model) {
      return {
        url: `${this.$store.state.config.ajaxUploadUrl}/${this.resource}/upload`,
        thumbnailWidth: 150,
        maxFilesize: 1024,
        withCredentials: true,
        acceptedFileTypes: field.acceptedFileTypes,
        id: 'dropzone_' + this.name,
        createThumbnailFromUrl: model
      };
    },
    getSubTableForm: async function(id) {
      try {
        if (['table', 'array'].indexOf(this.field.type) > -1) {
          const tableForm = await this.$http.get(`${this.field.model}/form`, {
            params: { id: this.id }
          });

          this.tableForm = tableForm.data.schema;
          this.addSubdata = true;
          return Promise.resolve(this.tableForm);
        }

        Promise.resolve();
      } catch (e) {
        Promise.reject(e);
      }
    }
  }
};
</script>
