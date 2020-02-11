import {IBasePopupOptions, IOpener} from 'Controls/_popup/interface/IBaseOpener';
import {Control} from 'UI/Base';

/**
 * Интерфейс для опций стики окон
 *
 * @interface Controls/_popup/interface/ISticky
 * @public
 * @author Красильников А.С.
 */

export interface IStickyPopupOptions extends IBasePopupOptions {
    minWidth?: number;
    width?: number;
    maxWidth?: number;
    minHeight?: number;
    height?: number;
    maxHeight?: number;
    target?: HTMLElement | EventTarget | Control;
    actionOnScroll?: string;
    targetPoint?: IStickyPosition;
    direction?: IStickyPosition;
    offset?: IStickyPositionOffset;
    fittingMode?: string | IStickyPosition;
    horizontalAlign?: any; //TODO НУЖНО УДАЛЯТЬ ИСПОЛЬЗОВАНИЕ ОПЦИИ
}

export interface IStickyPosition {
    vertical?: string;
    horizontal?: string;
}

export interface IStickyPositionOffset {
    vertical?: number;
    horizontal?: number;
}

export interface IStickyOpener extends IOpener {
    readonly '[Controls/_popup/interface/IStickyOpener]': boolean;
}

/**
 * @typedef {Object} PopupOptions
 * @description Конфигурация прилипающего блока.
 * @property {Boolean} autofocus Определяет, установится ли фокус на шаблон попапа после его открытия.
 * @property {Boolean} modal Определяет, будет ли открываемое окно блокировать работу пользователя с родительским приложением.
 * @property {String} className Имена классов, которые будут применены к корневой ноде всплывающего окна.
 * @property {Boolean} closeOnOutsideClick Определяет возможность закрытия всплывающего окна по клику вне.
 * @property {function|String} template Шаблон всплывающего окна
 * @property {function|String} templateOptions  Опции для контрола, переданного в {@link template}
 * @property {Object} targetPoint Точка позиционнирования всплывающего окна относительно вызывающего элемента.
 * @property {Object} direction Устанавливает выравнивание всплывающего окна относительно точки позиционнирования.
 * @property {Object} offset Устанавливает отступы от точки позиционнирования до всплывающего окна
 * @property {Number} minWidth Минимальная ширина всплывающего окна
 * @property {Number} maxWidth Максимальная ширина всплывающего окна
 * @property {Number} minHeight Минимальная высота всплывающего окна
 * @property {Number} maxHeight Максимальная высота всплывающего окна
 * @property {Number} height Текущая высота всплывающего окна
 * @property {Number} width Текущая ширина всплывающего окна
 * @property {Node|Control} target Элемент (DOM-элемент или контрол), относительно которого позиционируется всплывающее окно.
 * @property {Node} opener Логический инициатор открытия всплывающего окна
 * @property {fittingMode} fittingMode Определеяет поведение окна, в случае, если оно не помещается на экране с заданным позиционнированием.
 * @property {Controls/_popup/interface/IStickyOpener.typedef} eventHandlers Функции обратного вызова на события всплывающего окна.
 */

/*
 * Open sticky popup.
 * If you call this method while the window is already opened, it will cause the redrawing of the window.
 * @function Controls/_popup/interface/IStickyOpener#open
 * @param {PopupOptions} popupOptions Sticky popup options.
 * @remark {@link https://wi.sbis.ru/docs/js/Controls/interface/IStickyOptions#popupOptions popupOptions}
 */

