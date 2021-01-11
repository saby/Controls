import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/operations/SimpleMultiSelector/Template';
import {Memory} from 'Types/source';
import {Gadgets} from 'Controls-demo/treeGrid/DemoHelpers/DataCatalog';

export default class MultiSelectorCheckboxDemo extends Control {
    _template: TemplateFunction = template;
    _viewSource: Memory = null;
    _gridColumns = null;
    _filter = null;
    _selectedKeys = null;
    _excludedKeys = null;

    _beforeMount(): void {
        this._selectedKeys = [];
        this._excludedKeys = [];
        this._filter = {};
        this._gridColumns = Gadgets.getGridColumnsForFlat();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
