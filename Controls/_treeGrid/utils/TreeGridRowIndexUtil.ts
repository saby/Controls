import ItemsUtil = require('Controls/_list/resources/utils/ItemsUtil')
import { relation } from 'Types/entity'
import { Collection, CollectionItem } from 'Controls/display'


/**
 * @author Родионов Е.А.
 */



/**
 * @typedef {Object} HasMoreStorage Объект, содержащий флаги наличия у узлов незагруженных дочерних записей(нужно ли показывать кнопку "Ещё").
 */
type HasMoreStorage = Record<string, boolean>;

/**
 * @typedef {Array<string>} ExpandedItems Массив, содержащий идентификаторы раскрытых узлов дерева.
 */
type ExpandedItems = Array<string>;

/**
 * @typedef {Object} ItemId Объект расширяющий базовую конфигурацию для получения индекса записи по идентификатору элемента таблицы.
 * @param {string} id Идентификатор элемента таблицы.
 */
type ItemId = { id: string };

/**
 * @typedef {Object} DisplayItem Объект расширяющий базовую конфигурацию для получения индекса записи по элементу проекции.
 * @param {'Controls/display:CollectionItem'} item Элемент проекции таблицы.
 */
type DisplayItem = { item: CollectionItem<unknown> };

/**
 * @typedef {Object} DisplayItemIndex Объект расширяющий базовую конфигурацию для получения индекса записи по индексу элемента в проекции.
 * @param {number} index Индекс элемента в проекции.
 */
type DisplayItemIndex = { index: number }

/**
 * @typedef {Object} HasEmptyTemplate Объект расширяющий базовую конфигурацию, необходимый для расчета номера строки подвала и итогов таблицы.
 * @param {Boolean} hasEmptyTemplate Флаг, указывающий, задан ли шаблон отображения пустого списка.
 */
type HasEmptyTemplate = { hasEmptyTemplate: boolean };

/**
 * @typedef {Object} IBaseTreeGridRowIndexOptions Конфигурационый объект.
 * @param {'Controls/display'} display Проекция элементов списка.
 * @param {Boolean} hasHeader Флаг, указывающий на наличие заголовка в дереве.
 * @param {"top" | "bottom" | null} resultsPosition Позиция результатов в дереве. Null, если результаты не выводятся.
 * @param {'Types/entity:relation.Hierarchy'} hierarchyRelation Объект, представляющий иерархические отношения дерева.
 * @param {HasMoreStorage} hasMoreStorage Объект, содержащий флаги наличия у узлов незагруженных дочерних записей(нужно ли показывать кнопку "Ещё").
 * @param {ExpandedItems} expandedItems Массив, содержащий идентификаторы раскрытых узлов дерева.
 * @param {Boolean} hasNodeFooterTemplate Флаг, указывающий нужно ли выводить подвалы для узлов.
 */
interface IBaseTreeGridRowIndexOptions {
    display: Collection<unknown, CollectionItem<unknown>>
    hasHeader: boolean
    hasBottomPadding: boolean
    resultsPosition?: 'top' | 'bottom'
    multiHeaderOffset: number
    hierarchyRelation: relation.Hierarchy
    hasMoreStorage: HasMoreStorage
    expandedItems: ExpandedItems
    hasNodeFooterTemplate: boolean
    editingRowIndex?: number
    hasColumnScroll?: boolean
}

/**
 * @typedef {IBaseTreeGridRowIndexOptions & (ItemId|DisplayItem|DisplayItemIndex|HasEmptyTemplate)} TreeGridRowIndexOptions Конфигурационый объект.
 */
type TreeGridRowIndexOptions<T = ItemId|DisplayItem|DisplayItemIndex|HasEmptyTemplate> = IBaseTreeGridRowIndexOptions & T;



/**
 * Возвращает номер строки в списке для элемента с указанным id.
 *
 * @param {TreeGridRowIndexOptions<ItemId>} cfg Конфигурационый объект.
 * @return {Number} Номер строки в списке для элемента с указанным id.
 */
function getIndexById(cfg: TreeGridRowIndexOptions<ItemId>): number {

    let idProperty = cfg.display.getIdProperty() || (<Collection<unknown>>cfg.display.getCollection()).getKeyProperty(),
        item = ItemsUtil.getDisplayItemById(cfg.display, cfg.id, idProperty),
        index = cfg.display.getIndex(item);

    return getItemRealIndex({item, index, ...cfg});
}