/**
 * Метод открытия диалогового окна.
 * Повторный вызов этого метода инициирует перерисовку окна с новыми опциями.
 * @function Controls/_popup/interface/IStickyOpener#open
 * @param {PopupOptions} popupOptions Конфигурация прилипающего блока {@link https://wi.sbis.ru/docs/js/Controls/interface/IStickyOptions#popupOptions popupOptions}
 * @remark Если требуется открыть окно, без создания popup:Sticky в верстке, следует использовать статический метод {@link openPopup}
 * @example
 * wml
 * <pre>
 *    <Controls.popup:Sticky name="sticky" template="Controls-demo/Popup/TestDialog">
 *          <ws:direction vertical="bottom" horizontal="left"/>
 *          <ws:targetPoint vertical="bottom" horizontal="left"/>
 *   </Controls.popup:Sticky>
 *
 *   <div name="target">{{_text}}</div>
 *
 *   <Controls.buttons:Button name="openStickyButton" caption="open sticky" on:click="_open()"/>
 *   <Controls.buttons:Button name="closeStickyButton" caption="close sticky" on:click="_close()"/>
 * </pre>
 * js
 * <pre>
 *    Control.extend({
 *       ...
 *
 *       _open() {
 *          var popupOptions = {
 *              target: this._children.target,
 *              opener: this._children.openStickyButton,
 *              templateOptions: {
 *                  record: this._record
 *              }
 *          }
 *          this._children.sticky.open(popupOptions);
 *      }
 *
 *      _close() {
 *          this._children.sticky.close()
 *      }
 *      ...
 *    });
 * </pre>
 * @see close
 * @see openPopup
 * @see closePopup
 */

/**
 * @name Controls/_popup/interface/ISticky#minWidth
 * @cfg {Number} Минимальная ширина всплывающего окна
 */

/**
 * @name Controls/_popup/interface/ISticky#maxWidth
 * @cfg {Number} Максимальная ширина всплывающего окна
 */

/**
 * @name Controls/_popup/interface/ISticky#minHeight
 * @cfg {Number} Минимальная высота всплывающего окна
 */

/**
 * @name Controls/_popup/interface/ISticky#maxHeight
 * @cfg {Number} Максимальная высота всплывающего окна
 */
/**
 * @name Controls/_popup/interface/ISticky#height
 * @cfg {Number} Текущая высота всплывающего окна
 */
/**
 * @name Controls/_popup/interface/ISticky#width
 * @cfg {Number} Текущая ширина всплывающего окна
 */

/**
 * @name Controls/_popup/interface/ISticky#target
 * @cfg {Node|Control} Элемент (DOM-элемент или контрол), относительно которого позиционируется всплывающее окно.
 */

/**
 * @name Controls/_popup/interface/ISticky#actionOnScroll
 * @cfg {String} Определяет реакцию всплывающего окна на скролл родительской области
 * @variant close Всплывающее окно закрывается
 * @variant track  Всплывающее окно движется вместе со своей точкой позиционнирования.
 * @variant none Всплывающее окно остается на месте расположения, вне зависимости от движения точки позиционнирования.
 * @default none
 */

/*
 * @name Controls/_popup/interface/ISticky#actionOnScroll
 * @cfg {String} Determines the popup action on scroll.
 * @variant close
 * @variant track
 * @variant none
 * @default none
 */

/**
 * @name Controls/_popup/interface/ISticky#targetPoint
 * @cfg {direction} Точка позиционнирования всплывающего окна относительно вызывающего элемента.
 */

/*
 * @name Controls/_popup/interface/ISticky#targetPoint
 * @cfg {direction} Point positioning of the target relative to sticky.
 */

/**
 * @typedef {Object} direction
 * @property {vertical} vertical
 * @property {horizontal} horizontal
 */

/**
 * @typedef {Enum} vertical
 * @variant top
 * @variant bottom
 * @variant center
 */

/**
 * @typedef {Enum} horizontal
 * @variant left
 * @variant right
 * @variant center
 */

/**
 * @name Controls/_popup/interface/ISticky#direction
 * @cfg {direction} Устанавливает выравнивание всплывающего окна относительно точки позиционнирования.
 */

/*
 * @name Controls/_popup/interface/ISticky#direction
 * @cfg {direction} Sets the alignment of the popup.
 */

/**
 * @name Controls/_popup/interface/ISticky#offset
 * @cfg {offset} Устанавливает отступы от точки позиционнирования до всплывающего окна
 */

/*
 * @name Controls/_popup/interface/ISticky#offset
 * @cfg {offset} Sets the offset of the targetPoint.
 */

/**
 * @typedef {Object} offset
 * @property {Number} vertical
 * @property {Number} horizontal
 */

