import display = require('Controls/display');
import isPlainObject = require('Core/helpers/Object/isPlainObject');
import { Model } from 'Types/entity';
import { RecordSet } from 'Types/collection';

const DEFAULT_UNIQUE_SEPARATOR = ',';

var
    TreeItemsUtil = {
        getUniqueParentKey(item: Model,
                           items: RecordSet,
                           originalKeyProperty: string,
                           originalParentProperty: string,
                           separator?: string = DEFAULT_UNIQUE_SEPARATOR): string {
            let curParentKey = item.get(originalParentProperty);
            let uniqueKey = '' + curParentKey;
            let curParent = items.at(items.getIndexByValue(originalKeyProperty, curParentKey));
            while (curParent) {
                curParentKey = curParent.get(originalParentProperty);
                uniqueKey += separator + curParentKey;
                curParent = items.at(items.getIndexByValue(originalKeyProperty, curParentKey));
            }
            return uniqueKey;
        },

        getUniqueHierarchicalKey(item: Model,
                                 items: RecordSet,
                                 originalKeyProperty: string,
                                 originalParentProperty: string,
                                 separator?: string = DEFAULT_UNIQUE_SEPARATOR): string {
            return '' + item.get(originalKeyProperty) + separator +
                TreeItemsUtil.getUniqueParentKey(item, items, originalKeyProperty, originalParentProperty, separator);
        },

        prepareDisplayProperties: function(items, cfg, filter) {
           var
              displayProperties = {
                 collection: items,
                 keyProperty: cfg.keyProperty,
                 parentProperty: cfg.parentProperty,
                 nodeProperty: cfg.nodeProperty,
                 loadedProperty: '!' + cfg.parentProperty + '$',
                 // todo to support merge strategy replace this code on "unique: cfg.loadItemsStrategy === 'merge'".
                 // https://online.sbis.ru/opendoc.html?guid=e070a968-f6dd-486b-bd44-4da47198529e
                 unique: true,
                 filter: filter,
                 sort: cfg.itemsSortMethod
              },
              root, rootAsNode;

           if (cfg.groupMethod) {
              displayProperties.group = cfg.groupMethod;
           }

           if (cfg.groupingKeyCallback) {
              displayProperties.group = cfg.groupingKeyCallback;
           }

           if (cfg.groupProperty) {
               const groupProperty = cfg.groupProperty;
               displayProperties.group = (item) => {
                   return item.get(groupProperty);
               };
           }

           if (typeof cfg.root !== 'undefined') {
              root = cfg.root;
           } else {
              root = null;
           }
           rootAsNode = isPlainObject(root);
           if (rootAsNode) {
              root = Model.fromObject(root, 'Types/entity:adapter.Sbis');
              root.keyProperty = cfg.keyProperty;
              displayProperties.rootEnumerable = true;
           }
           displayProperties.root = root;
           displayProperties.compatibleReset = true;
           return displayProperties;
        },
        getDefaultDisplayTree: function (items, cfg, filter) {
            return new display.Tree(TreeItemsUtil.prepareDisplayProperties(items, cfg, filter));
        }
    };
export = TreeItemsUtil;
