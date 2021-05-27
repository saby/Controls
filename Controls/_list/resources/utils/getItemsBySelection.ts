import {Query, ICrud, QueryWhereExpression} from 'Types/source';
import {factory} from 'Types/chain';
import {adapter, Model} from 'Types/entity';
import {ISelectionObject, TSelectionType, TSelectionRecord} from 'Controls/interface';
import * as cClone from 'Core/core-clone';
import * as Deferred from 'Core/Deferred' ;
import * as operations from 'Controls/operations';
import { error as errorLib } from 'Controls/dataSource';
import {RecordSet} from 'Types/collection';

function selectionToRecord(selection: ISelectionObject, adapter: adapter.IAdapter,
                           type: TSelectionType): TSelectionRecord {
    const recursive = selection.recursive === undefined ? true : selection.recursive;
    return operations.selectionToRecord(selection, adapter, type, recursive);
}
/**
 * @typedef {Object} ISelectionObject
 * @property {Array<string|number>} selected массив идентификаторов отмеченных записей
 * @property {Array<string|number>} excluded массив идентификаторов записей, исключённых из отметки
 */

/**
 * Модуль возвращает функцию, которая позволяет по переданным параметрам получить выборку из отмеченных записей.
 * @param {ISelectionObject} selection Объект, описывающий выделение
 * @param {Types/source:ICrud} dataSource Источник данных
 * @param {Types/collection:RecordSet} items Коллекция записей списка
 * @param {object} filter объект, описывающий фильтрацию
 * @param {number} limit Максимальное количество записей в выборке
 * @param selectionType {string} Тип записей, доступных для выбора, поддерживаются варианты: "all", "leaf", "node"
 *
 * @example
 * <pre>
 * const selection = {
 *     selected: [1,2,3],
 *     excluded: []
 * };
 * const source = new SbisService(...)
 * const filter = {
 *     onlyStore: true
 * }
 * import('Controls/list').then((listLib) => {
 *      listLib.getItemsBySelection(selection, source, items, filter).then(() => {
 *          ...
 *      });
 * });
 * </pre>
 * @class Controls/_list/resources/utils/getItemsBySelection
 * @public
 * @author Герасимов А.М.
 */

export function getItemsBySelection(
    selection: ISelectionObject,
    dataSource: ICrud,
    items: RecordSet,
    filter: QueryWhereExpression<unknown>,
    limit?: number,
    selectionType?: TSelectionType
): Model[] {
    let item;
    let query: Query;
    let result;
    let selectedItems = [];

    if(items) {
        selection.selected.forEach((key) => {
            item = items.getRecordById(key);
            if (item) {
                selectedItems.push(item.getId());
            }
        });
    } else {
        selectedItems = selection.selected;
    }

    // Do not load the data if they are all in the current recordSet.
    if (selectedItems.length === selection.selected.length && !selection.excluded.length) {
        return Deferred.success(selectedItems);
    }
    query = new Query();

    const filterClone = filter ? cClone(filter) : {};

    filterClone.selection = selectionToRecord(selection, 'adapter.sbis', selectionType);

    if (limit) {
        query.limit(limit);
    }
    result = dataSource.query(query.where(filterClone)).addCallback((list) => {
        return factory(list.getAll()).toArray().map((curItem) => {
            return curItem.getId();
        });
    }).addErrback((error) => {
        return errorLib.process({ error }).then(() => []);
    });
    return result;

}
