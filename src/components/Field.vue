<template lang="pug">
v-flex(xs12)
  v-select(v-if="['select', 'select2'].includes(field.type)", :items='field.choices', v-model='model', v-bind='field')
  template(v-else-if="['radios', 'checkboxes'].indexOf(field.type) > -1")
    v-layout(row, wrap)
      v-flex(v-bind="{[field.width]: true}",xs12, v-for='option in field.choices',:key="field.value")
        component(
          v-model='model',
          hide-details,
          :is="field.type == 'radios' ? 'v-radio' : 'v-checkbox'",
          :key='option.value',
          :value='option.value',
          :label='option.text',
        )
      p {{$t(field.label)}}
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
      dropzone(:acceptedFileTypes="field.acceptedFileTypes",
        :withCredentials="true",
        :id="'dropzone_' + name",
        :url="$store.state.config.ajaxUploadUrl + '/' + resource + '/upload'",
        :createThumbnailFromUrl="model"
        @vdropzone-sending="onUploading"
        @vdropzone-success="onUploadSuccess")
        input(type='hidden', v-model='model')

  //- if hidden
  input(v-else-if="field.type == 'hidden'", type='hidden', v-model='model')

  //- if email
  v-text-field(v-else-if="field.type == 'email'", v-model='model', v-bind='field', field="$t(field.label)", :label="$t(field.label)", :placeholder="$t(field.placeholder)", :type="field.type", v-validate="{'required': field.required, 'email': true}")

  //- if table
  template(v-else-if="['table', 'array'].indexOf(field.type) > -1")
    label {{field.label}}
    v-data-table(v-bind:headers="field.headers", :items="model", hide-actions, class="elevation-1")
      template(slot="items", scope="props")
        tr
          td(:class="'text-xs-' + (column.align !== undefined? column.align  : 'left')", v-for='column in field.headers', v-html="getColumnData(props.item, column.field)")

  //- default input
  v-text-field(v-else, v-model='model', v-bind='field', :label="$t(field.label)", :placeholder="$t(field.placeholder)", :type="field.type", :multiLine="field.type == 'textarea'", :v-validate="{required: field.required}")
</template>

<script>
import randomstring from 'randomstring'
import config from '../config'

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
    }
  },
  data() {
    return {
      inputGroupClass: 'input-group input-group--dirty input-group--text-field',
      editorOption: {
        modules: {
          toolbar:
          [['bold', 'italic', 'underline', 'strike'],        // toggled buttons
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['blockquote', 'code-block'],
          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{'list': 'ordered'}, { 'list': 'bullet' }],
          [{'indent': '-1'}, { 'indent': '+1' }],
          [{ 'align': [] }]]
        }
      }
    }
  },
  computed: {
    resource() {
      return this.$route.params.resource
    },
    model: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    onUploading(file, xhr, formData) {
      const extension = file.name.split('.')
      file.upload.filename = `${randomstring.generate()}.${extension[extension.length - 1]}`
    },
    onUploadSuccess(file, response) {
      const filename = response.result.files.file[0].name
      this.$emit('input', `${config.api}Files/${this.resource}/download/${filename}`)
    },
    getColumnData(row, field) {
      // process fields like `type.name`
      let [l1, l2] = field.split('.')
      if (l2) {
        return row[l1] ? row[l1][l2] : null
      } else {
        return row[l1]
      }
    }
  }
}
</script>
