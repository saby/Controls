import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import {IEventHandlers, IPopupItemInfo} from 'Controls/_popup/interface/IPopup';
import {ILoadingIndicatorOptions} from 'Controls/_LoadingIndicator/interface/ILoadingIndicator';
import {List} from 'Types/collection';
import {IDataLoader} from 'Controls/_popup/interface/IBaseOpener';

/**
 * Интерфейс базовых опций окна.
 * @public
 * @author Красильников А.С.
 */
export interface IBasePopupOptions {
    id?: string;
    content?: Control<IControlOptions, unknown> | TemplateFunction;
    className?: string;
    template?: Control<IControlOptions, unknown> | TemplateFunction | string;
    closeOnOutsideClick?: boolean;
    templateOptions?: unknown;
    opener?: Control<IControlOptions, unknown> | null;
    autofocus?: boolean;
    topPopup?: boolean;
    modal?: boolean;
    closeOnOverlayClick?: boolean;
    eventHandlers?: IEventHandlers;
    isDefaultOpener?: boolean;
    showIndicator?: boolean;
    indicatorConfig?: ILoadingIndicatorOptions;
    dataLoaders?: IDataLoader[][];
    restrictiveContainer?: string;
    zIndexCallback?(item: IPopupItemInfo, popupList: List<IPopupItemInfo>): number;

    actionOnScroll?: string; // TODO Перенести на sticky, Удалить из baseOpener
    zIndex?: number; // TODO Compatible
    isCompoundTemplate?: boolean; // TODO Compatible
    _type?: string; // TODO Compatible
    isHelper?: boolean; //TODO удалить после перехода со статических методов на хелперы
}

/**
 * @name Controls/_popup/interface/IBasePopupOptions#showIndicator
 * @cfg {Boolean} Определяет, будет ли показываться индикатор при открытии окна
 * @default true
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#closeOnOverlayClick
 * @cfg {Boolean} Определяет, будет ли закрываться попап при клике по оверлею.
 * @description Актуально только при включенной опции {@link Controls/_popup/interface/IBasePopupOptions#modal modal}
 * @default false
 * @see Controls/_popup/interface/IBasePopupOptions#modal
 */

/**
 * @typedef {String} indicatorConfig
 * @description Конфигурация {@link Controls/LoadingIndicator/interface/ILoadingIndicator индикатора загрузки}
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#indicatorConfig
 * @cfg {indicatorConfig} Определяет конфигурацию индикатора загрузки, показываемого при открытии окна
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#autofocus
 * @cfg {Boolean} Определяет, установится ли фокус на шаблон попапа после его открытия.
 * @default true
 */

/*
 * @name Controls/_popup/interface/IBasePopupOptions#autofocus
 * @cfg {Boolean} Determines whether focus is set to the template when popup is opened.
 * @default true
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#modal
 * @cfg {Boolean} Определяет, будет ли открываемое окно блокировать работу пользователя с родительским приложением.
 * @default false
 */

/*
 * @name Controls/_popup/interface/IBasePopupOptions#modal
 * @cfg {Boolean} Determines whether the window is modal.
 * @default false
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#className
 * @cfg {String} Имена классов, которые будут применены к корневой ноде всплывающего окна.
 */

/*
 * @name Controls/_popup/interface/IBasePopupOptions#className
 * @cfg {String} Class names of popup.
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#closeOnOutsideClick
 * @cfg {Boolean} Определяет возможность закрытия всплывающего окна по клику вне.
 * @default false
 */

/*
 * @name Controls/_popup/interface/IBasePopupOptions#closeOnOutsideClick
 * @cfg {Boolean} Determines whether possibility of closing the popup when clicking past.
 * @default false
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#template
 * @cfg {String} Опция принимает строку, в которой содержится имя открываемого шаблона.
 * @remark
 * Шаблон задается строкой для того чтобы загружаться лениво при открытии окна.
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#zIndexCallback
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
 *   class MyControl extends Control<IControlOptions>{
 *       ...
 *       _zIndexCallback(currentItem) {
 *          if (currentItem.parentZIndex) {
 *             return currentItem.parentZIndex + 1;
 *          }
 *       }
 *       ...
 *    }
 * </pre>
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#topPopup
 * @cfg {Boolean} Определяет, будет ли окно открываться выше всех окон на странице.
 */

