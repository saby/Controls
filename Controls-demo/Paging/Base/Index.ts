import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/Paging/Base/Base';
import * as ContentTemplate from 'wml!Controls-demo/Paging/Base/contentTemplate';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _arrowState: any;
    protected _contentTemplate: Function = null;

    protected _beginBtnText: string = 'Кнопка begin в readonly';
    protected _prevBtnText: string = 'Кнопка prev в readonly';
    protected _nextBtnText: string = 'Кнопка next в readonly';
    protected _endBtnText: string = 'Кнопка end в readonly';

    protected _beforeMount(): void {
        this._arrowState = {
            begin: 'visible',
            next: 'visible',
            prev: 'visible',
            end: 'visible'
        };
    }

    private _onUpdateArrowState(event, arrow: string) {
        if (this._arrowState[arrow] === 'visible') {
            this._arrowState[arrow] = 'readonly';
            this[`_${arrow}BtnText`] = `Кнопка ${arrow} в hidden`;
        } else if (this._arrowState[arrow] === 'readonly') {
            this._arrowState[arrow] = 'hidden';
            this[`_${arrow}BtnText`] = `Кнопка ${arrow} в visible`;
        } else if (this._arrowState[arrow] === 'hidden') {
            this._arrowState[arrow] = 'visible';
            this[`_${arrow}BtnText`] = `Кнопка ${arrow} в readonly`;
        }
        this._arrowState = {...this._arrowState};
    }

    private _onUpdateTemplate() {
        this._contentTemplate = this._contentTemplate ? null : ContentTemplate;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
