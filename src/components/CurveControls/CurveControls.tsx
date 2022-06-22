import React, { useState, useEffect } from "react";
import { GroupData } from "../../containers/PlotBuilder/Model/data.model";
import { Radio, Row, Col, Button, Tooltip } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";
import CurveSelection from "./CurveSelection/CurveSelection";
import "./CurveControls.css";

interface CurveControlsProps {
  currentGroup: number;
  groupData: GroupData[];
  onCheck: any;
  measurement: string;
  convertToTrue: () => void;
}

const CurveControls: React.FC<CurveControlsProps> = (props) => {
  const [group, setGroup] = useState(0);

  useEffect(() => {
    setGroup(props.currentGroup);
  });

  const onChangeGroup = (e: RadioChangeEvent) => {
    console.log("radio checked", e.target.value);
    const group_index = e.target.value;
    setGroup(group_index);
    const keys = [...props.groupData[group_index].keys];
    props.onCheck(keys, group_index);
  };

  const onCheckCurve = (e) => {
    props.onCheck(e, group);
  };

  const submit = (e: any) => {
    props.convertToTrue();
  };

  return (
    <>
      <div
        style={{
          height: "400px",
          borderStyle: "solid",
          borderWidth: "2px",
          borderColor: "#d9d9d9",
          margin: "auto",
          padding: "10px",
          width: "100%",
        }}
      >
        <div className="curve-title">Curves</div>
        <Row style={{ paddingTop: "10px", paddingBottom: "10px" }}>
          <Col span={10}>
            <div className="curve-measurement">
              <strong>Data Type: </strong>
              {props.measurement}
            </div>
          </Col>
          <Col span={14}>
            {(props.measurement === "engineering" ? true : false) && (
              <Tooltip title="Convert all curves from engineering to true values. WARNING: All results will be reset">
                <Button
                  style={{ fontSize: "11px", float: "right" }}
                  size="small"
                  type="primary"
                  disabled={props.measurement === "engineering" ? false : true}
                  onClick={submit}
                >
                  Convert to True
                </Button>
              </Tooltip>
            )}
          </Col>
        </Row>
        <Row>
          <Col>
            <Radio.Group onChange={onChangeGroup} value={group}>
              {props.groupData.map((g, index) => {
                return (
                  <Radio
                    key={index}
                    value={index}
                    className="curve-group-title"
                  >
                    {g.title}
                  </Radio>
                );
              })}
            </Radio.Group>
          </Col>
        </Row>
        <Row style={{ width: "100%", paddingTop: "10px" }}>
          <Col>
            <CurveSelection
              treeData={props.groupData[group].treeData}
              checkedKeys={props.groupData[group].keys}
              onCheck={onCheckCurve}
            />
          </Col>
        </Row>
        {/* <br/>
          <Space align='start'>
            <Radio.Group onChange={onChangeGroup} value={group}>{
                props.groupData.map( (g,index) => {
                    return(
                    <Radio key={index} style={radioStyle} value={index}>{g.title}</Radio>
                    );
                })
            }</Radio.Group>
                <CurveSelection 
                    treeData = {props.groupData[group].treeData}
                    checkedKeys = {props.groupData[group].keys}
                    onCheck = {onCheckCurve}
                />
          </Space> */}
      </div>
    </>
  );
};
export default CurveControls;
