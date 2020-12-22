import {Control, TemplateFunction} from 'UI/Base';
import {IEventHandlers, IPopupItemInfo} from './IPopup';
import {List} from 'Types/collection';
import {IControlOptions} from 'UI/Base';
import {ILoadingIndicatorOptions} from 'Controls/LoadingIndicator';


/**
 * Опции интерфейса подробно описаны {@link Controls/_popup/interface/IBaseOpener здесь}. 
 * @public
 */
export interface IBasePopupOptions {
    id?: string;
    className?: string;
    template?: Control<IControlOptions, unknown> | TemplateFunction | string;
    closeOnOutsideClick?: boolean;
    templateOptions?: unknown;
    opener?: Control<IControlOptions, unknown> | null;
    autofocus?: boolean;
    topPopup?: boolean;
    modal?: boolean;
    eventHandlers?: IEventHandlers;
    isDefaultOpener?: boolean;
    showIndicator?: boolean;
    indicatorConfig?: ILoadingIndicatorOptions;
    dataLoaders?: IDataLoader[][];
    zIndexCallback?(item: IPopupItemInfo, popupList: List<IPopupItemInfo>): number;
    actionOnScroll?: string; // TODO Перенести на sticky, Удалить из baseOpener
    zIndex?: number; // TODO Compatible
    isCompoundTemplate?: boolean; // TODO Compatible
    _type?: string; // TODO Compatible
    isHelper?: boolean; //TODO удалить после перехода со статических методов на хелперы
}

export interface IOpener {
    open(popupOptions: IBasePopupOptions, controller: string): Promise<string | undefined>;
    close(): void;
    isOpened(): boolean;
}

/**
 * Интерфейс базовых опций опенеров.
 * @public
 * @author Красильников А.С.
 */
export interface IBaseOpener {
    readonly '[Controls/_popup/interface/IBaseOpener]': boolean;
}

/*  https://online.sbis.ru/opendoc.html?guid=f654ff87-5fa9-4c80-a16e-fee7f1d89d0f
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

/* https://online.sbis.ru/opendoc.html?guid=f654ff87-5fa9-4c80-a16e-fee7f1d89d0f
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
 * @name Controls/_popup/interface/IBaseOpener#showIndicator
 * @cfg {Boolean} Определяет, будет ли показываться индикатор при открытии окна
 * @default true
 */

/**
 * @typedef {String} indicatorConfig
 * @description Конфигурация {@link Controls/LoadingIndicator/interface/ILoadingIndicator индикатора загрузки}
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#indicatorConfig
 * @cfg {indicatorConfig} Определяет конфигурацию индикатора загрузки, показываемого при открытии окна
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

/**
 * @name Controls/_popup/interface/IBaseOpener#zIndexCallback
 * @cfg {Function} Функция, позволяющая высчитать z-index окна вручную.
 * На вход принимает параметры:
 * <b>currentItem</b> - конфигурация текущего окна, для которого высчитывается z-index.
 * <b>popupList</b> - Список с конфигурацией открытых на данный момент окон.
 * @remark
 * Функция позволяет решить нетривиальные сценарии взаимодействия окон и не должна использоваться повсеместно.
 * Для большинства сценариев должно быть достаточно базового механизма простановки z-index.
 * @example
 * В этом примере открывается окно с подсказкой. Для этого окна z-index выставляется на 1 больше чем у родителя,
 * чтобы не конфликтовать с другими окнами.
 * <pre>
 *    // MyTooltip.wml
 *    <Controls.popup:Sticky zIndexCallback="_zIndexCallback" />
 * </pre>
 *
 * <pre>
 *    // MyTooltip.js
 *    Control.extend({
 *       ...
 *       _zIndexCallback(currentItem) {
 *          if (currentItem.parentZIndex) {
 *             return currentItem.parentZIndex + 1;
 *          }
 *       }
 *       ...
 *    });
 * </pre>
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#topPopup
 * @cfg {Boolean} Определяет, будет ли окно открываться выше всех окон на странице.
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
 * @cfg {Node} Логический инициатор открытия всплывающего окна. Читайте подробнее {@link /doc/platform/developmentapl/interface-development/ui-library/focus/index/#control-opener здесь}.
 */

