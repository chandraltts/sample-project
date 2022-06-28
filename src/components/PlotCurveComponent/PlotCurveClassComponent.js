import React, { Component } from "react";
import Plotly from "plotly.js/dist/plotly";
import createPlotlyComponent from "react-plotly.js/factory";
//import classes from './PlotCurve.module.css';

//const plotCurve = (props) =>{
class PlotCurve extends Component {
  render() {
    const Plot = createPlotlyComponent(Plotly);
    let data = [];
    for (let i = 0; i < this.props.curves.length; i++) {
      let line = {
        type: "scatter",
        //mode: 'lines+markers',
        mode: "lines",
        x: this.props.curves[i].x,
        y: this.props.curves[i].y,
        name: this.props.curves[i].name,
        opacity: this.props.curves[i].opacity,
        // visible: props.curves[i].selected,
      };
      if (this.props.curves[i].name === "average") {
        line = {
          ...line,
          line: {
            color: "rgb(0, 0, 0)",
            width: 4,
          },
        };
      }
      data.push(line);
    }

    const layout = { width: 1000, height: 600, modebardisplay: false };

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
            console.log(gd);
            var newMode = "lines";
            Plotly.restyle(gd, "mode", newMode);
          },
        },
      ],
      modeBarButtonsToRemove: [
        "hoverClosestCartesian",
        "hoverCompareCartesian",
      ], // 2D: zoom2d, pan2d, select2d, lasso2d, zoomIn2d, zoomOut2d, autoScale2d, resetScale2d
      //'Cartesian', hoverClosestCartesian, hoverCompareCartesian
      //-'Other', hoverClosestGl2d, hoverClosestPie, toggleHover, resetViews, toImage, sendDataToCloud, toggleSpikelines, resetViewMapbox
    };

    return (
      <Plot
        graphDiv="graph"
        data={data}
        layout={layout}
        config={config}
        //onUpdate = { (event) => props.updatePlot(event) }
        onClick={(data) => this.props.clickPointHandler(data)}
        onLegendDoubleClick={(event) =>
          this.props.doubleClickLegendHandler(event)
        }
        onLegendClick={(event) => this.props.clickLegendHandler(event)}
      />
    );
  }
}

export default PlotCurve;