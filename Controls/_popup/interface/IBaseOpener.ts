import {Control, TemplateFunction} from 'UI/Base';
import {IEventHandlers} from './IPopup';

/**
 * Интерфейс базовых опций опенеров.
 *
 * @interface Controls/_popup/interface/IBaseOpener
 * @public
 * @author Красильников А.С.
 */

export interface IBasePopupOptions {
    className?: string;
    template?: Control | TemplateFunction | string | any; // TODO: https://online.sbis.ru/opendoc.html?guid=875d74bf-5b84-4a5b-802c-e7f47f1f98d1
    closeOnOutsideClick?: boolean;
    templateOptions?: any;
    opener?: Control | any; // TODO: https://online.sbis.ru/opendoc.html?guid=875d74bf-5b84-4a5b-802c-e7f47f1f98d1
    autofocus?: boolean;
    modal?: boolean;
    eventHandlers?: IEventHandlers;
    isDefaultOpener?: boolean;
    actionOnScroll?: string; // TODO Перенести на sticky, Удалить из baseOpener
    zIndex?: number; // TODO Compatible
    isCompoundTemplate?: boolean; // TODO Compatible
    _type?: string; // TODO Compatible
}

export interface IOpener {
    open(popupOptions: IBasePopupOptions, controller: string): Promise<string | undefined>;
    close(): void;
    isOpened(): boolean;
}

export interface IBaseOpener {
    readonly '[Controls/_popup/interface/IBaseOpener]': boolean;
}

/**
 * Открывает всплывающее окно.
 * @function Controls/_popup/interface/IBaseOpener#open
 * @param popupOptions Конфигурация всплывающего окна
 * @param controller Контрол-контроллер для всплывающего окна.
 */

/*
 * Opens a popup
 * @function Controls/_popup/interface/IBaseOpener#open
 * @param popupOptions Popup configuration
 * @param controller Popup Controller
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#close
 * @description Метод вызова закрытия всплывающего окна
 * @function
 * @example
 * wml
 * <pre>
 *    <Controls.popup:Sticky name="sticky" template="Controls-demo/Popup/TestDialog">
 *          <ws:direction vertical="bottom" horizontal="left"/>
 *          <ws:targetPoint vertical="bottom" horizontal="left"/>
 *    </Controls.popup:Sticky>
 *
 *    <div name="target">{{_text}}</div>
 *
 *    <Controls.buttons:Button name="openStickyButton" caption="open sticky" on:click="_open()"/>
 *    <Controls.buttons:Button name="closeStickyButton" caption="close sticky" on:click="_close()"/>
 * </pre>
 * js
 * <pre>
 *   Control.extend({
 *      ...
 *
 *      _open() {
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
 *  });
 *  </pre>
 *  @see open
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#isOpened
 * @description Возвращает информацию о том, открыто ли всплывающее окно.
 * @function
 */

/*
 * @name Controls/_popup/interface/IBaseOpener#isOpened
 * @description Popup opened status.
 * @function
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#autofocus
 * @cfg {Boolean} Определяет, установится ли фокус на шаблон попапа после его открытия.
 * @default true
 */

/*
 * @name Controls/_popup/interface/IBaseOpener#autofocus
 * @cfg {Boolean} Determines whether focus is set to the template when popup is opened.
 * @default true
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#modal
 * @cfg {Boolean} Определяет, будет ли открываемое окно блокировать работу пользователя с родительским приложением.
 * @default false
 */

/*
 * @name Controls/_popup/interface/IBaseOpener#modal
 * @cfg {Boolean} Determines whether the window is modal.
 * @default false
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#className
 * @cfg {String} Имена классов, которые будут применены к корневой ноде всплывающего окна.
 */

/*
 * @name Controls/_popup/interface/IBaseOpener#className
 * @cfg {String} Class names of popup.
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#closeOnOutsideClick
 * @cfg {Boolean} Определяет возможность закрытия всплывающего окна по клику вне.
 * @default false
 */

/*
 * @name Controls/_popup/interface/IBaseOpener#closeOnOutsideClick
 * @cfg {Boolean} Determines whether possibility of closing the popup when clicking past.
 * @default false
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#template
 * @cfg {String|Function} Шаблон всплывающего окна
 */

/*
 * @name Controls/_popup/interface/IBaseOpener#template
 * @cfg {String|Function} Template inside popup.
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#templateOptions
 * @cfg {String|Function} Опции для контрола, переданного в {@link template}
 */

/*
 * @name Controls/_popup/interface/IBaseOpener#templateOptions
 * @cfg {String|Function} Template options inside popup.
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#opener
 * @cfg {Node} Логический инициатор открытия всплывающего окна. Читайте подробнее {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/ui-library/focus/index/#control-opener здесь}.
 */

