import React, { useState, useEffect } from "react";
import { Col, Row, Tabs, Collapse, Alert } from "antd";
import PlotCurve from "../../components/PlotCurve/PlotCurve";
import CurveControls from "../../components/CurveControls/CurveControls";
import Steps from "../../components/Steps/Steps";
import { Operation } from "./Model/template.model";
import { Data } from "./Model/data.model";
import Consolidation from "../../components/Consolidation/Consolidation";
import PropertyTable from "../../components/PropertyTable/PropertyTable";
import Error from "../../components/Error/Error";
import { PlotMode, ErrorType } from "../../constants/Enum";
const { TabPane } = Tabs;
const { Panel } = Collapse;

interface PlotBuilderViewProps {
  data: Data;
  operations: Operation[];
  plotUpdate: boolean;
  showMarkers: boolean;
  plotMode: PlotMode;
  changeOperationsHandler_: (nops: Operation[]) => void;
  changeSelectedMethodHandler_: (m: string, a: string) => void;
  updatedCurveHandler_: (a: string, post: () => void) => void;
  clickPointHandler_: (dp: any) => boolean;
  restoreInitdataHandler_: (i: number) => void;
  updatePlotHandler_: () => void;
  removeAllPoints_: () => void;
  changeViewHandler_: (i: number) => void;
  checkDataTreeHandler_: (ss: string[], i: number) => void;
  convertToTrueHandler_: (post: () => void) => void;
  changeCollapseHandler_: (key: string | string[]) => void;
  failureInterpolationHandler_: (curves: string[], post: () => void) => void;
  adjustCurvesHandler_: (
    algo: string,
    curves: string[],
    parameters: { curve: string; parameter: string; value: number }[],
    post: (msg: string) => void
  ) => void;
  resetConsolidationActionsHandler_: (post: () => void) => void;
  setSortedTableHandler_: (data: any[]) => void;
}

