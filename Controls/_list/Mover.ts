import BaseAction from 'Controls/_list/BaseAction';
import Deferred = require('Core/Deferred');
import cInstance = require('Core/core-instance');
import {getItemsBySelection} from 'Controls/_list/resources/utils/getItemsBySelection';
import {Logger} from 'UI/Utils';
import {ContextOptions as dataOptions} from 'Controls/context';

import {MoveController, IMoveControllerOptions} from './Controllers/MoveController';
import {Model} from 'Types/entity';
import {CrudEntityKey, LOCAL_MOVE_POSITION} from 'Types/source';


// @TODO Если убрать отсюда шаблон, то operationPanel перестаёт получать события
//   selectedTypeChanged даже от MultiSelect
//  https://online.sbis.ru/doc/0445b971-8675-42ef-b2bc-e68d7f82e0ac
import * as Template from 'wml!Controls/_list/Mover/Mover';
import {Dialog} from 'Controls/popup';
import * as TreeItemsUtil from './resources/utils/TreeItemsUtil';
import {ISelectionObject, TKeysSelection} from 'Controls/interface';
import {IHashMap} from 'Types/declarations';
import {IMoverDialogTemplateOptions} from 'Controls/moverDialog';
import {BEFORE_ITEMS_MOVE_RESULT, IMoveItemsParams} from './interface/IMoverAndRemover';

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
                return self._controller.move(
                    _private.convertItemsToISelectionObject(items),
                    _private.extractFilter(items),
                    _private.getIdByItem(self, target),
                    position, beforeItemsMoveResult);
            }
            if (beforeItemsMoveResult === BEFORE_ITEMS_MOVE_RESULT.MOVE_IN_ITEMS) {
                return _private.moveInItems(self, items, target, position);
            } else if (beforeItemsMoveResult !== BEFORE_ITEMS_MOVE_RESULT.CUSTOM) {
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
        if (position === LOCAL_MOVE_POSITION.On) {
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
                if (position === LOCAL_MOVE_POSITION.Before) {
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

                if (position === LOCAL_MOVE_POSITION.After && targetIndex < movedIndex) {
                    targetIndex = (targetIndex + 1) < self._items.getCount() ? targetIndex + 1 : self._items.getCount();
                } else if (position === LOCAL_MOVE_POSITION.Before && targetIndex > movedIndex) {
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
        if (position !== LOCAL_MOVE_POSITION.On && self._options.sortingOrder !== DEFAULT_SORTING_ORDER) {
            position = position === LOCAL_MOVE_POSITION.After ? LOCAL_MOVE_POSITION.Before : LOCAL_MOVE_POSITION.After;
        }
        return self._source.move(idArray, targetId, {
            position,
            parentProperty: self._options.parentProperty
        });
    },

    moveItemToSiblingPosition: function (self, item, position) {
        const target = _private.getTargetItem(self, item, position);
        return target ? self.moveItems([item], target, position) : Deferred.success();
    },

    /**
     * Получает элемент к которому мы перемещаем текущий элемент
     * Метод сделан публичным для совместимости с HOC
     * @param self текущий контрол
     * @param item текущий элемент
     * @param position позиция (направление перемещения)
     * @private
     */
    getTargetItem(self, item, position: LOCAL_MOVE_POSITION): Model {
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
            siblingItem = display[position === LOCAL_MOVE_POSITION.Before ? 'getPrevious' : 'getNext'](itemFromProjection);
            result = siblingItem ? siblingItem.getContents() : null;
        } else {
            itemIndex = self._items.getIndex(_private.getModelByItem(self, item));
            result = self._items.at(position === LOCAL_MOVE_POSITION.Before ? --itemIndex : ++itemIndex);
        }

        return result;
    },

    updateDataOptions: function (self, newOptions, contextDataOptions) {
		self._items = newOptions.items || contextDataOptions?.items;

        let controllerOptions: Partial<IMoveControllerOptions> = {
            parentProperty: newOptions.parentProperty
        };
        if (contextDataOptions) {
			controllerOptions.source = newOptions.source || contextDataOptions.source;
            self._source = controllerOptions.source;
            self._keyProperty = newOptions.keyProperty || contextDataOptions.keyProperty;
            self._filter = contextDataOptions.filter;
        }
        if (newOptions.moveDialogTemplate) {
            controllerOptions.popupOptions = {
                opener: self
            };

            if (newOptions.moveDialogTemplate.templateName) {
                self._moveDialogTemplate = newOptions.moveDialogTemplate.templateName;
                self._moveDialogOptions = newOptions.moveDialogTemplate.templateOptions;
                controllerOptions.popupOptions.template = self._moveDialogTemplate;
                controllerOptions.popupOptions.templateOptions = self._moveDialogOptions;
            } else {
                self._moveDialogTemplate = newOptions.moveDialogTemplate;
                controllerOptions.popupOptions.template = self._moveDialogTemplate;
                Logger.warn('Mover: Wrong type of moveDialogTemplate option, use object notation instead of template function', self);
            }
        }
        if (!self._controller) {
            self._controller = new MoveController(controllerOptions as IMoveControllerOptions);
        } else {
            self._controller.updateOptions(controllerOptions);
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
            if (target && position === LOCAL_MOVE_POSITION.On && target.get(self._options.nodeProperty) === null) {
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

    getItemsBySelection(selection): Promise<any> {
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

    openMoveDialog(self, selection): Promise<void> {
        const templateOptions: IMoverDialogTemplateOptions = {
            movedItems: _private.useController(selection) ? selection.selectedKeys : selection,
            source: self._source,
            keyProperty: self._keyProperty, // keyProperty может быть заменён в moveDialogOptions
            ...(self._moveDialogOptions as IMoverDialogTemplateOptions)
        };
        return new Promise((resolve) => {
            self._children.dialogOpener.open({
                templateOptions,
                eventHandlers: {
                    onResult: (target: Model) => {
                        resolve(self.moveItems(selection, target, LOCAL_MOVE_POSITION.On))
                    }
                }
            });
        });
    },

    convertItemsToISelectionObject(item): ISelectionObject {
        let selectionObject: ISelectionObject
        if (item.selected) {
            selectionObject = item;
        } else if (item.selectedKeys) {
            selectionObject = {
                selected: item.selectedKeys,
                excluded: item.excludedKeys,
            }
        } else if (item.forEach) {
            selectionObject = {
                selected: item,
                excluded: undefined
            }
        }
        return selectionObject;
    },

    extractFilter(item): IHashMap<any> {
        let filter: IHashMap<any>;
        if (item.filter) {
            filter = item.filter;
        }
        return filter || {};
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
 * * <a href="/doc/platform/developmentapl/interface-development/controls/list/actions/mover/">руководство разработчика</a>
 * * <a href="https://github.com/saby/wasaby-controls/blob/rc-20.4000/Controls-default-theme/aliases/_list.less">переменные тем оформления</a>
 *
 * @class Controls/_list/Mover
 * @extends Controls/_list/BaseAction
 * @mixes Controls/interface/IMovable
 * @mixes Controls/_interface/IHierarchy
 * @deprecated Класс устарел и буден удалён. Используйте методы интерфейса {@link Controls/list:IMovableList}, который по умолчанию подключен в списки.
 * @demo Controls-demo/treeGrid/Mover/Base/Index
 * @public
 * @author Авраменко А.С.
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
 *
 * @public
 * @author Авраменко А.С.
 */

var Mover = BaseAction.extend({
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
        return _private.moveItemToSiblingPosition(this, item, LOCAL_MOVE_POSITION.Before);
    },

    moveItemDown: function (item) {
        return _private.moveItemToSiblingPosition(this, item, LOCAL_MOVE_POSITION.After);
    },

    moveItems(items: []|IMoveItemsParams, target, position): Promise<any> {
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

    moveItemsWithDialog(items: []|IMoveItemsParams): Promise<any> {
        if (this._moveDialogTemplate) {
            if (this.validate(items)) {
                if (_private.useController(items)) {
                    return _private.openMoveDialog(this, items);
                } else {
                    return _private.getItemsBySelection.call(this, items).addCallback((items: []) => (
                        _private.openMoveDialog(this, _private.prepareMovedItems(this, items))
                    ));
                }
            }
        } else {
            Logger.warn('Mover: Can\'t call moveItemsWithDialog! moveDialogTemplate option, is undefined', this);
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
