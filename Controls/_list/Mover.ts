import rk = require('i18n!Controls');
import BaseAction from 'Controls/_list/BaseAction';
import Deferred = require('Core/Deferred');
import cInstance = require('Core/core-instance');
import getItemsBySelection = require('Controls/Utils/getItemsBySelection');
import TreeItemsUtil = require('Controls/_list/resources/utils/TreeItemsUtil');
import template = require('wml!Controls/_list/Mover/Mover');
import {isEqual} from 'Types/object';
import {Logger} from 'UI/Utils';
import {ContextOptions as dataOptions} from 'Controls/context';
import {Confirmation} from 'Controls/popup';
import {TKeysSelection} from 'Controls/interface';
import {selectionToRecord} from 'Controls/operations';

const BEFORE_ITEMS_MOVE_RESULT = {
    CUSTOM: 'Custom',
    MOVE_IN_ITEMS: 'MoveInItems'
};
const DEFAULT_SORTING_ORDER = 'asc';
const MOVE_POSITION = {
    on: 'on',
    before: 'before',
    after: 'after'
};
interface IMoveItemsParams {
    selectedKeys: TKeysSelection;
    excludedKeys: TKeysSelection;
    filter: object;
}
var _private = {
    moveItems(self, items, target, position) {
        const isNewLogic = !items.forEach && !items.selected;
        return _private.beforeItemsMove(self, items, target, position).addCallback(function (beforeItemsMoveResult) {
            if (beforeItemsMoveResult === BEFORE_ITEMS_MOVE_RESULT.MOVE_IN_ITEMS && !isNewLogic) {
                _private.moveInItems(self, items, target, position);
            } else if (beforeItemsMoveResult !== BEFORE_ITEMS_MOVE_RESULT.CUSTOM) {
                return _private.moveInSource(self, items, target, position).addCallback(function (moveResult) {
                    if (!isNewLogic) {
                        _private.moveInItems(self, items, target, position);
                    }
                    return moveResult;
                });
            }
        }).addBoth(function (result) {
            _private.afterItemsMove(self, items, target, position, result);
            return result;
        });
    },
    openMoveDialog(self, items): void {
        const isNewLogic = !items.forEach && !items.selected;
        const templateOptions = {
            movedItems: isNewLogic ? items.selectedKeys : items,
            source: self._source,
            keyProperty: self._keyProperty,
            ...self._moveDialogOptions
        };
        self._children.dialogOpener.open({
            templateOptions,
            eventHandlers: {
                onResult: (target): void => {
                    self.moveItems(items, target, MOVE_POSITION.on);
                }
            }
        });
    },
    beforeItemsMove: function (self, items, target, position) {
        var beforeItemsMoveResult = self._notify('beforeItemsMove', [items, target, position]);
        return beforeItemsMoveResult instanceof Promise ? beforeItemsMoveResult : Deferred.success(beforeItemsMoveResult);
    },
    afterItemsMove: function (self, items, target, position, result) {
        self._notify('afterItemsMove', [items, target, position, result]);

        //According to the standard, after moving the items, you need to unselect all in the table view.
        //The table view and Mover are in a common container (Control.Container.MultiSelector) and do not know about each other.
        //The only way to affect the selection in the table view is to send the selectedTypeChanged event.
        //You need a schema in which Mover will not work directly with the selection.
        //Will be fixed by: https://online.sbis.ru/opendoc.html?guid=dd5558b9-b72a-4726-be1e-823e943ca173
        self._notify('selectedTypeChanged', ['unselectAll'], {
            bubbling: true
        });
    },

    moveInItems: function (self, items, target, position) {
        if (position === MOVE_POSITION.on) {
            _private.hierarchyMove(self, items, target);
        } else {
            _private.reorderMove(self, items, target, position);
        }
    },

    reorderMove: function (self, items, target, position) {
        var
            itemIndex,
            movedItem,
            parentProperty = self._options.parentProperty,
            targetId = _private.getIdByItem(self, target),
            targetItem = _private.getModelByItem(self, targetId),
            targetIndex = self._items.getIndex(targetItem);

        items.forEach(function (item) {
            movedItem = _private.getModelByItem(self, item);
            if (movedItem) {
                itemIndex = self._items.getIndex(movedItem);
                if (itemIndex === -1) {
                    self._items.add(movedItem);
                    itemIndex = self._items.getCount() - 1;
                }

                if (parentProperty && targetItem.get(parentProperty) !== movedItem.get(parentProperty)) {
                    //if the movement was in order and hierarchy at the same time, then you need to update parentProperty
                    movedItem.set(parentProperty, targetItem.get(parentProperty));
                }

                if (position === MOVE_POSITION.after && targetIndex < itemIndex) {
                    targetIndex = (targetIndex + 1) < self._items.getCount() ? targetIndex + 1 : self._items.getCount();
                } else if (position === MOVE_POSITION.before && targetIndex > itemIndex) {
                    targetIndex = targetIndex !== 0 ? targetIndex - 1 : 0;
                }
                self._items.move(itemIndex, targetIndex);
            }
        });
    },

    hierarchyMove: function (self, items, target) {
        var targetId = _private.getIdByItem(self, target);
        items.forEach(function (item) {
            item = _private.getModelByItem(self, item);
            if (item) {
                item.set(self._options.parentProperty, targetId);
            }
        });
    },

    moveInSource: function (self, items, target, position) {
        const targetId = _private.getIdByItem(self, target);
        const isNewLogic = !items.forEach && !items.selected;
        if (isNewLogic) {
            if (self._source.call) {
                const callFilter = {
                    selection: selectionToRecord({
                        selected: items.selectedKeys,
                        excluded: items.excludedKeys
                    }, self._source.getAdapter()), ...items.filter
                };
                return self._source.call(self._source.getBinding().move, {
                    method: self._source.getBinding().list,
                    filter: callFilter,
                    folder_id: targetId
                });
            }
            return self._source.move(items.selectedKeys, targetId, {
                position,
                parentProperty: self._options.parentProperty
            });
        }
        var
            idArray = items.map(function (item) {
                return _private.getIdByItem(self, item);
            });

        //If reverse sorting is set, then when we call the move on the source, we invert the position.
        if (position !== MOVE_POSITION.on && self._options.sortingOrder !== DEFAULT_SORTING_ORDER) {
            position = position === MOVE_POSITION.after ? MOVE_POSITION.before : MOVE_POSITION.after;
        }
        return self._source.move(idArray, targetId, {
            position,
            parentProperty: self._options.parentProperty
        });
    },

    moveItemToSiblingPosition: function (self, item, position) {
        var target = _private.getSiblingItem(self, item, position);
        return target ? self.moveItems([item], target, position) : Deferred.success();
    },

    getSiblingItem: function (self, item, position) {
        var
            result,
            display,
            itemIndex,
            siblingItem,
            itemFromProjection;

        //В древовидной структуре, нужно получить следующий(предыдущий) с учетом иерархии.
        //В рекордсете между двумя соседними папками, могут лежат дочерние записи одной из папок,
        //а нам необходимо получить соседнюю запись на том же уровне вложенности, что и текущая запись.
        //Поэтому воспользуемся проекцией, которая предоставляет необходимы функционал.
        //Для плоского списка можно получить следующий(предыдущий) элемент просто по индексу в рекордсете.
        if (self._options.parentProperty) {
            display = TreeItemsUtil.getDefaultDisplayTree(self._items, {
                keyProperty: self._keyProperty,
                parentProperty: self._options.parentProperty,
                nodeProperty: self._options.nodeProperty
            });
            if (self._options.root) {
                display.setRoot(self._options.root)
            }
            itemFromProjection = display.getItemBySourceItem(_private.getModelByItem(self, item));
            siblingItem = display[position === MOVE_POSITION.before ? 'getPrevious' : 'getNext'](itemFromProjection);
            result = siblingItem ? siblingItem.getContents() : null;
        } else {
            itemIndex = self._items.getIndex(_private.getModelByItem(self, item));
            result = self._items.at(position === MOVE_POSITION.before ? --itemIndex : ++itemIndex);
        }

        return result;
    },

    updateDataOptions: function (self, dataOptions) {
        if (dataOptions) {
            self._items = dataOptions.items;
            self._source = self._options.source || dataOptions.source;
            self._keyProperty = self._options.keyProperty || dataOptions.keyProperty;
            self._filter = dataOptions.filter;
        }
    },

    checkItem: function (self, item, target, position) {
        var
            key,
            parentsMap,
            movedItem = _private.getModelByItem(self, item);

        if (target !== null) {
            target = _private.getModelByItem(self, target);
        }

        //Check for a item to be moved because it may not be in the current recordset
        if (self._options.parentProperty && movedItem) {
            if (target && position === MOVE_POSITION.on && target.get(self._options.nodeProperty) === null) {
                return false;
            }
            parentsMap = _private.getParentsMap(self, _private.getIdByItem(self, target));
            key = '' + movedItem.get(self._keyProperty);
            if (parentsMap.indexOf(key) !== -1) {
                return false;
            }
        }
        return true;
    },

    getParentsMap: function (self, id) {
        var
            item,
            toMap = [],
            items = self._items,
            path = items.getMetaData().path;

        item = items.getRecordById(id);
        while (item) {
            id = '' + item.get(self._keyProperty);
            if (toMap.indexOf(id) === -1) {
                toMap.push(id);
            } else {
                break;
            }
            id = item.get(self._options.parentProperty);
            item = items.getRecordById(id);
        }
        if (path) {
            path.forEach(function (elem) {
                if (toMap.indexOf(elem.get(self._keyProperty)) === -1) {
                    toMap.push('' + elem.get(self._keyProperty));
                }
            });
        }
        return toMap;
    },

    getModelByItem: function (self, item) {
        return cInstance.instanceOfModule(item, 'Types/entity:Model') ? item : self._items.getRecordById(item);
    },

    getIdByItem: function (self, item) {
        return cInstance.instanceOfModule(item, 'Types/entity:Model') ? item.get(self._keyProperty) : item;
    },

    getItemsBySelection: function (selection) {
        //Support moving with mass selection.
        //Full transition to selection will be made by: https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
        selection.recursive = false;
        return selection instanceof Array ? Deferred.success(selection) : getItemsBySelection(selection, this._source, this._items, this._filter);
    },

    prepareMovedItems(self, items) {
        let result = [];
        items.forEach(function(item) {
            result.push(_private.getIdByItem(self, item));
        });
        return result;
    },
};

