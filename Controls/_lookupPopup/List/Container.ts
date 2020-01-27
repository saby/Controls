import rk = require('i18n!Controls');
import Control = require('Core/Control');
import template = require('wml!Controls/_lookupPopup/List/Container');
import {showType} from 'Controls/Utils/Toolbar';

/**
 *
 * Контейнер для списков, который отслеживает нажатия на его элементы и уведомляет с помощью события «selectComplete», когда выбор завершен.
 * Также добавляет действие «Выбрать» в иерархические списки.
 * Используется внутри Controls/lookupPopup:Controller и Controls/lookupPopup:Container.
 *
 * Подробное описание и инструкцию по настройке смотрите в <a href='/doc/platform/developmentapl/interface-development/controls/layout-selector-stack/'>статье</a>.
 *
 * <a href="/materials/demo/demo-ws4-engine-selector-browser">Пример</a> использования контрола.
 *
 * @class Controls/_lookupPopup/List/Container
 * @extends Core/Control
 * @mixes Controls/_interface/IMultiSelectable
 * @control
 * @public
 * @author Герасимов Александр Максимович
 */

/*
 *
 * Container for list controls, that tracks click on list items and notifying "selectComplete" event, when selection is completed.
 * Also adding "select" item action to a hierarchical lists.
 * Used inside Controls/lookupPopup:Controller and Controls/lookupPopup:Container.
 *
 * More information you can read <a href='/doc/platform/developmentapl/interface-development/controls/layout-selector-stack/'>here</a>.
 *
 * <a href="/materials/demo/demo-ws4-engine-selector-browser">Here</a> you can see a demo.
 *
 * @class Controls/_lookupPopup/List/Container
 * @extends Core/Control
 * @mixes Controls/_interface/IMultiSelectable
 * @control
 * @public
 * @author Герасимов Александр Максимович
 */

/**
 * @typedef {Object} ItemAction
 * @property {String} id Идентификатор операции над записью.
 * @property {String} title Название операции операции над записью.
 * @property {String} icon Иконка операции операции над записью.
 * @property {Number} showType Расположение операции операции над записью.
 * @property {String} style Стиль операции операции над записью.
 * @property {String} iconStyle Стиль иконки операции операции над записью. (secondary | warning | danger | success).
 * @property {Function} handler Обработчик события клика по операции операции над записью.
 * @property {String} parent Ключ родителя операции операции над записью.
 * @property {boolean|null} parent@ Поле, определяющее иерархический тип операции над записью (list, node, hidden node).
 */

/*
 * @typedef {Object} ItemAction
 * @property {String} id Identifier of operation.
 * @property {String} title Operation name.
 * @property {String} icon Operation icon.
 * @property {Number} showType Location of operation.
 * @property {String} style Operation style.
 * @property {String} iconStyle Style of the action's icon. (secondary | warning | danger | success).
 * @property {Function} handler Operation handler.
 * @property {String} parent Key of the action's parent.
 * @property {boolean|null} parent@ Field that describes the type of the node (list, node, hidden node).
 */

/**
 * @name Controls/_lookupPopup/List/Container#itemActions
 * @cfg {Array.<ItemAction>} Массив конфигурационных объектов для кнопок, которые будут отображаться, когда пользователь наводит курсор на элемент.
 * <a href="/materials/demo-ws4-list-item-actions">Пример</a>.
 */

/*
 * @name Controls/_lookupPopup/List/Container#itemActions
 * @cfg {Array.<ItemAction>} Array of configuration objects for buttons which will be shown when the user hovers over an item.
 * <a href="/materials/demo-ws4-list-item-actions">Example</a>.
 */

