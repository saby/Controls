import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/DetailPanel/HistoryId/Default/Default';
import 'Controls-demo/Filter_new/resources/HistorySourceDemo';
import {getHistoryItems} from 'Controls-demo/Filter_new/resources/FilterItemsStorage';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
    protected _source: unknown[] = [];

    protected _beforeMount(): void {
        this._source = getHistoryItems();
    }
}
