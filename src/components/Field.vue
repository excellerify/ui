<template lang="pug">
v-flex(xs12)
  //- if select2
  v-select(
    v-if="['select', 'select2'].includes(field.type)",
    :name='name',
    :data-vv-as='field.label',
    :items='field.choices',
    v-model='model',
    v-bind='field',
    :readonly="readonly",
    v-validate="{'required': field.required}")

  //- if radio
  v-layout(v-else-if="['radios', 'radio'].indexOf(field.type) > -1", row)
    div.input-group
      label {{$t(field.label)}}
      v-flex(xs12)
        v-radio-group(v-model="model", column, wrap, :readonly="readonly")
          v-radio(
            :name='name',
            :data-vv-as='field.label',
            v-for='option in field.choices',
            :key="option.value",
            :label="option.text",
            :value="option.value",
            :disabled="readonly",
            v-validate="{'required': field.required}")

  //- if checkboxes
  template(v-else-if="['checkboxes'].indexOf(field.type) > -1")
    v-layout(row, wrap, class="input-group")
      label {{$t(field.label)}}
      v-flex(v-bind="{[field.width]: true}", xs12)
        span(v-for='option in field.choices', :key="field.value")
          component(
            :name='name',
            :data-vv-as='field.label',
            v-model='model',
            hide-details,
            :is="field.type == 'radios' || 'radio' ? 'v-radio' : 'v-checkbox'",
            :key='option.value',
            :value='option.value',
            :label='option.text',
            :disabled="readonly",
            v-validate="{'required': field.required}")

  //- if input type is date or time
  template(v-else-if="['date', 'datetime', 'time'].indexOf(field.type) > -1")
    v-menu
      v-text-field(slot='activator', v-model='model', :label="$t(field.label)")
      v-date-picker(
        v-model='model',
        no-title,
        scrollable,
        actions,
        v-validate="{'required': field.required}")

  //- if input type is html
  div(:class="inputGroupClass",v-else-if="field.type == 'html'")
    label {{$t(field.label)}}
    div.pt-2
      quill-editor(v-model='model', :options="editorOption")

  //- if input type is file
  //- TODO dropzone
  div(:class="inputGroupClass", v-else-if="['file', 'pdf', 'image', 'video'].includes(field.type)")
    label {{$t(field.label)}}
    div.pt-2
      dropzone(
        :id="field.name"
        :options="getDropzoneOptions(field, model)"
        @vdropzone-sending="onUploading"
        @vdropzone-success="onUploadSuccess")
        input(type='hidden', v-model='model',
        v-validate="{'required': field.required}")

  //- if hidden
  input(v-else-if="field.type == 'hidden'", type='hidden', v-model='model')

  //- if email
  v-text-field(
    v-else-if="field.type == 'email'",
    :name='name'
    :data-vv-as='field.label'
    v-model='model',
    v-bind='field',
    :readonly="readonly",
    field="$t(field.label)",
    :label="$t(field.label)",
    :placeholder="$t(field.placeholder)",
    :type="field.type",
    v-validate="{'required': field.required, 'email': true}",
    :error="isError",
    :error-messages="errorMessage")

  //- if table
  template(v-else-if="['table', 'array'].indexOf(field.type) > -1")
    v-layout(row, wrap, class="input-group")
      label {{field.label}}
      v-grid(
        :resource="field.model",
        :showSearch="false",
        :readonly="readonly",
        type="field",
        @onUpsert="$emit('onUpsert', {subForm: true})")

  //- password input
  v-text-field(
    v-else-if="['password'].indexOf(field.type) > -1",
    :name='name'
    :data-vv-as='field.label'
    v-model='model',
    v-bind='field',
    :readonly="readonly",
    :label="$t(field.label)",
    :placeholder="$t(field.placeholder)",
    :multiLine="field.type == 'textarea'",
    v-validate="{required: field.required}"
    :error="isError",
    :error-messages="errorMessage"
    :append-icon="passwordInvisible ? 'visibility' : 'visibility_off'"
    :append-icon-cb="() => (passwordInvisible = !passwordInvisible)"
    :type="passwordInvisible ? 'password' : 'text'")

  //- default input
  v-text-field(
    v-else,
    :name='name'
    :data-vv-as='field.label'
    v-model='model',
    v-bind='field',
    :readonly="readonly",
    :label="$t(field.label)",
    :placeholder="$t(field.placeholder)",
    :type="field.type",
    :multiLine="field.type == 'textarea'",
    v-validate="{required: field.required}"
    :error="isError",
    :error-messages="errorMessage")

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
      passwordInvisible: true,
      addSubdata: false,
      tableForm: {},
      isError: false,
      errorMessage: []
    };
  },
  watch: {
    'errors.items'(val) {
      this.isError = val.length > 0;
      this.errorMessage = this.isError ? val[0].msg : [];
      this.$emit('fieldError', {
        field: this.name,
        isError: this.isError,
        message: this.isError ? val[0].msg : null
      });
    }
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
    },
    validationRules: function () {
      const rules = {
        required: this.field.required,
        email: this.field.type.toLowerCase() === 'email'
      };

      return rules;
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
  },
  created: function () {
    if (this.field.required &&
      !this.value &&
      !['file', 'pdf', 'image', 'video', 'table', 'array'].includes(this.field.type)) {
      this.$emit('fieldError', {
        field: this.name,
        isError: true,
        message: `The ${this.field.label} is required`
      });
    }
  }
};
</script>
