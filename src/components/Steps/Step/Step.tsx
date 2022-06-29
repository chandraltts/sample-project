import React from "react";
import { Select, Alert, Tooltip } from "antd";
import { Operation } from "../../../containers/PlotBuilder/Model/template.model";
import DisplayParametersForms from "./DisplayParametersForms";
import { Parameter as parameter_type } from "../../../containers/PlotBuilder/Model/template.model";
import "../Steps.css";

interface StepProps {
  action_label: string;
  methods: any[];
  selected_method: string;
  changeSelectedMethod: any;
  applyButton: any;
  status: string;
  error_msg: string;
  changeOperations: (a: Operation[]) => void;
  operations: Operation[];
  action: string;
  saveParams: (p: parameter_type[]) => void;
  removeAllPoints: () => void;
}

const Step: React.FC<StepProps> = (props) => {
    
  const { Option } = Select;

  const changeMethodHandler = (selectedMethod: string) => {
    props.changeSelectedMethod(selectedMethod);
    const operationsUpdate = [...props.operations];
    operationsUpdate.find((el) => el.action === props.action).status =
      "waiting";
    props.changeOperations(operationsUpdate);
  };

  const changeParametersHandler = (
    params_: parameter_type[],
    apply: boolean
  ) => {
    const operationsUpdate = [...props.operations];
    const a = operationsUpdate.find((el) => el.action === props.action);
    const sm = a.selected_method;
    const m = a.methods.find((e) => e.type === sm);
    m.params.length = 0;
    m.params = params_;
    props.changeOperations(operationsUpdate);
    if (apply) props.applyButton();
  };

  const DisplayAlert = () => {
    let ret: any;
    if (props.status === "failed")
      ret = (
        <Alert
          style={{ fontSize: "10px" }}
          message={props.error_msg}
          type="error"
        />
      );
    else ret = null;
    return ret;
  };

  const removeAllPointsHAndler = () => {
    props.removeAllPoints();
  };

  const initParamsHandler = () => {
    const m = props.methods.find((e) => e.type === props.selected_method);
    if (m) {
      return m.params;
    }
  };

  return (
    <div
      style={{
        height: "360px",
        borderStyle: "solid",
        borderWidth: "1px",
        borderColor: "#d9d9d9",
        paddingLeft: "5px",
        paddingBottom: "0px",
      }}
    >
      <div className="step-title">{props.action_label}</div>

      <Select
        value={props.selected_method}
        size="small"
        className="step-select-method"
        onChange={changeMethodHandler}
      >
        {props.methods.map((met) => {
          return (
            <Option
              key={met.type}
              value={met.type}
              className="step-select-method"
            >
              <Tooltip title={met.tip}>{met.label}</Tooltip>
            </Option>
          );
        })}
      </Select>

      <DisplayParametersForms
        initParams={
          initParamsHandler() /*props.methods.find( e => e.type===props.selected_method ).params*/
        }
        onChangeParameter={changeParametersHandler}
        actionLabel={props.action_label}
        saveParams={props.saveParams}
        action={props.action}
        method={props.selected_method}
        removeAllPoints={removeAllPointsHAndler}
      />
      <div style={{ paddingTop: "95px" }}>
        <DisplayAlert />
      </div>
    </div>
  );
};


export default Step;