/*
 * @name Controls/_popup/interface/IBasePopupOptions#template
 * @cfg {String|TemplateFunction} Template inside popup.
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#templateOptions
 * @cfg {Object} Опции для контрола, переданного в {@link template}
 */

/*
 * @name Controls/_popup/interface/IBasePopupOptions#templateOptions
 * @cfg {String|TemplateFunction} Template options inside popup.
 */

/**
 * @name Controls/_popup/interface/IBasePopupOptions#opener
 * @cfg {Node} Логический инициатор открытия всплывающего окна. Читайте подробнее {@link /doc/platform/developmentapl/interface-development/ui-library/focus/activate-control/#control-opener здесь}.
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
 *   class MyControl extends Control<IControlOptions> {
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
 *  };
 * </pre>
 * TestStack.wml
 * <pre>
 *     ...
 *     <Controls.breadcrumbs:Path name="sendDataButton" caption="sendData" on:click="_sendData()"/>
 *     ...
 * </pre>
 * TestStack.js
 * <pre>
 *     class MyControl extends Control<IControlOptions>{
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
 *   class MyControl extends Control<IControlOptions>{
 *      ...
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
 *  };
 * </pre>
 * TestStack.wml
 * <pre>
 *     ...
 *     <Controls.breadcrumbs:Path name="sendDataButton" caption="sendData" on:click="_sendData()"/>
 *     ...
 * </pre>
 * TestStack.js
 * <pre>
 *     class MyControl extends Control<IControlOptions>{
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
 * @typedef {Object} Controls/_popup/interface/IBaseOpener/EventHandlers
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
 * @demo Controls-demo/Popup/Loader/Index
 * @cfg {DataLoader[]} Задает массив предзагрузчиков данных, необходимых для построения {@link template шаблона}.
 * Опция используется для ускорения открытия окна, за счет распараллеливания получения данных и построения верстки.
 * Полученные данные будут переданы в опцию <b>prefetchData</b>.
 * В рамках переходного этапа, для определения наличия предзагрузки данных используйте опцию <b>isPrefetchDataMode</b>. См. примеры.
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
 *       loadData(params, depsData) {
 *           const paramFromDependency = depsData[0].getRow();
 *           return new SbisService({
 *               endpoint: myEndpoint
 *           }).call('myMethod', {
 *               key: params.param1,
 *               rec: paramFromDependency
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
 *                      key: 'loaderForDependencies',
 *                      module: 'MyLoaderForDeps'
 *                 }],
 *                 [{
 *                     key: 'myLoaderKey',
 *                     module: 'MyLoader',
 *                     dependencies: ['loaderForDependencies'],
 *                     params: {
 *                         param1: 'data1'
 *                     }
 *                 }]
 *             ],
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
 * Описание шаблона окна
 *
 * <pre>
 *   class MyPopupTemplate extends Control {
 *      ...
 *
 *      _beforeMount(options) {
 *          if (!options.isPrefetchDataMode) {
 *              // Если данные не предзагружаются, значит контрол строится по старой схеме.
 *              // В этом случае в рамках совместимости этот контрол должен запросить данные самостоятельно.
 *              options.source.query({}).then(data => {
 *                  this._preloadData = data;
 *              }
 *          }
 *      }
 *
 *      _beforeUpdate(newOptions) {
 *          if (newOptions.isPrefetchDataMode) {
 *              if (newOptions.prefetchData !== this._options.prefetchData) {
 *                  this._preloadData = newOptions.prefetchData['myLoaderKey'];
 *              }
 *          }
 *      }
 *   }
 * </pre>
 *
 */

/**
 * @typedef {Object} DataLoader
 * @description Описание загрузчика данных
 * @property {String} module Имя модуля загрузчика, который реализует метод loadData.
 * @property {String} key Имя загрузчика. По умолчанию имя загрузчика берется из поля module.
 * @property {String[]} dependencies массив ключей загрузчиков от которых зависит данный.
 * Он будет вызван только после того, как отработают загрузичики из данного списка.
 * Их результаты придут в функцию загрузчика вторым аргументом.
 * Загрузчики из данного списка должны идти по порядку раньше текущего.
 * @property {Object} params Параметры, передающиеся в метод loadData.
 */
