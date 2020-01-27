import Control = require('Core/Control');
import template = require('wml!Controls/_operations/Panel/Panel');

/**
 * Контрол, предназначенный для операций над множеством записей списка.
 * @remark
 * См. <a href="/materials/demo-ws4-operations-panel">демо-пример</a>.
 * Подробное описание и инструкцию по настройке читайте контрола читайте {@link https://wi.sbis.ru/doc/platform/developmentapl/interface-development/controls/operations/ здесь}.
 * @class Controls/_operations/Panel
 * @extends Core/Control
 * @mixes Controls/_toolbars/IToolbarSource
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/_interface/IHierarchy
 * @control
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/OperationsPanel/Panel
 * 
 *
 * @css @background-color_OperationsPanel Background color of the panel.
 * @css @height_OperationsPanel Height of the panel.
 * @css @spacing_OperationsPanel-between-items Spacing between items.
 * @css @margin_OperationsPanel__rightTemplate Margin of rightTemplate.
 */

/*
 * Control for grouping operations.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/operations/'>here</a>.
 * <a href="/materials/demo-ws4-operations-panel">Demo</a>.
 *
 * @class Controls/_operations/Panel
 * @extends Core/Control
 * @mixes Controls/_interface/ISource
 * @mixes Controls/interface/IItemTemplate
 * @mixes Controls/_interface/IHierarchy
 * @control
 * @public
 * @author Авраменко А.С.
 * @demo Controls-demo/OperationsPanel/Panel
 *
 * @css @background-color_OperationsPanel Background color of the panel.
 * @css @height_OperationsPanel Height of the panel.
 * @css @spacing_OperationsPanel-between-items Spacing between items.
 * @css @margin_OperationsPanel__rightTemplate Margin of rightTemplate.
 */

/**
 * @name Controls/_operations/Panel#rightTemplate
 * @cfg {String|Function} Шаблон, отображаемый в правой части панели массового выбора.
 * @example
 * <pre class="brush: html">
 * <Controls.operations:Panel rightTemplate="wml!MyModule/OperationsPanelRightTemplate" />
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
 * @default null
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


var Panel = Control.extend({
   _template: template
});

export = Panel;
