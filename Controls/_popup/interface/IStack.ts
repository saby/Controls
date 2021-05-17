import { IOpener, IBasePopupOptions } from 'Controls/_popup/interface/IBaseOpener';

export interface IStackPopupOptions extends IBasePopupOptions {
    minWidth?: number;
    width?: number;
    maxWidth?: number;
    propStorageId?: number;
    restrictiveContainer?: string;
}

/**
 * Интерфейс для опций {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ стековых окон}.
 * @public
 * @author Красильников А.С.
 */
export interface IStackOpener extends IOpener {
    readonly '[Controls/_popup/interface/IStackOpener]': boolean;
}

/**
 * Метод открытия {@link /doc/platform/developmentapl/interface-development/controls/openers/stack/ стекового окна}.
 * @function Controls/_popup/interface/IStackOpener#open
 * @param {Controls/_popup/interface/IStackOpener/PopupOptions.typedef} popupOptions Конфигурация стекового окна.
 * @remark
 * Если требуется открыть окно, без создания {@link Controls/popup:Stack} в верстке, следует использовать статический метод {@link openPopup}.
 * Повторный вызов этого метода вызовет переририсовку контрола.
 * @return Promise<void>
 * @example
 * В этом примере показано, как открыть и закрыть стековое окно.
 * <pre class="brush: html">
 * <!-- WML-->
 * <Controls.popup:Stack name="stack" template="Controls-demo/Popup/TestStack" modal="{{true}}">
 *    <ws:templateOptions key="111"/>
 * </Controls.popup:Stack>
 *
 * <Controls.buttons:Button name="openStackButton" caption="open stack" on:click="_openStack()"/>
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions>{
 *    _openStack() {
 *       var popupOptions = {
 *          autofocus: true
 *       }
 *       this._children.stack.open(popupOptions)
 *    }
 * }
 * </pre>
 * <pre class="brush: js">
 * // TypeScript
 * import {StackOpener} from 'Controls/popup';
 *
 * this._stack = new StackOpener();
 *
 * openStack() {
 *     this._stack.open({
 *         template: 'Example/MyStackTemplate',
 *         opener: this._children.myButton
 *     });
 * }
 * </pre>
 * @see close
 */

/**
 * @name Controls/_popup/interface/IStackOpener#close
 * @description Метод закрытия стекового окна.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.popup:Stack name="stack" template="Controls-demo/Popup/TestStack" modal="{{true}}">
 *    <ws:templateOptions key="111"/>
 * </Controls.popup:Stack>
 *
 * <Controls.buttons:Button name="closeStackButton" caption="close stack" on:click="_closeStack()"/>
 * </pre>
 * 
 * <pre class="brush: js">
 * // JavaScript
 * class MyControl extends Control<IControlOptions>{
 *    _closeStack() {
 *       this._children.stack.close()
 *    }
 * }
 * </pre>
 * 
 * <pre class="brush: js">
 * // TypeScript
 * import {StackOpener} from 'Controls/popup';
 *
 * this._stack = new StackOpener();
 *
 * closeStack() {
 *     this._stack.close();
 * }
 * </pre>
 * @see open
 */

/**
 * @typedef {Object} Controls/_popup/interface/IStackOpener/PopupOptions
 * @description Конфигурация стекового окна.
 * @property {Boolean} [autofocus=true] Установится ли фокус на шаблон попапа после его открытия.
 * @property {Boolean} [modal=false] Будет ли открываемое окно блокировать работу пользователя с родительским приложением.
 * @property {String} className Имена классов, которые будут применены к корневой ноде стекового окна.
 * @property {Boolean} [closeOnOutsideClick=false] Определяет возможность закрытия стекового окна по клику вне.
 * @property {function|String} template Шаблон стекового окна.
 * @property {function|String} templateOptions Опции для контрола, переданного в {@link template}.
 * @property {Number} minWidth Минимально допустимая ширина стекового окна. Значение указывается в px.
 * @property {Number} maxWidth Максимально допустимая ширина стекового окна. Значение указывается в px.
 * @property {Number} width Текущая ширина стекового окна. Значение указывается в px.
 * @property {Node} opener Логический инициатор открытия стекового окна (см. {@link /doc/platform/developmentapl/interface-development/ui-library/focus/activate-control/#control-opener Определение понятия "опенер контрола"}).
 * @property {Controls/_popup/interface/IBaseOpener/EventHandlers.typedef} eventHandlers Функции обратного вызова на события стекового окна.
 */

