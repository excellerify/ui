<template lang="pug">
v-flex(xs12)
  div(v-if="readonly")
    v-text-field(
      :label="field.label"
      :value="model"
      readonly)

  div(v-else-if="field.disabled")
    v-text-field(
      :label="field.label"
      :value="model || \"AUTO\""
      disabled)

  div(v-else)
    //- if select2
    div(v-if="['select', 'select2'].includes(field.type)")
      v-select(
        v-if="!field.dataSource",
        v-validate="validationRules",
        v-model='model',
        v-bind='field',
        :name="name",
        :items='field.choices',
        :readonly="readonly")

      //- if autocomplete
      v-select(
        v-else-if="field.dataSource",
        v-validate="validationRules",
        v-model="model",
        v-bind="field",
        autocomplete
        browser-autocomplete="off"
        :loading="loading"
        :name="name",
        :search-input.sync='autoCompleteSync',
        :items='field.choices',
        :readonly="readonly")

    //- if radio
    v-layout(v-else-if="['radios', 'radio'].indexOf(field.type) > -1", row)
      div.input-group
        label {{$t(field.label)}}
        v-flex(xs12)
          v-radio-group(v-model="model", column, wrap, :readonly="readonly")
            v-radio(
              :name="name",
              v-for="option in field.choices",
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
              :name="name",
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
          v-validate="validationRules")
          template(slot-scope="{ save, cancel }")
            v-card-actions
              v-spacer
              v-btn(flat color="primary" @click="cancel") Cancel
              v-btn(flat color="primary" @click="save") OK

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
      v-else-if="['password'].indexOf(field.type) > -1"
      :name="name"
      v-model='model'
      v-bind="field"
      :readonly="readonly"
      :label="$t(field.label)"
      :placeholder="$t(field.placeholder)"
      v-validate="validationRules"
      :error="isError"
      :error-messages="errorMessage"
      :append-icon="passwordInvisible ? 'visibility' : 'visibility_off'"
      :append-icon-cb="() => (passwordInvisible = !passwordInvisible)"
      :type="passwordInvisible ? 'password' : 'text'")

    //- money input
    v-text-field(
      v-else-if="['money'].indexOf(field.type) > -1"
      :name="name"
      v-money="money"
      v-model='model'
      v-bind='field'
      :readonly="readonly"
      :label="$t(field.label)"
      :placeholder="$t(field.placeholder)"
      :type="field.type"
      v-validate="validationRules"
      :error="isError"
      :error-messages="errorMessage")

    //- default input
    v-text-field(
      v-else,
      :name="name"
      v-model.lazy='model'
      v-bind='field'
      :readonly="readonly"
      :label="$t(field.label)"
      :placeholder="$t(field.placeholder)"
      :type="field.type"
      :multiLine="field.type == 'textarea'"
      v-validate="validationRules"
      :error="isError"
      :error-messages="errorMessage")

</template>

<script>
import randomstring from "randomstring";
import moment from "moment";
import { VMoney } from "v-money";
import "vue2-dropzone/dist/vue2Dropzone.css";

import EventBus from "../eventBus.js";
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
      parentData: {},
      money: {
        decimal: ".",
        thousands: ",",
        precision: 2,
        masked: false /* doesn't work with directive */
      },
      loading: false,
      autoCompleteSync: null
    };
  },
  watch: {
    "errors.items": {
      handler(val) {
        this.isError = val.length > 0;
        this.errorMessage = this.isError ? val[0].msg : [];

        this.$emit("fieldError", {
          field: this.name,
          isError: this.isError,
          message: this.isError ? val[0].msg : []
        });
      },
      deep: true
    },
    autoCompleteSync: function(val) {
      val && this.onAutoCompleteSync(val);
    }
  },
  computed: {
    resource() {
      return this.$route.params.resource;
    },
    model: {
      get() {
        if (["date", "datetime"].indexOf(this.field.type) > -1) {
          return this.value
            ? moment(String(this.value)).format("YYYY-MM-DD")
            : null;
        }
        return this.value;
      },
      set(val) {
        if (["money"].indexOf(this.field.type) > -1) {
          val = Number(val.replace(/[^0-9\.-]+/g, ""));
        }

        return this.$emit("input", val);
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
    },
    onAutoCompleteSync: async function(val) {
      try {
        this.loading = true;

        const data = await this.$store.dispatch("fetchAutoComplete", {
          dataSource: this.field.dataSource,
          searchVal: val
        });

        if (data.length > 0) {
          this.field.choices = [];

          data.map(val => {
            let choice = "";

            this.field.dataSource.searchParams.map((param, key) => {
              choice += val[param];

              if (key != this.field.dataSource.searchParams.length - 1) {
                choice += " - ";
              }
            });

            this.field.choices.push(choice);
          });
        } else {
          this.field.choices = null;
        }

        this.loading = false;
      } catch (e) {
        this.loading = false;

        Promise.reject(e);
      }
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
  },

  directives: { money: VMoney }
};
</script>