/**
 * @event Происходит, когда дочерний контрол всплывающего окна инициирует событие 'sendResult'.
 * @name Controls/_popup/interface/IBaseOpener#result
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
 * @event Occurs when child control of popup notify "sendResult" event.
 * @name Controls/_popup/interface/IBaseOpener#result
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
 * @event Происходит при открытии всплывающего окна.
 * @name Controls/_popup/interface/IBaseOpener#open
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
 * @event Occurs when popup is opened.
 * @name Controls/_popup/interface/IBaseOpener#open
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
 * @event Происходит при закрытии всплывающего окна.
 * @name Controls/_popup/interface/IBaseOpener#close
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
 * @event Occurs when popup is closed.
 * @name Controls/_popup/interface/IBaseOpener#close
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
 * Когда {@link /doc/platform/developmentapl/interface-development/controls/openers/ открывающий контрол} добавлен в шаблон, можно задать декларативную подписку на события.
 * @property {Function} onOpen Функция обратного вызова, которая вызывается при открытии всплывающего окна.
 * Пример декларативной подписки на событие доступен {@link /doc/platform/developmentapl/interface-development/controls/openers/#event-open-window здесь}.
 * @property {Function} onClose Функция обратного вызова, которая вызывается при закрытии всплывающего окна.
 * Пример декларативной подписки на событие доступен {@link /doc/platform/developmentapl/interface-development/controls/openers/#event-close-window здесь}.
 * @property {Function} onResult Функция обратного вызова, которая вызывается в событии sendResult в шаблоне всплывающего окна.
 * Пример декларативной подписки на событие доступен {@link /doc/platform/developmentapl/interface-development/controls/openers/#event-result здесь}.
 */

/**
 * @name Controls/_popup/interface/IBaseOpener#dataLoaders
 * @cfg {DataLoader[]} Задает массив предзагрузчиков данных, необходимых для построения {@link template шаблона}.
 * Опция используется для ускорения открытия окна, за счет распараллеливания получения данных и построения верстки.
 * Полученные данные будут переданы в опцию prefetchPromise.
 * @remark
 * **Обратите внимение: модуль загрузчика данных - синглтон.**
 * **Внимание. Функционал является экспериментальным и не должен использоваться повсеместно.**
 * **Перед использованием проконсультируйтесь с ответственным за функционал.**
 * @example
 *
 * Описание модуля предзагрузки
 * <pre>
 *   import {getStore} from 'Application/Env';
 *   import {SbisService} from 'Types/source';
 *
 *   const STORE_KEY = 'MyStoreKey';
 *
 *   class MyLoader {
 *       init(): void {
 *           // Инициализация, если необходимо, вызывается перед вызовом loadData
 *       }
 *       getState(key) {
 *           return getStore(STORE_KEY).get(key);
 *       }
 *       setState(key, data) {
 *           getStore(STORE_KEY).set(key, data);
 *       }
 *
 *       // Возвращаем закэшированные данные, чтобы не запрашивать еще раз при построении на сервере.
 *       getReceivedData(params) {
 *           return this.getState(this._getKeyByParams(params));
 *       }
 *       _getKeyByParams(params) {
 *           // Нужно получить из параметров уникальное значение для данного набора параметров, чтобы закэшировать ответ.
 *       }
 *       loadData(params) {
 *           return new SbisService({
 *               endpoint: myEndpoint
 *           }).call('myMethod', {
 *               key: params.param1
 *           }).then((result) => {
 *               // Кэшируем результат
 *               this.setState(this._getKeyByParams(params), result);
 *           });
 *       }
 *   }
 *   // Загрузчик является синглтоном
 *   export default new MyLoader();
 * </pre>
 *
 * Описание предзагрузчика при открытии окна
 * <pre>
 *   class UserControl extends Control {
 *      ...
 *      protected _stack: StackOpener = new StackOpener();
 *      _openStack() {
 *         const popupOptions = {
 *             template: 'MyPopupTemplate',
 *             dataLoaders: [
 *                 [{
 *                     key: 'myLoaderKey',
 *                     module: 'MyLoader',
 *                     params: {
 *                         param1: 'data1'
 *                     }
 *                 }]
*              ],
 *             templateOptions: {
 *                 record: null
 *             }
 *         }
 *         this._stack.open(popupOptions)
 *      }
 *      ...
 *  }
 * </pre>
 *
 * </pre>
 *
 * Описание шаблона окна
 *
 * <pre>
 *   class MyPopupTemplate extends Control {
 *      ...
 *
 *      _beforeMount(options) {
 *          options.prefetchPromise.then((resultObject) => {
 *              this._preloadData = resultObject;
 *          });
 *      }
 *      ...
 *   }
 * </pre>
 *
 */

/**
 * @typedef {Object} DataLoader
 * @description Описание загрузчика данных
 * @property {String} module Имя модуля загрузчика, который реализует метод loadData.
 * @property {String} key Имя загрузчика. По умолчанию имя загрузчика берется из поля module.
 * @property {Object} params Параметры, передающиеся в метод loadData.
 */
export interface IDataLoader {
    key?: string;
    module: string;
    params?: Record<string, unknown>;
    dependencies?: string[];
    await?: boolean;
}
