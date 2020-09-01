import Control = require('Core/Control');
import Deferred = require('Core/Deferred');
import cInstance = require('Core/core-instance');
import {getItemsBySelection} from 'Controls/_list/resources/utils/getItemsBySelection';
import {Logger} from 'UI/Utils';
import {ContextOptions as dataOptions} from 'Controls/context';

import {MoveController} from './Controllers/MoveController';
import {IMoveObject, MOVE_POSITION, MOVE_TYPE, TMoveItems} from './interface/IMoveObject';
import {IMoveControllerOptions} from './interface/IMoveControllerOptions';
import {Model} from 'Types/entity';

// @TODO Если убрать отсюда шаблон, то operationPanel перестаёт получать события
//   selectedTypeChanged даже от MultiSelect
//  https://online.sbis.ru/doc/0445b971-8675-42ef-b2bc-e68d7f82e0ac
import * as Template from 'wml!Controls/_list/Mover/Mover';

const DEFAULT_SORTING_ORDER = 'asc';

var _private = {
    moveItems(self, items, target, position) {
        const useController = _private.useController(items);
        const afterItemsMove = function (result) {
            _private.afterItemsMove(self, items, target, position, result);
            return result;
        }
        return _private.beforeItemsMove(self, items, target, position).addCallback(function (beforeItemsMoveResult) {
            if (useController) {
                return self._controller.moveItems(items, target, position, beforeItemsMoveResult).then(afterItemsMove);
            }
            if (beforeItemsMoveResult === MOVE_TYPE.MOVE_IN_ITEMS) {
                return _private.moveInItems(self, items, target, position);
            } else if (beforeItemsMoveResult !== MOVE_TYPE.CUSTOM) {
                return _private.moveInSource(self, items, target, position).addCallback(function (moveResult) {
                    _private.moveInItems(self, items, target, position);
                    return moveResult;
                });
            }
        }).addBoth(afterItemsMove);
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
           movedIndex,
           movedItem,
           parentProperty = self._options.parentProperty,
           targetId = _private.getIdByItem(self, target),
           targetItem = _private.getModelByItem(self, targetId),
           targetIndex = self._items.getIndex(targetItem);

        items.forEach(function (item) {
            movedItem = _private.getModelByItem(self, item);
            if (movedItem) {
                if (position === MOVE_POSITION.before) {
                    targetIndex = self._items.getIndex(targetItem);
                }

                movedIndex = self._items.getIndex(movedItem);
                if (movedIndex === -1) {
                    self._items.add(movedItem);
                    movedIndex = self._items.getCount() - 1;
                }

                if (parentProperty && targetItem.get(parentProperty) !== movedItem.get(parentProperty)) {
                    //if the movement was in order and hierarchy at the same time, then you need to update parentProperty
                    movedItem.set(parentProperty, targetItem.get(parentProperty));
                }

                if (position === MOVE_POSITION.after && targetIndex < movedIndex) {
                    targetIndex = (targetIndex + 1) < self._items.getCount() ? targetIndex + 1 : self._items.getCount();
                } else if (position === MOVE_POSITION.before && targetIndex > movedIndex) {
                    targetIndex = targetIndex !== 0 ? targetIndex - 1 : 0;
                }
                self._items.move(movedIndex, targetIndex);
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
        const idArray = items.map(function (item) {
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
        const target = self._controller.getSiblingItem(item, position);
        return target ? self.moveItems([item], target, position) : Deferred.success();
    },

    updateDataOptions: function (self, newOptions, contextDataOptions) {
        let controllerOptions: IMoveControllerOptions = {
            parentProperty: newOptions.parentProperty,
            nodeProperty: newOptions.nodeProperty,
            root: newOptions.root,
            keyProperty: newOptions.keyProperty
        };
        if (newOptions.moveDialogTemplate) {
            controllerOptions.dialog = {
                opener: self,
                onResultHandler: newOptions.onResultHandler || _private.moveDialogOnResultHandler.bind(self)
            };
            if (newOptions.moveDialogTemplate.templateName) {
                controllerOptions.dialog.template = newOptions.moveDialogTemplate.templateName;
                controllerOptions.dialog.templateOptions = newOptions.moveDialogTemplate.templateOptions;
            } else {
                controllerOptions.dialog.template = newOptions.moveDialogTemplate;
                Logger.warn('Mover: Wrong type of moveDialogTemplate option, use object notation instead of template function', this);
            }
        }
        if (contextDataOptions) {
            controllerOptions.source = newOptions.source || contextDataOptions.source;
            controllerOptions.items = contextDataOptions.items;
            controllerOptions.filter = contextDataOptions.filter;
            self._items = controllerOptions.items;
            self._source = controllerOptions.source;
            self._keyProperty = newOptions.keyProperty || contextDataOptions.keyProperty;
            self._filter = controllerOptions.filter;
        }
        if (!self._controller) {
            self._controller = new MoveController(controllerOptions);
        } else {
            self._controller.update(controllerOptions);
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

    getItemsBySelection(selection): Promise<TMoveItems> {
        let resultSelection;
        // Support moving with mass selection.
        // Full transition to selection will be made by:
        // https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
        selection.recursive = false;

        if (selection instanceof Array) {
            resultSelection = Deferred.success(selection);
        } else {
            const filter = _private.prepareFilter(this, this._filter, selection);
            resultSelection = getItemsBySelection(selection, this._source, this._items, filter);
        }

        return resultSelection;
    },

    prepareMovedItems(self, items) {
        let result = [];
        items.forEach(function(item) {
            result.push(_private.getIdByItem(self, item));
        });
        return result;
    },

    prepareFilter(self, filter, selection): object {
        const searchParam = self._options.searchParam;
        const root = self._options.root;
        let resultFilter = filter;

        if (searchParam && !selection.selected.includes(root)) {
            resultFilter = {...filter};
            delete resultFilter[searchParam];
        }

        return resultFilter;
    },

    useController(items): boolean {
        return !items.forEach && !items.selected;
    },

    createMoveObject(self, items: TMoveItems): IMoveObject {
        let moveObject: IMoveObject = {
            selectedKeys: [],
            excludedKeys: []
        };
        if (items.forEach) {
            moveObject.selectedKeys = _private.prepareMovedItems(self, items);
        } else if (items.selected || items.excluded) {
            moveObject.selectedKeys = _private.prepareMovedItems(self, items.selected);
            moveObject.excludedKeys = _private.prepareMovedItems(self, items.excluded);
        }
        return moveObject;
    },

    /**
     * Обработчик перемещения при помощи диалога в HOC
     * @param items
     * @param target
     * @private
     */
    moveDialogOnResultHandler(items: TMoveItems, target: Model): void {
        this.moveItems(items, target, MOVE_POSITION.on);
    }
};

/**
 * Контрол для перемещения элементов списка в recordSet и dataSource.
 *
 * @remark
 * Контрол должен располагаться в одном контейнере {@link Controls/list:DataContainer} со списком.
 * В случае использования {@link Controls/operations:Controller} для корректной обработки событий необходимо помещать Controls/list:Mover внутри Controls/operations:Controller.
 *
 * Полезные ссылки:
 * * <a href="/materials/Controls-demo/app/Controls-demo%2FtreeGrid%2FMover%2FBase%2FIndex">демо-пример</a>
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list-environment/actions/mover/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
 *
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
 * In case you are using {@link Controls/operations:Controller}
 * you should place Controls/list:Mover inside of Controls/operations:Controller.
 * <a href="/materials/Controls-demo/app/Controls-demo%2FOperationsPanel%2FDemo">Demo examples</a>.
 * @class Controls/_list/Mover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IMovable
 * @mixes Controls/_interface/IHierarchy
 * @control
 * @public
 * @author Авраменко А.С.
 * @category List
 */

var Mover = Control.extend({
    _controller: null,
    _moveDialogTemplate: null,
    _moveDialogOptions: null,
    _template: Template,
    _beforeMount: function (options, context) {
        _private.updateDataOptions(this, options, context.dataOptions);
    },

    _beforeUpdate: function (options, context) {
        _private.updateDataOptions(this, options, context.dataOptions);
    },

    moveItemUp: function (item) {
        return _private.moveItemToSiblingPosition(this, item, MOVE_POSITION.before);
    },

    moveItemDown: function (item) {
        return _private.moveItemToSiblingPosition(this, item, MOVE_POSITION.after);
    },

    moveItems(items: []|IMoveObject, target, position): Promise<any> {
        const self = this;
        if (target === undefined) {
            return Deferred.success();
        }
        if (_private.useController(items)) {
            return _private.moveItems(self, items, target, position);
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

    moveItemsWithDialog(items: []|IMoveObject): Promise<void> {
        if (_private.useController(items)) {
            return this._controller.moveItemsWithDialog(items);
        } else {
            if (this._options.moveDialogTemplate) {
                if (MoveController.validate(_private.createMoveObject(this, items))) {
                    return _private.getItemsBySelection.call(this, items).addCallback((items: []) => (
                        this._controller.openMoveDialog(items, _private.prepareMovedItems(this, items))
                    ));
                }
            } else {
                Logger.warn('Mover: Can\'t call moveItemsWithDialog! moveDialogTemplate option, is undefined', this);
            }
        }
        return Promise.resolve();
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
