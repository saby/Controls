import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/SkipItem/SkipItem';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

const READONLY_ITEMS_KEYS = [2, 3];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _currentEditingIndex: number = null;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    private _getItemTemplateClasses(item: Model): string {
        if (READONLY_ITEMS_KEYS.indexOf(item.getKey()) !== -1) {
            return 'js-controls-ListView__notEditable controlsDemo__list__editInPlace__skipItem__notEditable';
        }
        return '';
    }

    protected _onBeforeBeginEdit(e, options) {
        const item: Model = options?.item;
        if (item && READONLY_ITEMS_KEYS.indexOf(item.getKey()) !== -1) {
            const isGoingFront = this._currentEditingIndex < this._getIndex(item);
            return isGoingFront ? 'GoToNext' : 'GoToPrev';
        }
    }

    protected _onAfterBeginEdit(e, item) {
        this._currentEditingIndex = this._getIndex(item);
    }

    private _getIndex(item): number {
        const items = this._children.list.getItems();
        return items.getIndex(items.getRecordById(item.getKey()));
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
