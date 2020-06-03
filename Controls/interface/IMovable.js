/* eslint-disable */
define('Controls/interface/IMovable', [
], function() {

   /**
    * Интерфейс для перемещения элементов в коллекциях.
    *
    * @interface Controls/interface/IMovable
    * @public
    * @author Авраменко А.С.
    */

   /*
    * Interface for item moving in collections.
    *
    * @interface Controls/interface/IMovable
    * @public
    * @author Авраменко А.С.
    */

   /**
    * @typedef {String} MovePosition
    * @variant after Вставить перемещенные элементы после указанного элемента.
    * @variant before Вставить перемещенные элементы перед указанным элементом.
    * @variant on Вставить перемещенные элементы в указанный элемент.
    */

   /*
    * @typedef {String} MovePosition
    * @variant after Insert moved items after the specified item.
    * @variant before Insert moved items before the specified item.
    * @variant on Insert moved items into the specified item.
    */

   /**
    * @typedef {Object} Selection
    * @property {Array.<Number|String>} selected Массив выбранных ключей.
    * @property {Array.<Number|String>} excluded Массив исключенных из выборки ключей.
    */

   /*
    * @typedef {Object} Selection
    * @property {Array.<Number|String>} selected Array of selected keys.
    * @property {Array.<Number|String>} excluded Array of excluded keys.
    */

   /**
    * @typedef {String} BeforeItemsMoveResult
    * @variant Custom Ваша собственная логика перемещения предметов.
    * @variant MoveInItems Перемещение в списке без вызова из источника перемещения.
    */

   /*
    * @typedef {String} BeforeItemsMoveResult
    * @variant Custom Your own logic of moving items.
    * @variant MoveInItems Move in the list without calling move on source.
    */

   /**
    * @typedef {Object} IMoveDialogTemplateProp
    * @property {String} templateName Имя контрола, который будет отображаться в диалоговом окне выбора целевой записи для перемещения.
    * @property {Object} templateOptions Опции для контрола, который будет отображаться в диалоговом окне.
    */

   /*
    * @typedef {Object} IMoveDialogTemplateProp
    * @property {String} templateName Control name, that will be displayed in dialog for selecting the target record to move.
    * @property {Object} templateOptions Options for control, which is specified in the dialog for selecting the target record to move.
    */

   /**
    * @name Controls/interface/IMovable#moveDialogTemplate
    * @cfg {IMoveDialogTemplateProp|null} Шаблон диалогового окна выбора целевой записи для перемещения.
    * Рекомендуется использовать стандартный шаблон {@link Controls/MoveDialog}.
    * @example
    * <pre>
    *    <Controls.list:Mover>
    *       <ws:moveDialogTemplate templateName="Controls/MoveDialog">
    *          <ws:templateOptions
    *             root="rootId"
    *             searchParam="folderTitle"
    *             parentProperty="parent"
    *             nodeProperty="parent@">
    *             <ws:filter moveDialog="{{true}}"/>
    *          </ws:templateOptions>
    *       </ws:moveDialogTemplate>
    *    </Controls.list:Mover>
    * </pre>
    * @see moveItemsWithDialog
    * @see Controls/MoveDialog
    */

   /*
    * @name Controls/interface/IMovable#moveDialogTemplate
    * @cfg {IMoveDialogTemplateProp|null} The template of the dialog for selecting the target record to move.
    * @example
    * The following example shows how to using default template {@link Controls/MoveDialog}.
    * <pre>
    *    <Controls.list:Mover>
    *       <ws:moveDialogTemplate templateName="Controls/MoveDialog">
    *          <ws:templateOptions
    *             root="rootId"
    *             searchParam="folderTitle"
    *             parentProperty="parent"
    *             nodeProperty="parent@">
    *             <ws:filter moveDialog="{{true}}"/>
    *          </ws:templateOptions>
    *       </ws:moveDialogTemplate>
    *    </Controls.list:Mover>
    * </pre>
    * @see moveItemsWithDialog
    * @see Controls.list:View/Mover/MoveDialog
    */

   /**
    * @name Controls/interface/IMovable#sortingOrder
    * @cfg {String} Определяет, какая сортировка задана в dataSource.
    * @variant asc Сортировка по возрастанию.
    * @variant desc Сортировка по убыванию.
    * @default asc
    * @remark Эта опция необходима для указания порядка расположения данных в источнике, чтобы при изменении порядковых номеров элементы перемещались в правильное положение.
    * @example
    * В следующем примере показано, как задать сортировку по убыванию.
    * <pre>
    *    <Controls.list:Mover sortingOrder="desc">
    *       <ws:moveDialogTemplate templateName="Controls/MoveDialog">
    *          <ws:templateOptions
    *             root="rootId"
    *             searchParam="folderTitle"
    *             parentProperty="parent"
    *             nodeProperty="parent@">
    *             <ws:filter moveDialog="{{true}}"/>
    *          </ws:templateOptions>
    *       </ws:moveDialogTemplate>
    *    </Controls.list:Mover>
    * </pre>
    */

   /*
    * @name Controls/interface/IMovable#sortingOrder
    * @cfg {String} Determines which sort is set on the dataSource.
    * @variant asc Ascending sort.
    * @variant desc Descending sort.
    * @default asc
    * @remark This option is necessary to specify the order in which the data is located in the source,
    * so that when changing the sequence numbers, the items are moved to the correct position.
    * @example
    * The following example shows how to set a descending sort.
    * <pre>
    *    <Controls.list:Mover sortingOrder="desc">
    *       <ws:moveDialogTemplate templateName="Controls/MoveDialog">
    *          <ws:templateOptions
    *             root="rootId"
    *             searchParam="folderTitle"
    *             parentProperty="parent"
    *             nodeProperty="parent@">
    *             <ws:filter moveDialog="{{true}}"/>
    *          </ws:templateOptions>
    *       </ws:moveDialogTemplate>
    *    </Controls.list:Mover>
    * </pre>
    */

   /**
    * @event Controls/interface/IMovable#beforeItemsMove Происходит до перемещения элементов.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Array.<String>|Array.<Number>} movedItems Массив элементов перемещения.
    * @param {Types/entity:Record|String|Number} target Целевой элемент перемещения.
    * @param {MovePosition} position Положение перемещения.
    * @returns {BeforeItemsMoveResult}
    * @example
    * В следующем примере показано, как переопределить логику перемещения элементов по умолчанию.
    * <pre>
    *    <Controls.list:Mover name="listMover" on:beforeItemsMove="_beforeItemsMove()"/>
    * </pre>
    *
    * <pre>
    *    Control.extend({
    *       ...
    *       _beforeItemsMove: function(eventObject, movedItems, target, position) {
    *          ...
    *          return 'Custom';
    *       }
    *       ...
    *    });
    * </pre>
    * @see afterItemsMove
    */

   /*
    * @event Controls/interface/IMovable#beforeItemsMove Occurs before the items are moved.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
    * @param {Array.<String>|Array.<Number>} movedItems Array of items to be moved.
    * @param {Types/entity:Record|String|Number} target Target item to move.
    * @param {MovePosition} position Position to move.
    * @returns {BeforeItemsMoveResult}
    * @example
    * The following example shows how to override the default items move logic.
    * <pre>
    *    <Controls.list:Mover name="listMover" on:beforeItemsMove="_beforeItemsMove()"/>
    * </pre>
    *
    * <pre>
    *    Control.extend({
    *       ...
    *       _beforeItemsMove: function(eventObject, movedItems, target, position) {
    *          ...
    *          return 'Custom';
    *       }
    *       ...
    *    });
    * </pre>
    * @see afterItemsMove
    */

   /**
    * @event Controls/interface/IMovable#afterItemsMove Происходит после перемещения элементов.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
    * @param {Array.<String>|Array.<Number>} movedItems Массив элементов перемещения.
    * @param {Types/entity:Record|String|Number} target Целевой элемент перемещения.
    * @param {MovePosition} position Положение перемещения.
    * @param {*} result Результат перемещения элементов.
    * @example
    * В следующем примере показано, как отобразить диалоговое окно ошибки после неудачного перемещения товаров.
    * <pre>
    *    <Controls.list:Mover name="listMover" on:afterItemsMove="_afterItemsMove()"/>
    *    <Controls.popup:Confirmation name="popupOpener"/>
    * </pre>
    *
    * <pre>
    *    Control.extend({
    *       ...
    *       _afterItemsMove: function(eventObject, movedItems, target, position, result) {
    *          if (result instanceof Error) {
    *             return this._children.popupOpener.open({
    *                message: 'Removing records failed.',
    *                style: 'error'
    *             });
    *          }
    *       }
    *       ...
    *    });
    * </pre>
    * @see beforeItemsMove
    */

   /*
    * @event Controls/interface/IMovable#afterItemsMove Occurs after moving items.
    * @param {Vdom/Vdom:SyntheticEvent} eventObject The event descriptor.
    * @param {Array.<String>|Array.<Number>} movedItems Array of items to be moved.
    * @param {Types/entity:Record|String|Number} target Target item to move.
    * @param {MovePosition} position Position to move.
    * @param {*} result Result of moving items.
    * @example
    * The following example shows how to display the error dialog after a failed move of items.
    * <pre>
    *    <Controls.list:Mover name="listMover" on:afterItemsMove="_afterItemsMove()"/>
    *    <Controls.popup:Confirmation name="popupOpener"/>
    * </pre>
    *
    * <pre>
    *    Control.extend({
    *       ...
    *       _afterItemsMove: function(eventObject, movedItems, target, position, result) {
    *          if (result instanceof Error) {
    *             return this._children.popupOpener.open({
    *                message: 'Removing records failed.',
    *                style: 'error'
    *             });
    *          }
    *       }
    *       ...
    *    });
    * </pre>
    * @see beforeItemsMove
    */

   /**
    * Перемещает один элемент вверх.
    * @function Controls/interface/IMovable#moveItemUp
    * @param {String|Number} item Элемент перемещения.
    * @returns {Core/Deferred} Отложенный результат перемещения.
    * @example
    * В следующем примере показано, как переместить элемент вверх с помощью панели операций над записью.
    * <pre>
    *    <Controls.list:View itemActions="{{_itemActions}}"/>
    *    <Controls.list:Mover name="listMover"/>
    * </pre>
    *
    * <pre>
    *    Control.extend({
    *       ...
    *       _beforeMount: function() {
    *          var self = this;
    *          this._itemActions = [{
    *             icon: 'icon-ArrowUp',
    *             handler: function(item) {
    *                self._children.listMover.moveItemUp(item.getKey());
    *             }
    *          }]
    *       }
    *       ...
    *    });
    * </pre>
    * @see moveItemDown
    * @see moveItems
    */

   /*
    * Move one item up.
    * @function Controls/interface/IMovable#moveItemUp
    * @param {String|Number} item The item to be moved.
    * @returns {Core/Deferred} Deferred with the result of the move.
    * @example
    * The following example shows how to move item up using the item actions.
    * <pre>
    *    <Controls.list:View itemActions="{{_itemActions}}"/>
    *    <Controls.list:Mover name="listMover"/>
    * </pre>
    *
    * <pre>
    *    Control.extend({
    *       ...
    *       _beforeMount: function() {
    *          var self = this;
    *          this._itemActions = [{
    *             icon: 'icon-ArrowUp',
    *             handler: function(item) {
    *                self._children.listMover.moveItemUp(item.getKey());
    *             }
    *          }]
    *       }
    *       ...
    *    });
    * </pre>
    * @see moveItemDown
    * @see moveItems
    */

   /**
    * Перемещает один элемент вниз.
    * @function Controls/interface/IMovable#moveItemDown
    * @param {String|Number} item Элемент перемещения.
    * @returns {Core/Deferred} Отложенный результат перемещения.
    * @example
    * В следующем примере показано, как переместить элемент вниз с помощью панели операций над записью.
    * <pre>
    *    <Controls.list:View itemActions="{{_itemActions}}"/>
    *    <Controls.list:Mover name="listMover"/>
    * </pre>
    *
    * <pre>
    * Base.Control.extend({
    *    _itemActions: null,
    *    _beforeMount: function() {
    *       var self = this;
    *       this._itemActions = [{
    *          icon: 'icon-ArrowDown',
    *          handler: function(item) {
    *             self._children.listMover.moveItemDown(item.getKey());
    *          }
    *       }]
    *    }
    *    ...
    * });
    * </pre>
    * @see moveItemUp
    * @see moveItems
    */

   /*
    * Move one item down.
    * @function Controls/interface/IMovable#moveItemDown
    * @param {String|Number} item The item to be moved.
    * @returns {Core/Deferred} Deferred with the result of the move.
    * @example
    * The following example shows how to move item down using the item actions.
    * <pre>
    *    <Controls.list:View itemActions="{{_itemActions}}"/>
    *    <Controls.list:Mover name="listMover"/>
    * </pre>
    *
    * <pre>
    *    Control.extend({
    *       ...
    *       _beforeMount: function() {
    *          var self = this;
    *          this._itemActions = [{
    *             icon: 'icon-ArrowDown',
    *             handler: function(item) {
    *                self._children.listMover.moveItemDown(item.getKey());
    *             }
    *          }]
    *       }
    *       ...
    *    });
    * </pre>
    * @see moveItemUp
    * @see moveItems
    */

   /**
    * Перемещает переданные элементы относительно указанного целевого элемента.
    * @function Controls/interface/IMovable#moveItems
    * @param {Array.<String>|Array.<Number>|Selection} movedItems Элементы для перемещения.
    * @param {String|Number} target Целевой элемент перемещения.
    * @param {MovePosition} position Положение перемещения.
    * @returns {Core/Deferred} Отложенный результат перемещения.
    * @remark
    * В зависимости от аргумента 'position' элементы могут быть перемещены до, после или на указанный целевой элемент.
    * @example
    * В следующем примере показано, как переместить элемент вниз с помощью панели операций над записью.
    * <pre class="brush: html">
    *    <Controls.breadcrumbs:Path caption="Move items in root" on:click="_moveItems()"/>
    *    <Controls.list:Mover name="listMover"/>
    * </pre>
    * <pre class="brush: js">
    * Base.Control.extend({
    *    _selectedKeys: null,
    *    _beforeMount: function() {
    *       this._selectedKeys = [];
    *    },
    *    _moveItems: function() {
    *       this._children.listMover.moveItems(this._selectedKeys, 'rootId', 'on');
    *    }
    * });
    * </pre>
    * @see moveItemUp
    * @see moveItemDown
    */

   /*
    * Moves the transferred items relative to the specified target item.
    * @function Controls/interface/IMovable#moveItems
    * @param {Array.<String>|Array.<Number>|Selection} movedItems Items to be moved.
    * @param {String|Number} target Target item to move.
    * @param {MovePosition} position Position to move.
    * @returns {Core/Deferred} Deferred with the result of the move.
    * @remark
    * Depending on the 'position' argument, elements can be moved before, after or on the specified target item.
    * @example
    * The following example shows how to move item down using the item actions.
    * <pre>
    *    <Controls.breadcrumbs:Path caption="Move items in root" on:click="_moveItems()"/>
    *    <Controls.list:Mover name="listMover"/>
    * </pre>
    *
    * <pre>
    *    Control.extend({
    *       ...
    *       _selectedKeys: [],
    *       _moveItems: function() {
    *          this._children.listMover.moveItems(this._selectedKeys, 'rootId', 'on');
    *       }
    *       ...
    *    });
    * </pre>
    * @see moveItemUp
    * @see moveItemDown
    */

   /**
    * Перемещение переданных элементов с предварительным выбором родительского узла с помощью диалогового окна.
    * @function Controls/interface/IMovable#moveItemsWithDialog
    * @param {Array.<String>|Array.<Number>|Selection} movedItems Элементы для перемещения.
    * @remark
    * Компонент, указанный в опции {@link moveDialogTemplate moveDialogTemplate}, будет использоваться в качестве шаблона для диалога перемещения.
    * @example
    * В следующем примере показано, как переместить выбранные элементы кликом по кнопке.
    * <pre>
    *    <Controls.breadcrumbs:Path caption="Move items in root" on:click="_moveItems()"/>
    *    <Controls.list:Mover name="listMover"/>
    * </pre>
    * <pre>
    * Base.Control.extend({
    *    _selectedKeys: null,
    *    _beforeMount: function(){
    *       this._selectedKeys = [...];
    *    },
    *    _moveItems: function() {
    *       this._children.listMover.moveItemsWithDialog(this._selectedKeys);
    *    }
    * });
    * </pre>
    * @see moveItemUp
    * @see moveItemDown
    * @see moveItems
    */

   /*
    * Move the transferred items with the pre-selection of the parent node using the dialog.
    * @function Controls/interface/IMovable#moveItemsWithDialog
    * @param {Array.<String>|Array.<Number>|Selection} movedItems Items to be moved.
    * @remark
    * The component specified in the {@link moveDialogTemplate moveDialogTemplate} option will be used as a template for the move dialog.
    * @example
    * The following example shows how to move the selected items to the root by clicking the button.
    * <pre>
    *    <Controls.breadcrumbs:Path caption="Move items in root" on:click="_moveItems()"/>
    *    <Controls.list:Mover name="listMover"/>
    * </pre>
    *
    * <pre>
    *    Control.extend({
    *       ...
    *       _selectedKeys: [...],
    *       _moveItems: function() {
    *          this._children.listMover.moveItemsWithDialog(this._selectedKeys);
    *       }
    *       ...
    *    });
    * </pre>
    * @see moveItemUp
    * @see moveItemDown
    * @see moveItems
    */
});
