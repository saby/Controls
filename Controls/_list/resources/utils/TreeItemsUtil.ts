import display = require('Controls/display');
import entity = require('Types/entity');
import isPlainObject = require('Core/helpers/Object/isPlainObject');

var
    TreeItemsUtil = {
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
                 unique: cfg.uniqueKeys !== false,
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
              root = entity.Model.fromObject(root, 'Types/entity:adapter.Sbis');
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
