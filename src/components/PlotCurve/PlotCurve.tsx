import React, { useState, useEffect } from "react";
import PlotlyChart from "react-plotlyjs-ts";
import Plotly from "plotly.js/dist/plotly";
import { Switch, Space, Button } from "antd";
import { Data, Curve } from "../../containers/PlotBuilder/Model/data.model";
import { colors } from "../../assets/colors.js";
import { PlotMode } from "../../constants/Enum";
import "./PlotCurve.css";

interface PlotCurveProps {
  data: Data;
  group: number;
  curves: Curve[];
  postData: any[];
  axisLabel: { xlabel: string; ylabel: string };
  clickPoint: (data: any) => boolean;
  plotUpdate: boolean;
  showMarkers: boolean;
  resultsView: number;
  changeView: (v: number) => void;
  displayGids: string[];
  mode: { plotMode: PlotMode; consolidationAlgo: string };
  failureInterpolation: (curves: string[], post: () => void) => void;
  resetFailureCurve: boolean;
}

const PlotCurve: React.FC<PlotCurveProps> = (props) => {
  const [dataPlot, setDataPlot] = useState<any>([]);
  const [currentGroup, setCurrentGroup] = useState(-1);
  const [displayInitCurves, setDisplayInitCurves] = useState(false);
  const [showSwitch, setShowSwitch] = useState(false);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [staticMode, setStaticMode] = useState(false);

  useEffect(() => {
    const avg_cur_index = props.curves.findIndex((c) => c.name === "average");
    const withAvgResult = avg_cur_index === -1 ? false : true;
    if (withAvgResult && props.mode.plotMode === PlotMode.Averaging)
      setShowSwitch(true);
    else setShowSwitch(false);

    if (withAvgResult && props.resultsView !== undefined) {
      const view = props.resultsView === 0 ? false : true;
      setDisplayInitCurves(view);
    } else {
      setDisplayInitCurves(false);
    }

    let data_: any = [];

    if (props.mode.plotMode === PlotMode.Averaging) {
      if (withAvgResult) {
        const line: any = {
          type: "scatter",
          mode: "lines",
          x: props.curves[avg_cur_index].x,
          y: props.curves[avg_cur_index].y,
          name: props.curves[avg_cur_index].name,
          opacity: props.curves[avg_cur_index].opacity,
          line: { color: "#000000", width: 4 },
        };
        data_.push(line);
      }
      if (displayInitCurves) {
        console.log("PLOT init curves");
        for (let i = 0; i < props.curves.length; i++) {
          if (i === avg_cur_index) continue;
          const line: any = {
            type: "scatter",
            mode: "lines",
            x: props.curves[i].x0,
            y: props.curves[i].y0,
            name: props.curves[i].name,
            opacity: props.curves[i].opacity,
            line: { color: colors[i] },
          };
          data_.push(line);
        }
        if (props.showMarkers) {
          for (let i = 0; i < props.curves.length; i++) {
            if (props.curves[i].markerId) {
              const x_marker2 = props.curves[i].x0[props.curves[i].markerId];
              const y_marker2 = props.curves[i].y0[props.curves[i].markerId];
              const opacity = props.curves[i].selected ? 1.0 : 0.2;
              const point2 = {
                type: "scatter",
                mode: "markers",
                name: props.curves[i].name,
                opacity: opacity,
                marker: { color: "black", symbol: ["x"], size: 10 },
                x: [x_marker2],
                y: [y_marker2],
              };
              data_.push(point2);
            }
          }
        }
      } else {
        console.log("PLOT result curves");
        for (let i = 0; i < props.curves.length; i++) {
          if (i === avg_cur_index) continue;
          const line: any = {
            type: "scatter",
            mode: "lines",
            x: props.curves[i].x,
            y: props.curves[i].y,
            name: props.curves[i].name,
            opacity: props.curves[i].opacity,
            line: { color: colors[i] },
          };
          data_.push(line);
        }
        if (props.showMarkers) {
          for (let i = 0; i < props.curves.length; i++) {
            if (props.curves[i].markerId) {
              const x_marker = props.curves[i].x[props.curves[i].markerId];
              const y_marker = props.curves[i].y[props.curves[i].markerId];
              const opacity = props.curves[i].selected ? 1.0 : 0.2;
              const point = {
                type: "scatter",
                mode: "markers",
                name: props.curves[i].name,
                opacity: opacity,
                marker: { color: "black", symbol: ["x"], size: 10 },
                x: [x_marker],
                y: [y_marker],
              };
              data_.push(point);
            }
          }
        }
      }
    }
    // display all other averaged curves
    if (props.mode.plotMode === PlotMode.Consolidation) {
      for (let gid = 0; gid < props.data.groups.length; gid++) {
        const curves = props.data.groups[gid].curves;
        const avg_cur_index = curves.findIndex((c) => c.name === "average");
        const withAvgResult = avg_cur_index === -1 ? false : true;
        if (withAvgResult) {
          const color = colors[gid];
          const showCurve =
            props.displayGids.findIndex((k) => k === "0-" + gid.toString()) ===
            -1
              ? false
              : true;

          const line: any = {
            type: "scatter",
            mode: "lines",
            x: curves[avg_cur_index].x,
            y: curves[avg_cur_index].y,
            name: props.data.groups[gid].label, //gid,
            opacity: 1,
            line: { color: color, width: 3 },
          };
          if (showCurve) data_.push(line);
        }
      }
      if (
        props.data.interpolation &&
        props.data.interpolation.x.length > 0 &&
        props.mode.consolidationAlgo === "failure"
      ) {
        const line: any = {
          type: "scatter",
          mode: "lines",
          x: props.data.interpolation.x,
          y: props.data.interpolation.y,
          name: "failureLine",
          opacity: 1,
          line: { color: "#000000", width: 2, dash: "dot" },
        };
        data_.push(line);
      } }

    setDataPlot(data_);

    if (props.group !== currentGroup) {
      setCurrentGroup(props.group);
    }
  }, [
    props.curves,
    displayInitCurves,
    props.plotUpdate,
    props.displayGids,
    props.mode,
  ]);

  useEffect(() => {
    setSelectedLines([]);
  }, [props.resetFailureCurve]);

  const postOp = () => {
    setStaticMode((prev) => !prev);
  };

  const AddPoint = (data_point: any) => {
    if (
      props.mode.plotMode === PlotMode.Consolidation &&
      props.mode.consolidationAlgo === "failure"
    ) {
      const line: string = data_point.points[0].data.name.toString();
      if (line === "failureLine") return;
      setStaticMode((prev) => !prev);
      let update: string[];
      if (
        selectedLines.length === 3 ||
        selectedLines.findIndex((e) => e === line) !== -1
      ) {
        update = [];
      } else {
        update = [...selectedLines, line];
      }
      setSelectedLines(update);
      // remove failure curve
      const data_up = [...dataPlot];
      const id = data_up.findIndex((e) => e.name === "failureLine");
      if (id !== -1) {
        data_up.splice(id, 1);
        setDataPlot(data_up);
      }
      props.failureInterpolation(update, postOp);
    } else if (props.mode.plotMode === PlotMode.Averaging) {
      if (!props.clickPoint(data_point)) return;
      const curve_idx = data_point.points[0].curveNumber;
      const x = data_point.points[0].x;
      const y = data_point.points[0].y;
      const pt_index = data_point.points[0].pointIndex;
      const curve_name = data_point.points[0].data.name;
      const data_up = [...dataPlot];
      // check if marker already exist
      const c = data_up.find(
        (c) => c.mode === "markers" && c.name === curve_name
      );
      if (c) {
        // replace by new value
        c.x = [x];
        c.y = [y];
      } else {
        // insert new point
        const point = {
          type: "scatter",
          mode: "markers",
          name: curve_name,
          marker: { color: "black", symbol: ["x"], size: 10 },
          x: [x],
          y: [y],
        };
        data_up.push(point);
      }

      setDataPlot(data_up);
    }
    return;
  };

  const configHandler = () => {
    const config = {
      staticPlot: staticMode,
      displaylogo: false, // remove plotly icon
      reponsive: true,
      modeBarButtonsToRemove: [
        "hoverClosestCartesian",
        "hoverCompareCartesian",
        "resetScale2d",
        "lasso2d",
        "select2d",
        "toggleHover",
      ],
      modeBarButtonsToAdd: [
        {
          name: "show markers",
          icon: Plotly.Icons.drawcircle,
          direction: "up",
          click: function (gd) {
            var newMode = "lines+markers";
            Plotly.restyle(gd, "mode", newMode);
          },
        },
        {
          name: "hide markers",
          icon: Plotly.Icons.eraseshape,
          click: function (gd) {
            console.log(gd);
            var newMode = "lines";
            Plotly.restyle(gd, "mode", newMode);
          },
        },
      ],
    };
    return config;
  };

  const config = {
    displaylogo: false, // remove plotly icon
    reponsive: true,
    modeBarButtonsToRemove: [
      "hoverClosestCartesian",
      "hoverCompareCartesian",
      "resetScale2d",
      "lasso2d",
      "select2d",
      "toggleHover",
    ],
    modeBarButtonsToAdd: [
      {
        name: "show markers",
        icon: Plotly.Icons.drawcircle,
        direction: "up",
        click: function (gd) {
          var newMode = "lines+markers";
          Plotly.restyle(gd, "mode", newMode);
        },
      },
      {
        name: "hide markers",
        icon: Plotly.Icons.eraseshape,
        click: function (gd) {
          console.log(gd);
          var newMode = "lines";
          Plotly.restyle(gd, "mode", newMode);
        },
      },
    ],
  };

  const switchChange = (checked: boolean, event: Event) => {
    setDisplayInitCurves(checked);
    const up = checked === true ? 1 : 0;
    props.changeView(up);
  };

  const layoutHandler = () => {
    const layout_c = {
      modebardisplay: false,
      showlegend: false,
      autosize: true,
      height: 530,
      // width: 700,
      hovermode: "closest",
      uirevision: currentGroup.toString(), // will keep the zoom if not changed
      margin: {
        l: 70,
        r: 50,
        b: 50,
        t: 50,
        pad: 4,
      },
      plot_bgcolor: "#fdfdfd",
      xaxis: {
        title: {
          text: props.axisLabel.xlabel,
        },
      },
      yaxis: {
        title: {
          text: props.axisLabel.ylabel,
        },
      },
    };
    return layout_c;
  };

  const unselectAllHandler = () => {
    setStaticMode((prev) => !prev);
    setSelectedLines([]);
    props.failureInterpolation([], postOp);
  };

  const showUnselectAll =
    props.mode.plotMode === PlotMode.Consolidation &&
    props.mode.consolidationAlgo === "failure" &&
    selectedLines.length > 0;

  return (
    <>
      <div style={{ height: "20px", fontSize: "12px", paddingLeft: "5px" }}>
        {showSwitch && (
          <Space align="center">
            Shifted Curves
            <Switch
              size="small"
              checked={displayInitCurves}
              onChange={switchChange}
            />
            Initial Curves
          </Space>
        )}
        {showUnselectAll && (
          <Space style={{ float: "left", paddingLeft: "100px" }}>
            <Button
              style={{ fontSize: "12px", paddingBottom: "10px" }}
              type="primary"
              size="small"
              onClick={unselectAllHandler}
            >
              Reset Curves Selection
            </Button>
          </Space>
        )}
      </div>

      <PlotlyChart
        data={dataPlot}
        layout={layoutHandler()}
        config={configHandler()}
        onClick={AddPoint}
      />
    </>
  );
};

export default PlotCurve;