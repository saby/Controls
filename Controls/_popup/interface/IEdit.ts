import { IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import { IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import { IDialogPopupOptions} from 'Controls/_popup/interface/IDialog';
import {RecordSet} from 'Types/Collection';

/**
 * Интерфейс для опций окна редактирования
 *
 * @interface Controls/_popup/interface/IEdit
 * @public
 * @author Красильников А.С.
 */

type TOpenerOptions = IStickyPopupOptions|IStackPopupOptions|IDialogPopupOptions;

export interface IEditOptions {
    items?: RecordSet;
    mode?: string;
}

export interface IEditOpener {
    readonly '[Controls/_popup/interface/IEditOpener]': boolean;
}

/*
 * The control opens a popup with a record editing dialog.
 * When in the edit dialog the action takes place with the entry, control synchronize editable entry with recordsets.
 *  <li>If option 'mode' is set to 'stack' use {@link Controls/popup:Stack Stack options}</li>
 *  <li>If option 'mode' is set to 'dialog' use  {@link Controls/popup:Dialog Dialog options}</li>
 *  <li>If option 'mode' is set to 'sticky' use  {@link Controls/popup:Sticky Sticky options}</li>
 * <a href="/materials/demo-ws4-popup-edit">Demo-example</a>
 * {@link /doc/platform/developmentapl/interface-development/forms-and-validation/editing-dialog/ Подробнее}
 * @class Controls/_popup/interface/IEdit
 * @control
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/Edit/Opener
 * @category Popup
 */

/**
 * Открывает всплывающее окно диалога редактирования.
 * @function Controls/_popup/interface/IEdit#open
 * @param {Object} meta Данные, по которым определяется, откуда диалог получит редактируемую запись. В объект можно передать свойства key и record. Политика обработки свойств подробно описана {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/forms-and-validation/editing-dialog/#step4 здесь}.
 * @param {Object} popupOptions Опции всплывающего окна диалога редактирования.
 * В зависимости от значения опции 'mode':
 * * 'stack' — смотреть {@link Controls/_popup/interface/IStack/PopupOptions.typedef popupOptions стекового окна}
 * * 'dialog' — смотреть {@link Controls/_popup/interface/IDialog/PopupOptions.typedef popupOptions диалогового окна}
 * * 'sticky' — смотреть {@link Controls/_popup/interface/ISticky/PopupOptions.typedef popupOptions окна прилипающего блока}
 * @returns {undefined}
 * @example
 * * WML
 * <pre>
 *     <Controls.popup:Edit name="EditOpener">
 *        <ws:popupOptions template="Controls-demo/Popup/Edit/MyFormController">
 *           <ws:templateOptions source="{{_viewSource}}" />
 *        </ws:popupOptions>
 *     </Controls.popup:Edit>
 * </pre>
 * * JavaScript
 * <pre>
 * Control.extend({
 *    ...
 *    _itemClick(event, record) {
 *       var popupOptions = {
 *          closeOnOutsideClick: false,
 *       };
 *       this._children.EditOpener.open({record: record}, popupOptions);
 *    }
 * });
 * </pre>
 */
/*
 * Open edit popup.
 * @function Controls/_popup/interface/IEdit#open
 * @param {Object} meta Data to edit: key, record.
 * @param {Object} popupOptions options for edit popup.
 * <ul>
 *     <li>if mode option equal 'stack' see {@link Controls/_popup/Opener/Stack/PopupOptions.typedef popupOptions}</li>
 *     <li>if mode option equal 'dialog' see {@link Controls/_popup/Opener/Dialog/PopupOptions.typedef popupOptions}</li>
 *     <li>if mode option equal 'sticky' see {@link Controls/_popup/Opener/Sticky/PopupOptions.typedef popupOptions}</li>
 * </ul>
 * @returns {undefined}
 * @example
 * WML
 * <pre>
 *     <Controls.popup:Edit name="EditOpener">
 *        <ws:popupOptions template="Controls-demo/Popup/Edit/MyFormController">
 *           <ws:templateOptions source="{{_viewSource}}" />
 *        </ws:popupOptions>
 *     </Controls.popup:Edit>
 * </pre>
 * JavaScript
 * <pre>
 *   Control.extend({
 *        ...
 *
 *        _itemClick(event, record) {
 *           var popupOptions = {
 *              closeOnOutsideClick: false,
 *           };
 *
 *           var meta = {
 *              record: record,
 *          };
 *
 *           this._children.EditOpener.open(meta, popupOptions);
 *       }
 *    });
 * </pre>
 */

/**
 * Закрывает всплывающее окно диалога редактирования.
 * @function
 * @name Controls/_popup/interface/IEdit#close
 */
/*
 * Close popup
 * @function Controls/_popup/interface/IEdit#close
 */

/**
 * Возвращает информацию о том, открыто ли всплывающее окно.
 * @function
 * @name Controls/_popup/interface/IEdit#isOpened
 */
/*
 * Popup opened status
 * @function Controls/_popup/interface/IEdit#isOpened
 * @returns {Boolean} is popup opened
 */

/**
 * @typedef {Object} additionalData
 * @property {Boolean} isNewRecord Flag that determines what record is it.
 * @property {String} key Key of record
 */

/**
 * @event The event is called before the synchronization with the recordset.
 * @name Controls/_popup/interface/IEdit#beforeItemEndEdit
 * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
 * @param {String} formControllerEvent Name of event from formController(update, create, delete)
 * @param {Object} record Data from formController
 * @param {additionalData} additionalData Additional data from formController
 */

/**
 * @name Controls/_popup/interface/IEdit#mode
 * @cfg {Object} Устанавливает режим отображения диалога редактирования.
 * @variant stack Отображение диалога в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/stack/ стековом окне}.
 * @variant dialog Отображение диалога в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/dialog/ диалоговом окне}.
 * @variant sticky Отображение диалога в {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/sticky/ окне прилипающего блока}.
 */
/*
 * @name Controls/_popup/interface/IEdit#mode
 * @cfg {Object} Sets the display mode of the dialog.
 * @variant stack Open edit dialog in the stack panel.
 * @variant dialog Open edit dialog in the dialog popup.
 * @variant sticky Open edit dialog in the sticky popup.
 */

/**
 * @name Controls/_popup/interface/IEdit#items
 * @cfg {Object} Рекордсет для синхронизации с редактируемой записью.
 */
/*
 * @name Controls/_popup/interface/IEdit#items
 * @cfg {Object} RecordSet for synchronization with the editing record.
 */
