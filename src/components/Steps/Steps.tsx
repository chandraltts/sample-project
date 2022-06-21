import React, {Fragment, useEffect, useState, useRef} from 'react'
import {Button, Steps as AntSteps } from 'antd';
import { CheckCircleFilled, RightCircleOutlined , ExclamationCircleTwoTone} from '@ant-design/icons';
import Step from './Step/Step';
import { Operation } from '../../containers/PlotBuilder/Model/template.model';
import './Steps.css';
import { Parameter as parameter_type } from '../../containers/PlotBuilder/Model/template.model';

interface StepsProps {
    operations: Operation[];
    changeSelectedMethod: any;
    updatedCurve: (a: string) => void;
    changeOperations: (a: Operation[]) => void;
    restoreInitdata: any;
    updatePlot: () => void;
    removeAllPoints: () => void;
    dataType: string;
};
const clone = require('rfdc')();
const Steps: React.FC<StepsProps> = (props) => {
    //-----------STATE----------------------------------------
    const [current, setCurrent] = useState(0);
    const paramsRef = useRef([]);

    //---------EFFECT------------------------------------------

    //---------HANDLER----------------------------------------
    const saveParamsHandler = (p: parameter_type[] ) => {
        paramsRef.current = clone(p); // deep copy
    }
    const changeParametersHandler = () => {
        if(paramsRef.current.length===0)
          return;
         
        const operationsUpdate = [...props.operations];
        const a = operationsUpdate[current];
        const sm = a.selected_method;
        const m = a.methods.find( e => e.type === sm);
        m.params.length = 0;
        m.params = [...paramsRef.current];
        props.changeOperations(operationsUpdate);
        paramsRef.current.length=0; // reset ref
    }

    const stepsOnChangeHandler = (current) => {
        //console.log("useRef :");
        //paramsRef.current.forEach( p => console.log(p.name+" = "+p.value));
        changeParametersHandler();
        const action = props.operations[current].action;
        setCurrent(current);
    }

    const changeSelectedMethod2 = (select:string, action: string) => {
        return  props.changeSelectedMethod(select,action);
    }

    // aplly button for a step
    const updatedCurveHandler = (action: string) => {
        if(action==='all'){
            const last_step = props.operations.length - 1;
            const action = props.operations[last_step].action;
            return props.updatedCurve(action);
        }
        else
            return props.updatedCurve(action);
    }

    const resetModeHandler = (event: any) => {
        props.restoreInitdata(-1); // -1 -> current group
        props.updatePlot();
    }

    const changeOperationsHandler = (new_ops: Operation[]) => { 
        props.changeOperations(new_ops);
        paramsRef.current.length=0; // reset ref
     }

    const removeAllPointsHandler = () => {
        props.removeAllPoints();
    } 
    const applyAllHandler = () => {
        changeParametersHandler();
        updatedCurveHandler('all')
    }
    
    //---------SUB-COMPONENTS------------------------------------
    function DisplayStep(props)  {
        let steps = [];
        props.operations.map( (op,i) => {
            let status_previous = 'success';
            let status_next = 'waiting';
            if(i!==0)
               status_previous = props.operations[i-1].status;
            if(i<props.operations.length-1)   
                status_next =  props.operations[i+1].status;    
            steps.push( 
                        <Step 
                              action_label={op.action_label}
                              methods = {op.methods}
                              selected_method = {op.selected_method}
                              changeSelectedMethod = {(select: string) => changeSelectedMethod2(select,op.action)}
                              applyButton = { () => updatedCurveHandler(op.action)}
                              status = {op.status}
                              error_msg = { op.error}
                              changeOperations= { changeOperationsHandler }
                              operations = {props.operations}
                              action={op.action}
                              saveParams={saveParamsHandler}
                              removeAllPoints={removeAllPointsHandler}
                        />
                        );
        });
        return steps[current];
    }

   function DisplayProgress() {
       let items = [];
       for(let i=0;i<props.operations.length;i++){
            const description = props.operations[i].action_label;
            const label = i;
            let icon = <RightCircleOutlined onChange={undefined}/>; // for waiting
            if(props.operations[i].status==='success')
                icon = <CheckCircleFilled onChange={undefined}/>;
            else if (props.operations[i].status==='failed')
                icon = <ExclamationCircleTwoTone twoToneColor="#eb2f2f" onChange={undefined}/>;
            items.push(<AntSteps.Step icon={icon} title={description} key={i} />);
        }
        return(
            <AntSteps style={{paddingBottom: '10px'}} current={current} size='small' onChange={stepsOnChangeHandler}>{items}</AntSteps>
        );
    }

    //---------RENDER-----------------------------------------
    return(
    <Fragment>
        <div style={{height: '550px', borderStyle: 'solid', borderWidth: '2px', borderColor: '#d9d9d9', margin: 'auto', padding: '8px'}}>
            <div className="analysis-type-title">
                Analysis type: {props.dataType}
            </div>

            <DisplayProgress/>
            
            <DisplayStep  operations={props.operations}/>
            
            <br/>
            <div style={{  float: 'right', paddingRight: '7px', paddingTop: '0px', paddingBottom: '10px'}}>
                <Button style={{fontSize: '12px', background: '#096dd9',  borderColor: '#096dd9'}} size="small" type="primary"  disabled={false} onClick={() => applyAllHandler()/*updatedCurveHandler('all')*/}>Apply All</Button>
            </div>

            <div style={{ float: 'right', paddingRight: '10px', paddingTop: '0px', paddingBottom: '10px'}}>
                <Button style={{fontSize: '12px', background: '#096dd9',  borderColor: '#096dd9'}} size="small" type="primary"  disabled={false} onClick={resetModeHandler}>Reset Curves</Button>
            </div>
            <br/>
        </div>
        
    </Fragment>
    );
};
//
export default Steps;