/*
 * @typedef {Object} Controls/_popup/interface/IStackOpener/PopupOptions
 * @description Stack popup options.
 * @property {Boolean} [autofocus=true] Determines whether focus is set to the template when popup is opened.
 * @property {Boolean} [modal=false] Determines whether the window is modal.
 * @property {String} className Class names of popup.
 * @property {Boolean} [closeOnOutsideClick=false] Determines whether possibility of closing the popup when clicking past.
 * @property {function|String} template Template inside popup.
 * @property {function|String} templateOptions Template options inside popup.
 * @property {Number} minWidth The minimum width of popup.
 * @property {Number} maxWidth The maximum width of popup.
 * @property {Number} width Width of popup.
 * @property {Node} opener Read more {@link /doc/platform/developmentapl/interface-development/ui-library/focus/index/#control-opener there}.
 * @property {Controls/_popup/interface/IBaseOpener/EventHandlers.typedef} eventHandlers Callback functions on popup events.
 */

/**
 * @name Controls/_popup/interface/IStackOpener#minWidth
 * @cfg {Number} Минимально допустимая ширина стекового окна.
 * @remark
 * Значение может быть задано как на опциях Controls/popup:Stack, так и на дефолтных опциях шаблона {@link template}.
 * Приоритетнее то, которое задано на Controls/popup:Stack.
 */
/*
* @name Controls/_popup/interface/IStackOpener#minWidth
* @cfg {Number} The minimum width of popup.
*/

/**
 * @name Controls/_popup/interface/IStackOpener#width
 * @cfg {Number} Текущая ширина стекового окна.
 * @remark
 * Значение может быть задано как на опциях Controls/popup:Stack, так и на дефолтных опциях шаблона {@link template}.
 * Приоритетнее то, которое задано на Controls/popup:Stack.
 */
/*
* @name Controls/_popup/interface/IStackOpener#width
* @cfg {Number} Width of popup.
*/

    /**
 * @name Controls/_popup/interface/IStackOpener#maxWidth
 * @cfg {Number} Максимально допустимая ширина стекового окна.
 * @remark
 * Значение может быть задано как на опциях Controls/popup:Stack, так и на дефолтных опциях шаблона {@link template}.
 * Приоритетнее то, которое задано на Controls/popup:Stack.
 */
/*
* @name Controls/_popup/interface/IStackOpener#maxWidth
* @cfg {Number} The maximum width of popup.
*/
/**
 * @name Controls/_popup/interface/IStackOpener#propStorageId
 * @cfg {String} Уникальный идентификатор контрола, по которому будет сохраняться конфигурация в хранилище данных.
 * С помощью этой опции включается функционал движения границ.
 * Помимо propStorageId необходимо задать опции {@link width}, {@link minWidth}, {@link maxWidth}.
 */

/**
 * @name Controls/_popup/interface/IStackOpener#restrictiveContainer
 * @cfg {String} Опция задает контейнер (через <b>селектор</b>), внутри которого будет позиционироваться окно. Окно не может спозиционироваться за пределами restrictiveContainer.
 * @remark
 * Алгоритм поиска контейнера, внутри которого будут строиться окна:
 * 
 * * Если задана опция restrictiveContainer, то ищем глобальным поиском класс по селектору, заданному в опции.
 * Если ничего не нашли или опция не задана см. следующий шаг.
 * * Если у окна есть родитель, то опрашиваем родителя, в каком контейнере он спозиционировался и выбираем его.
 * * Если родителя нет, то ищем глобальным селектором класс controls-Popup__stack-target-container.
 *
 * Класс controls-Popup__stack-target-container является зарезервированным и должен быть объявлен на странице только 1 раз.
 * Классом должен быть добавлен на контейнер, по которому позиционируются стековые окна по умолчанию.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <div class='myRestrictiveContainer'>Контейнер со своими размерами</div>
 * <Controls.buttons:Button caption="open stack" on:click="_openStack()"/>
 * </pre>
 * 
 * <pre class="brush: js">
 * // TypeScript
 * import {StackOpener} from 'Controls/popup';
 * _beforeMount(): void{
 *    this._stackOpener = new StackOpener();
 * }
 * _openStack(): void {
 *    const config = {
 *       template: 'Controls-demo/Popup/TestStack',
 *       closeOnOutsideClick: true,
 *       autofocus: true,
 *       opener: null,
 *       restrictiveContainer: '.myRestrictiveContainer'
 *    };
 *    this._stackOpener.open(config);
 * }
 * </pre>
 * @demo Controls-demo/Popup/Stack/RestrictiveContainer/Index
 */

/**
 * Разрушает экземпляр класса
 * @name Controls/_popup/PopupHelper/Stack#destroy
 * @function
 * @example
 * <pre class="brush: js">
 * import {StackOpener} from 'Controls/popup';
 *
 * this._stack = new StackOpener();
 *
 * _beforeUnmount() {
 *     this._stack.destroy();
 *     this._stack = null;
 * }
 * </pre>
 * @see open
 * @see close
 * @see isOpened
 */

/**
 * @name Controls/_popup/PopupHelper/Stack#isOpened
 * @description Возвращает информацию о том, открыто ли стековое окно.
 * @function
 * @see open
 * @see close
 * @see destroy
 */