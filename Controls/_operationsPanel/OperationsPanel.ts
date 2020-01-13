import Control = require('Core/Control');
import template = require('wml!Controls/_operationsPanel/OperationsPanel/OperationsPanel');
import toolbars = require('Controls/toolbars');
import sourceLib = require('Types/source');
import WidthUtils = require('Controls/_operationsPanel/OperationsPanel/Utils');
import buttons = require('Controls/buttons');
import notifyHandler = require('Controls/Utils/tmplNotify');
import {RecordSet} from 'Types/collection';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Record} from 'Types/entity';


var _private = {
   recalculateToolbarItems: function(self, items, toolbarWidth) {
      if (items) {
         self._oldToolbarWidth = toolbarWidth;
         self._toolbarSource = new sourceLib.Memory({
            keyProperty: self._options.keyProperty,
            data: WidthUtils.fillItemsType(
               self._options.keyProperty,
               self._options.parentProperty,
               items, toolbarWidth,
               self._options.theme,
               self._options.itemTemplate,
               self._options.itemTemplateProperty
            ).getRawData()
         });
         self._forceUpdate();
      }
   },
   checkToolbarWidth: function(self) {
      var newWidth = self._children.toolbarBlock.clientWidth;

      /**
       * Operations panel checks toolbar width on each update because we don't know if the rightTemplate has changed (will be fixed here: https://online.sbis.ru/opendoc.html?guid=b4ed11ba-1e4f-4076-986e-378d2ffce013 ).
       * Because of this the panel gets unnecessary redrawn after the mount. Usually this doesn't cause problems because width of the toolbar doesn't change and update is essentially skipped.
       * But if the panel becomes (or its parent) hidden and then updates, toolbar width is obviously 0 and that causes recalculation of toolbar items.
       * And it's even worse than that - panel can become visible again without updating and the user will get stuck with the wrong UI.
       * For example, this can happen if the user opens the panel and then immediately goes to another tab, making the tab with the panel hidden, and then goes back.
       * The only way to prevent this is to block recalculation of toolbar items if the panel is not visible.
       */
      if (self._oldToolbarWidth !== newWidth && self._container.offsetParent !== null) {
         self._oldToolbarWidth = newWidth;
         _private.recalculateToolbarItems(self, self._items, newWidth);
      }
   },
   loadData: function(self, source) {
      var result;
      if (source) {
         result = source.query().addCallback(function(dataSet) {
            self._items = dataSet.getAll();

            // TODO: убрать когда полностью откажемся от поддержки задавания цвета в опции иконки. icon: icon-error, icon-done и т.д.
            // TODO: https://online.sbis.ru/opendoc.html?guid=05bbeb41-d353-4675-9f73-6bfc654a5f00
            buttons.ActualApi.itemsSetOldIconStyle(self._items);
            return self._items;
         });
      }
      return result;
   },

   initialized(self, options: object): void {
      self._initialized = true;

      if (options.operationsPanelOpenedCallback) {
         options.operationsPanelOpenedCallback();
      }
   }
};


/**
 * Контрол, предназначенный для операций над множеством записей списка.
 * Подробное описание и инструкцию по настройке читайте <a href='/doc/platform/developmentapl/interface-development/controls/operations/'>здесь</a>.
 * <a href="/materials/demo-ws4-operations-panel">Демо-пример</a>.
 *
 * @class Controls/_operationsPanel/OperationsPanel
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

/*
 * Control for grouping operations.
 * The detailed description and instructions on how to configure the control you can read <a href='/doc/platform/developmentapl/interface-development/controls/operations/'>here</a>.
 * <a href="/materials/demo-ws4-operations-panel">Demo</a>.
 *
 * @class Controls/_operations/OperationsPanel
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
 * @name Controls/_operationsPanel/OperationsPanel#rightTemplate
 * @cfg {Function} Шаблон, отображаемый в правой части панели массового выбора.
 * @example
 * <pre>
 *    <Controls.operations:Panel rightTemplate="wml!MyModule/OperationsPanelRightTemplate" />
 * </pre>
 */

