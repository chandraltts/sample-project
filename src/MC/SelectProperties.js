import React from "react";
import {
  Col,
  Row,
  Descriptions,
  Button,
  Checkbox,
  Skeleton,
  Layout,
  Select,
  Spin,
} from "antd";
import "antd/dist/antd.css";
import axios from "../axios-orders";
import "../App.css";
import {
  CheckCircleOutlined,
  CheckOutlined,
  Loading3QuartersOutlined,
} from "@ant-design/icons";

class SelectProperties extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPropDef: [],
      propDefs: [],
      loaded: false,
      analysisTypes: [],
      selectedAnalysisType: { mat: [] },
      propLabelMap: {},
      loadingIcon: false,
    };
    this.getPropertyDef = this.getPropertyDef.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
    this.onAnalysisTypeChange = this.onAnalysisTypeChange.bind(this);
    this.sendData = this.sendData.bind(this);
  }

  handleNext() {
    let json = {
      selectedPropDef: this.state.selectedPropDef,
      current: 1,
      previous: false,
      propDefs: this.state.propDefs,
      stateChanged: this.state.stateChanged,
      analysisTypes: this.state.analysisTypes,
      selectedAnalysisType: this.state.selectedAnalysisType,
      propLabelMap: this.state.propLabelMap,
    };
    this.sendData(json);
  }

  onChangeCheckbox(checkedValues) {
    this.setState({
      selectedPropDef: checkedValues,
      stateChanged: true,
    });
  }

  onAnalysisTypeChange(checkedValues, oldValue) {
    let propdef = this.state.analysisTypes[checkedValues].propDef;
    let propDefSelected = propdef.map((prop, index) => {
      return prop.value;
    });
    this.setState({
      selectedAnalysisType: this.state.analysisTypes[checkedValues],
      propDefs: this.state.analysisTypes[checkedValues].propDef,
      stateChanged: true,
      selectedPropDef: propDefSelected,
    });
  }

  componentDidMount() {
    if (this.props.propState.propDefs.length == 0) this.getPropertyDef();
    else {
      this.setState({
        propDefs: this.props.propState.propDefs,
        selectedPropDef: this.props.propState.selectedPropDef,
        loaded: true,
        stateChanged: false,
        analysisTypes: this.props.propState.analysisTypes,
        selectedAnalysisType: this.props.propState.selectedAnalysisType,
        propLabelMap: this.props.propState.propLabelMap,
      });
    }
  }

  getPropertyDef() {
    let propDefs = [];
    // console.log(this.props.propState);
    const url = this.props.propState.url;
    const query = this.props.propState.query;
    let newUrl =
      url + "/servlet/rest/dr/get_PropertyDef?query=" + query + "&format=json";
    let devURL =
      process.env.NODE_ENV === "production" ? "" : "&user=smroot&passwd=sdm";
    newUrl = newUrl + devURL;
    this.setState({
      loadingIcon: true,
    });
    axios.get(newUrl).then((response) => {
      //console.log(response);
      const res = response.data;
      let propDef = res.selectedAnalysisType.propDef;
      let propDefSelected = propDef.map((prop, index) => {
        return prop.value;
      });
      this.setState({
        propDefs: res.propDef,
        loaded: true,
        analysisTypes: res.analysis,
        selectedAnalysisType: res.selectedAnalysisType,
        propLabelMap: res.propLabelMap,
        selectedPropDef: propDefSelected,
        loadingIcon: false,
      });
    });
  }

  sendData = (result) => {
    this.props.parentCallback(result);
  };

  render() {
    let propDefArray =
      this.state.selectedAnalysisType.propDef === undefined
        ? []
        : this.state.selectedAnalysisType.propDef;
    let nextButtonEnabled =
      this.state.selectedPropDef.length === 0 ? "disabled" : "";
    let NextButton = (
      <Button
        type="primary"
        disabled={nextButtonEnabled}
        onClick={(e) => {
          this.handleNext();
        }}
      >
        Next
      </Button>
    );
    let table = (
      <table className="Grid">
        <thead>
          <tr key={"mattr01"}>
            <th key="propCol0"></th>
            {this.state.selectedPropDef.map((prop, index) => {
              return (
                <th style={{ textAlign: "center" }} key={"propCol" + index + 1}>
                  {this.state.propLabelMap[prop]}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {this.state.selectedAnalysisType.mat.map((matObj, index) => {
            let strikeout = Object.keys(matObj.propObject).length === 0;
            if (!strikeout) {
              let empty = true;
              this.state.selectedPropDef.map((prop, index1) => {
                //console.log(matObj.label+"   "+matObj.propObject[prop]+" "+matObj.propObject.hasOwnProperty(prop));
                if (empty) {
                  if (matObj.propObject.hasOwnProperty(prop)) {
                    empty = false;
                  }
                }
              });
              strikeout = empty;
            }
            return (
              <tr key={"mattr" + index}>
                <td key={"mattd" + index} className="MatData">
                  {" "}
                  <span className={strikeout ? "EmptyPropDef" : ""}>
                    {" "}
                    {matObj.label}
                  </span>
                </td>
                {this.state.selectedPropDef.map((prop, index1) => {
                  return (
                    <td
                      key={"mattdcol" + index + "" + index1}
                      style={{ textAlign: "center" }}
                    >
                      {matObj.propObject[prop] !== undefined ? (
                        <CheckOutlined
                          style={{ color: "green", fontSize: "24px" }}
                        />
                      ) : (
                        ""
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table> );
    const antIcon = <Loading3QuartersOutlined style={{ fontSize: 24 }} spin />;

    return (
      <>
        <Layout className="DRLayout">
          <div className="OuterDivScroll">
            <div id="PropertyDef" className="PropertyDef">
              <Spin spinning={this.state.loadingIcon} indicator={antIcon}>
                <Skeleton loading={!this.state.loaded}>
                  <Row className="AnalysisClass">
                    <Select
                      size="small"
                      value={this.state.selectedAnalysisType.title}
                      style={{ width: 150 }}
                      onChange={(e) =>
                        this.onAnalysisTypeChange(
                          e,
                          this.state.selectedAnalysisType
                        )
                      }
                    >
                      {this.state.analysisTypes.map((analysis, index) => {
                        return (
                          <Select.Option
                            key={"propOption" + index}
                            value={index}
                          >
                            {analysis.title}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  </Row>
                  <Row>
                    <Layout className="PropertyDefLayout">
                      <Checkbox.Group
                        options={propDefArray}
                        onChange={this.onChangeCheckbox}
                        value={this.state.selectedPropDef}
                      />
                    </Layout>
                  </Row>
                  <Row>
                    <Layout>{table}</Layout>
                  </Row>
                </Skeleton>
              </Spin>
            </div>
          </div>
          <div className="ButtonPanel">
            <div className="ButtonNext">{NextButton}</div>
          </div>
        </Layout>
      </>
    );
  }
}

export default SelectProperties;
