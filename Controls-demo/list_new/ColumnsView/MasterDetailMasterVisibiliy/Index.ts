import { Control, TemplateFunction } from 'UI/Base';
import template = require('wml!Controls-demo/list_new/ColumnsView/MasterDetailMasterVisibiliy/MasterDetailMasterVisibiliy');
import * as data from 'Controls-demo/DragNDrop/MasterDetail/Data';
import {HierarchicalMemory} from 'Types/source';
import { IColumn } from 'Controls/grid';

export default class RenderDemo extends Control {
    protected _template: TemplateFunction = template;
    protected gridColumns: IColumn[] = [{
        displayProperty: 'name',
        width: '1fr'
    }];
    protected _detailSource: HierarchicalMemory;
    protected _masterSource: HierarchicalMemory;
    protected _currentIcon: string = 'ArrangeList04';
    protected _masterVisibility: string = null;

    protected _beforeMount(): void {

        this._detailSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: data.detail
        });

        this._masterSource = new HierarchicalMemory({
            keyProperty: 'id',
            parentProperty: 'parent',
            data: data.master
        });
    }
    protected _toggleMaster(): void {
        this._currentIcon = this._currentIcon === 'ArrangeList04' ? 'ArrangeList03' : 'ArrangeList04';
        this._masterVisibility = this._masterVisibility === 'hidden' ? 'visible' : 'hidden';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/DragNDrop/MasterDetail/MasterDetail'];
}
