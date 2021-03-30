import {Gadgets} from '../../DemoHelpers/DataCatalog';
import {HierarchicalMemory} from 'Types/source';

export const getColumns = Gadgets.getGridColumnsForFlat;

export const generateData = (): Array<{
    id: number,
    title: string,
    parent: number | null,
    type: boolean | null
}> => {
    const itemsCount = 500;
    const result = [];
    const parents = [
        {
            id: '1',
            title: 'Запись первого уровня с id = 1. Много дочерних элементов.',
            parent: null,
            type: true
        },
        {
            id: '2',
            title: 'Запись первого уровня с id = 2. Много дочерних элементов.',
            parent: null,
            type: true
        }
    ];

    parents.forEach((parent) => {
        result.push(parent);
        for (let i = 1; i < itemsCount; i++) {
            const id = `${parent.id}${i}`;
            result.push(
                {
                    id,
                    title: `Запись второго уровня с id = ${id}`,
                    parent: parent.id,
                    type: null
                }
            );
        }
    });
    return result.sort((a, b) => a.id > b.id ? 1 : -1);
};

export function createLoadableSource(): HierarchicalMemory {
    const sourceData = generateData();

    const source = new HierarchicalMemory({
        keyProperty: 'id',
        data: sourceData,
        filter: (item, filter) => {
            const parent = filter.hasOwnProperty('parent') ? filter.parent : null;
            return item.get('parent') === parent;
        }
    });
    const originalQueryFn = source.query;
    // tslint:disable-next-line
    source.query = function(): any {
        const queryArguments = arguments;
        return originalQueryFn.apply(this, queryArguments).then((result) => {
            const resultData = result.getRawData();
            const lastResultKey = resultData.items[resultData.items.length - 1].id;
            const filteredSource = sourceData.filter((item) => {
                const filter = queryArguments[0].getWhere();
                const parent = filter.hasOwnProperty('parent') ? filter.parent : null;
                return item.parent === parent;
            });
            const lastResultIndex = filteredSource.findIndex((item) => {
                return item.id === lastResultKey;
            });
            resultData.meta.more = filteredSource.length - lastResultIndex;
            return result;
        });
    };
    return source;
}
