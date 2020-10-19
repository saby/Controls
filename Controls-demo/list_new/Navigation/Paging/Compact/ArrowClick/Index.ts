import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/Paging/Compact/ArrowClick/ArrowClick';
import {Memory} from 'Types/source';
import {generateData} from '../../../../DemoHelpers/DataCatalog';

interface IItem {
    title: string;
    id: number;
    keyProperty: string;
    count: number;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _dataArray: unknown = generateData({
        count: 100, beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.id}.`;
        }
    });
    private _isScroll: boolean = false;
    private _isScrollCenter: boolean = false;
    private _textInfo: string = '';

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    protected _onPagingArrowClick(event, arrow) {
        switch (arrow) {
            case 'Begin':
                this._textInfo = 'Нажали кнопку "в начало"';
                break;
            case 'End':
                this._textInfo = 'Нажали кнопку "в конец"';
                break;
        }
        if (this._isScrollCenter) {
            this._children.list.scrollToItem(50, false, true);
            return false;
        }
        if (this._isScroll) {
            return false;
        }
    }

    protected _clear() {
        this._textInfo = '';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
