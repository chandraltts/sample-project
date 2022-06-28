import React, { Fragment } from "react";

const PhysicalMeasurementForm = (props) => {
  const variable = props.variable;

  if (variable === "x") {
    return (
      <Fragment>
        <form>
          <label>
            Select X type:
            <select
              value={props.value}
              onChange={(e) => props.handleChange(e, variable)}
            >
              <option value="strain_engineering">Strain engineering</option>
              <option value="strain_true">Strain true</option>
            </select>
          </label>
        </form>
      </Fragment>
    );
  } else if (variable === "y") {
    return (
      <Fragment>
        <form>
          <label>
            Select Y type:
            <select
              value={props.value}
              onChange={(e) => props.handleChange(e, variable)}
            >
              <option value="stress_engineering">Stress engineering</option>
              <option value="stress_true">Stress true</option>
            </select>
          </label>
        </form>
      </Fragment>
    );
  }
};

export default PhysicalMeasurementForm;