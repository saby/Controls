import Control = require('Core/Control');
import template = require('wml!Controls/_filterPopup/SimplePanel/_HierarchyList/HierarchyList');
import {factory} from 'Types/chain';
import {RecordSet} from 'Types/collection';
import emptyItemTemplate = require('wml!Controls/_filterPopup/SimplePanel/_List/emptyItemTemplate');
import DropdownViewModel = require('Controls/_filterPopup/SimplePanel/DropdownViewModel');
import hierarchyItemTemplate = require('wml!Controls/_filterPopup/SimplePanel/_HierarchyList/hierarchyItemTemplate');

var _private = {

    getFolders: function(items, nodeProperty) {
        let folders = {};
        factory(items).each((item) => {
            if (item.get(nodeProperty)) {
                folders[item.getId()] = item;
            }
        });
        return folders;
    },

    getItemsByFolder: function(items, folderId, parentProperty) {
        return factory(items).filter((item) => {
            return item.get(parentProperty) === folderId;
        }).value();
    },

    getViewModelSelectedKeys: function(selectedKeys, emptyKey) {
        let result = [];
        factory(selectedKeys).each((key) => {
            if (!key.includes(emptyKey)) {
                result = result.concat(key);
            }
        });
        return result;
    },

    clearSelectedKeys: function(folders, selectedKeys) {
        factory(folders).each((folder, index) => {
            selectedKeys[index] = [];
        });
    },

    getSelectedKeys: function(selectedKeys, folders, emptyKey) {
        let clonedKeys = {};
        factory(folders).each((folder, index) => {
            if (selectedKeys[index] === undefined || selectedKeys[index] === emptyKey) {
                clonedKeys[index] = [];
            } else {
                clonedKeys[index] = selectedKeys[index];
            }
        });
        return clonedKeys;
    },

    getNodeItems: function(folders, {items, keyProperty, parentProperty}) {
        let nodeItems = {};
        factory(folders).each((folder, index) => {
            const records = new RecordSet({
                keyProperty,
                adapter: items.getAdapter()
            });
            records.add(folder);
            records.append(_private.getItemsByFolder(items, folder.get(keyProperty), parentProperty));
            nodeItems[index] = records;
        });
        return nodeItems;
    }
};

var HierarchyList = Control.extend({
    _template: template,
    _folders: null,
    _selectedKeys: null,
    _emptyItemTemplate: emptyItemTemplate,
    _selectionChanged: false,

    _beforeMount: function(options) {
        this._folders = _private.getFolders(options.selectorItems, options.nodeProperty);
        this._selectedKeys = _private.getSelectedKeys(options.selectedKeys, this._folders, options.emptyKey);
        this._flatSelectedKeys = _private.getViewModelSelectedKeys(this._selectedKeys, options.emptyKey);
        this._nodeItems = _private.getNodeItems(this._folders, options);

        this._listModel = new DropdownViewModel({
            items: options.items,
            selectedKeys: this._flatSelectedKeys,
            keyProperty: options.keyProperty,
            itemTemplateProperty: options.itemTemplateProperty,
            displayProperty: options.displayProperty,
            emptyText: options.emptyText,
            emptyKey: options.emptyKey,
            hasApplyButton: options.hasApplyButton
        });
    },

    _hasMoreButton: function(folder) {
        return this._options.sourceController.hasMoreData('down', folder.get(this._options.keyProperty));
    },

    _itemClickHandler: function(event, index, key) {
        if (this._selectionChanged) {
            this._checkBoxClickHandler(event, index, key);
        } else {
            this._selectedKeys = {};
            this._selectedKeys[index] = key;
            this._notify('itemClick', [this._selectedKeys]);
        }
    },

    _emptyItemClickHandler: function() {
        this._selectedKeys = [this._options.emptyKey];
        this._notify('itemClick', [this._selectedKeys]);
    },

    _checkBoxClickHandler: function(event, index, keys) {
        let eventName = 'checkBoxClick';
        let setKeys = () => {
            if (keys === undefined) {
                this._selectedKeys[index] = [];
            } else {
                this._selectedKeys[index] = keys;
            }
        };

        if (!!this._folders[keys[0]]) {
            _private.clearSelectedKeys(this._folders, this._selectedKeys);
            eventName = 'itemClick';
        } else {
            this._selectionChanged = true;
            const currentFolderKey = this._folders[index].get(this._options.keyProperty);
            if (this._selectedKeys[index].includes(currentFolderKey) && keys.length > 1) {
                keys.splice(keys.indexOf(currentFolderKey), 1);
            }
        }
        setKeys();
        this._notify(eventName, [this._selectedKeys]);
        this._listModel.setSelectedKeys(_private.getViewModelSelectedKeys(this._selectedKeys, this._options.emptyKey));
    },

    _moreButtonClick: function() {
        this._notify('moreButtonClick');
    }
});

HierarchyList.getDefaultOptions = (): object => {
    return {
        itemTemplate: hierarchyItemTemplate
    };
};

HierarchyList._theme = ['Controls/filterPopup'];

HierarchyList._private = _private;

export = HierarchyList;
