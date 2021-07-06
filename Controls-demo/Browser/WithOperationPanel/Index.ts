import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Browser/WithOperationPanel/template';
import 'css!Controls-demo/Controls-demo';
import {getListData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import {getPanelData, getAddedData} from './OperationsUtils';
import {IColumn} from 'Controls/grid';
import * as TreeMemory from 'Controls-demo/List/Tree/TreeMemory';
import 'wml!Controls-demo/OperationsPanelNew/Templates/PersonInfo';
import 'css!Controls/CommonClasses';
import 'css!Controls-demo/OperationsPanelNew/Index';
import {IAction} from 'Controls/actions';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _selectedKeys: string[] = [];
    protected _excludedKeys: string[] = [];
    protected _operationsItems: IAction[] = getPanelData();
    protected _addedOperationsItems: IAction[] = getAddedData();

    protected _source: TreeMemory = new TreeMemory({
        keyProperty: 'id',
        data: getListData()
    });
    protected _gridColumns: IColumn = [{
        template: 'wml!Controls-demo/OperationsPanelNew/Templates/PersonInfo'
    }];
    protected _panelSource = getPanelData();

    protected _selectedKeysChanged(event, keys): void {
        if (keys.length && !this._operationsItems.find((item) => item.id === 'sum')) {
            this._operationsItems = this._operationsItems.concat(this._addedOperationsItems);
        }
    }
}
