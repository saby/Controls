import {IBasePopupOptions, IOpener} from 'Controls/_popup/interface/IBaseOpener';
import {Control} from 'UI/Base';

/**
 * Опции интерфейса описаны {@link Controls/_popup/interface/IStickyOpener здесь}.
 * @public
 * @author Красильников А.С.
 */
export interface IStickyPopupOptions extends IBasePopupOptions {
    /**
     * @cfg {Number} Минимальная ширина всплывающего окна.
     */
    minWidth?: number;
    /**
     * @cfg {Number} Текущая ширина всплывающего окна
     */
    width?: number;
    /**
     * @cfg {Number} Максимальная ширина всплывающего окна.
     */
    maxWidth?: number;
    /**
     * @cfg {Number} Минимальная высота всплывающего окна.
     */
    minHeight?: number;
    /**
     * @cfg {Number} Текущая высота всплывающего окна
     */
    height?: number;
    /**
     * @cfg {Number} Максимальная высота всплывающего окна.
     */
    maxHeight?: number;
    /**
     * @cfg {Node|Control} Элемент (DOM-элемент или контрол), относительно которого позиционируется всплывающее окно.
     */
    target?: HTMLElement | EventTarget | Control;
    /**
     * @cfg {String} Определяет реакцию всплывающего окна на скролл родительской области
     * @variant close Всплывающее окно закрывается
     * @variant track  Всплывающее окно движется вместе со своей точкой позиционирования.
     * @variant none Всплывающее окно остается на месте расположения, вне зависимости от движения точки позиционирования.
     * @default none
     * @remark Для работы данной опции необходимо, чтоб контрол Controls.popup:Sticky находился в верстке.
     */

    /*
    * @cfg {String} Determines the popup action on scroll.
    * @variant close
    * @variant track
    * @variant none
    * @default none
    */
    actionOnScroll?: 'close' | 'track' | 'none';
    restrictiveContainer?: string | HTMLElement | Control;
    /**
     * @cfg {Controls/_popup/interface/IStickyOpener/Direction.typedef} Точка позиционирования всплывающего окна относительно вызывающего элемента.
     */
    /*
    * @cfg {Controls/_popup/interface/IStickyOpener/Direction.typedef} Point positioning of the target relative to sticky.
    */
    targetPoint?: IStickyPosition;
    /**
     * @cfg {Controls/_popup/interface/IStickyOpener/Direction.typedef} Устанавливает выравнивание всплывающего окна относительно точки позиционирования.
     */
    /*
    * @cfg {Controls/_popup/interface/IStickyOpener/Direction.typedef} Sets the alignment of the popup.
    */
    direction?: IStickyPosition;
    /**
     * @cfg {Controls/_popup/interface/IStickyOpener/Offset.typedef} Устанавливает отступы от точки позиционирования до всплывающего окна
     */
    /*
    * @cfg {Controls/_popup/interface/IStickyOpener/Offset.typedef} Sets the offset of the targetPoint.
    */
    offset?: IStickyPositionOffset;
    /**
     * @cfg {Controls/_popup/interface/IStickyOpener/FittingMode.typedef} Определеяет поведение окна, в случае, если оно не помещается на экране с заданным позиционированием.
     */
    fittingMode?: string | IStickyPosition;
}

export interface IStickyPosition {
    vertical?: string;
    horizontal?: string;
}

export interface IStickyPositionOffset {
    vertical?: number;
    horizontal?: number;
}

/**
 * Интерфейс для методов стики окон.
 * @public
 * @author Красильников А.С.
 */
export interface IStickyOpener extends IOpener {
    readonly '[Controls/_popup/interface/IStickyOpener]': boolean;
}

