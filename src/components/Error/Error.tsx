import React from "react";
import { Alert } from "antd";
import { ErrorType } from "../../constants/Enum";
interface IError {
  show: boolean;
  type: ErrorType;
  message: string;
}
const Error: React.FC<IError> = (props) => {
  const errorType = () => {
    if (props.type === ErrorType.Error) return "error";
    else if (props.type === ErrorType.Warning) return "warning";
    else if (props.type === ErrorType.Info) return "info";
    else return "success";
  };

  return (
    <>
      {props.show && (
        <Alert
          style={{ fontSize: "10px" }}
          type={errorType()}
          message={props.message}
        />
      )}
    </>
  );
};
export default Error;