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

export default class Mover extends BaseAction {
    _template = template;
    _moveDialogTemplate = null;
    _moveDialogOptions = null;

    static getDefaultOptions() {
        return {
            sortingOrder: DEFAULT_SORTING_ORDER
        };
    }

    static contextTypes() {
        return {
            dataOptions: dataOptions
        };
    }

    _beforeMount(options, context) {
        this._updateDataOptions(this, context.dataOptions);

        if (options.moveDialogTemplate) {
            if (options.moveDialogTemplate.templateName) {
                this._moveDialogTemplate = options.moveDialogTemplate.templateName;
                this._moveDialogOptions = options.moveDialogTemplate.templateOptions;
            } else {
                this._moveDialogTemplate = options.moveDialogTemplate;
                Logger.warn('Mover', 'Wrong type of moveDialogTemplate option, use object notation instead of template function', this);
            }
        }
    }

    _beforeUpdate(options, context) {
        this._updateDataOptions(context.dataOptions);
        if (options.moveDialogTemplate && options.moveDialogTemplate.templateOptions && !isEqual(this._moveDialogOptions, options.moveDialogTemplate.templateOptions)) {
           this._moveDialogOptions = options.moveDialogTemplate.templateOptions;
        }
    }

    moveItemUp(item) {
        return this._moveItemToSiblingPosition(item, MOVE_POSITION.before);
    }

    moveItemDown(item) {
        return this._moveItemToSiblingPosition(item, MOVE_POSITION.after);
    }

    moveItems(items: []|IMoveItemsParams, target, position): Promise<any> {
        const isNewLogic = !items.forEach && !items.selected;
        if (target === undefined) {
            return Deferred.success();
        }
        if (isNewLogic) {
            if (items.selectedKeys.length) {
                return this._moveItems(items, target, position);
            } else {
                return Deferred.success();
            }
        } else {
            return this._getItemsBySelection(items).addCallback((items) => {
                items = items.filter((item) => {
                    return this._checkItem(item, target, position);
                });
                if (items.length) {
                    return this._moveItems(items, target, position);
                } else {
                    return Deferred.success();
                }
            });
        }
    }

    moveItemsWithDialog(items: []|IMoveItemsParams): void {
        const isNewLogic = !items.forEach && !items.selected;

        if (this.validate(items)) {
            if (isNewLogic) {
                this._openMoveDialog(items);
            } else {
                this._getItemsBySelection(items).addCallback((items: []) => {
                    this._openMoveDialog(this._prepareMovedItems(items));
                });
            }
        }
    }

    private _moveItems(items, target, position) {
        const isNewLogic = !items.forEach && !items.selected;
        return this._beforeItemsMove(items, target, position).addCallback((beforeItemsMoveResult) => {
            if (beforeItemsMoveResult === BEFORE_ITEMS_MOVE_RESULT.MOVE_IN_ITEMS && !isNewLogic) {
                this._moveInItems(items, target, position);
            } else if (beforeItemsMoveResult !== BEFORE_ITEMS_MOVE_RESULT.CUSTOM) {
                return this._moveInSource(items, target, position).addCallback((moveResult) => {
                    if (!isNewLogic) {
                        this._moveInItems(items, target, position);
                    }
                    return moveResult;
                });
            }
        }).addBoth((result) => {
            this._afterItemsMove(items, target, position, result);
            return result;
        });
    }

    private _openMoveDialog(items): void {
        const isNewLogic = !items.forEach && !items.selected;
        const templateOptions = {
            movedItems: isNewLogic ? items.selectedKeys : items,
            source: this._source,
            keyProperty: this._keyProperty,
            ...this._moveDialogOptions
        };
        this._children.dialogOpener.open({
            templateOptions,
            eventHandlers: {
                onResult: (target): void => {
                    this.moveItems(items, target, MOVE_POSITION.on);
                }
            }
        });
    }

    private _beforeItemsMove(items, target, position) {
        let beforeItemsMoveResult = this._notify('beforeItemsMove', [items, target, position]);
        return beforeItemsMoveResult instanceof Promise ? beforeItemsMoveResult : Deferred.success(beforeItemsMoveResult);
    }

    private _afterItemsMove(items, target, position, result) {
        this._notify('afterItemsMove', [items, target, position, result]);

        //According to the standard, after moving the items, you need to unselect all in the table view.
        //The table view and Mover are in a common container (Control.Container.MultiSelector) and do not know about each other.
        //The only way to affect the selection in the table view is to send the selectedTypeChanged event.
        //You need a schema in which Mover will not work directly with the selection.
        //Will be fixed by: https://online.sbis.ru/opendoc.html?guid=dd5558b9-b72a-4726-be1e-823e943ca173
        this._notify('selectedTypeChanged', ['unselectAll'], {
            bubbling: true
        });
    }

    private _moveInItems(items, target, position) {
        if (position === MOVE_POSITION.on) {
            this._hierarchyMove(items, target);
        } else {
            this._reorderMove(items, target, position);
        }
    }

