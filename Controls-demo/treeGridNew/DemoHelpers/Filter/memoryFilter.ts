import {adapter} from 'Types/entity';

function findChildren(data: object[],
                      item: adapter.IRecord,
                      filterValue: string,
                      keyProperty: string,
                      parentProperty: string,
                      filterProperty: string): boolean {

    if (item.get(filterProperty).toLowerCase().indexOf(filterValue.toLowerCase()) !== -1) {
        return true;
    }

    let addByChildren: boolean = false;
    this._each(data, (sourceItem) => {
        const sourceRecord = this._$adapter.forRecord(sourceItem);
        if (sourceRecord.get(parentProperty) === item.get(keyProperty) &&
            findChildren.call(this, data, sourceRecord, filterValue, keyProperty, parentProperty, filterProperty)) {
            addByChildren = true;
        }
    });
    return addByChildren;
}

/**
 * Рекурсивно отфильтровывает данные для HierarchicalMemory. Возвращает родителей найденных по фильтру записей.
 * Необходимо для корректной работы с HierarchicalMemory при поиске с хлебными крошками
 * @param item
 * @param filter
 * @param keyProperty
 * @param parentProperty
 * @param filterProperty
 */
export const memoryFilter = function(item: adapter.IRecord,
                                     filter: {parent: Array<string| number>, title: string},
                                     keyProperty: string = 'key',
                                     parentProperty: string = 'parent',
                                     filterProperty: string = 'title'): boolean {
    const parent = filter.hasOwnProperty(parentProperty) ? filter.parent : null;
    if (parent && parent.forEach) {
        for (let i = 0; i < parent.length; i++) {
            if (item.get(parentProperty) === parent[i]) {
                return true;
            }
        }
        return false;
    } else if (filterProperty in filter && !!filter.title) {
        return findChildren.call(this, this.data, item, filter.title, keyProperty, parentProperty, filterProperty);
    } else {
        return item.get(parentProperty) === parent;
    }
};
