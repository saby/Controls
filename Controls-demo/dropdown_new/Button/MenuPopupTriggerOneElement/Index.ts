import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import controlTemplate = require('wml!Controls-demo/dropdown_new/Button/MenuPopupTriggerOneElement/Index');

export default class extends Control {
    protected _template: TemplateFunction = controlTemplate;
    protected _source: Memory;
    protected _chosenItem: string = '';

    protected _beforeMount(): void {
        this._source = new Memory({
            keyProperty: 'key',
            data: [
                {key: 1, title: 'Ярославль'}
            ]
        });
    }

    protected _menuItemActivate(event: Event, item: Model): void {
        this._chosenItem = JSON.stringify(item.getRawData());
    }

    protected _clear(): void {
        this._chosenItem = '';
    }

    static _theme: string[] = ['Controls/Classes'];
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
