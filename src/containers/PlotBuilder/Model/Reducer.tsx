import React from "react";
import { Data, Group, Curve, GroupData, CurveData } from "./data.model";
import ActionTypes from "./ActionTypes";
const clone = require("rfdc")();

import { LineOutlined } from "@ant-design/icons";
import { colors } from "../../../assets/colors";
/* TODO
- Strange to have JSX in model: <LineOutlined style={{fontSize...., this need to use tsx extension and not ts and to import React.
    This is a View and not a model concept
  
*/

const dataReducer = (currentData: Data, action: any) => {
  switch (action.type) {
    case "SET": {
      if (action.input === undefined) return currentData;
      const data: Data = {
        type: action.input.type,
        xtype: action.input.xtype,
        ytype: action.input.ytype,
        xunit: action.input.xunit,
        yunit: action.input.yunit,
        measurement: action.input.measurement,
        precision: action.input.precision ? action.input.precision : 4,
        groups: [],
        tree: { groupData: [], selectedGroup: 0 },
        interpolation: action.input.interpolation
          ? action.input.interpolation
          : { x: [], y: [] },
        selected: action.input.selected ? action.input.selected : [],
        sortedTable: action.input.sortedTable ? action.input.sortedTable : [],
      };
      const initState = action.input.tree === undefined ? true : false;
      action.input.groups.forEach((g, index_g) => {
        const group_c: Group = {
          id: index_g,
          curves: [],
          data: [],
          label: g.label,
          result: g.result === undefined ? false : g.result,
        };
        const group_d: GroupData = {
          title: g.label,
          treeData: [],
          keys: initState ? [] : [...action.input.tree.groupData[index_g].keys],
          resultsView: initState
            ? 0
            : action.input.tree.groupData[index_g].resultsView,
        };

        g.curves.forEach((c, index_c) => {
          if (c.name !== "average") {
            const curve_d: Curve = {
              id: index_c,
              x: [...c.x],
              y: [...c.y],
              name: index_c.toString(),
              label: c.matDataLabel ? c.matDataLabel : c.label,
              matDataLabel: c.matDataLabel,
              oid: c.oid,
              //selected: (initState?true:c.selected),
              selected: c.selected === undefined ? true : c.selected,
              //opacity: (initState?1:c.opacity),
              opacity: c.opacity === undefined ? 1 : c.opacity,
              markerId: c.markerId,
              x0: c.x0 === undefined ? [...c.x] : [...c.x0],
              y0: c.y0 === undefined ? [...c.y] : [...c.y0],
            };
            //  x0: (initState?[...c.x]:[...c.x0]),
            //  y0: (initState?[...c.y]:[...c.y0])};
            group_c.curves.push(curve_d);
            // insert in GroupData
            const curve_data: CurveData = {
              title: curve_d.label,
              key: "",
              icon: (
                <LineOutlined
                  style={{ fontSize: "24px", color: colors[index_c] }}
                  onChange={undefined}
                />
              ),
            };
            curve_data.key = index_g.toString() + "-" + index_c.toString();
            group_d.treeData.push(curve_data);
            if (initState) {
              group_d.keys.push(curve_data.key);
            }
          } else {
            const curve_d: Curve = {
              id: index_c,
              x: [...c.x],
              y: [...c.y],
              name: "average",
              label: c.matDataLabel ? c.matDataLabel : c.label,
              matDataLabel: c.matDataLabel,
              oid: c.oid,
              selected: true,
              opacity: 1,
            };
            group_c.curves.push(curve_d);
          }
        });
        if (g.data !== undefined && Object.keys(g.data).length !== 0) {
          const data_c = clone(g.data); // efficient deep copy
          group_c.data = data_c;
        } else {
          group_c.data.push({ label: "", value: 0, name: "", hide: true });
        }

        data.groups.push(group_c);
        data.tree.groupData.push(group_d);
      });
      return data;
    }
    case "CHECK_CURVES": {
      const newData = { ...currentData };
      // input: keys is the array of selected curves
      // output: modify current curves selected and opacity properties
      newData.groups[action.groupid].curves.forEach((item, i) => {
        if (item.name && item.name.indexOf("average") === -1) {
          item.selected = false;
          item.opacity = 0.2;
        }
      });
      action.keys.forEach((item, i) => {
        const index_curve = parseInt(item.split("-")[1]);
        newData.groups[action.groupid].curves[index_curve].selected = true;
        newData.groups[action.groupid].curves[index_curve].opacity = 1;
      });
      newData.tree.groupData[action.groupid].keys = action.keys;
      newData.tree.selectedGroup = action.groupid;
      return newData;
    }
    case "UPDATE_CURVES": {
      // input: curves
      // output: replace current curves by the input curves
      console.log("UPDATE_CURVES");
      //console.log(currentData);
      const group_new = [...currentData.groups];
      group_new[action.gid /*currentData.tree.selectedGroup*/].curves =
        action.curves;
      group_new[action.gid].data = action.data;
      group_new[action.gid].result = action.result;
      //console.log(group_new);
      return { ...currentData, groups: group_new };
    }
    case "UPDATE_ALL_CURVES": {
      let groups_new = [...currentData.groups];
      groups_new = action.groups;
      return { ...currentData, groups: groups_new };
    }
    case "RESET_CURVES": {
      const group_new = [...currentData.groups];
      group_new[action.input.groupId].curves = action.input.curves;
      return { ...currentData, groups: group_new };
    }
    case "RESET_CURVES_INIT": {
      console.log("RESET_CURVES_INIT");
      const group_new = [...currentData.groups];
      group_new[action.groupid].curves.map((val, index, arr) => {
        if (val.name !== "average") {
          arr[index].x = [...arr[index].x0];
          arr[index].y = [...arr[index].y0];
        }
      });
      // remove additional curve (average curve)
      const index_avg = group_new[action.groupid].curves.findIndex(
        (e) => e.name === "average"
      );
      if (index_avg !== -1)
        group_new[action.groupid].curves.splice(index_avg, 1);
      // remove all data (young, ...)
      group_new[action.groupid].data.length = 0;
      group_new[action.groupid].result = false;
      return { ...currentData, groups: group_new };
    }
    case "SET_MARKER": {
      const group_new = [...currentData.groups];
      group_new[currentData.tree.selectedGroup].curves.find(
        (c) => c.name === action.curve_name
      ).markerId = action.point_id;
      return { ...currentData, groups: group_new };
    }
    case "RESET_MARKERS": {
      const group_new = [...currentData.groups];
      group_new[action.group_id].curves.map((val, index, arr) => {
        if (val.markerId) val.markerId = undefined;
      });
      return { ...currentData, groups: group_new };
    }
    case "SET_VIEW": {
      const newData = { ...currentData };
      newData.tree.groupData[currentData.tree.selectedGroup].resultsView =
        action.val;
      return newData;
    }
    case "SET_MEASUREMENT": {
      const newData = { ...currentData };
      newData.measurement = action.val;
      if (action.val === "true") {
        newData.xtype = currentData.xtype.replace("_engineering", "");
        newData.ytype = currentData.ytype.replace("_engineering", "");
      }
      return newData;
    }
    case "SET_INTERPOLATION": {
      const newData = { ...currentData };
      newData.interpolation = action.interpolation;
      return newData;
    }
    case "SET_SELECTED": {
      const newData = { ...currentData };
      newData.selected = action.selected;
      return newData;
    }
    case "REMOVE_INTERPOLATION": {
      const newData = { ...currentData };
      newData.interpolation = { x: [], y: [] };
      return newData;
    }
    case "SET_SORTED_TABLE": {
      const newData = { ...currentData };
      newData.sortedTable = action.data;
      return newData;
    }
    default:
      throw new Error("Not be reach this case");
  }
};

export default dataReducer;