/**
 * @name Controls/_lookupPopup/List/Container#itemActionVisibilityCallback
 * @cfg {function} Функция управления видимостью операций над записью.
 * @param {ItemAction} action Объект с настройкой действия.
 * @param {Types/entity:Model} item Экземпляр записи, действие над которой обрабатывается.
 * @returns {Boolean} Определяет, должна ли операция отображаться.
 * @example
 *
 * JS:
 * <pre>
 *     _actionVisibilityCallback: function(action, item) {
 *         let actionVisibility = true;
 *
 *         if (action.id === 'delete' && !item.get('isDeletable')) {
 *             actionVisibility = false;
 *         }
 *
 *         return actionVisibility;
 *     }
 * </pre>
 */

/*
 * @name Controls/_lookupPopup/List/Container#itemActionVisibilityCallback
 * @cfg {function} item operation visibility filter function
 * @param {ItemAction} action Object with configuration of an action.
 * @param {Types/entity:Model} item Instance of the item whose action is being processed.
 * @returns {Boolean} Determines whether the action should be rendered.
 * @example
 *
 * JS:
 * <pre>
 *     _actionVisibilityCallback: function(action, item) {
 *         let actionVisibility = true;
 *
 *         if (action.id === 'delete' && !item.get('isDeletable')) {
 *             actionVisibility = false;
 *         }
 *
 *         return actionVisibility;
 *     }
 * </pre>
 */

/**
 * @name Controls/_lookupPopup/List/Container#selectionType
 * @cfg {String} Тип записей, которые можно выбрать.
 * @variant node только узлы доступны для выбора
 * @variant leaf only только листья доступны для выбора
 * @variant all все типы записей доступны для выбора
 * @variant allBySelectAction все типы записей доступны для выбора. Действие «Выбрать» будет отображаться для всех типов записей.
 * @example
 * В этом примере для выбора доступны только листья.
 * <pre>
 *    <Controls.lookupPopup:ListContainer selectionType="leaf">
 *        ...
 *    </Controls.lookupPopup:ListContainer>
 * </pre>
 */

/*
 * @name Controls/_lookupPopup/List/Container#selectionType
 * @cfg {String} Type of records that can be selected.
 * @variant node only nodes are available for selection
 * @variant leaf only leafs are available for selection
 * @variant all all types of records are available for selection
 * @variant allBySelectAction all types of records are available for selection. "Select" item action will showed on all types of records.
 * @example
 * In this example only leafs are available for selection.
 * <pre>
 *    <Controls.lookupPopup:ListContainer selectionType="leaf">
 *        ...
 *    </Controls.lookupPopup:ListContainer>
 * </pre>
 */

/**
 * @name Controls/_lookupPopup/List/Container#multiSelect
 * @cfg {Boolean} Определяет, установлен ли множественный выбор.
 * @example
 * <pre>
 *    <Controls.lookupPopup:ListContainer multiSelect="{{true}}">
 *        ...
 *    </Controls.lookupPopup:ListContainer>
 * </pre>
 */

/*
 * @name Controls/_lookupPopup/List/Container#multiSelect
 * @cfg {Boolean} Determines whether multiple selection is set.
 * @example
 * <pre>
 *    <Controls.lookupPopup:ListContainer multiSelect="{{true}}">
 *        ...
 *    </Controls.lookupPopup:ListContainer>
 * </pre>
 */

let ACTION_ID = 'selector.action';
let ACTION_TITLE = rk('Выбрать');
let ACTION = {
   id: ACTION_ID,
   title: ACTION_TITLE,
   showType: showType.TOOLBAR
};

