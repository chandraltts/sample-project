import React, {useState, useEffect}  from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import Plotly from 'plotly.js/dist/plotly';
import {Table, Switch, Space } from 'antd';

import { Curve } from '../../data.model';
import { colors } from '../../assets/colors.js';
import SkeletonButton from 'antd/lib/skeleton/Button';

interface PlotCurveProps {
   group: number;
   curves: Curve[];
   data: any[];
   keys: string[];
   axisLabel: { xlabel: string, ylabel: string};
   clickPoint: (data: any) => boolean;
   plotUpdate: boolean;
   showMarkers: boolean;
};

const PlotCurve: React.FC<PlotCurveProps> = (props) => {

  const [dataPlot,setDataPlot] = useState<any>([]);
  const [newGroup,setNewGroup] = useState(true);
  const [currentGroup,setCurrentGroup] = useState(-1);
  const [displayInitCurves,setDisplayInitCurves ] = useState(false);
  const [showSwitch,setShowSwitch] = useState(false);
  const [menus,setMenus] = useState([]);
  const [annotations,setAnnotations] = useState([]);

  useEffect(() => {
  
    const avg_cur_index = props.curves.findIndex( c => c.name==='average');
    const withAvgResult = (avg_cur_index===-1?false:true);
    if(withAvgResult)
      setShowSwitch(true);
    else
      setShowSwitch(false);
    const displayInitCurve = (withAvgResult&&displayInitCurves?true:false);
    

    // data [ {average } {curve1}, { curve2},  ... { curveN}, {curveInit1}, { curveInit2},  ... { curveInitN},]
    // visible_current [ true(if exist), true, true, ....., false, false,....]
    // visibel_init  [ true(if exist) , false, false,...., true, true,...]
    let data_: any = [];
    const visible_current = [];
    const visible_init = [];
    if(withAvgResult){
      const line : any = {
        type: 'scatter',
        mode: 'lines',
        x: props.curves[avg_cur_index].x,
        y: props.curves[avg_cur_index].y,
        name: props.curves[avg_cur_index].name,
        opacity: props.curves[avg_cur_index].opacity,
        line: { color: '#000000', width: 4 },
      };
      data_.push(line);
      visible_current.push(true);
      visible_init.push(true);
    }
    for(let i=0; i<props.curves.length; i++){
      if(i===avg_cur_index)
        continue;
      const line : any = {
        type: 'scatter',
        mode: 'lines',
        x: props.curves[i].x,
        y: props.curves[i].y,
        name: props.curves[i].name,
        opacity: props.curves[i].opacity,
        line: { color: colors[i] },
      };
      data_.push(line);
      visible_current.push(true);
      visible_init.push(false);
    }
    if(withAvgResult){
      for(let i=0; i<props.curves.length; i++){
        if(i===avg_cur_index)
         continue;
        const line : any = {
          type: 'scatter',
          mode: 'lines',
          visible: false,
          x: props.curves[i].x0,
          y: props.curves[i].y0,
          name: props.curves[i].name,
          opacity: props.curves[i].opacity,
          line: { color: colors[i] },
        };
        data_.push(line);
        visible_current.push(false);
        visible_init.push(true);
      }
    }
    if(props.showMarkers){
      for(let i=0; i<props.curves.length; i++){
        if(props.curves[i].marker){
          const x_marker = props.curves[i].x[props.curves[i].marker];
          const y_marker = props.curves[i].y[props.curves[i].marker];
          const point = { type: 'scatter', mode: 'markers', name: props.curves[i].name,  marker: { color: 'black', symbol: ['x'], size: 10 }, x: [x_marker], y: [y_marker] };
          data_.push(point);
          visible_current.push(true);
          visible_init.push(true);
        }
      }
    }
  
    let updatemenus;
    let annotations;
    if(withAvgResult){
     
      updatemenus = [
      {
        buttons: [{
          args: [{'visible': [...visible_current]}],
          label: 'Shifted Curves',
          method: 'restyle'
        },
        {
          args: [{'visible': [...visible_init]}],
          label: 'Initial Curves',
          method: 'restyle'
        }
        ],
        direction: 'left',
        font: {size: 12},
        showactive: true,
        type: 'buttons',
        x: 0.0,
        xanchor: 'left',
        y: 1.2,
        yanchor: 'top',
        // bgcolor: '#1890ff',
        // bordercolor: '#1890ff'
      }
      ];

      annotations = [
        {
          text: 'Reference Curves:',
          x: 0.,
          y: 1.185,
          //yref: 'paper',
          yref: 'domain',
          align: 'left',
          showarrow: false
        }
      ];
    } else {
      updatemenus =[];
      annotations = [];
    }
    setMenus(updatemenus);
    setAnnotations(annotations);



/*
    let data_: any = [];
    for(let i=0; i<props.curves.length; i++){
      //console.log(props.curves[i].name);
      let line : any = {
        type: 'scatter',
        //mode: 'lines+markers',
        mode: 'lines',
        x: props.curves[i].x,
        y: props.curves[i].y,
        name: props.curves[i].name,
        opacity: props.curves[i].opacity,
        line: { color: colors[i] },
      // visible: props.curves[i].selected,
      };
      let line_init : any = {
        type: 'scatter',
        //mode: 'lines+markers',
        mode: 'lines',
        x: props.curves[i].x0,
        y: props.curves[i].y0,
        name: props.curves[i].name,
        opacity: props.curves[i].opacity,
        line: { color: colors[i] },
      // visible: props.curves[i].selected,
      };

      if(props.curves[i].name==='average'){
        line = {...line,  line: {color: 'rgb(0, 0, 0)', width: 4} };
        line_init = {...line,  line: {color: 'rgb(0, 0, 0)', width: 4} };
        //setShowSwitch(true);
      }
      if(props.curves[i].marker){
        const x_marker = props.curves[i].x[props.curves[i].marker];
        const y_marker = props.curves[i].y[props.curves[i].marker];
        const point = { type: 'scatter', mode: 'markers', name: props.curves[i].name,  marker: { color: 'black', symbol: ['x'], size: 10 }, x: [x_marker], y: [y_marker] };
        data_.push(point);
      }
      
      if(displayInitCurve)
        data_.push(line_init);
      else 
        data_.push(line);  
    }
    */
    setDataPlot(data_);

    if(props.group!==currentGroup){
      setNewGroup(true);
      setCurrentGroup(props.group);
    }

  },[props.curves,props.keys,displayInitCurves,props.plotUpdate]);

  const AddPoint = (data_point: any) =>{
    if(!props.clickPoint(data_point))
      return;
    const curve_idx = data_point.points[0].curveNumber;
    const x = data_point.points[0].x;
    const y = data_point.points[0].y;
    const pt_index = data_point.points[0].pointIndex;
    const curve_name = data_point.points[0].data.name;
    const data_up = [...dataPlot];
    // check if marker already exist
    const c = data_up.find( c => (c.mode==='markers'&&c.name === curve_name));
    if(c){ // replace by new value
      c.x = [x];
      c.y = [y];
    } else { // insert new point
      const point = { type: 'scatter', mode: 'markers', name: curve_name,  marker: { color: 'black', symbol: ['x'], size: 10 }, x: [x], y: [y] };
      data_up.push(point);
    }
    
    setDataPlot(data_up);
    
  }

  
  const layout = { 
    modebardisplay: false,
    showlegend: false,
    autosize: true,
    // width: 800,
    height: 550,
    updatemenus: menus,
 //   annotations: annotations,
    hovermode: "closest",
    uirevision: (newGroup?'false':'true'),
    margin: {
      l: 70,
      r: 50,
      b: 50,
      t: 50,
      pad: 4
    },
    plot_bgcolor: '#fdfdfd',
    xaxis: {
      title: {
        text: props.axisLabel.xlabel
      }
    },
    yaxis: {
      title: {
        text: props.axisLabel.ylabel
      }
    }
  };
  const config = {
    displaylogo: false, // remove plotly icon
    reponsive: true,
    modeBarButtonsToRemove: [ 'hoverClosestCartesian', 'hoverCompareCartesian', 'resetScale2d', 'lasso2d','select2d', 'toggleHover'],
    modeBarButtonsToAdd: [
      {
        name: 'show markers',
        icon: Plotly.Icons.drawcircle,
        direction: 'up',
        click: function(gd) {
          var newMode = 'lines+markers';
          Plotly.restyle(gd, 'mode', newMode);
        }
      },
      {
        name: 'hide markers',
        icon: Plotly.Icons.eraseshape,
        click: function(gd) {
          console.log(gd);
          var newMode = 'lines';
          Plotly.restyle(gd, 'mode', newMode);
        }
      }
    ]
  };
 /*
  var config = {
    displaylogo: false, // remove plotly icon
    reponsive: true,
    modeBarButtonsToAdd: [
      {
        name: 'show markers',
        icon: Plotly.Icons.pencil,
        direction: 'up',
        click: function(gd) {
          var newMode = 'lines+markers';
          Plotly.restyle(gd, 'mode', newMode);
        }
      },
      {
        name: 'hide markers',
        icon: Plotly.Icons.eraseshape,
        click: function(gd) {
          console.log(gd);
          var newMode = 'lines';
          Plotly.restyle(gd, 'mode', newMode);
        }
      }
    ],
    modeBarButtonsToRemove: [ 'hoverClosestCartesian', 'hoverCompareCartesian'] // 2D: zoom2d, pan2d, select2d, lasso2d, zoomIn2d, zoomOut2d, autoScale2d, resetScale2d
                                                  //'Cartesian', hoverClosestCartesian, hoverCompareCartesian
                                                  //-'Other', hoverClosestGl2d, hoverClosestPie, toggleHover, resetViews, toImage, sendDataToCloud, toggleSpikelines, resetViewMapbox
  }
   */ 

  function DisplayData(props) {

    const columns =[
      {title: 'Property', dataIndex: 'parameter', key: 'name'},
      {title: 'Value', dataIndex: 'value', key: 'value'}
    ];


    let datasource: any[] = [];
    props.data.forEach( (e,index) => {
      if(e.label !== ''){
        datasource.push({key: index.toString(), parameter: e.label, value:  e.value });
      }
    });

    if(datasource.length>0){
      return <Table dataSource={datasource} columns={columns} size='small' bordered={true} pagination={false}  style={{width: '500px', margin: 'auto', paddingTop: '20px'}}/>;
    } else {
      return <div></div>;
    }    
  } 

  const switchChange = (checked: boolean, event: Event) => {
    setDisplayInitCurves(!checked);
}

  return(
    <>
   
      <PlotlyChart
        data = { dataPlot }
        layout = { layout }
        config = { config }
        //onUpdate = { (event) => props.updatePlot(event) }
        //onClick = { (data) => props.clickPoint(data) }
        onClick = {AddPoint}
        //onLegendDoubleClick =  { (event) => props.doubleClickLegendHandler(event)}
        //onLegendClick =  { (event) => props.clickLegendHandler(event)}
      />
    

    <div>
    <DisplayData
       data={props.data}/>
    </div>
    </>
   

  );
}
   
export default PlotCurve;