export interface Curve {
  id: number;
  x: number[];
  y: number[];
  name: string;
  selected: boolean;
  opacity: number;
  x0?: number[];
  y0?: number[];
  oid: string;
  matDataLabel: string;
  label: string;
  markerId?: number;
}

export interface DataAnalytics {
  label: string;
  value: number;
  name: string;
  hide: boolean;
  range?: string[];
}

export interface Group {
  id: number;
  curves: Curve[];
  data: DataAnalytics[];
  label: string;
  result: boolean; // true if we have a result (averaging curve)
}

export interface Data {
  type: string;
  xtype: string;
  ytype: string;
  xunit: string;
  yunit: string;
  measurement: string;
  precision: number;
  groups: Group[];
  tree?: Tree;
  interpolation?: { x: number[]; y: number[] };
  selected?: string[]; // selected curves for interpolation
  sortedTable?: any[]; // property table order
}

// use to initialize ant Tree component
export interface CurveData {
  title: string; // curve name
  key: string; // group_id-curve_id
  icon: any;
}

export interface GroupData {
  title: string; // group name
  treeData: CurveData[];
  keys: string[];
  resultsView: number;
}

export interface Tree {
  groupData: GroupData[];
  selectedGroup: number;
}
