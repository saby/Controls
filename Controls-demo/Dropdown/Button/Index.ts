import {Control, TemplateFunction} from "UI/Base";
import {Memory} from 'Types/source';
import {createMemory} from 'Controls-demo/Buttons/Menu/historySourceMenu';
import controlTemplate = require('wml!Controls-demo/Dropdown/Button/Index');

export default class extends Control{
    protected _template: TemplateFunction = controlTemplate;
    private _source: Memory;
    _beforeMount() {
        this._source = createMemory();
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
