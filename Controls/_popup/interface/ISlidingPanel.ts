import { TemplateFunction } from 'UI/Base';

type TSlidingPanelPosition = 'top' | 'bottom';

export interface ISlidingPanelPopupOptions {
    slidingPanelOptions: ISlidingPanelOptions;
    className?: string;
    dialogOptions: IDialogOptions;
    modal?: boolean;
    position?: TSlidingPanelPosition;
    content?: TemplateFunction;
    desktopMode?: 'dialog' | 'stack';
}

export interface ISlidingPanelOptions {
    maxHeight?: number;
    minHeight?: number;
    position?: TSlidingPanelPosition;
    height?: number;
    desktopMode?: 'dialog' | 'stack';
    autoHeight?: boolean;
}

export interface IDialogOptions {
    minHeight?: number;
    maxHeight?: number;
    minWidth?: number;
    maxWidth?: number;
    width?: number;
    height?: number;
}

/**
 * Интерфейс для опций окна-шторки.
 * @public
 * @interface Controls/_popup/interface/ISlidingPanel
 * @implements Controls/popup:IBaseOpener
 * @extends
 * @author Красильников А.С.
 */
export interface ISlidingPanel {
    readonly '[Controls/_popup/interface/ISlidingPanel]': boolean;
}

/**
 * @name Controls/_popup/interface/ISlidingPanel#desktopMode
 * @cfg {String} Определяет какого вида окно откроется на настольном копьютере и планшете.
 * @variant stack (Стековая панель)
 * @variant dialog (Диалоговое окно)
 * @default stack
 */

/**
 * @name Controls/_popup/interface/ISlidingPanel#slidingPanelOptions
 * @cfg {Controls/_popup/interface/ISlidingPanel/SlidingPanelOptions.typedef} Конфигурация окна на мобильном устройстве.
 */

/**
 * @name Controls/_popup/interface/ISlidingPanel#dialogOptions
 * @cfg {Controls/_popup/interface/ISlidingPanel/DialogOptions.typedef} Конфигурация окна на настольном копьютере и планшете.
 */

/**
 * @typedef {Object} Controls/_popup/interface/ISlidingPanel/DialogOptions
 * @description Настройки окна на настольном копьютере и планшете.
 * Подробнее:
 * Для desktopMode "dialog" {@link Controls/_popup/interface/IDialogOpener здесь}
 * Для desktopMode "stack" {@link Controls/_popup/interface/IStackOpener здесь}
 * @property {Number} minHeight Минимальная высота окна.
 * @property {Number} maxHeight Максимальная высота окна.
 * @property {Number} height Текущая высота окна.
 * @property {Number} maxWidth Максимальная ширина окна.
 * @property {Number} minWidth Минимальная ширина окна.
 * @property {Number} width Текущая ширина окна.
 */

/**
 * @typedef {Object} Controls/_popup/interface/ISlidingPanel/SlidingPanelOptions
 * @description Настройки окна на мобильном устройстве.
 * @property {Boolean} modal
 * @property {Number} minHeight Минимально допустимая высота окна. С такой высотой она открывается.
 * @property {Number} maxHeight Максимально допустимая высота окна.
 * @property {String} position Определяет с какой стороны отображается окно. (Варианты: 'top', 'bottom')
 * @property {Boolean} autoHeight Позволяет окну до начала изменения высоты с помощью свайпа принимать высоту по контенту.
 */

/**
 * @typedef {Object} Controls/_popup/interface/ISlidingPanel/PopupOptions
 * @description Конфигурация окна.
 * @property {String} className Имена классов, которые будут применены к корневой ноде всплывающего окна.
 * @property {String} desktopMode Определяет какого вида окно откроется на настольном копьютере и планшете. (Варианты: 'stack', 'dialog')
 * @property {function|String} template Шаблон всплывающего окна.
 * @property {function|String} templateOptions Опции для контрола, переданного в {@link template}.
 * @property {Controls/_popup/interface/ISlidingPanel/SlidingPanelOptions.typedef} slidingPanelOptions Конфигурация окна на мобильном устройстве
 * @property {Controls/_popup/interface/ISlidingPanel/DialogOptions.typedef} dialogOptions Конфигурация окна на настольном копьютере и планшете
 * @property {Node} opener Логический инициатор открытия всплывающего окна. Читайте подробнее {@link /doc/platform/developmentapl/interface-development/ui-library/focus/index/#control-opener здесь}.
 * @property {Controls/_popup/interface/IBaseOpener/EventHandlers.typedef} eventHandlers Функции обратного вызова на события окна.
 */

/**
 * Метод для закрытия окна-шторки.
 * @name Controls/_popup/interface/ISlidingPanel#close
 * @function
 * @example
 * <pre class="brush: js">
 * import {SlidingPanelOpener} from 'Controls/popup';
 *
 * this._slidingPanel = new SlidingPanelOpener();
 *
 * closeStack() {
 *     this._slidingPanel.close();
 * }
 * </pre>
 * @see open
 * @see destroy
 * @see isOpened
 */

/**
 * Разрушает экземпляр класса
 * @name Controls/_popup/interface/ISlidingPanel#destroy
 * @function
 * @example
 * <pre class="brush: js">
 * import {SlidingPanelOpener} from 'Controls/popup';
 *
 * this._slidingPanel = new SlidingPanelOpener();
 *
 * _beforeUnmount() {
 *     this._slidingPanel.destroy();
 *     this._slidingPanel = null;
 * }
 * </pre>
 * @see open
 * @see close
 * @see isOpened
 */

/**
 * @name Controls/_popup/interface/ISlidingPanel#isOpened
 * @description Возвращает информацию о том, открыта ли шторка.
 * @function
 * @see open
 * @see close
 * @see destroy
 */

/**
 * Метод для открытия шторки.
 * @function Controls/_popup/interface/ISlidingPanel#open
 * @param {Controls/_popup/interface/ISlidingPanel/PopupOptions.typedef} popupOptions Конфигурация шторки.
 * @example
 * <pre class="brush: js">
 * import {SlidingPanelOpener} from 'Controls/popup';
 *
 * this._slidingPanel = new SlidingPanelOpener();
 *
 * openStack() {
 *     this._slidingPanel.open({
 *         template: 'Example/MyStackTemplate',
 *         opener: this._children.myButton
 *     });
 * }
 * </pre>
 * @see close
 * @see destroy
 * @see isOpened
 */
