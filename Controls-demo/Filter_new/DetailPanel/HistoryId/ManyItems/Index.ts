import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/DetailPanel/HistoryId/ManyItems/ManyItems';
import 'Controls-demo/Filter_new/resources/HistorySourceDemo';
import {getHistoryItems} from 'Controls-demo/Filter_new/resources/FilterItemsStorage';
import 'css!Controls-demo/Controls-demo';
import 'css!Controls-demo/Filter_new/Filter';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _source: unknown[] = [];

    protected _beforeMount(): void {
        this._source = getHistoryItems();
    }
}
