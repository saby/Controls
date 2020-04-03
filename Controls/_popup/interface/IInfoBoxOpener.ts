import {Control, TemplateFunction} from 'UI/Base';
import {IEventHandlers} from './IPopup';

/**
 * Интерфейс для опций всплывающих подсказок.
 *
 * @interface Controls/_popup/interface/IInfoBoxOpener
 * @private
 * @author Красильников А.С.
 */

export interface IInfoBoxPopupOptions {
    target?: HTMLElement | EventTarget | Control;
    opener?: Control | any; // TODO: https://online.sbis.ru/opendoc.html?guid=875d74bf-5b84-4a5b-802c-e7f47f1f98d1
    maxWidth?: number;
    style?: string;
    styleType?: string;
    targetSide?: string;
    alignment?: string;
    floatCloseButton?: boolean;
    closeOnOutsideClick?: boolean;
    hideDelay?: number;
    showDelay?: number;
    eventHandlers?: IEventHandlers;
    template?: Control | TemplateFunction | string | any;
    templateOptions?: any;
    message?: string;
    zIndexCallback(item, popupList): number;
    zIndex?: number; //TODO Compatible
    position?: string; //TODO старое, надо удалить
}

export interface IInfoBoxOpener {
    readonly '[Controls/_popup/interface/IInfoBoxOpener]': boolean;
}

/**
 * @typedef {Object} EventHandlers
 * @description Функции обратного вызова на события всплывающего окна.
 * @property {Function} onClose Функция обратного вызова, которая вызывается при закрытии всплывающего окна.
 * @property {Function} onResult Функция обратного вызова, которая вызывается в событии sendResult в шаблоне всплывающего окна.
 */

/*
 * @typedef {Object} EventHandlers
 * @description Callback functions on popup events.
 * @property {Function} onClose Callback function is called when popup is closed.
 * @property {Function} onResult Callback function is called at the sendResult event in the popup template.
 */

/**
 * Close popup.
 * @function Controls/_popup/interface/IInfoBoxOpener#close
 */

/**
 * @name Controls/_popup/interface/IInfoBoxOpener#isOpened
 * @function
 * @description Popup opened status.
 */

/**
 * Open popup.
 * @function Controls/_popup/interface/IInfoBoxOpener#open
 * @param {Object} Config
 * @returns {undefined}
 * @example
 * js
 * <pre>
 *   Control.extend({
 *      ...
 *
 *      _openInfobox() {
 *          var config= {
 *              message: 'My tooltip'
 *              target: this._children.buttonTarget //dom node
 *          }
 *          this._notify('openInfoBox', [config], {bubbling: true});
 *      }
 *
 *      _closeInfobox() {
 *          this._notify('closeInfoBox', [], {bubbling: true});
 *      }
 *   });
 * </pre>
 */

/**
 * Open InfoBox popup.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/infobox/ See more}.
 * @function Controls/_popup/interface/IInfoBoxOpener#openPopup
 * @param {Object} config InfoBox options. See {@link Controls/_popup/InfoBox description}.
 * @static
 * @see closePopup
 */

/**
 * Close InfoBox popup.
 * {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/infobox/ See more}.
 * @function Controls/_popup/interface/IInfoBoxOpener#closeInfoBox
 * @see openPopup
 * @static
 */