    private _reorderMove(items, target, position) {
        let
           itemIndex,
           movedItem,
           parentProperty = this._options.parentProperty,
           targetId = this._getIdByItem(target),
           targetItem = this._getModelByItem(targetId),
           targetIndex = this._items.getIndex(targetItem);

        items.forEach((item) => {
            movedItem = this._getModelByItem(item);
            if (movedItem) {
                itemIndex = this._items.getIndex(movedItem);
                if (itemIndex === -1) {
                    this._items.add(movedItem);
                    itemIndex = this._items.getCount() - 1;
                }

                if (parentProperty && targetItem.get(parentProperty) !== movedItem.get(parentProperty)) {
                    //if the movement was in order and hierarchy at the same time, then you need to update parentProperty
                    movedItem.set(parentProperty, targetItem.get(parentProperty));
                }

                if (position === MOVE_POSITION.after && targetIndex < itemIndex) {
                    targetIndex = (targetIndex + 1) < this._items.getCount() ? targetIndex + 1 : this._items.getCount();
                } else if (position === MOVE_POSITION.before && targetIndex > itemIndex) {
                    targetIndex = targetIndex !== 0 ? targetIndex - 1 : 0;
                }
                this._items.move(itemIndex, targetIndex);
            }
        });
    }

    private _hierarchyMove(items, target) {
        let targetId = this._getIdByItem(target);
        items.forEach((item) => {
            item = this._getModelByItem(item);
            if (item) {
                item.set(this._options.parentProperty, targetId);
            }
        });
    }

    private _moveInSource(items, target, position) {
        const targetId = this._getIdByItem(target);
        const isNewLogic = !items.forEach && !items.selected;
        if (isNewLogic) {
            if (this._source.call) {
                const callFilter = {
                    selection: selectionToRecord({
                        selected: items.selectedKeys,
                        excluded: items.excludedKeys
                    }, this._source.getAdapter()), ...items.filter
                };
                return this._source.call(this._source.getBinding().move, {
                    method: this._source.getBinding().list,
                    filter: callFilter,
                    folder_id: targetId
                });
            }
            return this._source.move(items.selectedKeys, targetId, {
                position,
                parentProperty: this._options.parentProperty
            });
        }
        let
           idArray = items.map((item) => {
               return this._getIdByItem(item);
           });

        //If reverse sorting is set, then when we call the move on the source, we invert the position.
        if (position !== MOVE_POSITION.on && this._options.sortingOrder !== DEFAULT_SORTING_ORDER) {
            position = position === MOVE_POSITION.after ? MOVE_POSITION.before : MOVE_POSITION.after;
        }
        return this._source.move(idArray, targetId, {
            position,
            parentProperty: this._options.parentProperty
        });
    }

    private _moveItemToSiblingPosition(item, position) {
        let target = this._getSiblingItem(item, position);
        return target ? this.moveItems([item], target, position) : Deferred.success();
    }

    private _getSiblingItem(item, position) {
        let
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
        if (this._options.parentProperty) {
            display = TreeItemsUtil.getDefaultDisplayTree(this._items, {
                keyProperty: this._keyProperty,
                parentProperty: this._options.parentProperty,
                nodeProperty: this._options.nodeProperty
            });
            if (this._options.root) {
                display.setRoot(this._options.root)
            }
            itemFromProjection = display.getItemBySourceItem(this._getModelByItem(item));
            siblingItem = display[position === MOVE_POSITION.before ? 'getPrevious' : 'getNext'](itemFromProjection);
            result = siblingItem ? siblingItem.getContents() : null;
        } else {
            itemIndex = this._items.getIndex(this._getModelByItem(item));
            result = this._items.at(position === MOVE_POSITION.before ? --itemIndex : ++itemIndex);
        }

        return result;
    }

    private _updateDataOptions(dataOptions) {
        if (dataOptions) {
            this._items = dataOptions.items;
            this._source = this._options.source || dataOptions.source;
            this._keyProperty = this._options.keyProperty || dataOptions.keyProperty;
            this._filter = dataOptions.filter;
        }
    }

    private _checkItem(item, target, position) {
        let
           key,
           parentsMap,
           movedItem = this._getModelByItem(item);

        if (target !== null) {
            target = this._getModelByItem(target);
        }

        //Check for a item to be moved because it may not be in the current recordset
        if (this._options.parentProperty && movedItem) {
            if (target && position === MOVE_POSITION.on && target.get(this._options.nodeProperty) === null) {
                return false;
            }
            parentsMap = this._getParentsMap(this._getIdByItem(target));
            key = '' + movedItem.get(this._keyProperty);
            if (parentsMap.indexOf(key) !== -1) {
                return false;
            }
        }
        return true;
    }

    private _getParentsMap(id) {
        let
           item,
           toMap = [],
           items = this._items,
           path = items.getMetaData().path;

        item = items.getRecordById(id);
        while (item) {
            id = '' + item.get(this._keyProperty);
            if (toMap.indexOf(id) === -1) {
                toMap.push(id);
            } else {
                break;
            }
            id = item.get(this._options.parentProperty);
            item = items.getRecordById(id);
        }
        if (path) {
            path.forEach((elem) => {
                if (toMap.indexOf(elem.get(this._keyProperty)) === -1) {
                    toMap.push('' + elem.get(this._keyProperty));
                }
            });
        }
        return toMap;
    }

    private _getModelByItem(item) {
        return cInstance.instanceOfModule(item, 'Types/entity:Model') ? item : this._items.getRecordById(item);
    }

    private _getIdByItem(item) {
        return cInstance.instanceOfModule(item, 'Types/entity:Model') ? item.get(this._keyProperty) : item;
    }

    private _getItemsBySelection(selection) {
        //Support moving with mass selection.
        //Full transition to selection will be made by: https://online.sbis.ru/opendoc.html?guid=080d3dd9-36ac-4210-8dfa-3f1ef33439aa
        selection.recursive = false;
        return selection instanceof Array ? Deferred.success(selection) : getItemsBySelection(selection, this._source, this._items, this._filter);
    }

    private _prepareMovedItems(items) {
        let result = [];
        items.forEach((item) => {
            result.push(this._getIdByItem(this, item));
        });
        return result;
    }
};