/*
 * @name Controls/_operationsPanel/OperationsPanel#rightTemplate
 * @cfg {Function} Template displayed on the right side of the panel.
 * @example
 * <pre>
 *    <Controls.operations:Panel rightTemplate="wml!MyModule/OperationsPanelRightTemplate" />
 * </pre>
 */

/**
 * @event Controls/_operationsPanel/OperationsPanel#itemClick Происходит при клике на элемент.
 * @param {Vdom/Vdom:SyntheticEvent} eventObject Дескриптор события.
 * @param {Types/entity:Record} item Элемент, по которому произвели клик.
 * @param {Object} originalEvent Дескриптор исходного события.
 * @example
 * TMPL:
 * <pre>
 *    <Controls.operations:Panel on:itemClick="onPanelItemClick()" />
 * </pre>
 * JS:
 * <pre>
 *    onPanelItemClick: function(e, selection) {
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

/*
 * @event Controls/_operationsPanel/OperationsPanel#itemClick Occurs when an item was clicked.
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
 *    onPanelItemClick: function(e, selection) {
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
 * @name Controls/_operationsPanel/OperationsPanel#selectionViewMode
 * @cfg {String} Задает отображение кнопки "Показать отмеченные" в меню мультивыбора.
 * @variant null Кпопка скрыта
 * @variant all Кнопка "Показать отмеченные"
 * @variant selected Кнопка "Показать все"
 * @default null
 * @example
 * <pre>
 *    Control.extend({
 *       _selectionViewMode: 'all'
 *       ...
 *    });
 * </pre>
 * <pre>
 *    <Controls.operationsPanel:OperationsPanel bind:selectionViewMode="_selectionViewMode"/>
 * </pre>
 */


var OperationsPanel = Control.extend({
   _template: template,
   _oldToolbarWidth: 0,
   _initialized: false,
   _notifyHandler: notifyHandler,

   _beforeMount(options: object): Promise<RecordSet>|void {
      const loadDataCallback = (data?: RecordSet): RecordSet|void => {
         if (!data) {
            _private.initialized(this, options);
         }
         return data;
      };
      let result;

      if (options.source) {
         result = _private.loadData(this, options.source).then(loadDataCallback);
      } else {
         loadDataCallback();
      }

      return result;
   },

   _afterMount(): void {
      _private.checkToolbarWidth(this);
      _private.initialized(this, this._options);
      this._notify('operationsPanelOpened');
   },

   _afterUpdate(oldOptions: object): void {
      if (this._options.source !== oldOptions.source) {
         // We should recalculate the size of the toolbar only when all the children have updated,
         // otherwise available width may be incorrect.
         _private.loadData(this, this._options.source).addCallback(() => {
            _private.recalculateToolbarItems(this, this._items, this._children.toolbarBlock.clientWidth);
         });
      } else {
         // TODO: размеры пересчитываются после каждого обновления, т.к. иначе нельзя понять что изменился rightTemplate (там каждый раз новая функция)
         // TODO: будет исправляться по этой задаче: https://online.sbis.ru/opendoc.html?guid=b4ed11ba-1e4f-4076-986e-378d2ffce013
         _private.checkToolbarWidth(this);
      }
   },

   _onResize: function() {
      _private.checkToolbarWidth(this);

      // todo зову _forceUpdate потому что нужно отрисовать пересчет, произошедший в checkToolbarWidth. добавляю на всякий случай, возможно это лишний вызов. раньше тут _forceUpdate звался из-за события
      this._forceUpdate();
   },

   _itemClickHandler: function(event: SyntheticEvent<null>, item: Record, nativeEvent: MouseEvent) {
      this._notify('itemClick', [item, nativeEvent, {
         selected: this._options.selectedKeys,
         excluded: this._options.excludedKeysd
      }]);
   }
});

OperationsPanel.getDefaultOptions = function() {
   return {
      itemTemplate: toolbars.ItemTemplate
   };
};
OperationsPanel._theme = ['Controls/operationsPanel', 'Controls/toolbars'];

export = OperationsPanel;
