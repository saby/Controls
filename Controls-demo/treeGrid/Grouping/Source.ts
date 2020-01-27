import {HierarchicalMemory} from 'Types/source';

function generateData(count: number): any[] {
    const result = [];
    const countsArray = [5, 7, 12, 3, 8, 6, 22, 1, 4, 16];
    let countIdx = 0;
    for (let i = 0; i < count; i++) {
        result.push({
            key: 'key_' + i,
            title: 'item_' + i,
            count: countsArray[countIdx],
            parent: null,
            hasChildren: i % 3 === 0,
            type: true,
            group: 'group_' + (i < count / 2 ? 1 : 2)
        });
        if (i % 3 === 0) {
            for (let j = 0; j < 3; j++) {
                result.push({
                    key: 'key_' + i + '_' + j,
                    title: 'item_' + i + '_' + j,
                    count: 0,
                    parent: 'key_' + i,
                    hasChildren: false,
                    type: true,
                    group: 'group_' + (i < count / 2 ? 1 : 2)
                });
            }
        }
        countIdx = countIdx < 9 ? countIdx + 1 : 0;
    }
    return result;
}

interface IDemoCreateSourceCfg {
    count: number;
}

export function createGroupingSource(cfg: IDemoCreateSourceCfg): HierarchicalMemory {
    const sourceData = generateData(cfg.count);
    let foundedCursor = false;
    const source = new HierarchicalMemory({
        keyProperty: 'key',
        data: sourceData,
        filter: (item, filter) => {
            const parent = filter.hasOwnProperty('parent') ? filter.parent : null;
            if (parent !== null || filter['key>='] === item.get('key')) {
                foundedCursor = true;
            }
            if (filter.group) {
                return filter.group.indexOf(item.get('group')) !== -1 && item.get('parent') === parent;
            }
            let itemInExpandedGroup = true;
            if (filter.collapsedGroups && filter.collapsedGroups.indexOf(item.get('group')) !== -1) {
                itemInExpandedGroup = false;
            }
            return foundedCursor && itemInExpandedGroup && item.get('parent') === parent;
            // for old grouping:
            // return foundedCursor && item.get('parent') === parent;
        }
    });
    const originalQueryFn = source.query;
    source.query = function() {
        return originalQueryFn.apply(this, arguments).then((result) => {
            const resultData = result.getRawData();
            const lastResultKey = resultData.items[resultData.items.length - 1].key;
            const lastResultIndex = sourceData.findIndex((item) => {
                return item.key === lastResultKey;
            });
            const nextKey = 'key_' + (+lastResultKey.replace('key_', '') + 1);
            resultData.meta.nextPosition = [nextKey];
            resultData.meta.more = lastResultIndex < sourceData.length;
            foundedCursor = false;
            return result;
        });
    };
    return source;
}
