import React, { useState } from "react";
import { Tree } from "antd";
import { CurveData } from "../../../containers/PlotBuilder/Model/data.model";
import "../CurveControls.css";

interface CurveSelection {
  treeData: CurveData[];
  checkedKeys: string[];
  onCheck: any;
}

const CurveSelection: React.FC<CurveSelection> = (props) => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const onSelect = (selectedKeys, info) => {
    setSelectedKeys(selectedKeys);
  };

  const fontStyle = {
    fontSize: "12px",
  };

  return (
    <>
      <Tree
        height={400}
        className="curve-label"
        showIcon
        checkable
        checkedKeys={props.checkedKeys}
        selectedKeys={selectedKeys}
        onCheck={props.onCheck}
        onSelect={onSelect}
        autoExpandParent={autoExpandParent}
        treeData={props.treeData}
      />
    </>
  );
};
export default CurveSelection;