import {Control, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls-demo/breadCrumbs_new/ClickHandler/ClickHandler';
import {Model} from 'Types/entity';

export default class extends Control {
    protected _template: TemplateFunction = template;
    private _readOnly: boolean = false;
    private _items: Model[];
    private _pathWrapperClickCount: number = 0;
    private _itemClickCount: number = 0;
    private _pathClickCount: number = 0;

    protected _beforeMount(): void {
            this._items = [
                { id: 1, title: 'Первая папка', parent: null },
                { id: 2, title: 'Вторая папка', parent: 1 },
                { id: 3, title: 'Третья папка', parent: 2 }
            ].map((item) => {
                return new Model({
                    rawData: item,
                    keyProperty: 'id'
                });
            });
    }

    _onPathWrapperClick(): void {
        this._pathWrapperClickCount++;
    }

    _onPathClick(): void {
        this._pathClickCount++;
    }

    _onItemClick(): void {
        this._itemClickCount++;
    }
}
