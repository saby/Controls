import Control = require('Core/Control');
import template = require('wml!Controls/_operations/Panel/Panel');

/**
 * Контрол, предназначенный для операций над множеством записей списка.
 * 
 * @remark
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/operations/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_operations.less">переменные тем оформления</a>
 *
 * @class Controls/_operations/Panel
 * @extends Core/Control
 * @mixes Controls/_toolbars/IToolbarSource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/_interface/IHierarchy
 * @control
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/OperationsPanelNew/Base/Index
 * @demo Controls-demo/OperationsPanelNew/ReadOnly/Index
 */

/*
 * Control for grouping operations.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/operations/'>here</a>.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">Demo</a>.
 *
 * @class Controls/_operations/Panel
 * @extends Core/Control
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/_interface/IHierarchy
 * @control
 * @public
 * @author Герасимов А.М.
 * @demo Controls-demo/OperationsPanelNew/Base/Index
 */

/**
 * @name Controls/_operations/Panel#rightTemplate
 * @cfg {String|Function} Шаблон, отображаемый в правой части панели массового выбора.
 * @demo Controls-demo/OperationsPanelNew/RightTemplate/Index
 * @example
 * <pre class="brush: html">
 * <Controls.operations:Panel>
 *     <ws:rightTemplate>
 *         <Controls.buttons:Button caption="Доп. операции"
 *                                  on:click="_onClickAddBlock()"
 *                                  iconSize="s"
 *                                  icon="icon-Settings"
 *                                  viewMode="link"
 *                                  fontColorStyle="link"
 *     </ws:rightTemplate>
 * </Controls.operations:Panel>
 * </pre>
 */

/*
 * @name Controls/_operations/Panel#rightTemplate
 * @cfg {Function} Template displayed on the right side of the panel.
 * @example
 * <pre>
 * <!-- WML -->
 *    <Controls.operations:Panel rightTemplate="wml!MyModule/OperationsPanelRightTemplate" />
 * </pre>
 */

/**
 * @event Происходит после появления панели массовых операций на экране.
 * @name Controls/_operations/Panel#operationsPanelOpened
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 */


/**
 * @event Происходит при клике на элемент.
 * @name Controls/_operations/Panel#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Record} item Элемент, по которому произвели клик.
 * @param {Object} nativeEvent Объект нативного события браузера
 * @param {Controls/interface:ISelectionObject} selection Объект, который содержит идентификаторы отмеченных и исключённых записей.
 * @example
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.operations:Panel on:itemClick="onPanelItemClick()" />
 * </pre>
 * <pre class="brush: js">
 * // JavaScript
 * onPanelItemClick: function(e, item) {
 *    var itemId = item.get('id');
 *    switch (itemId) {
 *       case 'remove':
 *          this._removeItems();
 *          break;
 *       case 'move':
 *          this._moveItems();
 *          break;
 *    }
 * }
 * </pre>
 */

/*
 * @event Occurs when an item was clicked.
 * @name Controls/_operations/Panel#itemClick
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Descriptor of the event.
 * @param {Types/entity:Record} item Clicked item.
 * @param {Event} originalEvent Descriptor of the original event.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.operations:Panel on:itemClick="onPanelItemClick()" />
 * </pre>
 * JS:
 * <pre>
 *    onPanelItemClick: function(e, item) {
 *       var itemId = item.get('id');
 *       switch (itemId) {
 *          case 'remove':
 *             this._removeItems();
 *             break;
 *          case 'move':
 *             this._moveItems();
 *             break;
 *    }
 * </pre>
 */

/**
 * @typedef {String} SelectionViewMode
 * @variant null Кпопка скрыта.
 * @variant all Кнопка "Показать отмеченные".
 * @variant selected Кнопка "Показать все".
 */ 

/**
 * @name Controls/_operations/Panel#selectionViewMode
 * @cfg {SelectionViewMode} Задает отображение кнопки "Показать отмеченные" в меню мультивыбора.
 * @demo Controls-demo/OperationsPanelNew/SelectionViewMode/Index
 * @default null
 * @remark Вызываемый списочный метод нужно перевести на использование функции ShowMarked, о которой подробнее можно прочитать {@link https://wi.sbis.ru/doc/platform/developmentapl/service-development/service-contract/logic/list/list-iterator/show-marked/ здесь}.
 * @example
 * <pre class="brush: js">
 * // JavaScript
 * Control.extend({
 *    _selectionViewMode: 'all',
 *    ...
 * });
 * </pre>
 * <pre class="brush: html">
 * <!-- WML -->
 * <Controls.operationsPanel:OperationsPanel bind:selectionViewMode="_selectionViewMode"/>
 * </pre>
 */

/**
 * @typedef {Object} ISelectedCountConfig
 * @property {Types/_source/IRpc} rpc источник данных, поддерживающий RPC
 * @property {String} command Имя вызываемого метода
 * @property {Object} data Параметры вызываемого метода
 */

/**
 * @name Controls/_operations/Panel#selectedCountConfig
 * @cfg {ISelectedCountConfig} Конфигурация для получения счётчика отмеченных записей.
 * @demo Controls-demo/operations/SelectedCountConfig/Index
 * @default undefined
 * @example
 * TS:
 * <pre>
 *    import {SbisService} from 'Types/source';
 *
 *    private _filter: object = null;
 *    private _selectedCountConfig: object = null;
 *
 *    _beforeMount():void {
 *        this._filter = {};
 *        this._selectedCountConfig = this._getSelectedCountConfig();
 *    }
 *
 *    private _getSelectedCountConfig() {
 *        return {
 *            rpc: new SbisService({
 *                endpoint: 'Employee'
 *            }),
 *            command: 'employeeCount',
 *            data: {
 *                filter: this._filter
 *            }
 *        }
 *    }
 * </pre>
 *
 * WML:
 * <pre>
 *    <Controls.operations:Panel selectedCountConfig="{{_selectedCountConfig}}"/>
 * </pre>
 */


var Panel = Control.extend({
   _template: template
});

export = Panel;
