import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import pagingTemplate = require('wml!Controls/_paging/Paging/Paging');
import {SyntheticEvent} from 'Vdom/Vdom';
import {TNavigationPagingMode} from 'Controls/interface';

type TButtonState = 'normal' | 'disabled';
type TArrowStateVisibility = 'visible' | 'hidden' | 'readonly';

export interface IArrowState {
    begin: TArrowStateVisibility;
    prev: TArrowStateVisibility;
    next: TArrowStateVisibility;
    end: TArrowStateVisibility;
}

export interface IPagingOptions extends IControlOptions {
    showDigits: boolean;
    pagesCount: number;
    selectedPage?: number;
    contrastBackground: boolean;
    contentTemplate?: TemplateFunction;
    elementsCount?: number;
    arrowState: IArrowState;
    pagingMode: TNavigationPagingMode;
}

/**
 * Контрол для отображения кнопок постраничной навигации.
 *
 * @remark
 * Полезные ссылки:
 * * {@link https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_paging.less переменные тем оформления}
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
class Paging extends Control<IPagingOptions> {
    protected _template: TemplateFunction = pagingTemplate;
    protected _stateBackward: TButtonState = 'normal';
    protected _stateForward: TButtonState = 'normal';

    protected _stateTop: TButtonState = 'normal';
    protected _stateBottom: TButtonState = 'normal';

    private _initArrowDefaultStates(config: IPagingOptions): void {
        if (config.arrowState) {
            if (config.pagingMode === 'numbers') {
                if (config.selectedPage <= 1) {
                    this._stateTop = this._getState('hidden');
                } else {
                    this._stateTop = this._getState('visible');
                }

                if (config.selectedPage >= config.pagesCount) {
                    this._stateBottom = this._getState('hidden');
                } else {
                    this._stateBottom = this._getState('visible');
                }
            } else {
                this._stateTop = this._getState(config.arrowState.begin || 'readonly');
                this._stateBackward = this._getState(config.arrowState.prev || 'readonly');
                this._stateForward = this._getState(config.arrowState.next || 'readonly');
                this._stateBottom = this._getState(config.arrowState.end || 'readonly');
            }
        }
    }

    private _isDigit(): boolean {
        return (this._options.showDigits || this._options.pagingMode === 'numbers');
    }

    private _getState(state: TArrowStateVisibility): TButtonState {
        return (state === 'visible') ? 'normal' : 'disabled';
    }

    private _getArrowStateVisibility(state: string): string {
        if (this._options.arrowState) {
            return this._options.arrowState[state] || 'visible';
        }
        if (this._isDigit()) {
            return 'visible';
        }
        return 'hidden';
    }

    private _initArrowStateBySelectedPage(config: IPagingOptions): void {
        const page = config.selectedPage;
        if (page <= 1) {
            this._stateBackward = this._stateTop = this._getState('hidden');
        } else {
            this._stateBackward = this._stateTop = this._getState('visible');
        }

        if (page >= config.pagesCount) {
            this._stateForward = this._stateBottom = this._getState('hidden');
        } else {
            this._stateForward = this._stateBottom = this._getState('visible');
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

    private _isShowContentTemplate(): boolean {
        return !(this._getArrowStateVisibility('begin') === 'hidden' &&
            this._getArrowStateVisibility('prev') === 'hidden' &&
            this._getArrowStateVisibility('next') === 'hidden' &&
            this._getArrowStateVisibility('end') === 'hidden');
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
 * @name Controls/_paging/Paging#pagesCount
 * @cfg {Number} Размер страницы
 */

/**
 * @name Controls/_paging/Paging#showDigits
 * @cfg {Boolean} Отображать кнопки с номерами страницы.
 */
/**
 * @name Controls/_paging/Paging#selectedPage
 * @cfg {Number} Номер выбранной страницы.
 */

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
/**
 * @typedef {Object} ArrowState
 * @property {TArrowStateVisibility} [begin] Управялет показом/скрытием кнопки "Переход в начало".
 * @property {TArrowStateVisibility} [prev] Управялет показом/скрытием кнопки "Переход к предыдущей странице".
 * @property {TArrowStateVisibility} [next] Управялет показом/скрытием кнопки "Переход к следующей странице".
 * @property {TArrowStateVisibility} [end] Управялет показом/скрытием кнопки "Переход в конец".
 */
/**
 * @name Controls/_paging/Paging#arrowsState
 * @cfg {IArrowState} Опция управляет возможностью показа/скрытия кнопок в пэйджинге.
 */

/**
 * @name Controls/_paging/Paging#pagingMode
 * @cfg {TNavigationPagingMode} Внешний вид пэйджинга. Позволяет для каждого конкретного реестра задать внешний вид в зависимости от требований к интерфейсу.
 */

/**
 * @name Controls/_paging/Paging#contrastBackground
 * @cfg {Boolean} Определяет контрастность фона кнопки по отношению к ее окружению.
 */

/**
 * @name Controls/_paging/Paging#contentTemplate
 * @cfg {Function} Опция управляет отображением произвольного шаблона внутри пэйджинга.
 */

/**
 * @name Controls/_paging/Paging#elementsCount
 * @cfg {Number} Опция управляет возможностью показа количества элементов, если их количество больше 0.
 */
