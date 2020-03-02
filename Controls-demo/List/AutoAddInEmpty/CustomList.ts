import {Control, TemplateFunction} from "UI/Base"
import * as template from "wml!Controls-demo/List/AutoAddInEmpty/CustomList"
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = template;
    protected _addingItem: Model | null = null;

    protected _beforeMount(newOptions) {
        this._addingItem = newOptions.items.getCount() ? null : new Model({
            keyProperty: 'id',
            rawData: {
                id: 1001,
                title: 'New element'
            }
        });
    }
}
