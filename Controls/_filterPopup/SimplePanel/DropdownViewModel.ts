/**
 * Created by as.krasilnikov on 26.12.2017.
 */
import {BaseViewModel, getStyle, ItemsUtil, ItemsViewModel} from 'Controls/list';
import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';
import * as multiSelectTpl from 'wml!Controls/_filterPopup/SimplePanel/multiSelectTpl';
import entity = require('Types/entity');

var _private = {
         filterHierarchy: function(item) {
            var parent;
            if (!this._options.parentProperty || !this._options.nodeProperty || !item.get) {
               return true;
            }
            parent = item.get(this._options.parentProperty);
            if (typeof parent === 'undefined') {
               parent = null;
            }
            return parent === this._options.rootKey;
         },

         isHistoryItem: function(item) {
            return !!(item.get('pinned') || item.get('recent') || item.get('frequent'));
         },

         filterAdditional: function(item) {
            var isAdditional, isHistory;

            if (!this._options.additionalProperty || this._expanded === true || !item.get) {
               return true;
            }

            isAdditional = item.get(this._options.additionalProperty);
            isHistory = _private.isHistoryItem(item);

            //additional item in history must be showed
            return isAdditional !== true || isHistory;
         },

         needToDrawSeparator: function(item, nextItem, hasParent) {
            if (!nextItem.get) {
               return false;
            }
            var itemInHistory = _private.isHistoryItem(item) && !hasParent;
            var nextItemInHistory = _private.isHistoryItem(nextItem);
            return itemInHistory && !nextItemInHistory;
         },

         needHideGroup: function(self, key) {
            //FIXME временное решение, переделывается тут: https://online.sbis.ru/opendoc.html?guid=8760f6d2-9ab3-444b-a83b-99019207a9ca

            // Get items from the same group. Hide the separator, if the group is empty or all list items from the same group
            let itemsGroup = self._itemsModel._display.getGroupItems(key);
            // getCount of itemsModel returns count items includes groups
            let numberItemsCurrentRoot = factory(self.getItems()).filter(_private.filterHierarchy.bind(self)).value().length;
            return itemsGroup.length === 0 || itemsGroup.length === numberItemsCurrentRoot;
         },

         getRightPadding: function(rightPadding, itemData, hasHierarchy, hasApplyButton) {
            let result = rightPadding || 'default';
            if (hasApplyButton) {
               result = 'multiSelect';
            } else if (itemData.hasPinned) {
               result = 'history';
            } else if (itemData.hasClose) {
               result = 'close';
            } else if (hasHierarchy) {
               result = 'hierarchy';
            }
            return result;
         },

         getClassList: function(itemPadding, multiSelect, itemData, hasHierarchy, hasApplyButton?) {
            const item = itemData.item;
            let classes = 'controls-SimplePanel-List__row_state_' + (item.get('readOnly')  ? 'readOnly' : 'default') ;

            if (item.get('pinned') === true && !itemData.hasParent) {
               classes += ' controls-SimplePanel-List__row_pinned';
            }

            const paddings = itemPadding || {};
            if (multiSelect && itemData.emptyText) {
               classes += ' controls-SimplePanel-List__emptyItem-leftPadding_multiSelect';
            } else if (!multiSelect) {
               classes += ' controls-SimplePanel-List__item-leftPadding_' + (paddings.left || 'default');
            }
            classes += ' controls-SimplePanel-List__item-rightPadding_' + _private.getRightPadding(paddings.right, itemData, hasHierarchy, hasApplyButton);
            return classes;
         },

         getNewTreeItem(currentItem): object {
            return {
               isNode: () => currentItem.hasChildren,
               isSelected: () => currentItem.isSelected,
               getContents: () => currentItem.item,
               isSwiped: () => currentItem.isSwiped,
               shouldDisplayActions: () => {return false},
               getLevel: () => {},
               getParent: () => {return {getContents: () => currentItem.hasParent}}
            };
         }
   };

      var DropdownViewModel = BaseViewModel.extend({
         _itemsModel: null,
         _expanded: false,

         constructor: function(cfg) {
            var self = this;
            this._options = cfg;
            DropdownViewModel.superclass.constructor.apply(this, arguments);
            this._itemsModel = new ItemsViewModel({
               groupProperty: cfg.groupProperty,
               groupingKeyCallback: cfg.groupingKeyCallback,
               groupMethod: cfg.groupMethod,
               groupTemplate: cfg.groupTemplate,
               items: cfg.items,
               keyProperty: cfg.keyProperty,
               displayProperty: cfg.displayProperty || 'title'
            });
            this._itemsModel.subscribe('onListChange', function() {
               self._nextVersion();
            });
            this._hierarchy = new entity.relation.Hierarchy({
               keyProperty: cfg.keyProperty,
               parentProperty: cfg.parentProperty,
               nodeProperty: cfg.nodeProperty
            });
            this.setFilter(this.getDisplayFilter());
         },

         setFilter: function(filter) {
            this._itemsModel.setFilter(filter);
         },

         updateSelection: function(item) {
            var key = item.get(this._options.keyProperty);
            if (this._options.selectedKeys.indexOf(key) !== -1) {
               var index = this._options.selectedKeys.indexOf(key);
               this._options.selectedKeys.splice(index, 1);
               // In the dropdown list with a multiselect, emptyText (item with key null) is required.
               if (!this._options.selectedKeys.length) {
                  this._options.selectedKeys.push(null);
               }
            } else {
               if (this._options.selectedKeys[0] === null) {
                  this._options.selectedKeys = [];
               }
               this._options.selectedKeys.push(key);
            }
            this._nextVersion();
         },

         getSelectedKeys: function() {
            return this._options.selectedKeys;
         },

         setSelectedKeys: function(selectedKeys) {
            if (this._options.selectedKeys !== selectedKeys) {
               this._options.selectedKeys = selectedKeys;
               this._nextVersion();
            }
         },

         getDisplayFilter: function() {
            var filter = [];
            filter.push(_private.filterHierarchy.bind(this));
            filter.push(_private.filterAdditional.bind(this));
            return filter;
         },

         setItems: function(options) {
            this._options.items = options.items;
            this._itemsModel.setItems(options.items);
         },

         setRootKey: function(key) {
            this._options.rootKey = key;
            this.setFilter(this.getDisplayFilter());
         },

         destroy: function() {
            this._itemsModel.destroy();
            this._hierarchy.destroy();
            DropdownViewModel.superclass.destroy.apply(this, arguments);
         },

         reset: function() {
            return this._itemsModel.reset();
         },

         isEnd: function() {
            return this._itemsModel.isEnd();
         },

         goToNext: function() {
            return this._itemsModel.goToNext();
         },

         isLast: function() {
            return this._itemsModel.isLast();
         },

         isGroupNext: function() {
            return !!this._itemsModel.getItemDataByItem(this._itemsModel.getNext().dispItem).isGroup;
         },

         getCurrent: function() {
            var itemsModelCurrent = this._itemsModel.getCurrent();

            //if we had group element we should return it without changes
            if (itemsModelCurrent.isGroup) {

               //FIXME временное решение, переделывается тут: https://online.sbis.ru/opendoc.html?guid=8760f6d2-9ab3-444b-a83b-99019207a9ca
               if (_private.needHideGroup(this, itemsModelCurrent.key)) {
                  itemsModelCurrent.isHiddenGroup = true;
               }

               return itemsModelCurrent;
            }
            itemsModelCurrent.hasChildren = this._hasItemChildren(itemsModelCurrent.item);
            itemsModelCurrent.hasParent = this._hasParent(itemsModelCurrent.item);
            itemsModelCurrent.isSelected = this._isItemSelected(itemsModelCurrent.item);
            itemsModelCurrent.icon = itemsModelCurrent.item.get('icon');
            itemsModelCurrent.iconSize = this._options.iconSize;
            itemsModelCurrent.isSwiped = this._swipeItem && itemsModelCurrent.dispItem.getContents() === this._swipeItem;

            //Draw the separator to split history and nohistory items.
            //Separator is needed only when list has both history and nohistory items
            //if the last item is in history then separator is unnecessary
            if (!this._itemsModel.isLast()) {
               itemsModelCurrent.hasSeparator = _private.needToDrawSeparator(itemsModelCurrent.item, this._itemsModel.getNext().item, itemsModelCurrent.hasParent);
            }
            itemsModelCurrent.iconStyle = getStyle(itemsModelCurrent.item.get('iconStyle'), 'SimplePanel-List');
            itemsModelCurrent.itemTemplateProperty = this._options.itemTemplateProperty;
            itemsModelCurrent.template = itemsModelCurrent.item.get(itemsModelCurrent.itemTemplateProperty);
            itemsModelCurrent.multiSelect = this._options.multiSelect;
            itemsModelCurrent.parentProperty = this._options.parentProperty;
            itemsModelCurrent.nodeProperty = this._options.nodeProperty;
            itemsModelCurrent.hasClose = this._options.hasClose;
            itemsModelCurrent.hasPinned = this._options.hasIconPin && itemsModelCurrent.item.has('pinned');
            itemsModelCurrent.itemClassList = _private.getClassList(this._options.itemPadding, this._options.multiSelect, itemsModelCurrent, this.hasHierarchy());
            itemsModelCurrent.multiSelectTpl = multiSelectTpl;

            // Для совместимости с menu:Control
            itemsModelCurrent.treeItem = _private.getNewTreeItem(itemsModelCurrent);
            return itemsModelCurrent;
         },
         _isItemSelected: function(item) {
            const keys = this._options.selectedKeys;
            if (keys instanceof Array) {
               let index = keys.findIndex((key) => {
                  if (isEqual(key, item.get(this._options.keyProperty))) {
                     return true;
                  }
               });
               return index > -1;
            }
            return keys !== undefined && isEqual(keys, item.get(this._options.keyProperty));
         },
         _hasItemChildren: function(item) {
            return this._hierarchy.isNode(item) && !!this._hierarchy.getChildren(item, this._options.items).length;
         },
         setSwipeItem: function(itemData) {
            this._swipeItem = itemData;
            this._nextVersion();
         },
         hasHierarchy: function() {
            if (!this._options.parentProperty || !this._options.nodeProperty) {
               return false;
            }
            var display = this._itemsModel._display;
            for (var i = 0; i < display.getCount(); i++) {
               var item = display.at(i).getContents();
               if (item.get && item.get(this._options.nodeProperty)) {
                  return true;
               }
            }
            return false;
         },
         hasAdditional: function() {
            var self = this;
            var hasAdditional = false;

            if (this._options.additionalProperty && this._options.rootKey === null) {
               this._options.items.each(function(item) {
                  if (!hasAdditional) {
                     hasAdditional = item.get(self._options.additionalProperty) && !_private.isHistoryItem(item);
                  }
               });
            }
            return hasAdditional;
         },
         _hasParent: function(item) {
            return this._hierarchy.hasParent(item, this._options.items);
         },
         getItems: function() {
            return this._itemsModel._options.items;
         },
         getCount: function() {
            return this._itemsModel.getCount();
         },
         toggleExpanded: function(expanded) {
            this._expanded = expanded;
            this.setFilter(this.getDisplayFilter());
            this._nextVersion();
         },
         isExpanded: function() {
            return this._expanded;
         },
         getEmptyItem: function() {
            if (this._options.emptyText) {
               var emptyItem = {};
               var itemData = {};
               itemData[this._options.displayProperty] = this._options.emptyText;
               itemData[this._options.keyProperty] = this._options.emptyKey !== undefined ? this._options.emptyKey : null;
               var item = new entity.Model({
                  rawData: itemData
               });
               emptyItem.item = item;
               emptyItem.isSelected = this._options.selectedKeys.length ? this._isItemSelected(item) : true;
               emptyItem.getPropValue = ItemsUtil.getPropertyValue;
               emptyItem.emptyText = this._options.emptyText;
               emptyItem.hasClose = this._options.hasClose;
               emptyItem.itemClassList = _private.getClassList(this._options.itemPadding, this._options.multiSelect, emptyItem, this.hasHierarchy(), this._options.hasApplyButton);

               // Для совместимости с menu:Control
               emptyItem.treeItem = _private.getNewTreeItem(emptyItem);
               return emptyItem;
            }
         }
      });

      DropdownViewModel._private = _private;
      export = DropdownViewModel;

