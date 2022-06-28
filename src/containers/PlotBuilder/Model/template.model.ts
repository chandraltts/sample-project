export type Selection = {
  label: string;
  name: string;
  link?: string[];
  tip?: string;
};

export type Range = {
  min: number;
  max: number;
};

export type Parameter = {
  label: string;
  name: string;
  tip?: string;
  selection?: Selection[];
  range?: Range;
  value: any; // number or number[]
  curveId?: { groupId: number; curveName: string }[];
  float?: boolean;
  conditional?: string;
};

export type Method = {
  label: string;
  type: string;
  params: Parameter[];
};

export type Operation = {
  action: string;
  action_label: string;
  methods: Method[];
  selected_method: string;
  status: string;
  error: string;
};

export type Operations = {
  gid: number;
  operations: Operation[];
};

