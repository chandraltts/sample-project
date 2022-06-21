import React, {useState} from 'react';
import { Table, Space, Tooltip} from 'antd'
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { MenuOutlined, LineOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from 'array-move';
import { Data } from '../../containers/PlotBuilder/Model/data.model';
import { colors } from '../../assets/colors.js';
import './PropertyTable.css';

interface IPropertyTable {
    data: Data;
    setSortedTable: (data: any) => void;
};


const PropertyTable: React.FC<IPropertyTable> = (props) => {
    //---------STATE-----------------------------------
    const { data, setSortedTable} = props;

    const DisplayDataAll = () => {

        // check if we have results to display
        const gid = props.data.groups.findIndex( g => g.result);
        if(gid===-1)
            return <div></div>;
        
        let columns: any[] = [ {title: '',dataIndex: 'sort', width:'1em', className: 'drag-visible', key: 'sort', render: (value,row,index) => <DragHandle value={value} row={row} index={index}/>},
                                {title: 'Curve', dataIndex: 'curve',ellipsis: true , className: 'drag-visible',  key: 'curve'}];
        // data
        let allResults = false;
        allResults = true;
        let datasource: any[] = [];
        if(data.sortedTable.length===0){
            props.data.groups.forEach( (g,idg: number) => {
            const row = { curve: g.label , key: idg.toString(), index: idg, style: {textAlign: 'center'}};
            g.data.forEach( (p,idp) => {
                let tmp: string;
                if(p.hide===false){
                    tmp =  p.value.toString();
                     if(p.range){
                        tmp += " [" + p.range[0] + " : " + p.range[1] + "]";
                     } 
                    Object.assign(row, { [p.name.toString()]: tmp});
                }
            });
            datasource.push(row);
            });
        } else {
            datasource = [...data.sortedTable];
            props.data.groups.forEach( (g,idg: number) => {
            const r = datasource.find( r => r.index===idg);
            g.data.forEach( (p,idp) => {
                if(p.hide===false) {
                    let tmp =  p.value.toString();
                     if(p.range){
                        tmp += " [" + p.range[0] + " : " + p.range[1] + "]";
                     } 
                    r[p.name] = tmp;
                }
            });
            });
        }
        // build a table for column color
        const paramVec: {name: string, value: number[]}[]  = [];
        props.data.groups[gid].data.forEach( (p,ind) => {
            if(p.hide===false){
                paramVec.push( {name: p.name, value: []});
            }
        });
        datasource.forEach( g => {
            for(const r of paramVec){
                if(g[r.name]){
                    let val = g[r.name];
                    const id = val.indexOf("[");
                    if(id!==-1){
                        val = val.slice(0,id);
                    } 
                    r.value.push(+val);
                }
            }
        });
        
        const columnColor = paramVec.map( r => {
            const monotonus_inc = r.value.every( (e,i,a) => {if(i) return e >= a[i-1]; else return true;});
            const monotonus_dec = r.value.every( (e,i,a) => {if(i) return e <= a[i-1]; else return true;});
            if(monotonus_inc ||monotonus_dec) 
                return {name: r.name, color: "green"};
            else 
                return {name: r.name, color: "red"};
        });
        const columnStyle = (paramName: string) => {
            const e = columnColor.find( r => r.name===paramName);
            if(e)
            return { color: e.color, textAlign: 'center'};
            else
            return {};
        };
                                
        props.data.groups[gid].data.forEach( (p,ind) => {
            if(p.hide===false)
            columns.push({title: p.label, dataIndex: p.name, width: '6em', ellipsis: { showTitle: false }, render(text,record) {
                let tooltip_value = text;
                let cell_value = text;
                if(text){
                    const id = text.indexOf("[");
                    if(id!==-1){
                        cell_value = text.slice(0,id);
                        tooltip_value = text.slice(id);
                    } 
                }
                return {
                        props: {
                        style: columnStyle(p.name)
                        },
                       // children: <div>{text}</div>
                       children: <Tooltip title={tooltip_value}>{cell_value}</Tooltip>
                    };
            }});
        });
        
        const DragHandle = SortableHandle((e) => 
          <LineOutlined style={{ fontSize: '16px', verticalAlign: 'middle', color: colors[e.row.index] }} onChange={undefined}/>
          //<MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
        );
        const SortableItem = SortableElement(props => <tr {...props} />);
        const SortableContainer2 = SortableContainer(props => <tbody {...props} />);
        
        class SortableTable extends React.Component {
            state = {
            dataSource: datasource,
            };
        
            onSortEnd = ({ oldIndex, newIndex }) => {
            const { dataSource } = this.state;
            if (oldIndex !== newIndex) {
                const newData = arrayMoveImmutable([].concat(dataSource), oldIndex, newIndex).filter(el => !!el);
                this.setState({ dataSource: newData });
                setSortedTable(newData);
            }
            };
        
            DraggableContainer = props => (
            <SortableContainer2
                useDragHandle
                disableAutoscroll
                helperClass="row-dragging"
                onSortEnd={this.onSortEnd}
                {...props}
            />
            );
        
            DraggableBodyRow = ({ className, style, ...restProps }) => {
            const { dataSource } = this.state;
            // function findIndex base on Table rowKey props and should always be a right array index
            const index = dataSource.findIndex(x => x.index === restProps['data-row-key']);
            return <SortableItem index={index} {...restProps} />;
            };
        
            render() {
            const { dataSource } = this.state;
        
            return (
                <Table
                pagination={false}
                size='small' bordered={true}
                dataSource={dataSource}
                scroll={{ x: "max-content"}}
                columns={columns}
                rowKey="index"
                components={{
                    body: {
                    wrapper: this.DraggableContainer,
                    row: this.DraggableBodyRow,
                    },
                }}
                />
            );
            }
        }
        
        return <SortableTable/>
        }
    
    return (
        <>
        <div style={{width: '100%', borderStyle: 'solid', borderWidth: '0px', borderColor: '#d9d9d9', margin: 'auto', padding: '0px'}}>
          <DisplayDataAll/>
        </div>
        </>  
    );
    
};

export default PropertyTable;