import {adapter} from 'Types/entity';

export const moverMemoryFilter = function(item: adapter.IRecord,
                                          filter: {parent: Array<string| number>, title: string}): boolean {
    const parent = filter.hasOwnProperty('parent') ? filter.parent : null;
    if (parent && parent.forEach) {
        for (let i = 0; i < parent.length; i++) {
            if (item.get('parent') === parent[i]) {
                return true;
            }
        }
        return false;
    } else if ('title' in filter && !!filter.title) {
        let addByChildren = false;
        this._each(this.data, (sourceItem) => {
            const sourceRecord = this._$adapter.forRecord(sourceItem);
            if (sourceRecord.get('parent') === item.get('key') &&
                sourceRecord.get('title').toLowerCase().indexOf(filter.title.toLowerCase()) !== -1) {
                addByChildren = true;
            }
        });
        return addByChildren || item.get('title').toLowerCase().indexOf(filter.title.toLowerCase()) !== -1;
    } else {
        return item.get('parent') === parent;
    }
};
