import Control = require('Core/Control');
import template = require('wml!Controls/_filterPopup/SimplePanel/SimplePanel');
import CoreClone = require('Core/core-clone');
import ParallelDeferred = require('Core/ParallelDeferred');
import * as defaultItemTemplate from 'wml!Controls/_filterPopup/SimplePanel/itemTemplate';

import {factory} from 'Types/chain';
import {isEqual} from 'Types/object';
import {isHistorySource} from 'Controls/_filter/HistoryUtils';

/**
 * Панель "быстрых фильтров" для {@link Controls/filter:View}.
 * Шаблон окна, в котором для каждого фильтра с viewMode = 'frequent' отображает список элементов в отдельном блоке.
 *
 * @class Controls/_filterPopup/SimplePanel
 * @extends Core/Control
 * @control
 * @public
 * @author Золотова Э.Е.
 * @example
 * WML:
 * <pre>
 *    <Controls.filterPopup:SimplePanel
 *          attr:class="custom-SimplePanel"
 *          items="{{_options.items}}" />
 * </pre>
 *
 */

/*
 * Control dropdown list for {@link Controls/filter:View}.
 *
 * @class Controls/_filterPopup/SimplePanel
 * @extends Core/Control
 * @mixes Controls/_filterPopup/SimplePanel/SimplePanelStyles
 * @control
 * @public
 * @author Золотова Э.Е.
 *
 */

var _private = {

    getItems: function(self, initItems) {
        let items = [];
        let pDef = new ParallelDeferred();
        factory(initItems).each(function(item, index) {
            var curItem = item.getRawData();
            curItem.initSelectedKeys = self._items ? self._items[index].initSelectedKeys : CoreClone(item.get('selectedKeys'));
            if (curItem.loadDeferred) {
                pDef.push(curItem.loadDeferred.addCallback(() => {
                    if (isHistorySource(curItem.source)) {
                        curItem.items = curItem.source.prepareItems(curItem.items);
                    }
                }));
            }
            items.push(curItem);
        });
        return pDef.done().getResult().addCallback(() => {
            return items;
        });
    },

    isEqualKeys: function(oldKeys, newKeys) {
        let result;
        if (oldKeys[0] === null && !newKeys.length) {
            result = false;
        } else {
            result = isEqual(oldKeys, newKeys);
        }
        return result;
    },

    needShowApplyButton: function(items) {
        let isNeedShowApplyButton = false;
        factory(items).each(function(item) {
            if (!_private.isEqualKeys(item.initSelectedKeys, item.selectedKeys)) {
                isNeedShowApplyButton = true;
            }
        });
        return isNeedShowApplyButton;
    },

    getResult: function(self, event, action) {
        var result = {
            action: action,
            event: event,
            selectedKeys: {}
        };
        factory(self._items).each(function(item) {
            result.selectedKeys[item.id] = item.selectedKeys;
        });
        return result;
    },

    hasApplyButton: function (items) {
        let result = false;
        factory(items).each((item) => {
            if (item.multiSelect) {
                result = true;
            }
        });
        return result;
    }
};

var Panel = Control.extend({
    _template: template,
    _items: null,

    _beforeMount: function(options) {
        let self = this;
        return _private.getItems(this, options.items).addCallback((items) => {
            self._items = items;
            self._hasApplyButton = _private.hasApplyButton(self._items);
        });
    },

    _beforeUpdate: function(newOptions) {
        const itemsChanged = newOptions.items !== this._options.items;
        if (itemsChanged) {
            let self = this;
            return _private.getItems(this, newOptions.items).addCallback((items) => {
                self._items = items;
                self._needShowApplyButton = _private.needShowApplyButton(self._items);
            });
        }
    },

    _itemClickHandler: function(event, item, keys) {
        var result = {
            action: 'itemClick',
            event: event,
            selectedKeys: keys,
            id: item.id
        };
        this._notify('sendResult', [result]);
    },

    _checkBoxClickHandler: function(event, index, keys) {
        this._items[index].selectedKeys = keys;
        this._needShowApplyButton = _private.needShowApplyButton(this._items);
        this._notify('selectedKeysChangedIntent', [index, keys]);
    },

    _closeClick: function() {
        this._notify('close');
    },

    _applySelection: function(event) {
        var result = _private.getResult(this, event, 'applyClick');
        this._notify('sendResult', [result]);
    },

    _moreButtonClick: function(event, item, selectedItems) {
        this._notify('sendResult', [{action: 'moreButtonClick', id: item.id, selectedItems: selectedItems}]);
    }
});

Panel.getDefaultOptions = (): object => {
    return {
        itemTemplate: defaultItemTemplate
    };
};

Panel._theme = ['Controls/filterPopup', 'Controls/dropdownPopup'];

Panel._private = _private;

export = Panel;
