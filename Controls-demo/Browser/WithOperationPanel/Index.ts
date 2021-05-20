import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import { SyntheticEvent } from 'UICommon/Events';
import * as template from 'wml!Controls-demo/Browser/WithOperationPanel/template';
import 'css!Controls-demo/Controls-demo';
import {getPanelData, getListData} from 'Controls-demo/OperationsPanelNew/DemoHelpers/DataCatalog';
import {IColumn} from 'Controls/grid';
import * as TreeMemory from 'Controls-demo/List/Tree/TreeMemory';
import 'wml!Controls-demo/OperationsPanelNew/Templates/PersonInfo';
import 'css!Controls/CommonClasses';
import 'css!Controls-demo/OperationsPanelNew/Index';

export default class extends Control<IControlOptions> {
    protected _template: TemplateFunction = template;
    protected _selectedKeys: string[] = [];
    protected _excludedKeys: string[] = [];
    protected _operationsItems = getPanelData();

    protected _source: TreeMemory = new TreeMemory({
        keyProperty: 'id',
        data: getListData()
    });
    protected _gridColumns: IColumn = [{
        template: 'wml!Controls-demo/OperationsPanelNew/Templates/PersonInfo'
    }];
    protected _panelSource = getPanelData();

    protected _selectedKeysChanged(event: SyntheticEvent, keys: string[]): void {
        this._selectedKeys = keys;
    }

    protected _excludedKeysChanged(event: SyntheticEvent, keys: string[]): void {
        this._excludedKeys = keys;
    }
}
