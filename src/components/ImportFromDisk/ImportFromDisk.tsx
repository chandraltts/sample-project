import React, { useState, useReducer } from "react";
import { Layout, Button, Col, Row } from "antd";
import PlotBuilder from "../../containers/PlotBuilder/PlotBuilder";
import FileLoader from "../FileLoader/FileLoader.js";
import initialData from "../../containers/PlotBuilder/Model/InitialData";
import dataReducer from "../../containers/PlotBuilder/Model/Reducer";
import actions from "../../containers/PlotBuilder/Model/Actions";
import {
  Data,
  Curve,
  Group,
} from "../../containers/PlotBuilder/Model/data.model";
import tensile_template from "../../data/template_tensile.json";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

const ImportFromDisk: React.FC = () => {

  const { Header, Footer, Sider, Content } = Layout;

  const [data, dispatch] = useReducer(dataReducer, initialData);
  const [template, setTemplate] = useState(tensile_template);
  const [show, setShow] = useState(true);

  const handleOnFileLoad = (result) => {
    console.log("----CSV handler ----");
    const format_3headers = result[0].data[0] === "3headers" ? true : false;
    let header_line0, header_line1, header_line2;
    let keys;
    let index_strat = 0;
    let number_col = result[0].data.length;
    let number_row = result.length;
    let nbr_groups = 1;
    if (format_3headers) {
      header_line0 = result[1].data;
      header_line1 = result[2].data;
      header_line2 = result[3].data;
      index_strat = 4;
      number_col = result[index_strat].data.length;
      number_row -= 4;
      keys = new Set(header_line0);
      nbr_groups: keys.length;
    }
    const nbr_curves = Math.floor(number_col / 2);
    let grs = new Array<Group>();
    let curves_ = new Array<Curve>();
    let strain_unit: string;
    let stress_unit: string;

    for (let i = 0; i < number_col / 2; i++) {
      let xs = new Array(number_row);
      let ys = new Array(number_row);
      for (let j = index_strat; j < index_strat + number_row; j++) {
        xs[j - index_strat] = result[j].data[2 * i];
        ys[j - index_strat] = result[j].data[2 * i + 1];
      }

      const key = header_line0[2 * i];
      const name_x = header_line1[2 * i];
      const name_y = header_line1[2 * i + 1];
      let unit_x = header_line2[2 * i];
      const unit_y = header_line2[2 * i + 1];
      let strain_scale = 1;
      if (unit_x === "MICRO") {
        strain_scale = 1.0e-6;
        unit_x = "NO";
      }

      strain_unit = unit_x;
      stress_unit = unit_y;

      let xs_: number[] = [];
      let ys_: number[] = [];
      for (let i = 0; i < xs.length; i++) {
        if (xs[i] !== undefined && xs[i].length > 0) {
          xs_.push(parseFloat(xs[i]) * strain_scale);
          ys_.push(parseFloat(ys[i]));
        }
      }

      const curve_id = i + 1;
      const curve: Curve = {
        id: i + 1,
        oid: (i + 1).toString(),
        name: i.toString(),
        matDataLabel: i.toString(),
        selected: true,
        opacity: 1,
        x: xs_,
        y: ys_,
        label: "curve_" + key + "_" + curve_id,
      };
      curves_.push(curve);
      if (i === nbr_curves - 1 || key !== header_line0[2 * (i + 1)]) {
        let gr = {
          id: i,
          data: [],
          result: false,
          label: key,
          curves: [...curves_],
        };
        grs.push(gr);
        curves_.length = 0;
      }
    }

    // create Data
    let data_2 = {
      type: "tensile",
      xtype: "strain_engineering",
      ytype: "stress_engineering",
      xunit: strain_unit,
      yunit: stress_unit,
      measurement: "engineering",
      precision: 3,
      // groups: [{
      //     id: 1,
      //     data: [],
      //     result: false,
      //     label: "toto",
      //     curves: [
      //         // {
      //         // id: 1,
      //         // label: "titi",
      //         // name: "toto",
      //         // selected: true,
      //         // opacity: 1,
      //         // x: [0,1,.2],
      //         // y: [0,10,20],
      //         // oid: "c1",
      //         // matDataLabel: "toto",
      //         // markerId: 1
      //         // }
      //     ]
      // }]
    };

    const data_3: Data = { ...data_2, groups: grs };
    dispatch(actions.setModel(data_3));
    setShow((prev) => !prev);
  };

  const saveResults = (res: any) => {
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const fileExtension = ".xlsx";
    // create workbook
    const wb = XLSX.utils.book_new();

    let ws_mod = [];
    res.data.groups.map((g, i) => {
      if (i === 0) {
        let header = [""];
        for (let i = 0; i < g.data.length; i++) {
          header.push(g.data[i].label);
        }
        ws_mod.push(header);
      }
      let line = [g.label];
      for (let i = 0; i < g.data.length; i++) {
        line.push(+g.data[i].value);
      }
      ws_mod.push(line);
    });
    const ws = XLSX.utils.aoa_to_sheet(ws_mod);
    XLSX.utils.book_append_sheet(wb, ws, "Property");

    let x_label = res.data.xtype + " [" + res.data.xunit + "]";
    let y_label = res.data.ytype + " [" + res.data.yunit + "]";

    res.data.groups.map((g) => {
      let ws_data = [[x_label, y_label]];
      const avg_cur_index = g.curves.findIndex((c) => c.name === "average");
      const withAvgResult = avg_cur_index === -1 ? false : true;
      if (withAvgResult) {
        const x = g.curves[avg_cur_index].x;
        const y = g.curves[avg_cur_index].y;
        for (let i = 0; i < x.length; i++) {
          ws_data.push([x[i], y[i]]);
        }
      }
      const label = g.label;
      // create worksheet
      const ws = XLSX.utils.aoa_to_sheet(ws_data);
      XLSX.utils.book_append_sheet(wb, ws, label);
    });

    // const ws_data = [
    //     ["x","y"],
    //     [1, 2],
    //     [10,20]
    // ];

    // create file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, "DataReduction_Result" + fileExtension);
  };

  //---------RENDER-----------------------------------------
  return (
    <Layout style={{ height: "100vh" }}>
      <Content>
        <Row>
          <Col span={6}>
            {show && <FileLoader handleOnFileLoad={handleOnFileLoad} />}
          </Col>
        </Row>

        <hr style={{ width: "100%" }} />

        <PlotBuilder
          data_input={data}
          template_input={template}
          parentCallback={saveResults}
        />
      </Content>
    </Layout>
  );
};

export default ImportFromDisk;