/**
 * @name Controls/_popup/interface/ISticky#fittingMode
 * @cfg {fittingMode} Определеяет поведение окна, в случае, если оно не помещается на экране с заданным позиционированием.
 */

/**
 * @typedef {Object} fittingMode
 * @description Тип опции fittingMode, определеяющей поведение окна, в случае, если оно не помещается на экране с заданным позиционнированием.
 * @property {fittingModeValue} vertical
 * @property {fittingModeValue} horizontal
 */

/**
 * @typedef {Enum} fittingModeValue
 * @variant fixed Координаты точки позиционирования не меняются. Высота и ширина окна меняются так, чтобы его содержимое не выходило за пределы экрана.
 * @variant overflow Координаты точки позиционирования меняются (окно сдвигается относительно целевого элемента настолько, насколько не помещается в области видимости экрана, причем окно, возможно, будет перекрывать целевой элемент.) Если окно имеет размеры больше экрана, то ширина и высота уменьшаются так, чтобы окно поместилось.
 * @variant adaptive Координаты точки позиционирования ({@link Controls/_popup/interface/ISticky#targetPoint targetPoint}) и выравнивание ({@link Controls/_popup/interface/ISticky#direction direction}) меняются на противоположные. Если и в этом случае окно не помещается на экран, выбирается тот способ позиционирования (изначальный или инвертируемый), при котором на экране помещается наибольшая часть контента. Например если поле ввода с автодополнением находится внизу экрана, то список автодополнения раскроется вверх от поля. Ширина и высота при этом уменьшаются так, чтобы окно поместилось на экран.
 * @default adaptive
 */


/**
 * Статический метод для открытия всплывающего окна. При использовании метода не требуется создавать popup:Sticky в верстке.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/sticky/#open-popup Подробнее}.
 * @function Controls/_popup/interface/ISticky#openPopup
 * @param {PopupOptions} config Конфигурация прилипающего блока.
 * @return {Promise<string>} Возвращает Promise, который в качестве результата вернет идентификатор окна, который потребуется для закрытия этого окна. см метод {@link closePopup}
 * @remark
 * Для обновления уже открытого окна в config нужно передать св-во id с идентификатором открытого окна.
 * @static
 * @example
 * js
 * <pre>
 *    import {Sticky} from 'Controls/popup';
 *    ...
 *    openSticky() {
 *        Sticky.openPopup({
 *          template: 'Example/MyStickyTemplate',
 *          opener: this._children.myButton
 *        }).then((popupId) => {
 *          this._popupId = popupId;
 *        });
 *    },
 *
 *    closeSticky() {
 *       Sticky.closePopup(this._popupId);
 *    }
 * </pre>
 * @see closePopup
 * @see close
 * @see open
 */

/*
 * Open Sticky popup.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/sticky/ See more}.
 * @function Controls/_popup/interface/ISticky#openPopup
 * @param {PopupOptions} config Sticky popup options.
 * @return {Promise<string>} Returns id of popup. This id used for closing popup.
 * @static
 * @see closePopup
 */

/**
 * Статический метод для закрытия окна по идентификатору.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/sticky/#open-popup Подробнее}.
 * @function Controls/_popup/interface/ISticky#closePopup
 * @param {String} popupId Идентификатор окна, который был получен при вызове метода {@link openPopup}.
 * @static
 * @example
 * js
 * <pre>
 *    import {Sticky} from 'Controls/popup';
 *    ...
 *    openSticky() {
 *        Sticky.openPopup({
 *          template: 'Example/MyStickyTemplate',
 *          autoClose: true
 *        }).then((popupId) => {
 *          this._popupId = popupId;
 *        });
 *    },
 *
 *    closeSticky() {
 *       Sticky.closePopup(this._popupId);
 *    }
 * </pre>
 * @see openPopup
 */

/*
 * Close Sticky popup.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/sticky/ See more}.
 * @function Controls/_popup/interface/ISticky#closePopup
 * @param {String} popupId Id of popup.
 * @static
 * @see openPopup
 */
