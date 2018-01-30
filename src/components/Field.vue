<template lang="pug">
v-flex(xs12)
  //- if select2
  v-select(
    v-if="['select', 'select2'].includes(field.type)",
    :name='name',
    :items='field.choices',
    v-model='model',
    v-bind='field',
    :readonly="readonly",
    v-validate="validationRules")

  //- if radio
  v-layout(v-else-if="['radios', 'radio'].indexOf(field.type) > -1", row)
    div.input-group
      label {{$t(field.label)}}
      v-flex(xs12)
        v-radio-group(v-model="model", column, wrap, :readonly="readonly")
          v-radio(
            :name='name',
            v-for='option in field.choices',
            :key="option.value",
            :label="option.text",
            :value="option.value",
            :disabled="readonly",
            v-validate="validationRules")

  //- if checkboxes
  template(v-else-if="['checkboxes'].indexOf(field.type) > -1")
    v-layout(row, wrap, class="input-group")
      label {{$t(field.label)}}
      v-flex(v-bind="{[field.width]: true}", xs12)
        span(v-for='option in field.choices', :key="field.value")
          component(
            :name='name',
            v-model='model',
            hide-details,
            :is="field.type == 'radios' || 'radio' ? 'v-radio' : 'v-checkbox'",
            :key='option.value',
            :value='option.value',
            :label='option.text',
            :disabled="readonly",
            v-validate="validationRules")

  //- if input type is date or time
  template(v-else-if="['date', 'datetime', 'time'].indexOf(field.type) > -1")
    v-menu
      v-text-field(slot='activator', v-model='model', :label="$t(field.label)")
      v-date-picker(
        v-model='model',
        no-title,
        scrollable,
        actions,
        v-validate="validationRules")

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
        :id="getDropzoneOptions(field, model).id"
        :options="getDropzoneOptions(field, model)"
        @vdropzone-sending="onUploading"
        @vdropzone-success="onUploadSuccess")
        input(type='hidden', v-model='model',
        v-validate="validationRules")

  //- if hidden
  input(v-else-if="field.type == 'hidden'", type='hidden', v-model='model')

  //- if table
  template(v-else-if="['table'].indexOf(field.type) > -1")
    v-layout(row, wrap, class="input-group")
      label {{field.label}}
      v-grid(
        :resource="field.model || name",
        :filterByFk="{ model: resource, value : resourceId }",
        :showSearch="false",
        :readonly="readonly",
        type="field",
        :onCreate="onGridCreate",
        :onUpdate="onGridUpdate")

      v-dialog(v-model="isShowDialogForm", max-width="60%")
        v-card(v-if="isShowDialogForm")
          v-toolbar(style="flex: 0 0 auto;", dark, class="primary")
            v-btn(icon, @click.native="isShowDialogForm = false", dark)
              v-icon close
            v-toolbar-title {{$t(currentItem? 'Edit':'Add')}}
          v-spacer
          v-card-text
            v-form(
              v-bind="$data",
              :ParentData="parentData",
              type="subForm",
              :id="currentItem ? currentItem.id.id : null",
              :resource="field.model || name",
              @success="modalSubFormClose")

  //- password input
  v-text-field(
    v-else-if="['password'].indexOf(field.type) > -1",
    :name='name',
    v-model='model',
    v-bind='field',
    :readonly="readonly",
    :label="$t(field.label)",
    :placeholder="$t(field.placeholder)",
    v-validate="validationRules",
    :error="isError",
    :error-messages="errorMessage",
    :append-icon="passwordInvisible ? 'visibility' : 'visibility_off'",
    :append-icon-cb="() => (passwordInvisible = !passwordInvisible)",
    :type="passwordInvisible ? 'password' : 'text'")

  //- //- money input
  //- masked-input(
  //-   v-else-if="['money'].indexOf(field.type) > -1",
  //-   type="text",
  //-   :name='name',
  //-   class="form-control",
  //-   v-model="model",
  //-   v-bind='field',
  //-   :readonly="readonly",
  //-   :error-messages="errorMessage",
  //-   :mask="['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]",
    :guide="false")

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
    v-validate="validationRules"
    :error="isError",
    :error-messages="errorMessage")

