import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/Paging/Edges/Edges';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';
import {CrudEntityKey} from 'Types/source';

interface IItem {
    title: string;
    key: number;
    keyProperty: string;
    count: number;
}

const MAX_ELEMENTS_COUNT: number = 100;
const SCROLL_TO_ITEM: number = 95;

/**
 * Отображение пейджинга с одной командой прокрутки.
 * Отображается только кнопка в конец, а также произвольный шаблон.
 */
export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _dataArray: unknown = generateData({
        count: MAX_ELEMENTS_COUNT, beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.key}.`;
        }
    });
    protected _textInfo: string = '';
    protected _count: number;

    protected _beforeMount(): void {
        this._count = MAX_ELEMENTS_COUNT - 1;
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: this._dataArray
        });
    }

    /**
     * Обновляем количество непрочитанных записей
     * @param {SyntheticEvent} e
     * @param {EntityKey} key
     * @private
     */
    protected _updateCount(e: SyntheticEvent, key: CrudEntityKey): void {
        this._count = MAX_ELEMENTS_COUNT - 1 - Number(key);
    }

    /**
     * Обрабатываем нажатие на кнопку пэйджинга, и всегда скролим к определенному элементу списка
     * @param {SyntheticEvent} event
     * @param {string} arrow
     * @return {boolean}
     * @private
     */
    protected _onPagingArrowClick(event: SyntheticEvent, arrow: string): boolean {
        switch (arrow) {
            case 'End':
                this._textInfo = `Нажали кнопку "в конец" скролим к ${SCROLL_TO_ITEM} элементу`;
                this._children.list.scrollToItem(SCROLL_TO_ITEM, true, true);
                this._updateCount(null, SCROLL_TO_ITEM);
                return false;
            case 'Begin':
                this._updateCount(null, 0);
        }
    }

    protected _clear(): void {
        this._textInfo = '';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
