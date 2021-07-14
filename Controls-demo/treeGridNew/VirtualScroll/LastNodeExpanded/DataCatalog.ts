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
            title: 'Запись первого уровня с key = 1. Много дочерних элементов.',
            parent: null,
            type: true
        },
        {
            key: '2',
            title: 'Запись первого уровня с key = 2. Много дочерних элементов.',
            parent: null,
            type: true
        }
    ];

    parents.forEach((parent) => {
        result.push(parent);
        for (let i = 1; i < itemsCount; i++) {
            const key = `${parent.key}${i}`;
            result.push(
                {
                    key,
                    title: `Запись второго уровня с key = ${key}`,
                    parent: parent.key,
                    type: null
                }
            );
        }
    });
    return result.sort((a, b) => a.key > b.key ? 1 : -1);
};
