import { IStickyPopupOptions} from 'Controls/_popup/interface/ISticky';
import { IStackPopupOptions} from 'Controls/_popup/interface/IStack';
import { IDialogPopupOptions} from 'Controls/_popup/interface/IDialog';
import {RecordSet} from 'Types/Collection';

type TOpenerOptions = IStickyPopupOptions|IStackPopupOptions|IDialogPopupOptions;

export interface IEditOptions {
    items?: RecordSet;
    mode?: string;
}

/**
 * Интерфейс для опций окна редактирования.
 * @public
 * @author Красильников А.С.
 */
export interface IEditOpener {
    readonly '[Controls/_popup/interface/IEditOpener]': boolean;
}

/*
 * The control opens a popup with a record editing dialog.
 * When in the edit dialog the action takes place with the entry, control synchronize editable entry with recordsets.
 *  <li>If option 'mode' is set to 'stack' use {@link Controls/popup:Stack Stack options}</li>
 *  <li>If option 'mode' is set to 'dialog' use  {@link Controls/popup:Dialog Dialog options}</li>
 *  <li>If option 'mode' is set to 'sticky' use  {@link Controls/popup:Sticky Sticky options}</li>
 * <a href="/materials/Controls-demo/app/Controls-demo%2FPopup%2FEdit%2FOpener">Demo-example</a>
 * {@link /doc/platform/developmentapl/interface-development/controls/list/actions/editing-dialog/ Подробнее}
 * @class Controls/_popup/interface/IEditOpener
 * 
 * @public
 * @author Красильников А.С.
 * @demo Controls-demo/Popup/Edit/Opener
 */

/**
 * Открывает всплывающее окно диалога редактирования.
 * @function Controls/_popup/interface/IEditOpener#open
 * @param {Object} meta Данные, которые определяют откуда диалог получит редактируемую запись. В объект можно передать свойства key и record, политика обработки которых описана {@link /doc/platform/developmentapl/interface-development/controls/list/actions/editing-dialog/#step22 здесь}.
 * @param {Object} popupOptions Конфигурация всплывающего окна.
 * Набор опций, которым задается конфигурация, зависит от установленного значения в опции {@link Controls/_popup/interface/IEditOpener#mode mode}:
 * * если задано значение "stack", тогда в popupOptions передается набор опций для {@link Controls/popup:IStackOpener.PopupOptions.typedef конфигурации стекового окна}.
 * * если задано значение "dialog", тогда в popupOptions передается набор опций для {@link Controls/popup:IDialogOpener.PopupOptions.typedef конфигурации диалогового окна}
 * * если задано значение "sticky", тогда в popupOptions передается набор опций для {@link Controls/popup:IStickyOpener.PopupOptions.typedef конфигурации окна прилипающего блока}
 * @returns {undefined}
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.popup:Edit name="EditOpener">
 *    <ws:popupOptions template="Controls-demo/Popup/Edit/MyFormController">
 *       <ws:templateOptions source="{{_viewSource}}" />
 *    </ws:popupOptions>
 * </Controls.popup:Edit>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions>{
 *    ...
 *    _itemClick(event, record) {
 *       var popupOptions = {
 *          closeOnOutsideClick: false,
 *       };
 *       this._children.EditOpener.open({record: record}, popupOptions);
 *    }
 * }
 * </pre>
 * @see close
 * @see isOpened
 */
/*
 * Open edit popup.
 * @function Controls/_popup/interface/IEditOpener#open
 * @param {Object} meta Data to edit: key, record.
 * @param {Object} popupOptions options for edit popup.
 * <ul>
 *     <li>if mode option equal 'stack' see {@link Controls/_popup/Opener/Stack/PopupOptions.typedef popupOptions}</li>
 *     <li>if mode option equal 'dialog' see {@link Controls/_popup/Opener/Dialog/PopupOptions.typedef popupOptions}</li>
 *     <li>if mode option equal 'sticky' see {@link Controls/_popup/Opener/Sticky/PopupOptions.typedef popupOptions}</li>
 * </ul>
 * @returns {undefined}
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.popup:Edit name="EditOpener">
 *    <ws:popupOptions template="Controls-demo/Popup/Edit/MyFormController">
 *       <ws:templateOptions source="{{_viewSource}}" />
 *    </ws:popupOptions>
 * </Controls.popup:Edit>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions>{
 *    ...
 *    _itemClick(event, record) {
 *       var popupOptions = {
 *          closeOnOutsideClick: false,
 *       };
 *       this._children.EditOpener.open({record: record}, popupOptions);
 *    }
 * }
 * </pre>
 * @see close
 * @see isOpened
 */

/**
 * Закрывает всплывающее окно диалога редактирования.
 * @function
 * @name Controls/_popup/interface/IEditOpener#close
 * @see open
 * @see isOpened
 */
/*
 * Close popup
 * @function Controls/_popup/interface/IEditOpener#close
 * @see open
 * @see isOpened
 */

/**
 * Возвращает информацию о том, открыто ли всплывающее окно.
 * @function
 * @name Controls/_popup/interface/IEditOpener#isOpened
 * @returns {Boolean}
 * @see open
 * @see close
 */
/*
 * Popup opened status
 * @function Controls/_popup/interface/IEditOpener#isOpened
 * @returns {Boolean} is popup opened
 * @see open
 * @see close
 */

/**
 * @typedef {Object} Controls/_popup/interface/IEditOpener/AdditionalData
 * @property {Boolean} isNewRecord Принимает значение true, когда редактируемая запись отсутствует в источнике данных.
 * @property {String} key Идентификатор редактируемой записи.
 */

/**
 * @event Происходит перед синхронизацией с recordset.
 * @name Controls/_popup/interface/IEditOpener#beforeItemEndEdit
 * @param {UICommon/Events:SyntheticEvent} eventObject Дескриптор события.
 * @param {String} formControllerEvent Действие над записью, которое выполняется через formController: обновление существующей записи("update"), создание новой записи ("create") или удаление записи ("delete").
 * @param {Object} record Редактируемая записи.
 * @param {Controls/_popup/interface/IEditOpener/AdditionalData.typedef} additionalData Дополнительные данные, переданные из formController.
 */

/**
 * @name Controls/_popup/interface/IEditOpener#mode
 * @cfg {String} Режим отображения диалога редактирования.
 * @variant stack Отображение диалога в {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ стековом окне}. Для открытия диалога редактирования используйте класс {@link Controls/popup:Stack}.
 * @variant dialog Отображение диалога в {@link /doc/platform/developmentapl/interface-development/controls/openers/dialog/ диалоговом окне}. Для открытия диалога редактирования используйте класс {@link Controls/popup:Dialog}.
 * @variant sticky Отображение диалога в {@link /doc/platform/developmentapl/interface-development/controls/openers/sticky/ окне прилипающего блока}. Для открытия диалога редактирования используйте класс {@link Controls/popup:Sticky}.
 */
/*
 * @name Controls/_popup/interface/IEditOpener#mode
 * @cfg {String} Sets the display mode of the dialog.
 * @variant stack Open edit dialog in the stack panel.
 * @variant dialog Open edit dialog in the dialog popup.
 * @variant sticky Open edit dialog in the sticky popup.
 */

/**
 * @name Controls/_popup/interface/IEditOpener#items
 * @cfg {Types/collection:RecordSet} Рекордсет для синхронизации с редактируемой записью.
 */
/*
 * @name Controls/_popup/interface/IEditOpener#items
 * @cfg {Types/collection:RecordSet} RecordSet for synchronization with the editing record.
 */