/**
 * @event Controls/_popup/interface/IBaseOpener#result Происходит, когда дочерний контрол всплывающего окна инициирует событие 'sendResult'
 * @example
 * В этом примере мы подписываемся на событие 'result' и в его обработчике сохраняем данные с шаблона.
 * <pre>
 *    // MainControl.wml
 *    <Controls.popup:Stack on:result="_popupResultHandler()" />
 * </pre>
 *
 * <pre>
 *    // MainControl.js
 *    Control.extend({
 *       ...
 *       _popupResultHandler(event, userData) {
 *          this._saveUserData(userData);
 *       }
 *       ...
 *    });
 * </pre>
 *
 * <pre>
 *    // popupTemplate.js
 *    Control.extend({
 *       ...
 *       _sendDataToMainControl(userData) {
 *          this._notify('sendResult', [userData], { bubbling: true});
 *       }
 *       ...
 *    });
 * </pre>
 */

/*
 * @event Controls/_popup/interface/IBaseOpener#result Occurs when child control of popup notify "sendResult" event.
 * @example
 * In this example, we subscribe to result event and save user data.
 * <pre>
 *    // MainControl.wml
 *    <Controls.popup:Stack on:result="_popupResultHandler()" />
 * </pre>
 *
 * <pre>
 *    // MainControl.js
 *    Control.extend({
 *       ...
 *       _popupResultHandler(event, userData) {
 *          this._saveUserData(userData);
 *       }
 *       ...
 *    });
 * </pre>
 *
 * <pre>
 *    // popupTemplate.js
 *    Control.extend({
 *       ...
 *       _sendDataToMainControl(userData) {
 *          this._notify('sendResult', [userData], { bubbling: true});
 *       }
 *       ...
 *    });
 * </pre>
 */

/**
 * @event Controls/_popup/interface/IBaseOpener#open Происходит при открытии всплывающего окна
 * @example
 * В этом примере мы подписываемся на событие 'open' и в его обработчике меняем состояние '_popupOpened'
 * <pre>
 *    <Controls.popup:Stack on:open="_popupOpenHandler()" />
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _popupOpenHandler() {
 *          this._popupOpened = true;
 *          this._changeStatus(this._popupOpened);
 *       }
 *       ...
 *    });
 * </pre>
 */

/*
 * @event Controls/_popup/interface/IBaseOpener#open Occurs when popup is opened.
 * @example
 * In this example, we subscribe to open event and change text at input control
 * <pre>
 *    <Controls.popup:Stack on:open="_popupOpenHandler()" />
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _popupOpenHandler() {
 *          this._popupOpened = true;
 *          this._changeStatus(this._popupOpened);
 *       }
 *       ...
 *    });
 * </pre>
 */

/**
 * @event Controls/_popup/interface/IBaseOpener#close Происходит при закрытии всплывающего окна
 * @example
 * В этом примере мы подписываемся на событие 'close' и в его обработчике удаляем элемент из списка.
 * <pre>
 *    <Controls.popup:Stack on:close="_popupCloseHandler()" />
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _popupCloseHandler() {
 *          this._removeItem(this._currentItem);
 *       }
 *       ...
 *    });
 * </pre>
 */

