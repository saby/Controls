import {Control, TemplateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls-demo/operations/SelectedCountConfig/SelectedCountConfig';
import {Memory} from 'Types/source';
import {default as CountSource} from 'Controls-demo/operations/resources/Source';
import {Gadgets} from 'Controls-demo/treeGrid/DemoHelpers/DataCatalog';
import 'css!Controls-demo/Controls-demo';

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
        this._gridColumns = Gadgets.getGridColumnsForFlat();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
        this._selectedCountConfig = {
            rpc: new CountSource({
                data: Gadgets.getFlatData()
            }),
            command: 'demoGetCount',
            data: {
                filter: this._filter
            }
        };
    }
};
