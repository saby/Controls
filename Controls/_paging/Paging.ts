import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import pagingTemplate = require('wml!Controls/_paging/Paging/Paging');
import {SyntheticEvent} from 'Vdom/Vdom';

// TODO перевести на честную тему мешает наличие опции theme на scroll/Container
import 'css!theme?Controls/paging';

type TButtonState = 'normal' | 'disabled';

export interface IPagingOptions extends IControlOptions {
    showDigits: boolean;
    pagesCount: number;
    selectedPage?: number;
    stateBegin: TButtonState;
    stateEnd: TButtonState;
    stateNext: TButtonState;
    statePrev: TButtonState;
}

/**
 *
 * @mixes Controls/_paging/Paging/Styles
 * @mixes Controls/_paging/Paging/DigitButtons/Styles
 *
 */
class Paging extends Control<IPagingOptions> {
    protected _template: TemplateFunction = pagingTemplate;
    protected _stateBegin: TButtonState = 'normal';
    protected _stateEnd: TButtonState = 'normal';
    protected _stateNext: TButtonState = 'normal';
    protected _statePrev: TButtonState = 'normal';

    private _initArrowDefaultStates(config: IPagingOptions): void {
        this._stateBegin = config.stateBegin || 'disabled';
        this._stateEnd = config.stateEnd || 'disabled';
        this._stateNext = config.stateNext || 'disabled';
        this._statePrev = config.statePrev || 'disabled';
    }

    private _initArrowStateBySelectedPage(config: IPagingOptions): void {
        const page = config.selectedPage;
        if (page <= 1) {
            this._stateBegin = 'disabled';
            this._statePrev = 'disabled';
        } else {
            this._stateBegin = 'normal';
            this._statePrev = 'normal';
        }

        if (page >= config.pagesCount) {
            this._stateEnd = 'disabled';
            this._stateNext = 'disabled';
        } else {
            this._stateEnd = 'normal';
            this._stateNext = 'normal';
        }
    }

    private _initArrowState(newOptions: IPagingOptions): void {
        const showDigits = newOptions.showDigits;
        if (showDigits) {
            this._initArrowStateBySelectedPage(newOptions);
        } else {
            this._initArrowDefaultStates(newOptions);
        }
    }

    private _changePage(page: number): void {
        if (this._options.selectedPage !== page) {
            this._notify('selectedPageChanged', [page]);
        }
    }

    protected _beforeMount(newOptions: IPagingOptions): void {
        this._initArrowState(newOptions);
    }

    protected _beforeUpdate(newOptions: IPagingOptions): void {
        this._initArrowState(newOptions);
    }

    protected _digitClick(e: SyntheticEvent<Event>, digit: number): void {
        this._changePage(digit);
    }

    protected _arrowClick(e: SyntheticEvent<Event>, btnName: string): void {
        let targetPage: number;
        if (this['_state' + btnName] !== 'normal') {
            return;
        }
        if (this._options.showDigits) {
            switch (btnName) {
                case 'Begin':
                    targetPage = 1;
                    break;
                case 'End':
                    targetPage = this._options.pagesCount;
                    break;
                case 'Prev':
                    targetPage = this._options.selectedPage - 1;
                    break;
                case 'Next':
                    targetPage = this._options.selectedPage + 1;
                    break;
            }
            this._changePage(targetPage);
        }
        this._notify('onArrowClick', [btnName]);
    }
}

export default Paging;
