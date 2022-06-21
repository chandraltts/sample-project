import React, { useState, useEffect } from 'react';
import CurveSelection from './CurveSelection/CurveSelection'
import { Radio, Row, Col, Button, Tooltip } from 'antd';
import {LineOutlined} from '@ant-design/icons';
import { CurveData, Data } from '../../containers/PlotBuilder/Model/data.model';
import {colors} from '../../assets/colors';


interface CurveAvgControlsProps {
  data: Data;
  workingGroup: number;
  onCheck: any;
}
const CurveAvgControls: React.FC<CurveAvgControlsProps> = (props) => {

    const [treeData,setTreeData] = useState([]);
    const [checkedKeys,setCheckedKeys] = useState([]);

    useEffect( () => {
        let tree = new Array<CurveData>();
        let keys = new Array<string>();
        for(let gid=0;gid<props.data.groups.length;gid++){
            const curves = props.data.groups[gid].curves;
            const avg_cur_index = curves.findIndex( c => c.name==='average');
            const withAvgResult = (avg_cur_index===-1?false:true);
            if(withAvgResult){
                const color = (gid===props.workingGroup?'#000000':colors[gid]);
                const key = "0-"+gid.toString();
                const curveD = { title: props.data.groups[gid].label, key: key, icon: <LineOutlined style={{ fontSize: '24px', color: color }} onChange={undefined}/>} 
                tree.push(curveD);
                keys.push(key);
            }
        }
        setTreeData(tree);
        setCheckedKeys(keys);

    },[props.workingGroup]);

    const onCheckCurve = (selectedCurves) => {
        setCheckedKeys(selectedCurves);
        props.onCheck(selectedCurves);
    }

    return(
        <>
        <div style={{height: '200px',borderStyle: 'solid', borderWidth: '2px',  borderColor: '#d9d9d9', margin: 'auto', padding: '10px', width: '100%'}}>
        <div className="curve-title">
           Averaged Curves
        </div>
        <Row style={{ width: '100%',  paddingTop: '10px'}}>
            <Col>
                <CurveSelection 
                    treeData = {treeData}
                    checkedKeys = {checkedKeys}
                    onCheck = {onCheckCurve}
                />
            </Col>
        </Row>
        </div>
        </>
    );
}

export default CurveAvgControls;