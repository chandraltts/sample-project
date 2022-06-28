import React, { useEffect, useState } from "react";
import "../../App.css";
import DragNDrop from "./DragNDrop";

const defaultData = [
  {
    label: "group 1",
    curves: [{ name: 1 }, { name: 2 }, { name: 3 }],
    id: 0,
    isEditable: false,
  },
  {
    label: "group 2",
    curves: [{ name: 4 }, { name: 5 }],
    id: 1,
    isEditable: false,
  },
];

function DragNDropContainer() {
  const [data, setData] = useState();
  useEffect(() => {
    setData(defaultData);
  }, [setData]);

  const callbackFunction = (e) => {
    //console.log(JSON.stringify(e));
  };
  return (
    <div className="DropContainer">
      <header className="DropContainer-header">
        <DragNDrop
          key="DragNDrop"
          data={data}
          parentCallback={callbackFunction}
        />
      </header>
    </div>
  );
}

export default DragNDropContainer;

