import React from "react";
import { Layout } from "antd";
import "antd/dist/antd.css";
//import DRContainer from './containers/PlotBuilder/DRContainer'
import ImportFromDisk from "./components/ImportFromDisk/ImportFromDisk";
import ReactDOM from "react-dom";

//<DRContainer modelState={modelState}/>
//let modelState = require('./data/data1.json');
const modelState = {
  newLoad: true,
  url: "http://localhost:7050/MaterialCenter",
  query:
    "3;YZ4AE40LA:AEjKjA,YZ4AE40rw:AEjKjA,YZ4AE40IQ:AEjKjA,YZ4AE40og:AEjKjA,YZ4AE40lg:AEjKjA,YZ4AE40UQ:AEjKjA,YZ4AE40uQ:AEjKjA,YZ4AE40ig:AEjKjA,YZ4AE40RQ:AEjKjA,YZ4AE40OA:AEjKjA;this",
};
const App: React.FC = () => {
  const { Header, Footer, Sider, Content } = Layout;

  // App with compenent for curve loading from the local disk - Standalone version

  return (
    <Layout style={{ height: "100%" }}>
      <Content>
        <ImportFromDisk />
      </Content>
    </Layout>
  );

  //let drContainer = process.env.NODE_ENV === 'production'?'':<DRContainer modelState={modelState}/>;
  return (
    <Layout style={{ height: "90%" }}>
      <Content>{/* {drContainer} */}</Content>
    </Layout>
  );
};

//function renderDRContainer(model, element) {
//Comment this piece of code to activate logging
if (process.env.NODE_ENV === "production") {
  const noop = () => {};
  [
    "assert",
    "clear",
    "count",
    "debug",
    "dir",
    "dirxml",
    "group",
    "groupCollapsed",
    "groupEnd",
    "info",
    "log",
    "markTimeline",
    "profile",
    "profileEnd",
    "table",
    "time",
    "timeEnd",
    "timeline",
    "timelineEnd",
    "timeStamp",
    "trace",
  ].forEach((method) => {
    window.console[method] = noop;
  });
}
//ReactDOM.render(<DRContainer modelState={model} />, element);
//  ReactDOM.render(
// React.createElement(DRContainer, {modelState: model}, null),element);
//console.log("Test External Method element:" + element);


//(window as any).renderDRContainer = renderDRContainer;


export default App;