</template>

<script>
import randomstring from "randomstring";
import MaskedInput from "vue-text-mask";
import moment from "moment";
import "vue2-dropzone/dist/vue2Dropzone.css";

import { EventBus } from "../eventBus.js";
import config from "../config";

export default {
  props: {
    resourceId: {
      type: String,
      default: "new"
    },
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
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      inputGroupClass: "input-group input-group--dirty input-group--text-field",
      editorOption: {
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"], // toggled buttons
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ["blockquote", "code-block"],
            [{ header: 1 }, { header: 2 }], // custom button values
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ align: [] }]
          ]
        }
      },
      passwordInvisible: true,
      addSubdata: false,
      tableForm: {},
      isError: false,
      errorMessage: [],
      isShowDialogForm: false,
      currentItem: null,
      parentData: {}
    };
  },
  components: {
    MaskedInput
  },
  watch: {
    "errors.items"(val) {
      this.isError = val.length > 0;
      this.errorMessage = this.isError ? val[0].msg : [];

      this.$emit("fieldError", {
        field: this.name,
        isError: this.isError,
        message: this.isError ? val[0].msg : []
      });
    }
  },
  computed: {
    resource() {
      return this.$route.params.resource;
    },
    model: {
      get() {
        if (["date"].indexOf(this.field.type) > -1) {
          return  moment(String(this.value || new Date())).format('YYYY-MM-DD');
        }
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    },
    validationRules() {
      const rules = {
        required: !!this.field.required,
        email: this.field.type
          ? this.field.type.toLowerCase() === "email"
          : false
      };

      return rules;
    }
  },
  methods: {
    onUploading(file, xhr, formData) {
      const extension = file.name.split(".");
      file.upload.filename = `${randomstring.generate()}.${
        extension[extension.length - 1]
      }`;
    },
    onUploadSuccess(file, response) {
      const filename = response.result.files.file[0].name;
      this.$emit(
        "input",
        `${config.api}Files/${this.resource}/download/${filename}`
      );
    },
    getColumnData(row, field) {
      // process fields like `type.name`
      let [l1, l2] = field.split(".");
      if (l2) {
        return row[l1] ? row[l1][l2] : null;
      } else {
        return row[l1];
      }
    },
    getDropzoneOptions(field, model) {
      return {
        url: `${this.$store.state.config.ajaxUploadUrl}/${
          this.resource
        }/upload`,
        thumbnailWidth: 150,
        maxFilesize: 1024,
        withCredentials: true,
        acceptedFileTypes: field.acceptedFileTypes,
        id: "dropzone_" + this.name,
        createThumbnailFromUrl: model
      };
    },
    onGridCreate: function() {
      this.$emit("onUpsert", { subForm: true, cb: this.onGridUpsertCb });
    },
    onGridUpdate: function({ item }) {
      this.$emit("onUpsert", { subForm: true, cb: this.onGridUpsertCb });
      this.currentItem = item;
    },
    onGridUpsertCb: function(parentData) {
      this.parentData = {};
      this.parentData[this.resource] = parentData;
      this.isShowDialogForm = true;
    },
    modalSubFormClose() {
      this.isShowDialogForm = false;
      this.$emit("refresh");
      EventBus.$emit("gridRefresh");
    }
  },
  created: function() {
    if (
      this.field.required &&
      !this.value &&
      ![
        "file",
        "pdf",
        "image",
        "video",
        "table",
        "array",
        "date",
        "datetime",
        "time",
        "hidden"
      ].includes(this.field.type)
    ) {
      this.$emit("fieldError", {
        field: this.name,
        isError: true,
        message: `The ${this.field.label} field is required.`
      });
    }
  }
};
</script>
