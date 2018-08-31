export enum FieldTypes {
  Text = 'text',
  Textarea = 'textarea',
  Select = 'select',
  Email = 'email',
  Password = 'password',
  Date = 'date',
  Time = 'time',
  Datetime = 'datetime',
  Money = 'money',
  Table = 'table',
  Map = 'map',
  Number = 'number',
  Automatic = 'automatic',
  Image = 'image',
  File = 'file',
  Checkbox = 'checkbox',
}

export enum FieldModes {
  Create = 'isCreate',
  Edit = 'isEdit',
  View = 'isView',
}

export enum FormTypes {
  Simple = 'simple',
  Wizard = 'wizard',
}

export interface IForm {
  inline: boolean;
  model: object;
  fields: {
    [name: string]:
      | IFormField
      | IFormFieldUpload
      | IFormFieldAutocomplete
      | IFormFieldCheckbox
      | IFormFieldTable
      | IFormFieldFk;
  };
  type?: FormTypes;
}

export interface IOptionalsOn {
  property: string;
  value: string | object;
}

export interface IFormField {
  label: string;
  type?: FieldTypes;
  required?: boolean;
  mode?: FieldModes;
  readonly?: boolean;
  disabled?: boolean;
  optionalsOn?: IOptionalsOn[];
  group?: string;
  wizardStepTitle?: string;
}

export interface IFormFieldUpload extends IFormField {
  type: FieldTypes.Image | FieldTypes.File;
  uploadUrl: string;
}

export interface IFormFieldAutocomplete extends IFormField {
  type: FieldTypes.Select;
  // TODO: split interface into autocomplete and select
  // autocomplete > has dataSource
  // select > has choices
  dataSource?: IFormDataSource;
  choices?: string[] | object[];
}

export interface IFormFieldCheckbox extends IFormField {
  type: FieldTypes.Checkbox;
  // TODO: split interface into autocomplete and select
  // autocomplete > has dataSource
  // select > has choices
  choices: string[] | object[];
}

export interface IFormFieldTable extends IFormField {
  type: FieldTypes.Table;
  fk: { [key: string]: string };
  model: string;
}

export interface IFormFieldFk extends IFormField {
  fk: { [key: string]: string };
  model: string;
}

export interface IFormDataSource {
  url: string;
  searchParams: string[];
}

export interface IFormSchema {
  schema: IForm;
}
