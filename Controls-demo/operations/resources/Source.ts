import {Memory, DataSet} from 'Types/source';
import {RecordSet} from 'Types/collection';

function isNode(item) {
    const type = item.get('type');
    return type === true || type === false;
}

function isItemInRoot(item) {
    return item.get('parent') === null;
}

function getItemId(item) {
    return item.get('id') + '';
}

function getChildrenCount(id, items, excluded): number {
    let childCount = 0;

    items.each((item) => {
        if (item.get('parent') === id && !isInExcluded(item.get('id'), excluded)) {
            if (isNode(item)) {
                childCount += getChildrenCount(item.get('id'), items, excluded);
            } else {
                childCount++;
            }
        }
    });

    return childCount;
}

function isInExcluded(id:string|number, excluded: number[]|string[]): boolean {
  return excluded.includes(id + '') || excluded.includes(+id);
}

export default class extends Memory {
    call(command: string, data: object) {
        const selection = data.filter.selection;
        let marked = selection.get('marked');
        const excluded = selection.get('excluded');
        const items = new RecordSet({
            rawData: this._$data,
            keyProperty: 'id'
        });
        let count = 0;

        if (marked[0] === null) {
            marked = [];
            items.each((item) => {
               if (item.get('parent') === null) {
                   marked.push(item.get('id') + '');
               }
            });
        }

        marked.forEach((id) => {
            id = +id;

            if (!isInExcluded(id, excluded)) {
                if (isNode(items.getRecordById(id))) {
                    count++;
                    count += getChildrenCount(id, items, excluded);
                } else {
                    count++;
                }
            }
        });

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(new DataSet({
                    rawData: {
                        count
                    }
                }));
            }, 1000);
        });
    }
};
