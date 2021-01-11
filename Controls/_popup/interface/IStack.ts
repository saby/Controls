import { IOpener, IBasePopupOptions } from 'Controls/_popup/interface/IBaseOpener';

/**
 * Опции интерфейса описаны {@link Controls/_popup/interface/IStackOpener здесь}.
 * @public
 * @author Красильников А.С.
 */
export interface IStackPopupOptions extends IBasePopupOptions {
    /**
     * @name Controls/_popup/interface/IStackOpener#minWidth
     * @cfg {Number} Минимально допустимая ширина стековой панели.
     * @remark
     * Значение может быть задано как на опциях Controls/popup:Stack, так и на дефолтных опциях шаблона {@link template}.
     * Приоритетнее то, которое задано на Controls/popup:Stack.
     */
    /*
     * @name Controls/_popup/interface/IStackOpener#minWidth
     * @cfg {Number} The minimum width of popup.
     */
    minWidth?: number;
    /**
     * @name Controls/_popup/interface/IStackOpener#width
     * @cfg {Number} Текущая ширина стековой панели.
     * @remark
     * Значение может быть задано как на опциях Controls/popup:Stack, так и на дефолтных опциях шаблона {@link template}.
     * Приоритетнее то, которое задано на Controls/popup:Stack.
     */
    /*
    * @name Controls/_popup/interface/IStackOpener#width
    * @cfg {Number} Width of popup.
    */
    width?: number;
    /**
     * @name Controls/_popup/interface/IStackOpener#maxWidth
     * @cfg {Number} Максимально допустимая ширина стековой панели.
     * @remark
     * Значение может быть задано как на опциях Controls/popup:Stack, так и на дефолтных опциях шаблона {@link template}.
     * Приоритетнее то, которое задано на Controls/popup:Stack.
     */
    /*
    * @name Controls/_popup/interface/IStackOpener#maxWidth
    * @cfg {Number} The maximum width of popup.
    */
    maxWidth?: number;
    /**
     * @name Controls/_popup/interface/IStackOpener#propStorageId
     * @cfg {String} Уникальный идентификатор контрола, по которому будет сохраняться конфигурация в хранилище данных.
     * С помощью этой опции включается функционал движения границ.
     * Помимо propStorageId необходимо задать опции {@link width}, {@link minWidth}, {@link maxWidth}.
     */
    propStorageId?: number;
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
    restrictiveContainer?: string;
}

/**
 * Интерфейс для опций стековых окон.
 * @public
 * @author Красильников А.С.
 */
export interface IStackOpener extends IOpener {
    readonly '[Controls/_popup/interface/IStackOpener]': boolean;
}

/**
 * Метод открытия стековой панели.
 * Повторный вызов этого метода вызовет переририсовку контрола.
 * @function Controls/_popup/interface/IStackOpener#open
 * @param {Controls/_popup/interface/IStackOpener/PopupOptions.typedef} popupOptions Конфигурация стековой панели.
 * @remark
 * Если требуется открыть окно, без создания popup:Stack в верстке, следует использовать статический метод {@link openPopup}.
 * @example
 * В этом примере показано, как открыть и закрыть стековую панель.
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
 * Control.extend({
 *    _openStack() {
 *       var popupOptions = {
 *          autofocus: true
 *       }
 *       this._children.stack.open(popupOptions)
 *    }
 * });
 * </pre>
 * @see close
 */

/**
 * @name Controls/_popup/interface/IStackOpener#close
 * @description Метод закрытия стековой панели.
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
 * Control.extend({
 *    _closeStack() {
 *       this._children.stack.close()
 *    }
 * });
 * </pre>
 * @see open
 */

/**
 * @typedef {Object} Controls/_popup/interface/IStackOpener/PopupOptions
 * @description Конфигурация стековой панели.
 * @property {Boolean} [autofocus=true] Определяет, установится ли фокус на шаблон попапа после его открытия.
 * @property {Boolean} [modal=false] Определяет, будет ли открываемое окно блокировать работу пользователя с родительским приложением.
 * @property {String} className Имена классов, которые будут применены к корневой ноде всплывающего окна.
 * @property {Boolean} [closeOnOutsideClick=false] Определяет возможность закрытия всплывающего окна по клику вне.
 * @property {function|String} template Шаблон всплывающего окна.
 * @property {function|String} templateOptions Опции для контрола, переданного в {@link template}.
 * @property {Number} minWidth Минимально допустимая ширина всплывающего окна. Значение указывается в px.
 * @property {Number} maxWidth Максимально допустимая ширина всплывающего окна. Значение указывается в px.
 * @property {Number} width Текущая ширина всплывающего окна. Значение указывается в px.
 * @property {Node} opener Логический инициатор открытия всплывающего окна. Читайте подробнее {@link /doc/platform/developmentapl/interface-development/ui-library/focus/index/#control-opener здесь}.
 * @property {Controls/_popup/interface/IBaseOpener/EventHandlers.typedef} eventHandlers Функции обратного вызова на события стековой панели.
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