let _private = {
   getItemClickResult(itemKey, selectedKeys, multiSelect) {
      let added = [];
      let removed = [];
      let itemIndex = selectedKeys.indexOf(itemKey);
      selectedKeys = selectedKeys.slice();

      if (itemIndex === -1) {
         if (!multiSelect && selectedKeys.length) {
            removed.push(selectedKeys[0]);
            selectedKeys.splice(0, 1);
         }

         selectedKeys.push(itemKey);
         added.push(itemKey);
      } else if (multiSelect) {
         selectedKeys.splice(itemIndex, 1);
         removed.push(itemKey);
      }

      return [selectedKeys, added, removed];
   },

   selectItem(self, itemClickResult) {
      self._notify('listSelectedKeysChanged', itemClickResult, {bubbling: true});
      self._notify('selectComplete', [self._options.multiSelect, true], {bubbling: true});
   },

   selectionChanged(self, itemClickResult) {
      self._notify('listSelectedKeysChanged', itemClickResult, {bubbling: true});
   },

   getItemActions(options) {
      let itemActions = options.itemActions || [];

      if (options.selectionType !== 'leaf') {
         itemActions = itemActions.concat(ACTION);
      }

      return itemActions;
   },

   getItemActionVisibilityCallback(options) {
      return function(action, item) {
         let showByOptions;
         let showByItemType;

         if (action.id === ACTION_ID) {
            showByOptions = !options.multiSelect || !options.selectedKeys.length;
            showByItemType = options.selectionType === 'node' ? true : item.get(options.nodeProperty);
            return showByOptions && showByItemType;
         } else {
            return options.itemActionVisibilityCallback ? options.itemActionVisibilityCallback(action, item) : true;
         }
      };
   },

   itemClick(self, itemKey, multiSelect, selectedKeys) {
      let itemClickResult = _private.getItemClickResult(itemKey, selectedKeys, multiSelect);

      if (!multiSelect || !selectedKeys.length) {
         _private.selectItem(self, itemClickResult);
      } else {
         _private.selectionChanged(self, itemClickResult);
      }
   },

   getMarkedKeyBySelectedKeys(selectedKeys: number[]|string[]): null|string|number {
      let result = null;

      if (selectedKeys.length === 1) {
         result = selectedKeys[0];
      }

      return result;
   },

   getSelectedKeysFromOptions(options): number[]|string[] {
      return options.multiSelect ? options.selectedKeys : [];
   }
};

let Container = Control.extend({

   _template: template,
   _selectedKeys: null,
   _markedKey: null,
   _itemsActions: null,

   constructor(options) {
      this._itemActionsClick = this._itemActionsClick.bind(this);
      Container.superclass.constructor.call(this, options);
   },

   _beforeMount(options): void {
      this._selectedKeys = _private.getSelectedKeysFromOptions(options);
      this._markedKey = _private.getMarkedKeyBySelectedKeys(options.selectedKeys);
      this._itemActions = _private.getItemActions(options);
      this._itemActionVisibilityCallback = _private.getItemActionVisibilityCallback(options);
   },

   _beforeUpdate(newOptions) {
      let selectionTypeChanged = newOptions.selectionType !== this._options.selectionType;
      let selectedKeysChanged = newOptions.selectedKeys !== this._options.selectedKeys;

      if (selectedKeysChanged) {
         this._selectedKeys = newOptions.selectedKeys;
      }

      if (selectedKeysChanged || selectionTypeChanged) {
         this._itemActionVisibilityCallback = _private.getItemActionVisibilityCallback(newOptions);
      }

      if (newOptions.itemActions !== this._options.itemActions || selectionTypeChanged) {
         this._itemActions = _private.getItemActions(newOptions);
      }
   },

   _beforeUnmount() {
      this._itemActions = null;
      this._visibilityCallback = null;
      this._itemActionsClick = null;
      this._selectedKeys = null;
   },

   _itemClick(event, item) {
      if (!item.get(this._options.nodeProperty)) {
         _private.itemClick(this, item.get(this._options.keyProperty), this._options.multiSelect, this._options.selectedKeys);
      }
   },

   _itemActionsClick(event, action, item) {
      if (action.id === ACTION_ID) {
         let itemClickResult = _private.getItemClickResult(item.get(this._options.keyProperty), this._options.selectedKeys, this._options.multiSelect);
         _private.selectItem(this, itemClickResult);
      }
   }

});

Container._private = _private;

Container.getDefaultOptions = function getDefaultOptions() {
   return {
      selectionType: 'all'
   };
};

export = Container;

