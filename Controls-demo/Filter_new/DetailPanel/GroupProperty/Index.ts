import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Filter_new/DetailPanel/GroupProperty/GroupProperty';
import {getItemsWithGroup} from 'Controls-demo/Filter_new/resources/FilterItemsStorage';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _items: unknown[] = [];

    private _resolveTemplates(items: any): Promise<any> {
        const resultTemplates = [];
        items.forEach((item) => {
            if (item.additionalTemplate) {
                resultTemplates.push(import(item.additionalTemplate));
            }
            if (item.itemTemplate) {
                resultTemplates.push(import(item.itemTemplate));
            }
        });
        return Promise.all(resultTemplates).then(() => null);
    }

    protected _beforeMount(): Promise<any> {
        this._items = getItemsWithGroup();
        return this._resolveTemplates(this._items);
    }

    static _styles: string[] = ['Controls-demo/Controls-demo', 'Controls-demo/Filter_new/Filter'];
}
