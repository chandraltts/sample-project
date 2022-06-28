import React, { useState, useRef, useEffect } from "react";
import { PlusOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { Input, Row, Col, Checkbox } from "antd";

export const colors = [
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

function DragNDrop({ data, parentCallback }) {
  const [list, setList] = useState(data);
  const [dragging, setDragging] = useState(false);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const [previousClick, setPreviousClick] = useState("");

  useEffect(() => {
    setList(data);
  }, [setList, data]);

  const dragItem = useRef();
  const dragItemNode = useRef();

  const handletDragStart = (e, item) => {
    //console.log('Starting to drag', item)

    dragItemNode.current = e.target;
    e.dataTransfer.setData("text", JSON.stringify(item));
    dragItemNode.current.addEventListener("dragend", handleDragEnd);

    dragItem.current = item;

    setTimeout(() => {
      setDragging(true);
    }, 0);
  };
  const onDragOver = (e) => {
    e.preventDefault();
  };
  const handleDragEnter = (e, targetGroup) => {
    e.preventDefault();

    var targetItem;

    try {
      targetItem = JSON.parse(e.dataTransfer.getData("text"));
    } catch (e) {
      // If the text data isn't parsable we'll just ignore it.
      return;
    }
    targetItem.grpI = targetGroup;
    //console.log('Entering a drag target', targetItem)
    let grpIndex = dragItem.current.grpI;
    if (targetItem.grpI !== grpIndex) {
      let dragIndexArray = [];
      list[grpIndex].curves.map((item, itemI) => {
        if (item.opacity === 1) {
          dragIndexArray.push(itemI);
        }
      });
      if (dragIndexArray.length === 0) {
        dragIndexArray.push(targetItem.itemI);
      }
      //console.log('Target is NOT the same as dragged item')
      let oldList = list;

      let newList = JSON.parse(JSON.stringify(oldList));
      for (var i = 0; i <= dragIndexArray.length - 1; i++) {
        let c = newList[dragItem.current.grpI].curves[dragIndexArray[i]];
        c.opacity = 0.3;
        newList[targetItem.grpI].curves.splice(
          newList[targetItem.grpI].curves.length,
          0,
          c
        );
      }
      for (var i = dragIndexArray.length - 1; i >= 0; i--) {
        newList[grpIndex].curves.splice(dragIndexArray[i], 1);
      }
      dragItem.current = targetItem;
      //localStorage.setItem('List', JSON.stringify(newList));
      setList((list) => newList);
      setDragging(false);
      forceUpdate();
      parentCallback(newList);
    }
  };

  const handleOnNodeClick = (e, targetItem) => {
    if (
      e.shiftKey &&
      previousClick !== "" &&
      previousClick.grpI === targetItem.grpI
    ) {
      let prevIndex = previousClick.itemI;
      let currentIndex = targetItem.itemI;
      let from = prevIndex + 1;
      let to = currentIndex;
      if (prevIndex > currentIndex) {
        from = currentIndex;
        to = prevIndex - 1;
      }
      for (let i = from; i <= to; i++) {
        let groups = list;
        let opacity = list[targetItem.grpI].curves[i].opacity;
        opacity = opacity === 0.3 ? 1 : 0.3;
        list[targetItem.grpI].curves[i].opacity = opacity;
      }
      setPreviousClick("");
      forceUpdate();
      parentCallback(list);
      console.debug("shift+click has just happened!");
    } else if (e.ctrlKey) {
      let groups = list;
      let opacity = list[targetItem.grpI].curves[targetItem.itemI].opacity;
      opacity = opacity === 0.3 ? 1 : 0.3;
      if (opacity === 1) {
        setPreviousClick(targetItem);
      } else {
        setPreviousClick("");
      }
      list[targetItem.grpI].curves[targetItem.itemI].opacity = opacity;
      forceUpdate();
      parentCallback(list);
    } else {
      let opacity = list[targetItem.grpI].curves[targetItem.itemI].opacity;
      opacity = opacity === 0.3 ? 1 : 0.3;
      if (opacity === 1) {
        setPreviousClick(targetItem);
      } else {
        setPreviousClick("");
      }
      let len = list[targetItem.grpI].curves.length;
      for (let i = 0; i < len; i++) {
        list[targetItem.grpI].curves[i].opacity = 0.3;
      }
      list[targetItem.grpI].curves[targetItem.itemI].opacity = opacity;
      forceUpdate();
      parentCallback(list);
    }
  };
  const handleDragEnd = (e) => {
    setDragging(false);
    dragItem.current = null;
    dragItemNode.current.removeEventListener("dragend", handleDragEnd);
    dragItemNode.current = null;
  };

  const createGroup = () => {
    let size = list.length;
    let row = {
      label: "Group " + size,
      isSelected: true,
      isEditable: false,
      curves: [],
      id: size,
    };
    setList((list) => [...list, row]);
  };

  const removeGroup = (e) => {
    let groups = list;
    groups[0].curves = [...groups[0].curves, ...groups[e].curves];
    groups.splice(e, 1);
    setList((list) => groups);
    list[0].isSelected = true;
    forceUpdate();
    parentCallback(list);
  };

  const updateGroupLabel = (label, e) => {
    let groups = list;
    groups[e].label = label;
    setList((list) => groups);
    forceUpdate();
    parentCallback(list);
  };

  const onCheckBoxChange = (checked, e) => {
    let groups = list.map((grp, grpI) => {
      if (e === grpI) {
        grp.isSelected = checked;
      }
      return grp;
    });
    setList((list) => groups);
    forceUpdate();
    parentCallback(list);
  };

  const makeGroupLabelEditable = (e) => {
    let groups = list;
    if (e !== 0) {
      groups[e].isEditable = !groups[e].isEditable;
      setList((list) => groups);
      forceUpdate();
    }
  };

  const getStyles = (item) => {
    if (
      dragItem.current.grpI === item.grpI &&
      dragItem.current.itemI === item.itemI
    ) {
      return "dnd-item current";
    }
    if (item.opacity === 1) {
      return "dnd-item DNDSelect";
    }
    return "dnd-item";
  };

  if (list) {
    //const addGroup = <PlusOutlined onClick={createGroup}/>;
    let grpUnAssignedI = 0;
    let unAssignedGrp = list[grpUnAssignedI];
    let newList = list.slice(1, list.length);
    return (
      <table className="DefineGroupOuterTable">
        <tbody>
          <tr className="DefineGroupOuterRow">
            <td className="DefineGroupOuterCol1">
              <div className="drag-n-drop">
                {
                  <>
                    <div className="UnAssignedGroupDiv">
                      <Row key={"Row" + grpUnAssignedI} className="GroupLabel">
                        <Col>
                          <Checkbox
                            key={"checkbox" + grpUnAssignedI}
                            checked={unAssignedGrp.isSelected}
                            onChange={(e) =>
                              onCheckBoxChange(e.target.checked, grpUnAssignedI)
                            }
                          />
                          {unAssignedGrp.isEditable ? (
                            <>
                              <Input
                                value={unAssignedGrp.label}
                                onPressEnter={(e) =>
                                  makeGroupLabelEditable(grpI + 1)
                                }
                                onChange={(e) =>
                                  updateGroupLabel(
                                    e.target.value,
                                    grpUnAssignedI
                                  )
                                }
                                hidden={!unAssignedGrp.isEditable}
                                style={{ width: "60%" }}
                                placeholder="Group Name"
                              />
                              <CheckOutlined
                                title={"Submit"}
                                style={{
                                  color: "green",
                                  padding: "5px",
                                  fontSize: "18px",
                                }}
                                onClick={(e) =>
                                  makeGroupLabelEditable(grpUnAssignedI)
                                }
                              />
                            </>
                          ) : (
                            <span
                              style={{ color: colors[grpUnAssignedI] }}
                              hidden={unAssignedGrp.isEditable}
                              onClick={(e) =>
                                makeGroupLabelEditable(grpUnAssignedI)
                              }
                            >
                              {unAssignedGrp.label}
                            </span>
                          )}{" "}
                          <span value={grpUnAssignedI}>
                            {grpUnAssignedI === 0 ? (
                              ""
                            ) : (
                              <DeleteOutlined
                                title={"Delete Group"}
                                style={{
                                  color: "red",
                                  fontSize: "18px",
                                  padding: "5px",
                                }}
                                onClick={() => removeGroup(grpUnAssignedI)}
                              />
                            )}
                          </span>
                        </Col>
                      </Row>{" "}
                      <div
                        key={unAssignedGrp.id}
                        onDragOver={onDragOver}
                        onDrop={
                          dragging
                            ? (e) => handleDragEnter(e, grpUnAssignedI)
                            : null
                        }
                        className="dnd-group-unAssigned"
                      >
                        {unAssignedGrp.curves.map((item, itemI) => (
                          <div
                            draggable
                            key={item.id}
                            onClick={(e) =>
                              handleOnNodeClick(e, {
                                grpI: grpUnAssignedI,
                                itemI,
                              })
                            }
                            onDragStart={(e) =>
                              handletDragStart(e, {
                                grpI: grpUnAssignedI,
                                itemI: itemI,
                              })
                            }
                            className={
                              dragging
                                ? getStyles({ grpI: grpUnAssignedI, itemI })
                                : item.opacity === 1
                                ? "dnd-item DNDSelect"
                                : "dnd-item"
                            }
                          >
                            <div>
                              <Row
                                className="CardTitle"
                                key={"CardTitle" + grpUnAssignedI + "_" + itemI}
                              >
                                {item.matDataLabel}
                              </Row>{" "}
                              <Row>{item.name}</Row>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                }
              </div>
            </td>
            <td className="DefineGroupOuterCol2">
              <div className="drag-n-drop AssignedCurveDiv">
                {newList.map((grp, grpI) => (
                  <>
                    <div>
                      <Row key={"Row" + (grpI + 1)} className="GroupLabel">
                        <Col>
                          <Checkbox
                            key={"checkbox" + (grpI + 1)}
                            checked={grp.isSelected}
                            onChange={(e) =>
                              onCheckBoxChange(e.target.checked, grpI + 1)
                            }
                          />
                          {grp.isEditable ? (
                            <>
                              <Input
                                value={grp.label}
                                onPressEnter={(e) =>
                                  makeGroupLabelEditable(grpI + 1)
                                }
                                onChange={(e) =>
                                  updateGroupLabel(e.target.value, grpI + 1)
                                }
                                hidden={!grp.isEditable}
                                style={{ width: "60%" }}
                                placeholder="Group Name"
                              />
                              <CheckOutlined
                                title={"Submit"}
                                style={{
                                  color: "green",
                                  fontSize: "18px",
                                  padding: "5px",
                                }}
                                onClick={(e) =>
                                  makeGroupLabelEditable(grpI + 1)
                                }
                              />
                            </>
                          ) : (
                            <span
                              style={{ color: colors[grpI + 1] }}
                              hidden={grp.isEditable}
                              onClick={(e) => makeGroupLabelEditable(grpI + 1)}
                            >
                              {grp.label}
                            </span>
                          )}{" "}
                          <span value={grpI + 1}>
                            {grpI + 1 === 0 ? (
                              ""
                            ) : (
                              <DeleteOutlined
                                title={"Delete Group"}
                                style={{
                                  color: "red",
                                  fontSize: "18px",
                                  padding: "5px",
                                }}
                                onClick={() => removeGroup(grpI + 1)}
                              />
                            )}
                          </span>
                        </Col>
                      </Row>{" "}
                      <div
                        key={grp.id}
                        onDragOver={onDragOver}
                        onDrop={
                          dragging ? (e) => handleDragEnter(e, grpI + 1) : null
                        }
                        className="dnd-group"
                      >
                        {grp.curves.map((item, itemI) => (
                          <div
                            draggable
                            key={item.id}
                            onClick={(e) =>
                              handleOnNodeClick(e, { grpI: grpI + 1, itemI })
                            }
                            onDragStart={(e) =>
                              handletDragStart(e, {
                                grpI: grpI + 1,
                                itemI: itemI,
                              })
                            }
                            className={
                              dragging
                                ? getStyles({ grpI: grpI + 1, itemI })
                                : item.opacity === 1
                                ? "dnd-item DNDSelect"
                                : "dnd-item"
                            }
                          >
                            <div>
                              <Row
                                className="CardTitle"
                                key={"CardTitle" + (grpI + 1) + "_" + itemI}
                              >
                                {item.matDataLabel}
                              </Row>{" "}
                              <Row>{item.name}</Row>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ))}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    );
  } else {
    return null;
  }
}

export default DragNDrop;