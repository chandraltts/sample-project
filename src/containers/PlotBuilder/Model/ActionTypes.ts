import { Group, Curve } from "./data.model";
// Action is a Union Type
type Action =
  | { type: "CHECK_CURVES"; keys: string[]; groupid: number }
  | { type: "SET"; input: any }
  | {
      type: "UPDATE_CURVES";
      gid: number;
      curves: Curve[];
      data: any[];
      result: boolean;
    }
  | { type: "UPDATE_ALL_CURVES"; groups: Group[] }
  | { type: "RESET_CURVES"; input: any }
  | { type: "RESET_CURVES_INIT"; groupid: number }
  | { type: "SET_MARKER"; curve_name: string; point_id: number }
  | { type: "RESET_MARKERS"; group_id: number }
  | { type: "SET_VIEW"; val: number }
  | { type: "SET_MEASUREMENT"; val: string }
  | { type: "GET_MEASUREMENT" }
  | { type: "SET_INTERPOLATION"; interpolation: { x: number[]; y: number[] } }
  | { type: "SET_SELECTED"; value: string[] }
  | { type: "REMOVE_INTERPOLATION" }
  | { type: "SET_SORTED_TABLE" };

export default Action;