/**
 * @typedef {Object} Controls/_popup/interface/IStickyOpener/PopupOptions
 * @description Конфигурация прилипающего блока.
 * @property {Boolean} autofocus Определяет, установится ли фокус на шаблон попапа после его открытия.
 * @property {String} actionOnScroll Определяет реакцию всплывающего окна на скролл родительской области.
 * @property {Boolean} modal Определяет, будет ли открываемое окно блокировать работу пользователя с родительским приложением.
 * @property {String} className Имена классов, которые будут применены к корневой ноде всплывающего окна.
 * @property {Boolean} closeOnOutsideClick Определяет возможность закрытия всплывающего окна по клику вне.
 * @property {function|String} template Шаблон всплывающего окна
 * @property {function|String} templateOptions  Опции для контрола, переданного в {@link template}
 * @property {Object} targetPoint Точка позиционирования всплывающего окна относительно вызывающего элемента.
 * @property {Controls/_popup/interface/IStickyOpener/Direction.typedef} direction Устанавливает выравнивание всплывающего окна относительно точки позиционирования.
 * @property {Controls/_popup/interface/IStickyOpener/Offset.typedef} offset Устанавливает отступы от точки позиционирования до всплывающего окна
 * @property {Number} minWidth Минимальная ширина всплывающего окна
 * @property {Number} maxWidth Максимальная ширина всплывающего окна
 * @property {Number} minHeight Минимальная высота всплывающего окна
 * @property {Number} maxHeight Максимальная высота всплывающего окна
 * @property {Number} height Текущая высота всплывающего окна
 * @property {Number} width Текущая ширина всплывающего окна
 * @property {Node|Control} target Элемент (DOM-элемент или контрол), относительно которого позиционируется всплывающее окно.
 * @property {Node} opener Логический инициатор открытия всплывающего окна
 * @property {Controls/_popup/interface/IStickyOpener/FittingMode.typedef} fittingMode Определяет поведение окна, в случае, если оно не помещается на экране с заданным позиционированием.
 * @property {Controls/_popup/interface/IStickyOpener.typedef} eventHandlers Функции обратного вызова на события всплывающего окна.
 */

/*
 * Open sticky popup.
 * If you call this method while the window is already opened, it will cause the redrawing of the window.
 * @function Controls/_popup/interface/IStickyOpener#open
 * @param {Controls/_popup/interface/IStickyOpener/PopupOptions.typedef} popupOptions Sticky popup options.
 * @remark {@link /docs/js/Controls/interface/IStickyOptions#popupOptions popupOptions}
 */

/**
 * Метод открытия всплывающего окна.
 * @function Controls/_popup/interface/IStickyOpener#open
 * @param {Controls/_popup/interface/IStickyOpener/PopupOptions.typedef} popupOptions Конфигурация всплывающего окна.
 * @remark 
 * При повторном вызове метода происходит перерисовка всплывающего окна с новыми опциями, которые переданы в аргументе popupOptions.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.popup:Sticky name="sticky" template="Controls-demo/Popup/TestDialog">
 *    <ws:direction vertical="bottom" horizontal="left"/>
 *    <ws:targetPoint vertical="bottom" horizontal="left"/>
 * </Controls.popup:Sticky>
 *
 * <div name="target">{{_text}}</div>
 *
 * <Controls.buttons:Button name="openStickyButton" caption="open sticky" on:click="_open()"/>
 * <Controls.buttons:Button name="closeStickyButton" caption="close sticky" on:click="_close()"/>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * Control.extend({
 *    _open() {
 *       var popupOptions = {
 *          target: this._children.target,
 *          opener: this._children.openStickyButton,
 *          templateOptions: {
 *             record: this._record
 *          }
 *       }
 *       this._children.sticky.open(popupOptions);
 *    },
 *    _close() {
 *       this._children.sticky.close()
 *    }
 * });
 * </pre>
 * @return Promise<string|indefined>
 * @see close
 * @see openPopup
 * @see closePopup
 */

/**
 * Метод для закрытия всплывающего окна.
 * @name Controls/_popup/interface/IStickyOpener#close
 * @function
 */



/**
 * @name Controls/_popup/interface/IStickyOpener#minWidth
 * @cfg {Number} Минимальная ширина всплывающего окна
 */

/**
 * @name Controls/_popup/interface/IStickyOpener#maxWidth
 * @cfg {Number} Максимальная ширина всплывающего окна
 */

/**
 * @name Controls/_popup/interface/IStickyOpener#minHeight
 * @cfg {Number} Минимальная высота всплывающего окна
 */

/**
 * @name Controls/_popup/interface/IStickyOpener#maxHeight
 * @cfg {Number} Максимальная высота всплывающего окна
 */
/**
 * @name Controls/_popup/interface/IStickyOpener#height
 * @cfg {Number} Текущая высота всплывающего окна
 */
/**
 * @name Controls/_popup/interface/IStickyOpener#width
 * @cfg {Number} Текущая ширина всплывающего окна
 */

/**
 * @name Controls/_popup/interface/IStickyOpener#target
 * @cfg {Node|Control} Элемент (DOM-элемент или контрол), относительно которого позиционируется всплывающее окно.
 */