const PlotBuilderView: React.FC<PlotBuilderViewProps> = (props) => {
  const {
    data,
    operations,
    plotUpdate,
    showMarkers,
    plotMode,
    changeOperationsHandler_,
    changeSelectedMethodHandler_,
    updatedCurveHandler_,
    clickPointHandler_,
    restoreInitdataHandler_,
    updatePlotHandler_,
    removeAllPoints_,
    changeViewHandler_,
    checkDataTreeHandler_,
    convertToTrueHandler_,
    changeCollapseHandler_,
    failureInterpolationHandler_,
    adjustCurvesHandler_,
    resetConsolidationActionsHandler_,
    setSortedTableHandler_,
  } = props;

  // --- STATE VARIABLES --------------------------------------------
  // Stae variables only used for View, they do not change the Model
  const [displayGids, setDisplayGids] = useState<string[]>([]);
  const [selectedCurves, setSelectedCurves] = useState<string[]>([]); // curves selected for interpolation
  const [computationInProgress, setComputationInProgress] = useState(false);
  //  const [sortedTable,setSortedTable]= useState([]);
  const [unselectCurvesFailureAdjust, setUnselectCurvesFailureAdjust] =
    useState(false);
  const [resetFailureCurve, setResetFailureCurve] = useState(false);
  const [statusConsolidation, setStatusConsolidation] = useState("success");
  const [errorConsolidation, setErrorConsolidation] = useState("");
  const [consolidationAlgo, setConsolidationAlgo] = useState<string>("failure");

  // --- EFFECT -----------------------------------------------------
  useEffect(() => {
    let k = new Array();
    for (let gid = 0; gid < data.groups.length; gid++) {
      k.push("0-" + gid.toString());
    }
    setDisplayGids(k);
  }, [plotUpdate]);

  //------FUNCTIONS---------------------------------------------------
  const postOp = () => {
    setComputationInProgress(false);
  };
  // --from props----
  const changeOperationsHandler = (new_ops: Operation[]) => {
    changeOperationsHandler_(new_ops);
  };
  const changeSelectedMethodHandler = (
    selectedMethod: string,
    action: string
  ) => {
    changeSelectedMethodHandler_(selectedMethod, action);
  };
  const updatedCurveHandler = (action) => {
    setComputationInProgress(true);
    updatedCurveHandler_(action, postOp);
  };
  const clickPointHandler = (data_plot: any) => {
    return clickPointHandler_(data_plot);
  };
  const restoreInitdataHandler = (gid: number) => {
    restoreInitdataHandler_(gid);
  };
  const updatePlotHandler = () => {
    updatePlotHandler_();
  };
  const removeAllPoints = () => {
    removeAllPoints_();
  };
  const changeViewHandler = (val: number) => {
    changeViewHandler_(val);
  };
  const checkDataTreeHandler = (checkedKeys: string[], group_id: number) => {
    checkDataTreeHandler_(checkedKeys, group_id);
  };
  const convertToTrueHandler = () => {
    setComputationInProgress(true);
    return convertToTrueHandler_(postOp);
  };
  const changeCollapseHandler = (key: string | string[]) => {
    changeCollapseHandler_(key);
  };
  const failureInterpolationHandler = (
    curvesSelectedToInterpolation: string[],
    post: () => void
  ) => {
    setSelectedCurves(curvesSelectedToInterpolation);
    setUnselectCurvesFailureAdjust((prev) => !prev);
    if (curvesSelectedToInterpolation.length === 1) {
      post();
      return;
    }
    setComputationInProgress(true);
    const postAll = () => {
      postOp();
      post();
    };
    return failureInterpolationHandler_(curvesSelectedToInterpolation, postAll);
  };
  const adjustCurvesHandler = (
    algo: string,
    curvesToAdjust: string[],
    parameters: { curve: string; parameter: string; value: number }[]
  ) => {
    if (
      curvesToAdjust.length === 0 ||
      (algo === "failure" && data.interpolation.x.length === 0)
    )
      return;
    setComputationInProgress(true);
    const postOpAll = (msg: string) => {
      postOp();
      if (msg.length !== 0) {
        setStatusConsolidation("failed");
        setErrorConsolidation(msg);
      } else {
        setStatusConsolidation("success");
      }
      if (algo === "stiffness") curvesToAdjust.length = 0;
    };
    return adjustCurvesHandler_(algo, curvesToAdjust, parameters, postOpAll);
  };
  const resetConsolidationActionsHandler = (algo: string) => {
    setComputationInProgress(true);
    return resetConsolidationActionsHandler_(postOp);
  };
  const setSortedTableHandler = (data: any[]) => {
    setSortedTableHandler_(data);
  };

  // --internal functions---
  const axisLabel = {
    xlabel:
      data.xtype + (data.xunit === "POURCENT" ? "[%]" : "[" + data.xunit + "]"),
    ylabel: data.ytype + "[" + data.yunit + "]",
  };

  const dataTypeHandler = () => {
    return data.type === undefined ? "tensile" : data.type;
  };

  const updateSortedTable = (data: any) => {
    //setSortedTable(data);
    setSortedTableHandler(data);
  };

  const cleanErrorHandler = () => {
    setStatusConsolidation("success");
    setErrorConsolidation("");
  };

  const selectConsolidationAlgoHandler = (algo: string) => {
    setConsolidationAlgo(algo);
  };

  return (
    <>
      <div style={{ width: "100%" }}>
        <div
          style={{
            paddingTop: "20px",
            cursor: computationInProgress ? "wait" : "auto",
          }}
        >
          <Row
            justify="start"
            style={{ pointerEvents: computationInProgress ? "none" : "auto" }}
          >
            <Col span={5}>
              <Collapse
                className="PlotBuilderCollapse"
                accordion
                bordered={false}
                activeKey={plotMode === PlotMode.Averaging ? ["1"] : ["2"]}
                onChange={changeCollapseHandler}
              >
                <Panel header="1 - Averaging" key="1" showArrow={false}>
                  <Steps
                    operations={operations}
                    changeSelectedMethod={changeSelectedMethodHandler}
                    updatedCurve={updatedCurveHandler}
                    changeOperations={changeOperationsHandler}
                    restoreInitdata={restoreInitdataHandler}
                    updatePlot={updatePlotHandler}
                    removeAllPoints={removeAllPoints}
                    dataType={dataTypeHandler()}
                  />
                </Panel>
                <Panel header="2 - Consolidation" key="2" showArrow={false}>
                  <Consolidation
                    xunit={data.xunit}
                    groupData={data.tree.groupData}
                    postData={data.groups.map((g) => g.data)}
                    selectedCurves={selectedCurves}
                    listAvg={data.groups.map((g) => g.result)}
                    adjustCurves={adjustCurvesHandler}
                    resetConsolidationActions={resetConsolidationActionsHandler}
                    unselectAll={unselectCurvesFailureAdjust}
                    cleanError={cleanErrorHandler}
                    selectConsolidationAlgo={selectConsolidationAlgoHandler}
                  />
                  <Error
                    show={statusConsolidation === "failed"}
                    type={ErrorType.Error}
                    message={errorConsolidation}
                  />
                </Panel>
              </Collapse>
            </Col>
            <Col span={10}>
              <PlotCurve
                data={data}
                group={data.tree.selectedGroup}
                curves={data.groups[data.tree.selectedGroup].curves}
                postData={data.groups[data.tree.selectedGroup].data}
                axisLabel={axisLabel}
                clickPoint={clickPointHandler}
                plotUpdate={plotUpdate}
                showMarkers={showMarkers}
                resultsView={
                  data.tree.groupData[data.tree.selectedGroup].resultsView
                }
                changeView={changeViewHandler}
                displayGids={displayGids}
                mode={{ plotMode, consolidationAlgo }}
                failureInterpolation={failureInterpolationHandler}
                resetFailureCurve={resetFailureCurve}
              />
            </Col>
            <Col span={9}>
              {plotMode === PlotMode.Averaging && (
                <CurveControls
                  currentGroup={data.tree.selectedGroup}
                  groupData={data.tree.groupData}
                  onCheck={checkDataTreeHandler}
                  measurement={data.measurement}
                  convertToTrue={convertToTrueHandler}
                />
              )}
              {plotMode === PlotMode.Consolidation && (
                <PropertyTable
                  data={data}
                  // sortedTable={sortedTable}
                  setSortedTable={updateSortedTable}
                />
              )}
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

export default PlotBuilderView;