import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/FilterView/Source/AdditionalTemplateProperty/AdditionalTemplateProperty';
import 'Controls-demo/Filter_new/resources/HistorySourceDemo';
import {getItems} from 'Controls-demo/Filter_new/resources/FilterItemsStorage';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Filter_new/Filter';
import {SyntheticEvent} from 'Vdom/Vdom';
import {object} from 'Types/util';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _source: unknown[] = [];

    protected _beforeMount(): void {
        this._source = getItems();
    }

    protected _itemsChangedHandler(event: SyntheticEvent, items: unknown[]): void {
        this._source = object.clone(items);
    }
}