/**
 * @name Controls/_popup/interface/IStickyOpener#actionOnScroll
 * @cfg {String} Определяет реакцию всплывающего окна на скролл родительской области
 * @variant close Всплывающее окно закрывается
 * @variant track  Всплывающее окно движется вместе со своей точкой позиционнирования.
 * @variant none Всплывающее окно остается на месте расположения, вне зависимости от движения точки позиционнирования.
 * @default none
 * @remark Для работы данной опции необходимо, чтоб контрол Controls.popup:Sticky находился в верстке.
 */

/*
 * @name Controls/_popup/interface/IStickyOpener#actionOnScroll
 * @cfg {String} Determines the popup action on scroll.
 * @variant close
 * @variant track
 * @variant none
 * @default none
 */

/**
 * @name Controls/_popup/interface/IStickyOpener#targetPoint
 * @cfg {Controls/_popup/interface/IStickyOpener/Direction.typedef} Точка позиционнирования всплывающего окна относительно вызывающего элемента.
 */

/*
 * @name Controls/_popup/interface/IStickyOpener#targetPoint
 * @cfg {Controls/_popup/interface/IStickyOpener/Direction.typedef} Point positioning of the target relative to sticky.
 */

/**
 * @typedef {Object} Controls/_popup/interface/IStickyOpener/Direction
 * @property {Controls/_popup/interface/IStickyOpener/Vertical.typedef} vertical
 * @property {Controls/_popup/interface/IStickyOpener/Horizontal.typedef} horizontal
 */

/**
 * @typedef {String} Controls/_popup/interface/IStickyOpener/Vertical
 * @variant top
 * @variant bottom
 * @variant center
 */

/**
 * @typedef {String} Controls/_popup/interface/IStickyOpener/Horizontal
 * @variant left
 * @variant right
 * @variant center
 */

/**
 * @name Controls/_popup/interface/IStickyOpener#direction
 * @cfg {Controls/_popup/interface/IStickyOpener/Direction.typedef} Устанавливает выравнивание всплывающего окна относительно точки позиционнирования.
 */

/*
 * @name Controls/_popup/interface/IStickyOpener#direction
 * @cfg {Controls/_popup/interface/IStickyOpener/Direction.typedef} Sets the alignment of the popup.
 */

/**
 * @typedef {Object} Controls/_popup/interface/IStickyOpener/Offset
 * @property {Number} vertical
 * @property {Number} horizontal
 */

/**
 * @name Controls/_popup/interface/IStickyOpener#offset
 * @cfg {Controls/_popup/interface/IStickyOpener/Offset.typedef} Устанавливает отступы от точки позиционнирования до всплывающего окна
 */

/*
 * @name Controls/_popup/interface/IStickyOpener#offset
 * @cfg {Controls/_popup/interface/IStickyOpener/Offset.typedef} Sets the offset of the targetPoint.
 */

/**
 * @name Controls/_popup/interface/IStickyOpener#fittingMode
 * @cfg {Controls/_popup/interface/IStickyOpener/FittingMode.typedef} Определеяет поведение окна, в случае, если оно не помещается на экране с заданным позиционированием.
 */

/**
 * @typedef {Object} Controls/_popup/interface/IStickyOpener/FittingMode
 * @description Тип опции fittingMode, определеяющей поведение окна, в случае, если оно не помещается на экране с заданным позиционнированием.
 * @property {Controls/_popup/interface/IStickyOpener/FittingModeValue.typedef} [vertical=adaptive]
 * @property {Controls/_popup/interface/IStickyOpener/FittingModeValue.typedef} [horizontal=adaptive]
 */

/**
 * @typedef {String} Controls/_popup/interface/IStickyOpener/FittingModeValue
 * @variant fixed Координаты точки позиционирования не меняются. Высота и ширина окна меняются так, чтобы его содержимое не выходило за пределы экрана.
 * @variant overflow Координаты точки позиционирования меняются (окно сдвигается относительно целевого элемента настолько, насколько не помещается в области видимости экрана, причем окно, возможно, будет перекрывать целевой элемент.) Если окно имеет размеры больше экрана, то ширина и высота уменьшаются так, чтобы окно поместилось.
 * @variant adaptive Координаты точки позиционирования ({@link Controls/_popup/interface/IStickyOpener#targetPoint targetPoint}) и выравнивание ({@link Controls/_popup/interface/IStickyOpener#direction direction}) меняются на противоположные. Если и в этом случае окно не помещается на экран, выбирается тот способ позиционирования (изначальный или инвертируемый), при котором на экране помещается наибольшая часть контента. Например если поле ввода с автодополнением находится внизу экрана, то список автодополнения раскроется вверх от поля. Ширина и высота при этом уменьшаются так, чтобы окно поместилось на экран.
 */
