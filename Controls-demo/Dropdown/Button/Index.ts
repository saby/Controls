import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import {_createMemory} from 'Controls-demo/Dropdown/DemoHelpers/DataCatalog';
import controlTemplate = require('wml!Controls-demo/Dropdown/Button/Index');
import 'css!Controls-demo/Controls-demo';

export default class extends Control{
    protected _template: TemplateFunction = controlTemplate;
    private _source: Memory;
    _beforeMount() {
        this._source = _createMemory();
    }
}
