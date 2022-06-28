import React, { useState, useEffect } from "react";
import PlotlyChart from "react-plotlyjs-ts";
import Plotly from "plotly.js/dist/plotly";
import { colors } from "../../assets/colors.js";

interface PlotAvgCurveProps {
  data: any;
  workingGroup: number;
  plotUpdate: boolean;
  displayGids: string[];
  axisLabel: { xlabel: string; ylabel: string };
}

const PlotAvgCurve: React.FC<PlotAvgCurveProps> = (props) => {
  const [dataPlot, setDataPlot] = useState<any>([]);

  useEffect(() => {
    let data_: any = [];
    for (let gid = 0; gid < props.data.groups.length; gid++) {
      const curves = props.data.groups[gid].curves;
      const avg_cur_index = curves.findIndex((c) => c.name === "average");
      const withAvgResult = avg_cur_index === -1 ? false : true;
      if (withAvgResult) {
        const color = gid === props.workingGroup ? "#000000" : colors[gid];
        const showCurve =
          props.displayGids.findIndex((k) => k === "0-" + gid.toString()) === -1
            ? false
            : true;

        const line: any = {
          type: "scatter",
          mode: "lines",
          x: curves[avg_cur_index].x,
          y: curves[avg_cur_index].y,
          name: curves[avg_cur_index].name,
          opacity: curves[avg_cur_index].opacity,
          line: { color: color, width: 4 },
        };
        if (showCurve) data_.push(line);
      }
    }
    setDataPlot(data_);
  }, [props.plotUpdate, props.displayGids]);

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

  const layoutHandler = () => {
    const layout_c = {
      modebardisplay: false,
      showlegend: false,
      autosize: true,
      height: 530,
      hovermode: "closest",
      //      uirevision:  currentGroup.toString(), // will keep the zoom if not changed
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

  return (
    <>
      <div
        style={{ height: "20px", fontSize: "12px", paddingLeft: "5px" }}
      ></div>
      <PlotlyChart data={dataPlot} layout={layoutHandler()} config={config} />
    </>
  );
};

export default PlotAvgCurve;