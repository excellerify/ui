export interface IGridItem {
  item: { id: string };
}

export enum ColumnTypes {
  String = 'string',
  Money = 'money',
  Image = 'image',
  Date = 'date',
  Time = 'time',
  Datetime = 'datetime',
}

export enum ColumnAlign {
  Left = 'left',
  Center = 'center',
  Right = 'right',
}

export interface IGridColumn {
  text?: string;
  type?: ColumnTypes;
  align?: ColumnAlign;
  searchAble?: boolean;
  value?: string;
  key?: string;
}

export interface IGridColumns {
  [name: string]: IGridColumn;
}

export interface ICustomGridAction {
  type: 'form' | 'grid' | 'action';
  icon: string;
  formUrl?: string;
  gridUrl?: string;
  action: string;
}

export interface IGridOptions {
  readonly create: boolean;
  readonly update: boolean;
  readonly delete: boolean;
  readonly view: boolean;
  readonly custom?: ICustomGridAction;
  readonly customs?: ICustomGridAction[];
}

export interface IFilterOptions {
  readonly model: object;
  readonly fields: object;
  readonly rules: object;
}

export interface IGridFilters {
  [name: string]: IFilterOptions;
}

export interface IGrid {
  options: IGridOptions;
  filters: IFilterOptions;
  columns: IGridColumn;
  foreignKey: { [key: string]: string };
}

export interface IGridSchemas {
  [name: string]: IGrid;
}

export interface IGridSchema {
  schema: IGrid;
}
