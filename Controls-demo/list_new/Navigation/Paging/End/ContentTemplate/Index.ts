import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/Paging/End/ContentTemplate/ContentTemplate';
import {Memory} from 'Types/source';
import {generateData} from '../../../../DemoHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';
import {CrudEntityKey} from 'Types/source';

interface IItem {
    title: string;
    id: number;
    keyProperty: string;
    count: number;
}

const MAX_ELEMENTS_COUNT: number = 100;
const SCROLL_TO_ITEM: number = 95;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _dataArray: unknown = generateData({
        count: MAX_ELEMENTS_COUNT, beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.id}.`;
        }
    });
    protected _textInfo: string = '';
    protected _count: number;

    protected _beforeMount(): void {
        this._count = MAX_ELEMENTS_COUNT - 1;
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    protected _updateCount(e: SyntheticEvent, key: CrudEntityKey): void {
        this._count = MAX_ELEMENTS_COUNT - 1 - Number(key);
    }

    protected _onPagingArrowClick(event: SyntheticEvent, arrow: string): boolean {
        switch (arrow) {
            case 'End':
                this._textInfo = `Нажали кнопку "в конец" скролим к ${SCROLL_TO_ITEM} элементу`;
                break;
        }
        this._children.list.scrollToItem(SCROLL_TO_ITEM, true, true);
        return false;
    }

    protected _clear(): void {
        this._textInfo = '';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
