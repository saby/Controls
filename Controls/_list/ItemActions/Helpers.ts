import TreeItemsUtil = require('Controls/_list/resources/utils/TreeItemsUtil');

var MOVE_DIRECTION = {
    'UP': 'up',
    'DOWN': 'down'
};

var cachedDisplay;

function getDisplay(items, parentProperty, nodeProperty) {
   //Кешируем проекцию, т.к. её создание тежеловесная операция, а данный метод будет вызываться для каждой записи в списке.
   if (!cachedDisplay || cachedDisplay.getCollection() !== items || cachedDisplay.getCollection().getVersion() !== items.getVersion()) {
      cachedDisplay = TreeItemsUtil.getDefaultDisplayTree(items, {
         keyProperty: items.getIdProperty(),
         parentProperty: parentProperty,
         nodeProperty: nodeProperty
      }, {});
   }
   return cachedDisplay;
}

function getSiblingItem(direction, item, items, parentProperty, nodeProperty) {
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
    if (parentProperty) {
        display = getDisplay(items, parentProperty, nodeProperty);
        itemFromProjection = display.getItemBySourceItem(items.getRecordById(item.getId()));
        siblingItem = display[direction === MOVE_DIRECTION.UP ? 'getPrevious' : 'getNext'](itemFromProjection);
        result = siblingItem ? siblingItem.getContents() : null;
    } else {
        itemIndex = items.getIndex(item);
        result = items.at(direction === MOVE_DIRECTION.UP ? --itemIndex : ++itemIndex);
    }

    return result;
}

/**
 * Список хелперов для отображения панели операций над записью.
 * @class Controls/_list/ItemActions/Helpers
 * @public
 * @author Сухоручкин А.С.
 * @category List
 */

/*
 * List of helpers for displaying item actions.
 * @class Controls/_list/ItemActions/Helpers
 * @public
 * @author Сухоручкин А.С.
 * @category List
 */
var helpers = {

    /**
     *  @typedef {String} MoveDirection
     *  @variant {String} up Двигаться вверх.
     *  @variant {String} down Двигаться вниз
     */

    /*
     *  @typedef {String} MoveDirection
     *  @variant {String} up Move up
     *  @variant {String} down Move down
     */

    /**
     * Хелпер для отображения панели операций над записью наверху/внизу.
     * @function Controls/_list/ItemActions/Helpers#reorderMoveActionsVisibility
     * @param {MoveDirection} direction
     * @param {Types/entity:Record} item Экземпляр элемента, действие которого обрабатывается.
     * @param {Types/collection:RecordSet} items Список всех элементов.
     * @param {Controls/_interface/IHierarchy#parentProperty} parentProperty Имя поля, содержащего сведения о родительском узле.
     * @param {Controls/_interface/IHierarchy#nodeProperty} nodeProperty Имя поля, описывающего тип узла (список, узел, скрытый узел).
     */

    /*
     * Helper to display up/down item actions.
     * @function Controls/_list/ItemActions/Helpers#reorderMoveActionsVisibility
     * @param {MoveDirection} direction
     * @param {Types/entity:Record} item Instance of the item whose action is being processed.
     * @param {Types/collection:RecordSet} items List of all items.
     * @param {Controls/_interface/IHierarchy#parentProperty} parentProperty Name of the field that contains information about parent node.
     * @param {Controls/_interface/IHierarchy#nodeProperty} nodeProperty Name of the field describing the type of the node (list, node, hidden node).
     */

    /**
     * @example
     * В следующем примере разрешается перемещать только элементы, находящиеся в одном родительском элементе.
     * JS:
     * <pre>
     * _itemActionVisibilityCallback: function(action, item) {
     *    var result = true;
     *
     *    if (action.id === 'up' || action.id === 'down') {
     *       result = visibilityCallback.reorderMoveActionsVisibility(action.id, item, this._items, 'Parent');
     *    }
     *
     *    return result;
     * }
     * </pre>
     *
     * В следующем примере разрешается перемещать только элементы, которые находятся в том же родительском элементе и имеют тот же тип.
     * JS:
     * <pre>
     * _itemActionVisibilityCallback: function(action, item) {
     *    var result = true;
     *
     *    if (action.id === 'up' || action.id === 'down') {
     *       result = visibilityCallback.reorderMoveActionsVisibility(action.id, item, this._items, 'Parent', 'Parent@');
     *    }
     *
     *    return result;
     * }
     * </pre>
     */

    /*
     * @example
     * In the following example, only items that are in the same parent are allowed to be moved.
     * JS:
     * <pre>
     * _itemActionVisibilityCallback: function(action, item) {
     *    var result = true;
     *
     *    if (action.id === 'up' || action.id === 'down') {
     *       result = visibilityCallback.reorderMoveActionsVisibility(action.id, item, this._items, 'Parent');
     *    }
     *
     *    return result;
     * }
     * </pre>
     *
     * In the following example, only items that are in the same parent and have the same type are allowed to be moved.
     * JS:
     * <pre>
     * _itemActionVisibilityCallback: function(action, item) {
     *    var result = true;
     *
     *    if (action.id === 'up' || action.id === 'down') {
     *       result = visibilityCallback.reorderMoveActionsVisibility(action.id, item, this._items, 'Parent', 'Parent@');
     *    }
     *
     *    return result;
     * }
     * </pre>
     */
    reorderMoveActionsVisibility: function (direction, item, items, parentProperty, nodeProperty) {
        var siblingItem = getSiblingItem(direction, item, items, parentProperty, nodeProperty);

        return !!siblingItem &&
            (!parentProperty || siblingItem.get(parentProperty) === item.get(parentProperty)) && //items in one folder
            (!nodeProperty || siblingItem.get(nodeProperty) === item.get(nodeProperty));//items of the same type
    }
};

helpers.MOVE_DIRECTION = MOVE_DIRECTION;

export = helpers;
