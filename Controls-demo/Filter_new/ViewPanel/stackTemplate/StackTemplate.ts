import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/Filter_new/ViewPanel/stackTemplate/StackTemplate';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;
    private _filter: object = {};

    protected _beforeMount(options): void {
        this._source = new Memory({
            keyProperty: 'id',
            data: options.items
        });
    }

    static _theme: string[] = ['Controls/Classes'];
}
