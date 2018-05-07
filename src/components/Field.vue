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
      v-select(
        v-else-if="dataField.dataSource"
        autocomplete
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
      v-google-map(
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

    //- if checkboxes
    template(v-else-if="['checkboxes'].indexOf(dataField.type) > -1")
      v-layout(row, wrap, class="input-group")
        label {{$t(dataField.label)}}
        v-flex(v-bind="{[dataField.width]: true}", xs12)
          span(v-for='option in dataField.choices', :key="dataField.value")
            component(
              :name="name",
              v-model="model",
              hide-details,
              :is="dataField.type == 'radios' || 'radio' ? 'v-radio' : 'v-checkbox'",
              :key='option.value',
              :value='option.value',
              :label='option.text',
              :disabled="readonly",
              v-validate="validationRules")

    //- if input type is date or time
    template(v-else-if="['date', 'time', 'datetime'].indexOf(dataField.type) > -1")
      v-flex(xs12 class="input-group" style="padding: 0")
        label(v-if="!inline") {{$t(dataField.label)}}
        v-menu(
          v-if="['date', 'datetime'].indexOf(dataField.type) > -1"
          ref="menuDate"
          v-model="menuShowTogle.date"
          :return-value.sync="model"
          :close-on-content-click="false")
          v-text-field(
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

        v-menu(
          v-if="['time', 'datetime'].indexOf(dataField.type) > -1"
          ref="menuTime"
          v-model="menuShowTogle.time"
          :return-value.sync="model"
          :close-on-content-click="false")
          v-text-field(
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
      :readonly="readonly"
      :label="$t(dataField.label)"
      :placeholder="$t(dataField.placeholder)"
      v-validate="validationRules"
      :error="isError"
      :error-messages="errorMessage"
      :append-icon="passwordInvisible ? 'visibility' : 'visibility_off'"
      :append-icon-cb="() => (passwordInvisible = !passwordInvisible)"
      :type="passwordInvisible ? 'password' : 'text'")

    //- money input
    v-text-field(
      v-else-if="['money'].indexOf(dataField.type) > -1"
      v-money="money"
      v-model='model'
      v-bind='dataField'
      v-validate="validationRules"
      :name="name"
      :readonly="readonly"
      :label="$t(dataField.label)"
      :placeholder="$t(dataField.placeholder)"
      :type="dataField.type"
      :error="isError"
      :error-messages="errorMessage")

    //- default input
    v-text-field(
      v-else,
      :name="name"
      v-model.lazy='model'
      v-bind='dataField'
      :readonly="readonly"
      :label="$t(dataField.label)"
      :placeholder="$t(dataField.placeholder)"
      :type="dataField.type"
      :multiLine="dataField.type == 'textarea'"
      v-validate="validationRules"
      :error="isError"
      :error-messages="errorMessage")

</template>

<script>
import { VMoney } from "v-money";
import randomstring from "randomstring";
import moment, { now } from "moment";
import EventBus from "../eventBus.js";
import config from "../config";

import "vue2-dropzone/dist/vue2Dropzone.css";

export default {
  props: {
    resourceId: {
      type: String,
      default: "00000000-0000-0000-0000-000000000000"
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
    },
    inline: {
      type: Boolean,
      default: false
    },
    wizardIndex: {
      type: Number
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
      autoCompleteSync: null,
      menuShowTogle: {
        date: false,
        time: false
      },
      dataField: this.field
    };
  },
  watch: {
    "errors.items": {
      handler(val) {
        this.isError = val.length > 0;
        this.errorMessage = this.isError ? val[0].msg : [];

        this.emitError({
          isError: this.isError,
          msg: val.length > 0 ? val[0].msg : ""
        });
      },
      deep: true
    },
    autoCompleteSync(val) {
      if (val) {
        this.onAutoCompleteSync(val);
      } else if (this.model) {
        this.dataField.choices = [this.populateAutocompleteChoices(this.model)];
      }
    },
    value(val) {
      const isError = this.dataField.required && !val;
      this.emitError({ isError });

      if (
        ["select", "select2"].includes(this.dataField.type) &&
        this.dataField.dataSource &&
        this.model
      ) {
        this.dataField.choices = [this.populateAutocompleteChoices(this.model)];
      }
    }
  },
  computed: {
    resource() {
      return this.$route.params.resource;
    },
    model: {
      get() {
        const formatDate = date => {
          return date ? moment(String(date)).format("YYYY-MM-DD") : null;
        };

        const formatTime = date => {
          return date ? moment(String(date)).format("HH:mm") : null;
        };

        if (["date"].indexOf(this.dataField.type) > -1) {
          const date = formatDate(this.value);
          return { date };
        }
        if (["time"].indexOf(this.dataField.type) > -1) {
          const time = formatTime(this.value);
          return { time };
        } else if (["datetime"].indexOf(this.dataField.type) > -1) {
          const date = formatDate(this.value);
          const time = formatTime(this.value);

          return { date, time };
        }

        return this.value;
      },
      set(val) {
        if (["money"].indexOf(this.dataField.type) > -1) {
          val = Number(val.replace(/[^0-9\.-]+/g, ""));
        } else if (["datetime"].indexOf(this.dataField.type) > -1) {
          const { date, time } = val;
          const dateTime = moment(
            `${date || "0000-00-00"} ${time || "00:00"}`,
            "YYYY-MM-DD HH:mm"
          );

          return this.$emit("input", dateTime.toDate());
        } else if (["time"].indexOf(this.dataField.type) > -1) {
          return this.$emit("input", val.time);
        } else if (["date"].indexOf(this.dataField.type) > -1) {
          return this.$emit("input", val.date);
        }

        return this.$emit("input", val);
      }
    },
    validationRules() {
      const rules = {
        required: !!this.dataField.required,
        email: this.dataField.type
          ? this.dataField.type.toLowerCase() === "email"
          : false
      };

      return rules;
    }
  },
  methods: {
    emitError({ isError, msg } = {}) {
      this.$emit("fieldError", {
        field: this.name,
        wizardIndex: this.wizardIndex,
        isError,
        message: isError
          ? msg || `The ${this.dataField.label} field is required.`
          : []
      });
    },
    onUploading(file, xhr, formData) {
      const extension = file.name.split(".");

      formData.append("id", this.resourceId);

      file.upload.filename = `${randomstring.generate()}.${
        extension[extension.length - 1]
      }`;
    },
    onUploadSuccess(file, response) {
      if (response.url) {
        const filename = response.url;
        this.model = `${response.url}`;
        return;
      }

      const filename = response.url || response.result.files.file[0].name;
      this.model = `${config.api}Files/${this.resource}/download/${filename}`;
    },
    getDropzoneOptions(field, model) {
      const uploadUrl = this.dataField.uploadUrl
        ? `${this.$store.state.config.api}${this.dataField.uploadUrl}`
        : `${this.$store.state.config.ajaxUploadUrl}/${this.resource}/upload`;

      return {
        url: `${uploadUrl}`,
        thumbnailWidth: 150,
        maxFilesize: 1024,
        acceptedFileTypes: field.acceptedFileTypes,
        id: "dropzone_" + this.name,
        createThumbnailFromUrl: model,
        uploadMultiple: false,
        maxFiles: 1,
        init: function() {
          this.on("addedfile", function(file) {
            if (this.files.length > 1) {
              this.removeFile(this.files[0]);
            }
          });
        }
      };
    },
    onGridCreate() {
      this.prepareGridSubFormData();
    },
    onGridUpdate({ item }) {
      this.currentItem = item;
      this.prepareGridSubFormData();
    },
    prepareGridSubFormData() {
      this.parentData[this.resource] = {
        id: this.resourceId
      };

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
          dataSource: this.dataField.dataSource,
          searchVal: val
        });

        if (data.length > 0) {
          this.dataField.choices = data.map(val =>
            this.populateAutocompleteChoices(val)
          );
        } else if (this.model) {
          this.dataField.choices = [
            this.populateAutocompleteChoices(this.model)
          ];
        } else {
          this.dataField.choices = null;
        }

        this.loading = false;
      } catch (e) {
        this.loading = false;
        throw e;
      }
    },
    populateAutocompleteChoices: function(val) {
      let choice = "";

      this.dataField.dataSource.searchParams.map((param, key) => {
        choice += val[param];

        if (key != this.dataField.dataSource.searchParams.length - 1) {
          choice += " - ";
        }
      });

      return { value: val, text: choice };
    }
  },
  created() {
    if (
      this.dataField.required &&
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
        "hidden",
        "money",
        "map"
      ].includes(this.dataField.type)
    ) {
      this.emitError({ isError: true });
    }

    if (["select", "select2"].includes(this.dataField.type) && this.model) {
      this.dataField.choices = this.dataField.choices || [
        this.populateAutocompleteChoices(this.model)
      ];
    }
  },
  mounted() {
    if (["image"].includes(this.dataField.type) && this.model) {
      var url = `${global.config.api + this.value}`;
      this.$refs.dropzone.manuallyAddFile({}, url);
    }
  },

  directives: { money: VMoney }
};
</script>
