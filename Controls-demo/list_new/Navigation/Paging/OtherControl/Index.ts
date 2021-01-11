import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/Paging/OtherControl/OtherControl';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';
import {CrudEntityKey} from 'Types/source';

interface IArrowState {
    begin: string;
    prev: string;
    next: string;
    end: string;
}

interface IItem {
    title: string;
    id: number;
    keyProperty: string;
    count: number;
}

const MAX_ELEMENTS_COUNT: number = 50;

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _dataArray: unknown = generateData({
        count: MAX_ELEMENTS_COUNT, beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с ключом ${item.id}.`;
        }
    });
    private _arrowState: IArrowState;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });

        this._arrowState = {
            begin: 'readonly',
            next: 'hidden',
            prev: 'hidden',
            end: 'visible'
        };
    }

    _updatePagingArrow(event: SyntheticEvent, key: CrudEntityKey): void {
        if (key > 0) {
            this._arrowState.begin = 'visible';
        } else {
            this._arrowState.begin = 'readonly';
        }
        if (key === '49') {
            this._arrowState.end = 'readonly';
        } else {
            this._arrowState.end = 'visible';
        }
        this._arrowState = {...this._arrowState};
    }

    protected _onPagingArrowClick(event: SyntheticEvent, arrow: string): boolean {
        switch (arrow) {
            case 'Begin':
                this._children.list.scrollToItem(0, true, true);
                this._arrowState.begin = 'readonly';
                this._arrowState.end = 'visible';
                break;
            case 'End':
                this._children.list.scrollToItem(MAX_ELEMENTS_COUNT - 1, true, true);
                this._arrowState.begin = 'visible';
                this._arrowState.end = 'readonly';
                break;
        }
        this._arrowState = {...this._arrowState};
        return false;
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/list_new/Navigation/Paging/OtherControl/styles'
    ];
}
