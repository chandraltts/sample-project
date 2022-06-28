import React, { Component } from "react";
import { CSVReader } from "react-papaparse";
import { Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { Fragment } from "react";

const buttonRef = React.createRef();

class FileLoader extends Component {
  

  handleOpenDialog = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (buttonRef.current) {
      buttonRef.current.open(e);
    }
  };

  handleOnError = (err, file, inputElem, reason) => {
    console.log(err);
  };

  handleOnRemoveFile = (data) => {
    console.log("---------------------------");
    console.log(data);
    console.log("---------------------------");
  };

  handleRemoveFile = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (buttonRef.current) {
      buttonRef.current.removeFile(e);
    }
  };

  render() {
    return (
      <CSVReader
        ref={buttonRef}
        onFileLoad={this.props.handleOnFileLoad}
        onError={this.handleOnError}
        noClick
        noDrag
        onRemoveFile={this.handleOnRemoveFile}
      >
        {({ file }) => (
          <Fragment>
            <Button onClick={this.handleOpenDialog} icon={<UploadOutlined />}>
              Click to Upload
            </Button>
            {file && file.name}
          </Fragment>
        )}
      </CSVReader>
    );
  }
}

export default FileLoader;