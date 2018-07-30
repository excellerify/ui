import { config } from '@/config';
import EventBus from '@/eventBus';
import moment from 'moment';
import randomstring from 'randomstring';
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop, Watch } from 'vue-property-decorator';

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
  public field!: string;

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

  // data() {
  //   return {
  public inputGroupClass: string =
    'input-group input-group--dirty input-group--text-field';
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

  // },
  // watch: {
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
  public onValue(val) {
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

    this.value = val;

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

  public getDropzoneOptions(field, model) {
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
      init() {
        this.on('addedfile', function(file) {
          if (this.files.length > 1) {
            this.removeFile(this.files[0]);
          }
        });
      },
    };
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
