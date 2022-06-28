import React from "react";
import Plotly from "plotly.js/dist/plotly";
import createPlotlyComponent from "react-plotly.js/factory";
//import classes from './PlotCurve.module.css';
const colors = [
  "#e51c23", // red
  "#3f51b5", // indigo
  "#259b24", // green
  "#9c27b0", // purple
  "#00bcd4", // cyan
  "#795548", // brown
  "#827717", // dark lime
  "#607d8b", // blue grey
  "#e91e63", // pink
  "#009688", // teal
  "#673ab7", // deep purple

  "#b0120a", // dark red
  "#1a237e", // dark indigo
  "#0d5302", // dark green
  "#bf360c", // dark orange
  "#4a148c", // dark purple
  "#006064", // dark cyan
  "#3e2723", // dark brown
  "#263238", // dark grey
  "#880e4f", // dark pink
  "#004d40", // dark teal
  "#311b92", // dark deep purple
  "#ff5722", // dark orange (yellow)
  //        "#b0120a", // light red
  "#5677fc", // light blue
  "#8bc34a", // light green
  "#ef6c00", // light orange
  "#ab47bc", // light purple
  //        "#b0120a", // light cyan
  "#8d6e63", // light brown
  "#78909c", // light grey
  //        "#b0120a", // light teal
  "#b0120a", // light pink
  "#7e57c2", // light deep purple
];

const PlotCurve = (props) => {
  //console.log("Create in Plot");
  const Plot = createPlotlyComponent(Plotly);
  let data = [];

  for (let i = 0; i < props.curves.length; i++) {
    //console.log(props.curves[i].name);
    let line = {
      type: "scatter",
      //mode: 'lines+markers',
      mode: "lines",
      x: props.curves[i].x,
      y: props.curves[i].y,
      name: props.curves[i].name,
      opacity: props.curves[i].opacity,
      marker:
        props.curves[i].marker !== undefined
          ? props.curves[i].marker
          : { color: colors[props.groupIndex] },
      // visible: props.curves[i].selected,
    };
    if (props.showOnlyAverage && props.curves[i].name === "average") {
      data.push(line);
    } else if (!props.showOnlyAverage) {
      data.push(line);
    }
  }
  let width = props.isThumbnail === true ? 300 : 800;
  let height = props.isThumbnail === true ? 300 : 600;

  let marginThumbnail = {
    l: 60,
    r: 40,
    t: 40,
    b: 60,
    pad: 0,
  };

  let marginNormal = {
    l: 80,
    r: 80,
    t: 100,
    b: 80,
    pad: 0,
  };

  const layout = {
    xaxis: { title: props.xtype },
    yaxis: { title: props.ytype },
    width: width,
    height: height,
    displaylogo: false,
    modebardisplay: true,
    margin: props.isThumbnail === true ? marginThumbnail : marginNormal,
    showlegend:
      props.showLegend === undefined || props.showLegend ? true : false,
  };

  var config = {
    displaylogo: false, // remove plotly icon
    reponsive: true,
    modeBarButtonsToAdd: [
      {
        name: "show markers",
        icon: Plotly.Icons.pencil,
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
          //console.log(gd);
          var newMode = "lines";
          Plotly.restyle(gd, "mode", newMode);
        },
      },
    ],
    displayModeBar: !props.isThumbnail ? true : false,
    staticPlot: props.isThumbnail ? true : false,
    modeBarButtonsToRemove: [
      "hoverClosestCartesian",
      "hoverCompareCartesian",
      "resetScale2d",
      "lasso2d",
      "select2d",
      "toggleHover",
    ], // 2D: zoom2d, pan2d, select2d, lasso2d, zoomIn2d, zoomOut2d, autoScale2d, resetScale2d
    //'Cartesian', hoverClosestCartesian, hoverCompareCartesian
    //-'Other', hoverClosestGl2d, hoverClosestPie, toggleHover, resetViews, toImage, sendDataToCloud, toggleSpikelines, resetViewMapbox
  };

  return <Plot graphDiv="graph" data={data} layout={layout} config={config} />;
};

export default PlotCurve;