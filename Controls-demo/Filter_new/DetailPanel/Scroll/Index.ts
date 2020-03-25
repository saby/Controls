import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/DetailPanel/Scroll/Scroll';
import {getItems} from 'Controls-demo/Filter_new/resources/FilterItemsStorage';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Filter_new/Filter';
import {SyntheticEvent} from 'Vdom/Vdom';
import {object} from 'Types/util';
import {constants} from 'Env/Env';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _source: unknown[] = [];
    protected _resourceRoot: string = constants.resourceRoot;

    protected _beforeMount(): void {
        this._source = getItems();
    }
    protected _itemsChangedHandler(event: SyntheticEvent, items: unknown[]): void {
        this._source = object.clone(items);
    }
}
