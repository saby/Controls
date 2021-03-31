import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/SkipItem/SkipItem';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';
import {editing} from 'Controls/list';

const READONLY_ITEMS_KEYS = [2, 3];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    private _getItemTemplateClasses(item: Model): string {
        if (READONLY_ITEMS_KEYS.indexOf(item.getKey()) !== -1) {
            return 'controlsDemo__list__editInPlace__skipItem__notEditable';
        }
        return '';
    }

    protected _onBeforeBeginEdit(e, options) {
        const item: Model = options?.item;
        if (item && READONLY_ITEMS_KEYS.indexOf(item.getKey()) !== -1) {
            return editing.CANCEL;
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