/**
 * Контрол для перемещения элементов списка в recordSet и dataSource.
 * Контрол должен располагаться в одном контейнере {@link Controls/list:DataContainer} со списком.
 * <a href="/materials/demo-ws4-operations-panel">Демо-пример</a>.
 * @class Controls/_list/Mover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IMovable
 * @mixes Controls/_interface/IHierarchy
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

/*
 * Сontrol to move the list items in recordSet and dataSource.
 * Сontrol must be in one {@link Controls/list:DataContainer} with a list.
 * <a href="/materials/demo-ws4-operations-panel">Demo examples</a>.
 * @class Controls/_list/Mover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IMovable
 * @mixes Controls/_interface/IHierarchy
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

var Mover = BaseAction.extend({
    _template: template,
    _moveDialogTemplate: null,
    _moveDialogOptions: null,
    _beforeMount: function (options, context) {
        _private.updateDataOptions(this, context.dataOptions);

        if (options.moveDialogTemplate) {
            if (options.moveDialogTemplate.templateName) {
                this._moveDialogTemplate = options.moveDialogTemplate.templateName;
                this._moveDialogOptions = options.moveDialogTemplate.templateOptions;
            } else {
                this._moveDialogTemplate = options.moveDialogTemplate;
                Logger.warn('Mover', 'Wrong type of moveDialogTemplate option, use object notation instead of template function', this);
            }
        }
    },

    _beforeUpdate: function (options, context) {
        _private.updateDataOptions(this, context.dataOptions);
        if (options.moveDialogTemplate && options.moveDialogTemplate.templateOptions && !isEqual(this._moveDialogOptions, options.moveDialogTemplate.templateOptions)) {
           this._moveDialogOptions = options.moveDialogTemplate.templateOptions;
        }
    },

    moveItemUp: function (item) {
        return _private.moveItemToSiblingPosition(this, item, MOVE_POSITION.before);
    },

    moveItemDown: function (item) {
        return _private.moveItemToSiblingPosition(this, item, MOVE_POSITION.after);
    },
    moveItems(items: []|IMoveItemsParams, target, position): Promise<any> {
        const self = this;
        const isNewLogic = !items.forEach && !items.selected;
        if (target === undefined) {
            return Deferred.success();
        }
        if (isNewLogic) {
            if (items.selectedKeys.length) {
                return _private.moveItems(self, items, target, position);
            } else {
                return Deferred.success();
            }
        } else {
            return _private.getItemsBySelection.call(this, items).addCallback(function (items) {
                items = items.filter((item) => {
                    return _private.checkItem(self, item, target, position);
                });
                if (items.length) {
                    return _private.moveItems(self, items, target, position);
                } else {
                    return Deferred.success();
                }
            });
        }
    },
    moveItemsWithDialog(items: []|IMoveItemsParams): void {
        const isNewLogic = !items.forEach && !items.selected;

        if (this.validate(items)) {
            if (isNewLogic) {
                _private.openMoveDialog(this, items);
            } else {
                _private.getItemsBySelection.call(this, items).addCallback((items: []) => {
                    _private.openMoveDialog(this, _private.prepareMovedItems(this, items));
                });
            }
        }
    }
});

Mover.getDefaultOptions = function () {
    return {
        sortingOrder: DEFAULT_SORTING_ORDER
    };
};

Mover.contextTypes = function () {
    return {
        dataOptions: dataOptions
    };
};

Mover._private = _private;

export = Mover;
