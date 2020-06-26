import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import pagingTemplate = require('wml!Controls/_paging/Paging/Paging');
import {SyntheticEvent} from 'Vdom/Vdom';

type TButtonState = 'normal' | 'disabled';

export interface IPagingOptions extends IControlOptions {
    showDigits: boolean;
    pagesCount: number;
    selectedPage?: number;
    backwardEnabled: boolean;
    forwardEnabled: boolean;
    contrastBackground: boolean;
}

/**
 * Контрол для отображения кнопок постраничной навигации.
 *
 * @remark
 * Полезные ссылки:
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_paging.less">переменные тем оформления</a>
 *
 * @class Controls/_paging/Paging
 * @extends UI/Base:Control
 * @public
 * @author Авраменко А.С.
 *
 * @mixes Controls/_paging/Paging/Styles
 * @mixes Controls/_paging/Paging/DigitButtons/Styles
 *
 */
/**
 * @name Controls/_paging/Paging#pagesCount
 * @cfg {Boolean} Отображать кнопки с номерами страницы.
 */

/**
 * @name Controls/_paging/Paging#showDigits
 * @cfg {Number} Размер страницы.
 */
/**
 * @name Controls/_paging/Paging#selectedPage
 * @cfg {Number} Номер выбранной страницы.
 */
class Paging extends Control<IPagingOptions> {
    protected _template: TemplateFunction = pagingTemplate;
    protected _stateBackward: TButtonState = 'normal';
    protected _stateForward: TButtonState = 'normal';

    private _initArrowDefaultStates(config: IPagingOptions): void {
        this._stateBackward = this._getState(config.backwardEnabled);
        this._stateForward = this._getState(config.forwardEnabled);
    }

    private _getState(isEnabled: boolean) {
        return isEnabled ? 'normal' : 'disabled';
    }
    private _initArrowStateBySelectedPage(config: IPagingOptions): void {
        const page = config.selectedPage;
        if (page <= 1) {
            this._stateBackward = this._getState(false);
        } else {
            this._stateBackward = this._getState(true);
        }

        if (page >= config.pagesCount) {
            this._stateForward = this._getState(false);
        } else {
            this._stateForward = this._getState(true);
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

    protected _arrowClick(e: SyntheticEvent<Event>, btnName: string, direction: string): void {
        let targetPage: number;
        if (this['_state' + direction] !== 'normal') {
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

    static _theme: string[] = ['Controls/paging'];
}

export default Paging;

/**
 * @event Происходит при клике по кнопкам перехода к первой, последней, следующей или предыдущей странице.
 * @name Controls/_paging/Paging#onArrowClick
 * @remark
 * Событие происходит, когда опция showDigits установлена в значение true.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {ButtonName} btnName Имя нажатой кнопки.
 */

/**
 * @typedef {String} ButtonName
 * @variant Begin Кнопка "В начало".
 * @variant End Кнопка "В конец".
 * @variant Prev Кнопка "Назад".
 * @variant Next Кнопка "Вперёд".
 */