/*
 * @event Controls/_popup/interface/IBaseOpener#close Occurs when popup is closed.
 * @example
 * In this example, we subscribe to close event and remove item at list
 * <pre>
 *    <Controls.popup:Stack on:close="_popupCloseHandler()" />
 * </pre>
 *
 * <pre>
 *    Control.extend({
 *       ...
 *       _popupCloseHandler() {
 *          this._removeItem(this._currentItem);
 *       }
 *       ...
 *    });
 * </pre>
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#eventHandlers
 * @cfg {EventHandlers[]} Функции обратного вызова на события всплывающего окна.
 * @default {}
 * @remark
 * Необходимо учитывать контекст выполнения функций обратного вызова.
 * @example
 * userControl.wml
 * <pre>
 *     <Controls.popup:Stack name="stack">
 *         <ws:popupOptions template="Controls-demo/Popup/TestStack" modal="{{true}}" autofocus="{{false}}">
 *            <ws:templateOptions key="111"/>
 *            <ws:eventHandlers onResult="{{_onResultHandler}}" onClose="{{_onCloseHandler}}" />
 *         </ws:popupOptions>
 *      </Controls.popup:Stack>
 *
 *      <Controls.breadcrumbs:Path name="openStackButton" caption="open stack" on:click="_openStack()"/>
 * </pre>
 * userControl.js
 * <pre>
 *   Control.extend({
 *      ...
 *
 *      constructor: function() {
 *         Control.superclass.constructor.apply(this, arguments);
 *         this._onResultHandler = this._onResultHandler.bind(this);
 *         this._onCloseHandler= this._onCloseHandler.bind(this);
 *      }
 *
 *      _openStack() {
 *         var popupOptions = {
 *             autofocus: true,
 *             templateOptions: {
 *               record: this._record
 *             }
 *         }
 *         this._children.stack.open(popupOptions)
 *      }
 *
 *      _onResultHandler(newData) {
 *         this._data = newData;
 *      }
 *
 *      _onCloseHandler() {
 *         this._sendData(this._data);
 *      }
 *      ...
 *  });
 * </pre>
 * TestStack.wml
 * <pre>
 *     ...
 *     <Controls.breadcrumbs:Path name="sendDataButton" caption="sendData" on:click="_sendData()"/>
 *     ...
 * </pre>
 * TestStack.js
 * <pre>
 *     Control.extend({
 *         ...
 *
 *         _sendData() {
 *            var data = {
 *               record: this._record,
 *               isNewRecord: true
 *            }
 *
 *            // send data to userControl.js
 *            this._notify('sendResult', [data], {bubbling: true});
 *
 *            // close popup
 *            this._notify('close', [], {bubbling: true});
 *         }
 *         ...
 *     );
 * </pre>
 */

/*
 * @name Controls/_popup/interface/IBaseOpener#eventHandlers
 * @cfg {EventHandlers[]} Callback functions on popup events.
 * @variant onClose Callback function is called when popup is closed.
 * @default {}
 * @remark
 * You need to consider the context of callback functions execution. see examples.
 * @example
 * userControl.wml
 * <pre>
 *     <Controls.popup:Stack name="stack">
 *         <ws:popupOptions template="Controls-demo/Popup/TestStack" modal="{{true}}" autofocus="{{false}}">
 *            <ws:templateOptions key="111"/>
 *            <ws:eventHandlers onResult="{{_onResultHandler}}" onClose="{{_onCloseHandler}}" />
 *         </ws:popupOptions>
 *      </Controls.popup:Stack>
 *
 *      <Controls.breadcrumbs:Path name="openStackButton" caption="open stack" on:click="_openStack()"/>
 * </pre>
 * userControl.js
 * <pre>
 *   Control.extend({
 *      ...
 *
 *      constructor: function() {
 *         Control.superclass.constructor.apply(this, arguments);
 *         this._onResultHandler = this._onResultHandler.bind(this);
 *         this._onCloseHandler= this._onCloseHandler.bind(this);
 *      }
 *
 *      _openStack() {
 *         var popupOptions = {
 *             autofocus: true,
 *             templateOptions: {
 *               record: this._record
 *             }
 *         }
 *         this._children.stack.open(popupOptions)
 *      }
 *
 *      _onResultHandler(newData) {
 *         this._data = newData;
 *      }
 *
 *      _onCloseHandler() {
 *         this._sendData(this._data);
 *      }
 *      ...
 *  });
 * </pre>
 * TestStack.wml
 * <pre>
 *     ...
 *     <Controls.breadcrumbs:Path name="sendDataButton" caption="sendData" on:click="_sendData()"/>
 *     ...
 * </pre>
 * TestStack.js
 * <pre>
 *     Control.extend({
 *         ...
 *
 *         _sendData() {
 *            var data = {
 *               record: this._record,
 *               isNewRecord: true
 *            }
 *
 *            // send data to userControl.js
 *            this._notify('sendResult', [data], {bubbling: true});
 *
 *            // close popup
 *            this._notify('close', [], {bubbling: true});
 *         }
 *         ...
 *     );
 * </pre>
 */

/**
 * @typedef {Object} EventHandlers
 * @description Функции обратного вызова позволяют подписаться на события всплывающего окна, открытого через статические методы.
 * Когда {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/ открывающий контрол} добавлен в шаблон, можно задать декларативную подписку на события.
 * @property {Function} onOpen Функция обратного вызова, которая вызывается при открытии всплывающего окна.
 * Пример декларативной подписки на событие доступен {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/#event-open-window здесь}.
 * @property {Function} onClose Функция обратного вызова, которая вызывается при закрытии всплывающего окна.
 * Пример декларативной подписки на событие доступен {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/#event-close-window здесь}.
 * @property {Function} onResult Функция обратного вызова, которая вызывается в событии sendResult в шаблоне всплывающего окна.
 * Пример декларативной подписки на событие доступен {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/openers/#event-result здесь}.
 */
