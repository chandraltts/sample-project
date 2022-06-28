import React from "react";
import {
  Spin,
  Button,
  Checkbox,
  Skeleton,
  Layout,
  Modal,
  Input,
  Space,
} from "antd";
import "antd/dist/antd.css";
import axios from "../axios-orders";
import PlotCurve from "../components/PlotCurveComponent/PlotCurve";
import "../App.css";
import DragNDrop from "../components/DragNDrop/DragNDrop.js";
import { Loading3QuartersOutlined } from "@ant-design/icons";
import ReactDragListView from "react-drag-listview";

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

class DefineGroups extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      groups: [],
      selectedCurves: [],
      selectedPropDef: [],
      groupSelected: [0],
      loadCurve: false,
      isModalVisible: false,
      selectedCriteria: [],
      groupsCriteria: {},
      showGroupCriteria: false,
      xtype: props.propState.xtype,
      ytype: props.propState.ytype,
      xunit: props.propState.xunit,
      yunit: props.propState.yunit,
      xunitLbl: props.propState.xunitLbl,
      yunitLbl: props.propState.yunitLbl,
      precision: 6,
      loadingIcon: false,
      projects: this.props.propState.projects,
      selectedProject: this.props.propState.selectedProject,
    };
    this.getCurves = this.getCurves.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.onChangeCheckbox = this.onChangeCheckbox.bind(this);
    this.onSelectCriteria = this.onSelectCriteria.bind(this);
    this.sendData = this.sendData.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.openSelectCriteria = this.openSelectCriteria.bind(this);
    this.callbackFunction = this.callbackFunction.bind(this);
    this.handleCancelCriteria = this.handleCancelCriteria.bind(this);
    this.handleCreateGroup = this.handleCreateGroup.bind(this);
    this.removeExistingGroup = this.removeExistingGroup.bind(this);
    this.createGroup = this.createGroup.bind(this);
    this.updateAttribute = this.updateAttribute.bind(this);
    this.dragStart = this.dragStart.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    const that = this;
    this.dragProps = {
      onDragEnd(fromIndex, toIndex) {
        if (fromIndex === 0 || toIndex === 0) return;
        const groups = [...that.state.groups];
        const item = groups.splice(fromIndex, 1)[0];
        groups.splice(toIndex, 0, item);
        that.setState({
          groups,
        });
      },
      nodeSelector: "th",
    };
  }

  dragStart = (event) => {
    event.target.className = "DraggableTHDrag";
  };

  dragEnd = (event) => {
    event.target.className = "DraggableTH";
  };

  handlePrevious() {
    let json = {
      current: 0,
      previous: true,
      selectedCurves: this.state.selectedCurves,
      groups: this.state.groups,
      type: this.state.xyDisplayScale,
      xtype: this.state.xtype,
      xunit: this.state.xunit,
      ytype: this.state.ytype,
      yunit: this.state.yunit,
      xunitLbl: this.state.xunitLbl,
      yunitLbl: this.state.yunitLbl,
      groupSelected: this.state.groupSelected,
      selected_group: 0,
      numberOfGroups: 1,
      selectedCriteria: this.state.selectedCriteria,
      groupsCriteria: this.state.groupsCriteria,
      criteria: this.state.criteria,
      targetType: this.state.targetType,
      res_curve: this.state.res_curve,
      res_var1: this.state.res_var1,
      targetClass: this.state.targetClass,
      unitSystem: this.state.unitSystem,
      xQuantityType: this.state.xQuantityType,
      yQuantityType: this.state.yQuantityType,
      measurement: this.state.measurement,
      selectedProject: this.state.selectedProject,
      projects: this.state.projects,
    };
    this.sendData(json);
  }

  openSelectCriteria() {
    this.setState({
      isModalVisible: true,
    });
  }

  handleCancelCriteria() {
    this.setState({
      isModalVisible: false,
    });
  }

  updateAttribute = (value, crname, index) => {
    let group = this.state.groups[index + 1];
    group.criteria[crname] = value;
    this.state.groups[index + 1] = group;
    let json = {
      current: 1,
      previous: false,
      selectedCurves: this.state.selectedCurves,
      groups: this.state.groups,
      type: this.state.xyDisplayScale,
      xtype: this.state.xtype,
      xunit: this.state.xunit,
      ytype: this.state.ytype,
      yunit: this.state.yunit,
      groupSelected: this.state.groupSelected,
      selected_group: 0,
      tree: [],
      keys: [],
      selectedCriteria: this.state.selectedCriteria,
      groupsCriteria: this.state.groupsCriteria,
      criteria: this.state.criteria,
      targetType: this.state.targetType,
      res_curve: this.state.res_curve,
      res_var1: this.state.res_var1,
      targetClass: this.state.targetClass,
      unitSystem: this.state.unitSystem,
      xQuantityType: this.state.xQuantityType,
      yQuantityType: this.state.yQuantityType,
      measurement: this.state.measurement,
      projects: this.state.projects,
      selectedProject: this.state.selectedProject,
    };
    this.sendData(json);
  };

  handleNext() {
    let json = {
      current: 2,
      previous: false,
      selectedCurves: this.state.selectedCurves,
      groups: this.state.groups,
      type: this.state.xyDisplayScale,
      xtype: this.state.xtype,
      xunit: this.state.xunit,
      ytype: this.state.ytype,
      yunit: this.state.yunit,
      xunitLbl: this.state.xunitLbl,
      yunitLbl: this.state.yunitLbl,
      groupSelected: this.state.groupSelected,
      selected_group: 0,
      selectedCriteria: this.state.selectedCriteria,
      groupsCriteria: this.state.groupsCriteria,
      criteria: this.state.criteria,
      targetType: this.state.targetType,
      res_curve: this.state.res_curve,
      res_var1: this.state.res_var1,
      targetClass: this.state.targetClass,
      unitSystem: this.state.unitSystem,
      xQuantityType: this.state.xQuantityType,
      yQuantityType: this.state.yQuantityType,
      stateChanged: false,
      precision: this.state.precision,
      measurement: this.state.measurement,
      projects: this.state.projects,
      selectedProject: this.state.selectedProject,
    };
    this.sendData(json);
  }

  onChangeCheckbox(checkedValues) {
    this.state.selectedCurves = checkedValues;
  }

  onSelectCriteria(checkedValues) {
    let curveMap = {};
    let curveCriteriaMap = {};
    checkedValues.map((param, index) => {
      let obj = this.state.criteria[param];
      let values = obj.value;
      Object.keys(values).map((key, i) => {
        let curves = values[key];
        curves.map((curve) => {
          let c1 = curveMap[curve];
          if (c1 === undefined) {
            curveMap[curve] = param + ":" + key;
            let criObj = new Object();
            criObj[param] = key;
            curveCriteriaMap[curve] = criObj;
          } else {
            curveMap[curve] = c1 + ";" + param + ":" + key;
            let criObj = curveCriteriaMap[curve];
            criObj[param] = key;
            curveCriteriaMap[curve] = criObj;
          }
        });
      });
    });
    Object.keys(this.state.criteria).map((param, index) => {
      if (!checkedValues.includes(param)) {
        let obj = this.state.criteria[param];
        let values = obj.value;
        Object.keys(values).map((key, i) => {
          let curves = values[key];
          curves.map((curve) => {
            let c1 = curveCriteriaMap[curve];
            if (c1 === undefined) {
              let criObj = new Object();
              criObj[param] = key;
              curveCriteriaMap[curve] = criObj;
            } else {
              let criObj = curveCriteriaMap[curve];
              criObj[param] = key;
              curveCriteriaMap[curve] = criObj;
            }
          });
        });
      }
    });
    let groupsCriteria = {};
    Object.keys(curveMap).map((key, i) => {
      let groupKey = curveMap[key];
      let g = groupsCriteria[groupKey];
      let criteria = curveCriteriaMap[key];
      if (g === undefined) {
        let curves = [key];
        g = {};
        g["curves"] = curves;
      } else {
        g.curves.push(key);
      }
      g["criteria"] = criteria;
      groupsCriteria[groupKey] = g;
    });

    this.setState({
      selectedCriteria: checkedValues,
      groupsCriteria: groupsCriteria,
    });
  }

  componentDidMount() {
    if (this.props.propState.groups.length == 0 || this.props.propState.reload)
      this.getCurves();
    else {
      if (this.props.propState.selectedCriteria.length > 0) {
        this.state.showGroupCriteria = true;
      }
      this.setState({
        groups: this.props.propState.groups,
        selectedCurves: this.props.propState.selectedCurves,
        selectedPropDef: this.props.propState.selectedPropDef,
        loaded: true,
        type: this.props.propState.xyDisplayScale,
        xtype: this.props.propState.xtype,
        xunit: this.props.propState.xunit,
        xunitLbl: this.props.propState.xunitLbl,
        yunitLbl: this.props.propState.yunitLbl,
        ytype: this.props.propState.ytype,
        yunit: this.props.propState.yunit,
        selected_group: 0,
        groupSelected: this.props.propState.groupSelected,
        selectedCriteria: this.props.propState.selectedCriteria,
        groupsCriteria: this.props.propState.groupsCriteria,
        criteria: this.props.propState.criteria,
        xQuantityType: this.props.propState.xQuantityType,
        yQuantityType: this.props.propState.yQuantityType,
        precision: this.props.propState.precision,

        targetType: this.props.propState.targetType,
        res_curve: this.props.propState.res_curve,
        res_var1: this.props.propState.res_var1,
        selected_resProp: this.props.propState.selected_resProp,
        targetClass: this.props.propState.targetClass,
        xunit: this.props.propState.xunit,
        yunit: this.props.propState.yunit,
        xunitLbl: this.props.propState.xunitLbl,
        yunitLbl: this.props.propState.yunitLbl,
        unitSystem: this.props.propState.unitSystem,
        xQuantityType: this.props.propState.xQuantityType,
        yQuantityType: this.props.propState.yQuantityType,
        widget: this.props.propState.widget,
        measurement: this.props.propState.measurement,
        projects: this.props.propState.projects,
        selectedProject: this.props.propState.selectedProject,
      });
    }
  }

  getCurves() {
    let propDefs = [];
    //console.log(this.props.propState);
    const url = this.props.propState.url;
    const query = this.props.propState.query;
    const selectedPropDef = this.props.propState.selectedPropDef;
    let selectedPropDefStr = selectedPropDef.join("','");
    selectedPropDefStr = "'" + selectedPropDefStr + "'";
    let selectedAnalysisType = this.props.propState.selectedAnalysisType.title;
    let newUrl =
      url +
      "/servlet/rest/dr/get_Curve?query=" +
      query +
      "&analysisType=" +
      selectedAnalysisType +
      "&propDef=" +
      selectedPropDefStr +
      "&format=json";
    let devURL =
      process.env.NODE_ENV === "production" ? "" : "&user=smroot&passwd=sdm";
    newUrl = newUrl + devURL;
    this.setState({
      loadingIcon: true,
    });
    axios.get(newUrl).then((response) => {
      //console.log(response);
      const res = response.data;
      this.setState({
        groups: res.groups,
        loaded: true,
        type: res.xyDisplayScale,
        xtype: res.xtype,
        xunit: res.xunit,
        ytype: res.ytype,
        yunit: res.yunit,
        xunitLbl: res.xunitLbl,
        yunitLbl: res.yunitLbl,
        selected_group: 0,
        tree: res.tree,
        keys: res.keys,
        criteria: res.criteria,
        targetType: res.targetType,
        res_curve: res.res_curve,
        res_var1: res.res_var1,
        targetClass: res.targetClass,
        unitSystem: res.unitSystem,
        xQuantityType: res.xQuantityType,
        yQuantityType: res.yQuantityType,
        precision: res.precision,
        stateChanged: false,
        measurement: res.measurement,
        projects: res.projects,
        selectedProject: res.selectedProject,
        loadingIcon: false,
      });
    });
  }

  sendData = (result) => {
    this.props.parentCallback(result);
  };

  callbackFunction = (e) => {
    this.state.groupSelected = [];
    e.map((grp, grpI) => {
      if (grp.isSelected) {
        this.state.groupSelected.push(grpI);
      }
    });
    this.setState({
      groups: e,
      loadCurve: true,
    });
    // this.state.groups = e;
    // this.state.loadCurve = true;
    this.forceUpdate();
    //console.log(JSON.stringify(e));
    let json = {
      current: 1,
      previous: false,
      selectedCurves: this.state.selectedCurves,
      groups: this.state.groups,
      type: this.state.xyDisplayScale,
      xtype: this.state.xtype,
      xunit: this.state.xunit,
      ytype: this.state.ytype,
      yunit: this.state.yunit,
      groupSelected: this.state.groupSelected,
      selected_group: 0,
      selectedCriteria: this.state.selectedCriteria,
      groupsCriteria: this.state.groupsCriteria,
      criteria: this.state.criteria,
      targetType: this.state.targetType,
      res_curve: this.state.res_curve,
      res_var1: this.state.res_var1,
      targetClass: this.state.targetClass,
      unitSystem: this.state.unitSystem,
      xQuantityType: this.state.xQuantityType,
      yQuantityType: this.state.yQuantityType,
      measurement: this.state.measurement,
      stateChanged: false,
      projects: this.state.projects,
      selectedProject: this.state.selectedProject,
    };
    this.sendData(json);
  };

  removeExistingGroup() {
    let groups = this.state.groups;
    for (var i = 1; i < groups.length; i++) {
      groups[0].curves = [...groups[0].curves, ...groups[i].curves];
    }
    groups.splice(1);
    groups[0].isSelected = true;
    this.state.groups = groups;
  }

  createGroup = () => {
    let groups = this.state.groups;
    let size = this.state.groups.length;
    let row = {
      label: "Group " + size,
      isSelected: true,
      isEditable: false,
      curves: [],
      id: size,
      criteria: {},
    };
    this.state.groups = [...groups, row];
    this.state.groupSelected.push(size);
    this.state.showGroupCriteria = true;
    this.setState({
      isModalVisible: false,
      showGroupCriteria: true,
    });
    let json = {
      current: 1,
      previous: false,
      selectedCurves: this.state.selectedCurves,
      groups: this.state.groups,
      type: this.state.xyDisplayScale,
      xtype: this.state.xtype,
      xunit: this.state.xunit,
      ytype: this.state.ytype,
      yunit: this.state.yunit,
      groupSelected: this.state.groupSelected,
      selected_group: 0,
      tree: [],
      keys: [],
      selectedCriteria: this.state.selectedCriteria,
      groupsCriteria: this.state.groupsCriteria,
      criteria: this.state.criteria,
      stateChanged: false,
      measurement: this.state.measurement,
    };
    this.sendData(json);
  };

  handleCreateGroup = () => {
    this.state.groupSelected = [0];
    this.removeExistingGroup();
    Object.keys(this.state.groupsCriteria).map((key, i) => {
      let curvesId = this.state.groupsCriteria[key]["curves"];
      let groups = this.state.groups;
      let curves = [];
      curvesId.map((curveId, index) => {
        groups[0].curves.map((curve, index1) => {
          if (curveId === curve.oid) {
            curve.opacity = 0.3;
            curves.push(curve);
            groups[0].curves.splice(index1, 1);
          }
        });
      });
      let grpCriteria = this.state.groupsCriteria[key].criteria;
      Object.keys(grpCriteria).map((key, index) => {
        if (!this.state.selectedCriteria.includes(key)) {
          grpCriteria[key] = "";
        }
      });

      let size = this.state.groups.length;
      let row = {
        label: "Group " + size,
        isSelected: true,
        isEditable: false,
        curves: curves,
        id: size,
        criteria: grpCriteria,
      };
      this.state.groups = [...groups, row];
      this.state.groupSelected.push(++i);
      this.state.showGroupCriteria = true;
    });
    if (this.state.groups.length > 1) {
      this.state.groups[0].label = "Unassigned Curve";
    }

    this.setState({
      isModalVisible: false,
    });
    let json = {
      current: 1,
      previous: false,
      selectedCurves: this.state.selectedCurves,
      groups: this.state.groups,
      type: this.state.xyDisplayScale,
      xtype: this.state.xtype,
      xunit: this.state.xunit,
      ytype: this.state.ytype,
      yunit: this.state.yunit,
      groupSelected: this.state.groupSelected,
      selected_group: 0,
      tree: [],
      keys: [],
      selectedCriteria: this.state.selectedCriteria,
      groupsCriteria: this.state.groupsCriteria,
      criteria: this.state.criteria,
      stateChanged: false,
      measurement: this.state.measurement,
    };
    this.sendData(json);
  };

  render() {
    let allCurves = [];
    let colorsArray = [];
    if (this.state.groups !== undefined && this.state.groups.length > 0) {
      this.state.groupSelected.map((grpIndex) => {
        this.state.groups[grpIndex].curves.map((curve, index) => {
          curve.marker = { color: colors[grpIndex] };
          allCurves.push(curve);
        });
      });
    }
    let criteria = [];
    let count = 1;
    let numberOfGroups = this.state.numberOfGroups;
    if (this.state.isModalVisible) {
      Object.keys(this.state.criteria).map((key, i) => {
        let obj = new Object();
        obj["label"] = this.state.criteria[key]["label"];
        obj["value"] = key;
        criteria.push(obj);
      });
if (this.state.groupsCriteria !== undefined)
        count = Object.keys(this.state.groupsCriteria).length;
    }

    let criteriaGrp = {};

    this.state.groups.map((group, index1) => {
      let critObj = group.criteria;
      if (critObj !== undefined) {
        this.state.selectedCriteria.map((key, i) => {
          let valArray = criteriaGrp[key];
          if (valArray === undefined) {
            valArray = [];
          }
          valArray.push(critObj[key] === undefined ? "" : critObj[key]);
          criteriaGrp[key] = valArray;
        
        });
      }
    });

    let table = !(this.state.groups.length > 1) ? (
      ""
    ) : (
      <table className="Grid">
        <thead>
          <tr key={"mattr01"}>
            <th key="propCol0"></th>
            {this.state.groups.map((group, index) => {
              return index !== 0 ? (
                <th
                  className="DraggableTH"
                  key={"propCol" + index + 1}
                  onDragStart={(e) => this.dragStart(e)}
                  onDragEnd={(e) => this.dragEnd(e)}
                >
                  {group.label}
                </th>
              ) : (
                ""
              );
            })}
          </tr>
        </thead>
        <tbody>
          {this.state.selectedCriteria.map((cr, index) => {
            let crObj = this.state.criteria[cr];
            let leftHeaderLabel = crObj.label;
            let values = criteriaGrp[cr];
            return (
              <tr key={"proptr" + index}>
                <td key={"proptd" + index} className="MatData">
                  {" "}
                  <span> {leftHeaderLabel}</span>
                </td>
                {values !== undefined
                  ? values.map((val, i) => {
                      return (
                        <td>
                          <Input
                            value={val}
                            onChange={(e) =>
                              this.updateAttribute(
                                e.target.value,
                                crObj.label,
                                i
                              )
                            }

                            style={{ width: "60%" }}
                            placeholder=""
                          />
                        </td>
                      );
                    })
                  : ""}
              </tr>


            );
          })}
        </tbody>
      </table>
    );
    let nextDisabled = true;

    this.state.groups.map((grp, id) => {
      if (id > 0 && nextDisabled) {
        let size = grp.curves.length;
        if (size > 0) {
          nextDisabled = false;
        }
      }
    });
    const antIcon = <Loading3QuartersOutlined style={{ fontSize: 24 }} spin />;

    return (
      <>
        <Layout className="DRLayout">
          <Spin spinning={this.state.loadingIcon} indicator={antIcon}>
            <div className="OuterDivScroll">
              <table className="DefineTable">
                <tbody>
                  <tr className="DefineRow">
                    <td className="LeftColumn">
                      <Skeleton loading={!this.state.loaded}>
                        <div className="PlotCurveDiv">
                          <PlotCurve
                            curves={allCurves}
                            showLegend={false}
                            isThumbnail={false}
                            showOnlyAverage={false}
                            xtype={
                              this.state.xtype +
                              " [" +
                              this.state.xunitLbl +
                              "] "
                            }
                            ytype={
                              this.state.ytype +
                              " [" +
                              this.state.yunitLbl +
                              "] "
                            }
                          />
                        </div>
                      </Skeleton>
                    </td>

                    <td className="RightColumn">
                      <Skeleton loading={!this.state.loaded}>
                        <div id="DefineGroup" className="DefineGroup">
                          <div className="DropContainer">
                            <header className="DefineDropContainer-header">
                              <Space>
                                <Button
                                  type="primary"
                                  onClick={this.openSelectCriteria}
                                >
                                  Select Criteria
                                </Button>
                                <Button
                                  type="primary"
                                  onClick={this.createGroup}
                                >
                                  Create Group
                                </Button>
                              </Space>
                              <Modal
                                title="Select Attributes"
                                visible={this.state.isModalVisible}
                                okText="Create Groups"
                                centered
                                onOk={(e) => {
                                  this.handleCreateGroup();
                                }}
                                width={1000}
                                onCancel={(e) => {
                                  this.handleCancelCriteria();
                                }}
                              >
                                <div className="criteriaDiv">
                                  <Checkbox.Group
                                    options={criteria}
                                    onChange={this.onSelectCriteria}
                                    value={this.state.selectedCriteria}
                                  />
                                </div>
                                <label>Max Number of Groups</label>
                                <Input
                                  value={count}
                                  style={{ width: "20%" }}
                                  disabled="true"
                                  defaultValue={this.state.numberOfGroups}
                                />
                              </Modal>
                            </header>
                          </div>

                          <div className="DropContainer">
                            <ReactDragListView.DragColumn {...this.dragProps}>
                              {table}
                            </ReactDragListView.DragColumn>
                          </div>

                          <div className="DropContainer">
                            <header className="DropContainer-header">
                              <DragNDrop
                                key="DragNDropKey"
                                data={this.state.groups}
                                parentCallback={this.callbackFunction}
                              />
                            </header>
                          </div>
                        </div>
                      </Skeleton>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="ButtonPanel">
              <div className="ButtonPrevious">
                <Button
                  onClick={(e) => {
                    this.handlePrevious();
                  }}
                >
                  Previous
                </Button>
              </div>
              <div className="ButtonNext">
                <Button
                  type="primary"
                  disabled={nextDisabled}
                  onClick={(e) => {
                    this.handleNext();
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </Spin>
        </Layout>
      </>
    );
  }
}

export default DefineGroups;