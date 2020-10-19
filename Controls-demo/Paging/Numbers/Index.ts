import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Paging/Numbers/Numbers';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _arrowState: any;
    protected _selectedPage: number = 1;
    protected _pagesCount: number = 5;
    protected _elementsCount: number = 99;

    protected _beforeMount(): void {
        this._arrowState = {
            begin: 'visible',
            next: 'hidden',
            prev: 'hidden',
            end: 'visible'
        };
    }

    protected _onElementsCount() {
        this._elementsCount = this._elementsCount ? 0 : 99;
    }

    protected _selectedPageChanged(event, page) {
        this._selectedPage = page;
    }

    protected _onPagingArrowClick(event, state) {
        if (state === 'Begin') {
            this._selectedPage = 1;
        } else {
            this._selectedPage = this._pagesCount;
        }
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
