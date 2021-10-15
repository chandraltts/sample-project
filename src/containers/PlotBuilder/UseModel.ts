import {useState,useReducer} from 'react';
import dataReducer from './Model/Reducer';
import initalData from './Model/InitialData';
import {InitialOperation,InitialOperations} from './Model/InitialOperation';
import { Operation, Operations } from './Model/template.model';
import { ACTION } from '../../assets/tensile_operations_config';
import { Data, Group, Curve, Tree, GroupData, CurveData } from './Model/data.model';
import ReactWasm, { Module } from '../../assets/dataclean/dataclean.js'
import actions from './Model/Actions';
const clone = require('rfdc')();

interface EmscriptenModule {
    [key: string]: any    
};

const useModel = () => {
    // datat represents the state related to curves management 
    const [data, dispatch]  =  useReducer(dataReducer,initalData);
    const [interpolationData,setInterpolationData] = useState<{x: number[], y: number[]}>( {x: [], y:[]});
    const [strainAtBreak,setStrainAtBreak] = useState<{curve: string, value: number}[]>([]);
    // operations represent the state related to actions/methods/parameters
    // Each action has:
    // status: 'waiting' (initial value), 'failed', 'success' depending on the success of the action 
    const [operationsType, setOperationsType] = useState<Operation[]>([InitialOperation]);
    const [allOperations, setAllOperations] = useState<Operations[]>([InitialOperations]);
    const [backupAllOperations, setBackupAllOperations] = useState<Operations[]>([]);
    
    // ----Functions for Data-----
    const adjustCurves = (algo: string, curves: string[],parameters: {curve: string, parameter: string, value: number}[], post: () => void) => {
        
        const allOpsBU = clone(allOperations); // efficient deep copy
        setBackupAllOperations(allOpsBU);

        for(let gid=0; gid<data.groups.length;gid++){
            const ind = curves.findIndex(e => e===data.groups[gid].label);
            if(ind!==-1){
                const allOpsUp = allOperations;
                const action_id = ACTION.Averaging;
                const selected_method = allOpsUp[gid].operations[action_id].selected_method;
                const method = allOpsUp[gid].operations[action_id].methods.find( m => m.type === selected_method);
                if(algo==='failure'){
                    const param_extrapolation = method.params.find( p => p.name === 'extrapolation');
                    param_extrapolation.value = 2; // tangent method
                    const param_extrapolation_end_point = method.params.find( p => p.name === 'extrapolating_end_point');
                    param_extrapolation_end_point.value = 2; // user defined
                    const param_extrapolation_end_point_value = method.params.find( p => p.name === 'extrapolating_end_point_value');
                    param_extrapolation_end_point_value.value = +strainAtBreak[gid].value.toPrecision(6);          
                } else if(algo==='stiffness'){
                    const p1 = parameters.find(e => (e.curve===curves[ind]&&e.parameter==='young'));
                    const p2 = parameters.find(e => (e.curve===curves[ind]&&e.parameter==='strain'));
                    if(p1&&p2){
                        const param_linear_correction_stiffness = method.params.find( p => p.name === 'linear_correction_stiffness');
                        param_linear_correction_stiffness.value = p1.value;
                        const param_linear_correction_strain = method.params.find( p => p.name === 'linear_correction_strain');
                        param_linear_correction_strain.value = p2.value;
                        const param_linear_correction = method.params.find( p => p.name === 'linear_correction');
                        param_linear_correction.value = 1;
                    }
                }
                setAllOperations(allOpsUp);
                updatedCurve('Averaging',gid,action_id,data.precision,post);
            }
        }
    }

    const cancelAdjustCurves = (post: () => void) => {
        const action_id = ACTION.Averaging;
        for(let gid=0; gid<data.groups.length;gid++){
            updatedCurve('Averaging',gid,action_id,data.precision,post,backupAllOperations);
        }
        //setAllOperations( () => backupAllOperations);
        setBackupAllOperations([]);
    }

    const failureInterpolation = (selectedCurves: string[],post: any) => {
        let x_int: number[] = [];
        let y_int: number[] = [];
        if(selectedCurves.length===3||selectedCurves.length==2){
            const Module: EmscriptenModule  = {};
            ReactWasm(Module).then( () => {   
                // create a datase
                const dataset = new Module.Dataset();
                for(let gid=0; gid<data.groups.length;gid++){
                    const curve = data.groups[gid].curves.find(c => c.name==='average');
                    if(curve){
                        const curve_name = data.groups[gid].label;
                        const curve_ds = new Module.Curve(curve_name/*gid.toString()*/);
                        const vecX = new Module.VectorDouble();
                        const vecY = new Module.VectorDouble();
                        for(let i=0; i<curve.x.length;i++){
                            vecX.push_back(curve.x[i]);
                            vecY.push_back(curve.y[i]);
                        }
                        curve_ds.setPoints(vecX,vecY);
                        dataset.addCurve(curve_ds);
                        curve_ds.delete();
                        vecX.delete();
                        vecY.delete();
                    }
                }
                // create DataProcess
                const dataprocess = new Module.DataProcess(dataset);
                let error_msg: string;
                let log: string;
                const applyOperation = (dataprocess) => {
                    return new Promise((success,failure) => {
                        let check = true;
                        const convert_op = JSON.stringify(
                            {"operations":[
                                {"action":"FailureInterpolation",
                                "method":"None",
                                "parameters":[ {"number_of_points": 30},
                                                {"selected_curve": selectedCurves/*["0","1","2"]*/}
                                            ]
                                }]
                            }
                        );
                        console.log('Failure interpolation '+convert_op);
                        try{
                            const op = new Module.Operation(convert_op);
                            check = dataprocess.apply(op);
                            op.delete();
                        } catch {
                            console.log("Error during convert engineering to true");
                        }
                        if(check) {
                            success(dataprocess);
                        } else {
                            failure(dataprocess);
                        }
                    });
                }
                const todoAfterOperationApplied = (dataprocess: any) => { 
                    const dataset_out = dataprocess.getOutputDataset();
                    const curve_interpolation = dataset_out.getCurve("interpolation");
                    let vecX_out = curve_interpolation.getX();
                    let vecY_out = curve_interpolation.getY();
                    
                    for(let i=0; i< vecX_out.size(); i++){
                        x_int.push(vecX_out.get(i));
                        y_int.push(vecY_out.get(i));
                    }
                    setInterpolationData({x:x_int,y: y_int});

                    const report = dataprocess.getReport();
                    let res: {curve: string, value: number}[] = [];
                    for(let gid=0; gid<data.groups.length;gid++){
                        const curve_name = data.groups[gid].label;
                        const strain_at_break = report.getPropertyFirst(Module.ActionType.FAILURE_INTERPOLATION,curve_name,'failure_point');
                        res.push({curve: curve_name, value: strain_at_break});
                    }
                    setStrainAtBreak(res);
                }
                const todoOperationFailed = (dataprocess: any) => {
                    const report = dataprocess.getReport();
                    const log = report.executionLog();
                    console.log("REPORT :"+log);
                    console.log("ERROR KO"+dataprocess.getErrorMessage());
                    console.log("LOG OK:"+dataprocess.logfile());
                    x_int.push(0.001);
                    y_int.push(0.001);
                }
                const promise = applyOperation(dataprocess);
                promise.then(todoAfterOperationApplied,todoOperationFailed).then( () => {
                    post();
                });
            });
        }
    }

    const convertToTrue = (post: any) => {

        const Module: EmscriptenModule  = {};
        ReactWasm(Module).then( () => {   
            // create a datase
            const dataset = new Module.Dataset();
            let ic = 0;
            for(let gid=0; gid<data.groups.length;gid++){
                for(let cid=0; cid<data.groups[gid].curves.length; cid++){
                    const curve = data.groups[gid].curves[cid];
                    if(curve.x0===undefined) // no manage average curve
                        continue;
                    const curve_ds = new Module.Curve(ic.toString());
                    curve_ds.setXName(Module.PhysicalMeasurement.STRAIN_ENGINEERING);
                    curve_ds.setYName(Module.PhysicalMeasurement.STRESS_ENGINEERING);
                    const vecX = new Module.VectorDouble();
                    const vecY = new Module.VectorDouble();
                    for(let i=0; i<curve.x0.length;i++){
                        vecX.push_back(curve.x0[i]);
                        vecY.push_back(curve.y0[i]);
                    }
                    curve_ds.setPoints(vecX,vecY);
                    dataset.addCurve(curve_ds);
                    curve_ds.delete();
                    vecX.delete();
                    vecY.delete();
                    ic++;
                }
            }
            // create DataProcess
            const dataprocess = new Module.DataProcess(dataset);
            let error_msg: string;
            let log: string;
            const applyOperation = (dataprocess) => {
                return new Promise((success,failure) => {
                    let check = true;
                    const convert_op = JSON.stringify( {"operations":[ {"action":"Convert", "method":"Engineering_to_true"}]} );
                    console.log('Convert '+convert_op);
                    try{
                        const op = new Module.Operation(convert_op);
                        check = dataprocess.apply(op);
                        op.delete();
                    } catch {
                        console.log("Error during convert engineering to true");
                    }
                    if(check) {
                        success(dataprocess);
                    } else {
                        failure(dataprocess);
                    }
                });
            }
            const todoAfterOperationApplied = (dataprocess: any) => {
                const dataset_out = dataprocess.getOutputDataset();
                const groups_new = [...data.groups];
                let ic = 0;
                for(let gid=0; gid<data.groups.length;gid++){
                    for(let cid=0; cid<data.groups[gid].curves.length; cid++){
                        if(data.groups[gid].curves[cid].x0===undefined) // do not consider avaerage curve
                            continue;
                        const curve_out = dataset_out.getCurve(ic.toString());
                        let vecX_out = curve_out.getX();
                        let vecY_out = curve_out.getY();
                        const x_new = [];
                        const y_new = [];
                        for(let i=0; i< vecX_out.size(); i++){
                            x_new.push(vecX_out.get(i));
                            y_new.push(vecY_out.get(i));
                        }
                        if(groups_new[gid].curves[cid].x0){  // not for average curve
                            groups_new[gid].curves[cid].x0.length=0;
                            groups_new[gid].curves[cid].y0.length=0;
                            groups_new[gid].curves[cid].x0 = [...x_new];
                            groups_new[gid].curves[cid].y0 = [...y_new];
                        }
                        curve_out.delete();
                        vecX_out.delete();
                        vecY_out.delete();
                        ic++;
                    }
                }
                dispatch(actions.setMeasurement('true'));
            }
            const todoOperationFailed = (dataprocess: any) => {
                const report = dataprocess.getReport();
                const log = report.executionLog();
                console.log("REPORT :"+log);
                console.log("ERROR KO"+dataprocess.getErrorMessage());
                console.log("LOG OK:"+dataprocess.logfile());
            }
            const promise = applyOperation(dataprocess);
            promise.then(todoAfterOperationApplied,todoOperationFailed).then( () => {
                post();
            });
        });
    }

    const updatedCurve = (action: string,group_id: number,op_target: number ,precision: number,post: any,allOpsIn: Operations[] = undefined) => { 
           
         // use dataClean C++ lib 
        const Module: EmscriptenModule  = {};
        ReactWasm(Module).then( () => {    
            console.log("----------transform curves-------------");
            const newCurves = []; // do not use newCurves = curves because it will a reference because curves must be unchanged to activate the update, newCurves = [...curves] or curves.slice() are not a deep copy but a shallow copy -> does not work
            // perform a hard copy by hand -> use rfdc
            const curves = data.groups[group_id].curves;
            for(let ic=0; ic<data.groups[group_id].curves.length; ic++){
                if(curves[ic].name!=='average'){
                    let curve: Curve = {
                                    id: curves[ic].id,
                                    oid: curves[ic].oid,
                                    matDataLabel: curves[ic].matDataLabel,
                                    x: curves[ic].x,
                                    y: curves[ic].y,
                                    name: curves[ic].name,
                                    label: curves[ic].label,
                                    selected: curves[ic].selected,
                                    opacity: curves[ic].opacity,
                                    x0: curves[ic].x0,
                                    y0: curves[ic].y0
                                };
                    if(curves[ic].markerId){
                        curve = {...curve, markerId: curves[ic].markerId};
                    }
                    newCurves.push(curve);
                }
            }
            // create a datase
            const dataset = new Module.Dataset();
            // create Curves and add into dataset
            for(let curve_idx=0;curve_idx<newCurves.length;curve_idx++){
                // build Curve
                if(!newCurves[curve_idx].selected) { continue; }

                //console.log("----------build curve:"+newCurves[curve_idx].name);
                const curve = new Module.Curve(newCurves[curve_idx].name);
                var vecX = new Module.VectorDouble();
                var vecY = new Module.VectorDouble();
                for(let i=0; i<newCurves[curve_idx].x.length;i++){
                    if(newCurves[curve_idx].x[i]!==""){
                        vecX.push_back(newCurves[curve_idx].x[i]);
                        vecY.push_back(newCurves[curve_idx].y[i]);
                    }
                }
                // set name -> TODO should be define in the UI
                if(data.xtype==='strain_true'){
                    curve.setXName(Module.PhysicalMeasurement.STRAIN_TRUE);
                }
                else if(data.xtype==='strain_engineering'){
                    curve.setXName(Module.PhysicalMeasurement.STRAIN_ENGINEERING);
                }
                if(data.ytype==='stress_true'){
                    curve.setYName(Module.PhysicalMeasurement.STRESS_TRUE);
                }
                else if(data.ytype==='stress_engineering'){
                    curve.setYName(Module.PhysicalMeasurement.STRESS_ENGINEERING);
                }
               
                //curve.setXCoordinateType(core.CoordinateType.LINEAR);
                // set unit  -> TODO to read in the UI and defiend for each curve
                if(data.xunit==='POURCENT'){
                    curve.setXUnit(Module.Unit.POURCENT);
                } else {
                    curve.setXUnit(Module.Unit.NO);
                }

                curve.setPoints(vecX,vecY);   
                dataset.addCurve(curve);
                // delete C++ object (not done automatically)
                curve.delete();
                vecX.delete();
                vecY.delete();
            }
            // create DataProcess
            const dataprocess = new Module.DataProcess(dataset);
            
            let error_msg: string;
            let log: string;;
            // promise
            const applyOperation = (dataprocess) => {
                return new Promise((success,failure) => {
                    console.log("OPERATION STARTED");
                    let check = true;
                    
                    // create a template file from operations and run 
                    let ops: object[] = [];
                    for(let op_index=0; op_index <= op_target; op_index++){
                        //const op = allOperations[group_id].operations[op_index]; //operations[op_index];
                        let op: any;
                        if(allOpsIn===undefined){
                            op = allOperations[group_id].operations[op_index];
                        } else {
                            op = allOpsIn[group_id].operations[op_index];
                            allOperations[group_id].operations[op_index] = op;
                        }
                        const action = op.action;
                        const method = op.methods.find( e => e.type === op.selected_method);
                        const params = method.params;
                        let par: object[] = [];
                        method.params.forEach( param => {
                            // do not add parameter for extrapolation, manage after
                            // Should be better to have a property in params to do the difference between basic param (to be included)
                            // and additional parameter like extrapolation, linear_correction, averaging_type
                            const extra_index = param.name.toLowerCase().indexOf('extrapolat');
                            const lin_corr_index = param.name.toLowerCase().indexOf('linear_correction');
                            const averaging_type_index = param.name.toLowerCase().indexOf('averaging_type');
                            if( extra_index === -1 && lin_corr_index === -1 && averaging_type_index === -1 ){
                                if(typeof param.value !== 'undefined'&& param.value!==null){ 
                                    const name = param.name;
                                    if(param.selection){
                                        par.push( {[name] : param.selection[param.value].name});
                                    } else { 
                                        let val = param.value;
                                        if(param.float){ // if the float is an integer number we need to add decimal separator in order to well interpreted by dataclean.lib
                                            val = (val===0?1e-15:val*(1+1e-15));
                                        } 
                                        if(param.curveId){
                                            const curve_names = [];
                                            const values = [];
                                            param.curveId.forEach( (p,i) => {
                                                if(p.groupId === group_id){
                                                    curve_names.push(p.curveName);
                                                    values.push(val[i]);
                                                }
                                            })
                                            par.push( {curveId : curve_names });
                                            par.push( {[name] : values})
                                        } else {
                                            par.push( {[name] : val})
                                        }
                                    }
                                }
                            }
                        });
                        if(action==='Averaging')
                            ops.push({action: action, method: op.selected_method, parameters: par, result: 'Shifting'});
                        else 
                            ops.push({action: action, method: op.selected_method, parameters: par});

                        // manage Extrapolation action in Averaging
                        if(action === 'Averaging'){
                            const avg_method = op.methods.find( e => e.type === op.selected_method);
                            const extrapolation_parm = avg_method.params.find( e => e.name === 'extrapolation');
                            const extrapolation_method = extrapolation_parm.selection[extrapolation_parm.value].name;
                            if(extrapolation_method !== 'none'){ // !none
                                const params: object[] = [];
                                avg_method.params.forEach( param => {
                                    const extra_index = param.name.toLowerCase().indexOf('extrapolat')
                                    if(extra_index !== -1 && param.name !== 'extrapolation'){
                                        if(typeof param.value !== 'undefined'){
                                            const name = param.name;
                                            if(param.selection) {
                                                params.push( {[name] : param.selection[param.value].name});
                                            } else {
                                                (param.float?    params.push( {[name] : (param.value*(1+1e-15))}):params.push( {[name] : param.value}));
                                            }
                                        }
                                    }
                                });
                                ops.push({action: 'Extrapoling' , method: extrapolation_method, parameters: params, result: 'Shifting'})
                            }
                            // Add Transform operation
                            const lin_corr_parm = avg_method.params.find( e => e.name === 'linear_correction');
                            const lin_corr_method = lin_corr_parm.selection[lin_corr_parm.value].name;
                            if(lin_corr_method === 'linear_correction_yes'){ 
                                const params: object[] = [];
                                const stiffness = avg_method.params.find( e => e.name === 'linear_correction_stiffness');
                                const strain = avg_method.params.find( e => e.name === 'linear_correction_strain');
                                params.push( {selected_curves:['averaging'],
                                              stiffness: [stiffness.value*(1.+1e-15)],
                                              strain: [strain.value*(1.+1e-15)],
                                              strategy: "fixed_failure_point"});
                               
                                ops.push({action: 'Transform' , method: 'None', parameters: params})
                            }
                        }
                        
                    }
                    const template = {operations: ops};
                    //setCurrentTemplate(template);
                    let s = JSON.stringify(template);
                    console.log('Template '+s);
                    try{
                        const op = new Module.Operation(s);
                        // apply operation
                        check = dataprocess.apply(op);
                        op.delete();

                    } catch {
                        console.log("Error with template");
                    }
                                    
                    if(check) {
                        success(dataprocess);
                    } else {
                        failure(dataprocess);
                    }
                });
            }
            const todoAfterOperationApplied = (dataprocess) => {
                console.log("LOG OK:"+dataprocess.logfile());
                
                 // get results
                const dataset_out = dataprocess.getOutputDataset();
                // get data anaytics
                let data_analytics: any[] = [{label:'', value:0}];
                // result flag (true is we have an averagin curve)
                let result_flag = false;
                // get curves
                for(let curve_idx=0;curve_idx<newCurves.length;curve_idx++){
                    const curve_out = dataset_out.getCurve(newCurves[curve_idx].name);
                    // get Xs, Ys
                    //console.log("new points");
                    let vecX_out = curve_out.getX();
                    let vecY_out = curve_out.getY();
                    //console.log("new size: "+vecX_out.size());
        
                    // update newCurves
                    const x_new = [];
                    const y_new = [];
                    for(let i=0; i< vecX_out.size(); i++){
                        x_new.push(vecX_out.get(i));
                        y_new.push(vecY_out.get(i));
                    }
                    // update selected curves
                    if(newCurves[curve_idx].selected){
                        // reset x and y
                        newCurves[curve_idx].x.length = 0;
                        newCurves[curve_idx].y.length = 0;
                        // update x and y array
                        newCurves[curve_idx].x = [...x_new];
                        newCurves[curve_idx].y = [...y_new];
                    }
                    // delete C++ object
                    curve_out.delete();
                    vecX_out.delete();
                    vecY_out.delete();
                }
                let error_in_data_analytics = false;
                let error_msg_in_data_analytics = '';
                if(dataset_out.hasCurve('averaging')){
                    result_flag = true;
                    const curve_out = dataset_out.getCurve('averaging');
                    let vecX_out = curve_out.getX();
                    let vecY_out = curve_out.getY();
                    const x_avg = [];
                    const y_avg = [];
                    for(let i=0; i< vecX_out.size(); i++){
                        x_avg.push(vecX_out.get(i));
                        y_avg.push(vecY_out.get(i));
                    }
                    const curve_average = { x: x_avg, y: y_avg, name: 'average', selected: true, opacity: 1};
                    newCurves.push(curve_average)
                    curve_out.delete();
                    vecX_out.delete();
                    vecY_out.delete();

                    // DataAnaytics 
                    let young = 0;
                    let yield_strength = 0;
                    let yield_strain = 0;
                    let strain_at_break = 0;
                    let stress_at_break = 0;
                    let strain_at_ultimate_strength = 0;
                    let stress_at_ultimate_strength = 0;
                    let proportional_limit_strain = 0;
                    const dp_data = new Module.DataProcess(dataset_out);                
                    const op_slope = new Module.Operation(Module.ActionType.DATA_ANALYTICS,Module.MethodType.NONE);
                    op_slope.addParameterString("stiffness","averaging");
                    op_slope.addParameterString("last_point","averaging");
                    op_slope.addParameterString("point_max_y","averaging");
                    op_slope.addParameterString("offset_yield_strength","averaging");
                   // op_slope.addParameterString("slope_range","first_point"); // not use range to avoid not enough points
                    op_slope.addParameterString("proportional_limit","averaging");

                    const check = dp_data.apply(op_slope); 
                    console.log("LOG: "+dp_data.logfile());
                    if(!check){
                        error_in_data_analytics = true;
                        error_msg_in_data_analytics = dp_data.getErrorMessage();
                        console.log("ERROR: "+error_msg_in_data_analytics);
                    }
                    else {
                        const report_test = dp_data.getReport();
                        const stiffness = report_test.getPropertyFirst(Module.ActionType.DATA_ANALYTICS,"averaging","stiffness");
                        young = stiffness.toExponential(precision);
                        const offset_yield_strength = report_test.getPropertySecond(Module.ActionType.DATA_ANALYTICS,"averaging","offset_yield_strength");
                        const offset_yield_strain = report_test.getPropertyFirst(Module.ActionType.DATA_ANALYTICS,"averaging","offset_yield_strength");
                        yield_strength = offset_yield_strength.toExponential(precision);
                        yield_strain = offset_yield_strain.toExponential(precision);
                        const last_point_x = report_test.getPropertyFirst(Module.ActionType.DATA_ANALYTICS,"averaging","last_point");
                        const last_point_y = report_test.getPropertySecond(Module.ActionType.DATA_ANALYTICS,"averaging","last_point");
                        strain_at_break = last_point_x.toExponential(precision);
                        stress_at_break = last_point_y.toExponential(precision);
                        const point_max_y_x = report_test.getPropertyFirst(Module.ActionType.DATA_ANALYTICS,"averaging","point_max_y");
                        const point_max_y_y = report_test.getPropertySecond(Module.ActionType.DATA_ANALYTICS,"averaging","point_max_y");
                        strain_at_ultimate_strength = point_max_y_x.toExponential(precision);
                        stress_at_ultimate_strength = point_max_y_y.toExponential(precision);
                        const proportional_limit = report_test.getPropertyFirst(Module.ActionType.DATA_ANALYTICS,"averaging","proportional_limit");
                        proportional_limit_strain = proportional_limit.toExponential(precision);

                    }
        
                    data_analytics.length = 0;
                    data_analytics.push({label: "Young's Modulus", value: young, name: "young", hide: false});
                    data_analytics.push({label: "Yield Strength", value: yield_strength, name: "yield_strength", hide: false});
                    data_analytics.push({label: "Yield Strain", value: yield_strain, name: "yield_strain", hide: true});
                    data_analytics.push({label: "Proportional limit", value: proportional_limit_strain, name: "proportional_limit_strain", hide: true});
                    data_analytics.push({label: "Strain at Break", value: strain_at_break, name: "strain_at_break", hide: false});
                    data_analytics.push({label: "Strength at Break", value: stress_at_break, name: "stress_at_break", hide: false});
                    data_analytics.push({label: "Strain at Ultimate Strength", value: strain_at_ultimate_strength, name: "strain_at_ultimate_strength", hide: false});
                    data_analytics.push({label: "Strength at Ultimate Strength", value: stress_at_ultimate_strength, name: "stress_at_ultimate_strength", hide: false});
                    op_slope.delete();
                    dp_data.delete();
                }

                // update the state with the new curves
                //console.log("UPDATE STATE");
                dispatch(actions.updateCurves(group_id,newCurves,data_analytics,result_flag));
                // flag status operation
                // replace by a useReducer
                const allOpsUp = [...allOperations];
                const operationsUpdate = allOpsUp[group_id].operations;
                if(action==='Template'){
                    operationsUpdate.forEach( e => e.status='success');
                } else {
                    const ind = operationsUpdate.findIndex( (el) => el.action === action);
                    for(let i=0; i <= ind; i++){
                        operationsUpdate[i].status = 'success';
                    }
                    for(let i = ind+1; i<operationsUpdate.length; i++){
                        operationsUpdate[i].status = 'waiting';
                    }
                }
                // update for data anayltics
                if(error_in_data_analytics){
                    operationsUpdate[operationsUpdate.length-1].status = 'failed';
                    operationsUpdate[operationsUpdate.length-1].error = error_msg_in_data_analytics;
                }
                allOpsUp[group_id]={gid:group_id, operations: operationsUpdate};
                setAllOperations(allOpsUp);          
            }

            const todoOperationFailed = (dataprocess) => {
                const report = dataprocess.getReport();
                const log = report.executionLog();
                console.log("REPORT :"+log);
                console.log("ERROR KO"+dataprocess.getErrorMessage());
                console.log("LOG OK:"+dataprocess.logfile());
                // flag status operation
                // replace by a useReducer
                const allOpsUp = [...allOperations];
                const operationsUpdate = allOpsUp[group_id].operations;
                const error_msg = dataprocess.getErrorMessage();
                let action_error = action;
                if(action==='Template'){
                    // find the action name from the error message,i f not found put on the last action
                    const err =  dataprocess.getErrorMessage();
                    const i0 = err.indexOf('[');
                    const i1 = err.indexOf(']');
                    let action: string="";
                    if(i0!==-1&&i1!==-1) {
                        action_error = err.substring(i0+1,i1);
                    }
                    else {
                        action_error = operationsUpdate[operationsUpdate.length-1].action;
                    }
                }
                if(action_error==="Extrapoling")
                    action_error = "Averaging";
                operationsUpdate.find( (el) => el.action === action_error).status = 'failed';
                operationsUpdate.find( (el) => el.action === action_error).error = error_msg;
                allOpsUp[group_id]={gid:group_id, operations: operationsUpdate};
                setAllOperations(allOpsUp);
            }

            const promise = applyOperation(dataprocess);
            promise.then(todoAfterOperationApplied,todoOperationFailed).then( () => {
                    post();
                });
        });
        
    };

    // ----Functions for Operation---
    // initialize the Operations state with a dataclean input json file
    // Several diffences between structure of Operations and template file
    // - in Operations value is always a number, for string value the value is a index in a selection array
    // - no Extrapolation action in Operations, it is inside Averaging
    const initOperationsFromTemplate = (template: any, nbGroups: number) => {
        // console.log("initOperationsFromTemplate");
        // console.log(template.operations);
        if(template.operations.length>1){
            // manage Averaging to put extrapolation parameters
            const op_avg = template.operations.find( op => op.action === "Averaging");
            const op_extr = template.operations.find( op => op.action === "Extrapoling");
            if(op_extr){
                op_avg.parameters.push( {extrapolation: op_extr.method.toLowerCase()} );
                op_extr.parameters.forEach( par => op_avg.parameters.push(par) );
            }

            const operationsUpdated = clone(operationsType); // efficient deep copy

            template.operations.forEach( (elem,index) => {
                // check if Action and Operations in template file are found in local operations
                const op_index = operationsType.findIndex( op => op.action === elem.action );
                let params_extrapolating: object[] = [];
                if(op_index!==-1){
                    const op = operationsType[op_index];
                    const meth_index = op.methods.findIndex( met => met.type === elem.method);
                    if(meth_index!==-1){
                        // update local operations with template file    
                        if('parameters' in elem) { // some operation has no parameters
                            const params_input= elem.parameters;
                            
                            const param_cur = operationsUpdated[op_index].methods[meth_index].params;
                            const param_new = [];
                            for(let i=0; i<param_cur.length;i++ ){
                                const name_c = param_cur[i].name;
                                const param_temp = params_input.find( p => Object.keys(p)[0]===name_c);
                                if(param_temp !== undefined ){ // param found in the input template
                                    let param_value = Object.values(param_temp)[0];
                                    if(param_cur[i].selection){
                                        param_value = param_cur[i].selection.findIndex( e => e.name===param_value)
                                    }
                                    const new_param ={...param_cur[i], value: param_value};
                                    param_new.push(new_param);
                                } else { // keep the default
                                    const default_param={...param_cur[i]};
                                    param_new.push(default_param);
                                }
                            }
                            operationsUpdated[op_index].methods[meth_index].params.length = 0;
                            operationsUpdated[op_index].methods[meth_index].params = param_new;
                        }
                        operationsUpdated[op_index].selected_method = elem.method;
                    } else if(elem.action!=='Extrapoling')
                        throw new Error("ERROR in tensile template: method not recognized.");
                } else if (elem.action!=='Extrapoling'){
                    throw new Error("ERROR in tensile template: action not recognized.");
                }
            });
            console.log("Number groups:"+nbGroups);
            //setOperations(operationsUpdated); 

            let opsAllup = new Array<Operations>();
            for(let i =0; i<nbGroups; i++){
                const ops = clone(operationsUpdated);
                opsAllup.push( { gid: i, operations: ops});
            }
            setAllOperations(opsAllup);

            // // check if we must show the markers
            // const op_clean = template.operations.find( op => op.action === "Cleaning_ends");
            // if(op_clean.method === "Max_Xs"){
            //     setShowMarkers(true); 
            //     updatePlotHandler();
            // }

        }
    }

    return [data,dispatch,
            interpolationData,
            setOperationsType,
            allOperations,setAllOperations,
            convertToTrue,updatedCurve,failureInterpolation,adjustCurves,cancelAdjustCurves,
            initOperationsFromTemplate] as const; // as const to ensure argument order not guaranteed
};

export default useModel;