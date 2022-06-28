import { Data } from "./data.model";

const setModel = (model: Data) => ({
  type: "SET",
  input: model,
});

const setMarker = (curve_name, pt_index) => ({
  type: "SET_MARKER",
  curve_name: curve_name,
  point_id: pt_index,
});

const setView = (val) => ({
  type: "SET_VIEW",
  val: val,
});

const resetMarkers = (group_id) => ({
  type: "RESET_MARKERS",
  group_id: group_id,
});

const checkCurves = (keys, group_id) => ({
  type: "CHECK_CURVES",
  keys: keys,
  groupid: group_id,
});

const setMeasurement = (val) => ({
  type: "SET_MEASUREMENT",
  val: val,
});

const updateCurves = (gid, newCurves, data_analytics, result_flag) => ({
  type: "UPDATE_CURVES",
  gid: gid,
  curves: newCurves,
  data: data_analytics,
  result: result_flag,
});

const resetCurves = (group_id) => ({
  type: "RESET_CURVES_INIT",
  groupid: group_id,
});

const setInterpolation = (val: { x: number[]; y: number[] }) => ({
  type: "SET_INTERPOLATION",
  interpolation: val,
});

const setSelected = (val: string[]) => ({
  type: "SET_SELECTED",
  selected: val,
});

const removeInterpolation = () => ({ type: "REMOVE_INTERPOLATION" });

const setSortedTable = (data: any[]) => ({
  type: "SET_SORTED_TABLE",
  data: data,
});
const Actions = {
  setModel,
  setMarker,
  setView,
  resetMarkers,
  checkCurves,
  setMeasurement,
  updateCurves,
  resetCurves,
  setInterpolation,
  removeInterpolation,
  setSelected,
  setSortedTable,
};

export default Actions;