/**
 * Возвращает номер строки в списке для указанного элемента.
 *
 * @param {TreeGridRowIndexOptions<DisplayItem>} cfg Конфигурационый объект.
 * @return {Number} Номер строки в списке для элемента с указанным id.
 */
function getIndexByItem(cfg: TreeGridRowIndexOptions<DisplayItem>): number {

    let id = cfg.item.getContents().getKey(),
        index = cfg.display.getIndex(cfg.item);

    return getItemRealIndex({id, index, ...cfg});
}



/**
 * Возвращает номер строки в списке для элемента с указанным индексом в проекции.
 *
 * @param {TreeGridRowIndexOptions<DisplayItemIndex>} cfg Конфигурационый объект.
 * @return {Number} Номер строки в списке для элемента с указанным индексом в проекции.
 */
function getIndexByDisplayIndex(cfg: TreeGridRowIndexOptions<DisplayItemIndex>): number {

    let item = cfg.display.at(cfg.index).getContents(),
        id = item.getKey ? item.getKey() : item;

    return getItemRealIndex({item, id, ...cfg});
}



/**
 * Возвращает номер строки в списке для строки результатов.
 *
 * @param {TreeGridRowIndexOptions<HasEmptyTemplate>} cfg Конфигурационый объект.
 * @return {Number} Номер строки в списке для строки результатов.
 */
function getResultsIndex(cfg: TreeGridRowIndexOptions<HasEmptyTemplate>) {
    let index = cfg.hasHeader ? 1 : 0;
    index += cfg.multiHeaderOffset ? cfg.multiHeaderOffset : 0;
    if (cfg.resultsPosition === "bottom") {
        let
            itemsCount = cfg.display.getCount(),
            hasEditingItem = typeof cfg.editingRowIndex === "number";

        if (itemsCount) {
            // Чтобы ради подвала снова не считать индекс последнего элемента на экране,
            // который кстати сначала нужно найти, просто берем общее количество элементов
            // и считаем что у каждего есть подвал.
            // Магическая вещь. Может когда-нибудь сломаться, но пока работает
            index += itemsCount * 2;
        } else {
            index += cfg.hasEmptyTemplate ? 1 : 0;
        }

        index += cfg.hasBottomPadding ? 1 : 0;
        index += hasEditingItem ? 1 : 0;
    }

    return index;
}

/**
 * Возвращает номер строки в списке для строки-отступа между последней записью в таблице и
 * результатами/подвалом/нижней границей таблицы.
 *
 * @param {GridRowIndexOptions} cfg Конфигурационый объект.
 * @return {Number} Номер строки в списке для строки-отступа.
 */
function getBottomPaddingRowIndex(cfg: TreeGridRowIndexOptions): number {
    let
        index = cfg.display.getCount() * 2,
        isResultsInTop = cfg.resultsPosition === "top",
        hasEditingItem = typeof cfg.editingRowIndex === "number";

    index += cfg.hasHeader ? 1 : 0;
    index += isResultsInTop ? 1 : 0;
    index += hasEditingItem ? 1 : 0;
    index += cfg.multiHeaderOffset ? cfg.multiHeaderOffset : 0;
    index += cfg.hasColumnScroll ? 1 : 0;

    return index;
}



/**
 * Возвращает номер строки в списке для строки с подвалом.
 *
 * @param {TreeGridRowIndexOptions<HasEmptyTemplate>} cfg Конфигурационый объект.
 * @return {Number}
 */
function getFooterIndex(cfg: TreeGridRowIndexOptions<HasEmptyTemplate>): number {
    let
        hasResults = !!cfg.resultsPosition,
        itemsCount = cfg.display.getCount(),
        index = 0,
        hasEditingItem = typeof cfg.editingRowIndex === "number";

    index += cfg.hasHeader ? 1 : 0;
    index += hasResults ? 1 : 0;
    index += hasEditingItem ? 1 : 0;
    index += cfg.hasBottomPadding ? 1 : 0;
    index += cfg.multiHeaderOffset ? cfg.multiHeaderOffset : 0;
    index += cfg.hasColumnScroll ? 1 : 0;

    if (itemsCount) {
        index += itemsCount * 2;
    } else {
        index += cfg.hasEmptyTemplate ? 1 : 0;
    }

    return index;
}


