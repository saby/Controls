import { IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import { IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import { IDialogPopupOptions} from 'Controls/_popup/interface/IDialog';
import {RecordSet} from 'Types/Collection';

/**
 * Интерфейс для опций окна редактирования
 *
 * @interface Controls/_popup/interface/IEditOptions
 * @public
 * @author Красильников А.С.
 */

export interface IEditOptions {
    items?: RecordSet;
    mode?: 'stack' | 'sticky' | 'dialog';
}

export interface IEditOpener {
    readonly '[Controls/_popup/interface/IEditOpener]': boolean;
}

/**
 * Открывает всплывающее окно диалога редактирования.
 * @function Controls/_popup/interface/IEditOptions#open
 * @param {Object} meta Данные, по которым определяется, откуда диалог получит редактируемую запись. В объект можно передать свойства key и record. Политика обработки свойств подробно описана {@link /doc/platform/developmentapl/interface-development/forms-and-validation/editing-dialog/#step4 здесь}.
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
 * @function Controls/_popup/interface/IEditOptions#open
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
 * @name Controls/_popup/interface/IEditOptions#close
 */
/*
 * Close popup
 * @function Controls/_popup/interface/IEditOptions#close
 */

/**
 * Возвращает информацию о том, открыто ли всплывающее окно.
 * @function
 * @name Controls/_popup/interface/IEditOptions#isOpened
 */
/*
 * Popup opened status
 * @function Controls/_popup/interface/IEditOptions#isOpened
 * @returns {Boolean} is popup opened
 */

/**
 * @typedef {Object} Controls/_popup/interface/IEditOptions/AdditionalData
 * @property {Boolean} isNewRecord Принимает значение true, когда редактируемая запись отсутствует в источнике данных.
 * @property {String} key Идентификатор редактируемой записи.
 */

/**
 * @event Происходит перед синхронизацией с recordset.
 * @name Controls/_popup/interface/IEditOptions#beforeItemEndEdit
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} formControllerEvent Действие над записью, которое выполняется через formController: обновление существующей записи("update"), создание новой записи ("create") или удаление записи ("delete").
 * @param {Object} record Редактируемая записи.
 * @param {Controls/_popup/interface/IEditOptions/AdditionalData.typedef} additionalData Дополнительные данные, переданные из formController.
 */

/**
 * @name Controls/_popup/interface/IEditOptions#mode
 * @cfg {Object} Режим отображения диалога редактирования.
 * @variant stack Отображение диалога в {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ стековом окне}. Для открытия диалога редактирования используйте класс {@link Controls/popup:Stack}.
 * @variant dialog Отображение диалога в {@link /doc/platform/developmentapl/interface-development/controls/openers/dialog/ диалоговом окне}. Для открытия диалога редактирования используйте класс {@link Controls/popup:Dialog}.
 * @variant sticky Отображение диалога в {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ окне прилипающего блока}. Для открытия диалога редактирования используйте класс {@link Controls/popup:Sticky}.
 */
/*
 * @name Controls/_popup/interface/IEditOptions#mode
 * @cfg {Object} Sets the display mode of the dialog.
 * @variant stack Open edit dialog in the stack panel.
 * @variant dialog Open edit dialog in the dialog popup.
 * @variant sticky Open edit dialog in the sticky popup.
 */

/**
 * @name Controls/_popup/interface/IEditOptions#items
 * @cfg {Types/collection:RecordSet} Рекордсет для синхронизации с редактируемой записью.
 */
/*
 * @name Controls/_popup/interface/IEditOptions#items
 * @cfg {Types/collection:RecordSet} RecordSet for synchronization with the editing record.
 */
