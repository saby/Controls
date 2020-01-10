import displayLib = require('Types/display');
import cInstance = require('Core/core-instance');
import Utils = require('Types/util');

var ItemsUtil = {
    getDefaultDisplayFlat: function(items, cfg, filter) {
        var projCfg = {};
        projCfg.keyProperty = cfg.keyProperty;
        if (cfg.groupMethod) {
            projCfg.group = cfg.groupMethod;
        }
        if (cfg.groupingKeyCallback) {
            projCfg.group = cfg.groupingKeyCallback;
        }
        if (cfg.groupProperty) {
            const groupProperty = cfg.groupProperty;
            projCfg.group = (item) => {
                return item.get(groupProperty);
            };
        }
        // todo to support merge strategy replace this code on "projCfg.unique = cfg.loadItemsStrategy === 'merge'".
        // https://online.sbis.ru/opendoc.html?guid=e070a968-f6dd-486b-bd44-4da47198529e
        projCfg.unique = true;
        projCfg.filter = filter;
        return displayLib.Abstract.getDefaultDisplay(items, projCfg);
    },

    getPropertyValue: function(itemContents, field) {
        if (!(itemContents instanceof Object)) {
            return itemContents;
        } else {
            return Utils.object.getPropertyValue(itemContents, field);
        }
    },

    //TODO это наверное к Лехе должно уехать
    getDisplayItemById: function(display, id, keyProperty) {
        var list = display.getCollection();
        if (cInstance.instanceOfModule(list, 'Types/collection:RecordSet')) {
            return display.getItemBySourceItem(list.getRecordById(id));
        } else {
            var resItem;
            display.each(function(item, i) {
                if (ItemsUtil.getPropertyValue(item.getContents(), keyProperty) == id) {
                    resItem = item;
                }
            });
            return resItem;
        }
    },

    getDefaultDisplayItem: function(display, item) {
        return display.createItem({contents: item});
    },

    getFirstItem: function(display) {
        var
            itemIdx = 0,
            item,
            itemsCount = display.getCount();
        while (itemIdx < itemsCount) {
            item = display.at(itemIdx).getContents();
            if (cInstance.instanceOfModule(item, 'Types/entity:Model')) {
                return display.at(itemIdx).getContents();
            }
            itemIdx++;
        }
    },

    getLastItem: function(display) {
        var
            itemIdx = display.getCount() - 1,
            item;
        while (itemIdx >= 0) {
            item = display.at(itemIdx).getContents();
            if (cInstance.instanceOfModule(item, 'Types/entity:Model')) {
                return item;
            }
            itemIdx--;
        }
    },

    getDisplayItemKey: function(dispItem, keyProperty) {
        let contents = dispItem.getContents();

        if (contents instanceof Array) {
            // Breadcrumbs key is the key of the last item
            contents = contents[contents.length - 1];
        }

        return ItemsUtil.getPropertyValue(contents, keyProperty);
    }
};
export = ItemsUtil;