/**
 * Возвращиет отступ сверху для первой записи списка.
 *
 * @param {TreeGridRowIndexOptions.hasHeader} hasHeader Флаг, указывающий на наличие заголовка в таблице.
 * @param {TreeGridRowIndexOptions.resultsPosition} resultsPosition Позиция результатов таблицы. Null, если результаты не выводятся.
 * @return {Number} Отступ сверху для первой записи списка
 */
function getTopOffset(hasHeader: TreeGridRowIndexOptions["hasHeader"], resultsPosition: TreeGridRowIndexOptions["resultsPosition"] = null, multiHeaderOffset: number, hasColumnScroll: boolean): number {
    let
        topOffset = 0;

    topOffset += hasHeader ? 1 : 0;
    topOffset += resultsPosition === "top" ? 1 : 0;
    topOffset += multiHeaderOffset ? multiHeaderOffset : 0;
    topOffset += hasColumnScroll ? 1 : 0;

    return topOffset;
}


export {
    ItemId,
    DisplayItem,
    DisplayItemIndex,
    HasEmptyTemplate,

    TreeGridRowIndexOptions,
    IBaseTreeGridRowIndexOptions,

    getIndexById,
    getIndexByItem,
    getIndexByDisplayIndex,
    getBottomPaddingRowIndex,
    getResultsIndex,
    getFooterIndex,
    getTopOffset
}



// region private functions

/**
 * Функция расчета номера строки в списке для заданного элемента.
 *
 * @private
 * @param {TreeGridRowIndexOptions<DisplayItem & DisplayItemIndex & ItemId>} cfg Конфигурационый объект.
 * @return {Number} Отступ сверху для первой записи списка
 */
function getItemRealIndex(cfg: TreeGridRowIndexOptions<DisplayItem & DisplayItemIndex & ItemId>): number {


    let realIndex = cfg.index + getTopOffset(cfg.hasHeader, cfg.resultsPosition, cfg.multiHeaderOffset, cfg.hasColumnScroll);

    if (cfg.display.getCount() === 1) {
        return realIndex;
    } else {
        realIndex += calcNodeFootersBeforeItem(cfg);
    }

    return realIndex;
}



/**
 * Возвращает количество всех видимых подвалов узлов перед(выше) заданным элементом.
 *
 * Формирует массив, хранящий ключи всех элементов, у которых есть подвал и находит количество подвалов,
 * которые рендерятся выше элемента с указанным id.
 * @private
 */
function calcNodeFootersBeforeItem(cfg: TreeGridRowIndexOptions<ItemId & DisplayItemIndex & DisplayItem>): number {

    let
        count = 0,
        needToCheckRealFooterIndex = Object.keys(cfg.hasMoreStorage).filter((id)=>cfg.hasMoreStorage[id] === true),
        idProperty: string = cfg.display.getIdProperty() || (<Collection<unknown>>cfg.display.getCollection()).getKeyProperty();


    if(cfg.hasNodeFooterTemplate) {
        cfg.expandedItems.forEach((expandedItemId) => {
            if (needToCheckRealFooterIndex.indexOf(expandedItemId) === -1) {
                needToCheckRealFooterIndex.push(expandedItemId);
            }
        });
    }

    needToCheckRealFooterIndex.forEach((itemId)=>{
        if (itemId !== cfg.id) {
            let
                expandedItem = ItemsUtil.getDisplayItemById(cfg.display, itemId, idProperty),
                expandedItemIndex = cfg.display.getIndex(expandedItem);

            if (expandedItemIndex < cfg.index) {
                let childrenCount = getChildrenOnDisplayCount(itemId, cfg.display, cfg.hierarchyRelation, cfg.expandedItems);
                count += (cfg.index > expandedItemIndex + childrenCount) ? 1 : 0;
            }
        }
    });


    return count;
}


/**
 * Возвращает количество всех видимых подвалов узлов перед("выше") заданным элементом.
 *
 * @private
 */
// TODO: Переписать на рекурсию с запоминанием
function getChildrenOnDisplayCount(id, display, hierarchyRelation, expandedItems) {

    let count = 0, children;

    // TODO: Удеберется лишний map, при переводе объектов с ключами на map.
    if (expandedItems && expandedItems.map((itemKey) => `${itemKey}`).indexOf(`${id}`) !== -1) {
        children = hierarchyRelation.getChildren(id, display.getCollection());
        count = children.length;

        children.forEach((item) => {
            count += getChildrenOnDisplayCount(item.getKey(), display, hierarchyRelation, expandedItems);
        });
    }

    return count;
}

// endregion
