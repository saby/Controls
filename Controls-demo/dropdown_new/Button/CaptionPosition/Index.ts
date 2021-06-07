import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/dropdown_new/Button/CaptionPosition/Index';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _source: Memory;

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                { key: 1, title: 'Add' },
                { key: 2, title: 'Vacation' },
                { key: 3, title: 'Time off' },
                { key: 4, title: 'Hospital' },
                { key: 5, title: 'Business trip' }
            ]
        });
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
