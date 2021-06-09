import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

export const getColumns = Flat.getColumns;

export const generateData = (): Array<{
    key: number,
    title: string,
    parent: number | null,
    type: boolean | null
}> => {
    const itemsCount = 500;
    const result = [];
    const parents = [
        {
            key: '1',
            title: 'Запись первого уровня с id = 1. Много дочерних элементов.',
            parent: null,
            type: true
        },
        {
            key: '2',
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
