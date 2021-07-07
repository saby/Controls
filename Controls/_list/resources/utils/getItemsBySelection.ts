import {Query} from 'Types/source';
import {factory} from 'Types/chain';
import {adapter} from 'Types/entity';
import {ISelectionObject, TSelectionType, TSelectionRecord} from 'Controls/interface';
import * as cClone from 'Core/core-clone';
import * as Deferred from 'Core/Deferred' ;
import * as operations from 'Controls/operations';

function selectionToRecord(selection: ISelectionObject, adapter: adapter.IAdapter,
                           type: TSelectionType): TSelectionRecord {
    const recursive = selection.recursive === undefined ? true : selection.recursive;
    return operations.selectionToRecord(selection, adapter, type, recursive);
}

export function getItemsBySelection(selection: ISelectionObject, dataSource, items, filter, limit?: number,
                                    selectionType?: TSelectionType) {
    let item;
    let query: Query;
    let result;
    const selectedItems = [];

    selection.selected.forEach((key) => {
        item = items.getRecordById(key);
        if (item) {
            selectedItems.push(item.getId());
        }
    });

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
    }).addErrback(() => {
        return [];
    });
    return result;

}
