import {Control} from 'UI/Base';
import * as template from 'wml!Controls-demo/operations/SelectedCountConfig/SelectedCountConfig';
import {Memory} from 'Types/source';
import {default as CountSource} from 'Controls-demo/operations/resources/Source';
import { Flat } from 'Controls-demo/treeGridNew/DemoHelpers/Data/Flat';

export default class extends Control {
    _template = template;
    _gridColumns = null;
    _viewSource = null;
    _selectedCountConfig = null;
    _filter = null;
    _selectedKeys = null;
    _excludedKeys = null;

    _beforeMount() {
        this._selectedKeys = [];
        this._excludedKeys = [];
        this._filter = {};
        this._gridColumns = Flat.getColumns();
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Flat.getData()
        });
        this._selectedCountConfig = {
            rpc: new CountSource({
                data: Flat.getData()
            }),
            command: 'demoGetCount',
            data: {
                filter: this._filter
            }
        };
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
};
