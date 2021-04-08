import { IColumn } from 'Controls/grid';
import * as ColumnTemplate from 'wml!Controls-demo/treeGridNew/EditArrow/resources/ColumnTemplate';
import { IHeader } from 'Controls-demo/types';

export const TreeHeader: IHeader[] = [
    {
        title: ''
    },
    {
        title: 'price',
        width: '100px',
        align: 'right'
    },
    {
        title: 'count',
        width: '100px',
        align: 'right'
    }
];

export const TreeColumns: IColumn[] = [
    {
        displayProperty: 'title',
        width: '300px',
        textOverflow: 'ellipsis'
    },
    {
        displayProperty: 'price',
        width: '100px',
        align: 'right'
    },
    {
        displayProperty: 'count',
        width: '100px',
        align: 'right'
    }
];

export const TreeColumnsWithTemplate: IColumn[] = [
    {
        displayProperty: 'title',
        width: '300px',
        template: ColumnTemplate
    },
    {
        displayProperty: 'price',
        width: '100px',
        align: 'right',
        template: ColumnTemplate
    },
    {
        displayProperty: 'count',
        width: '100px',
        align: 'right',
        template: ColumnTemplate
    }
];

export const TreeData = [
    {
        id: 1,
        parent: null,
        'parent@': true,
        title: 'First Node',
        description: 'description',
        price: '100',
        count: '10'
    },
    {
        id: 2,
        parent: null,
        'parent@': true,
        title: 'Second Node',
        description: 'description',
        price: '200',
        count: '30'
    },
    {
        id: 3,
        parent: 2,
        'parent@': true,
        title: 'Third Node with veeeery long caption, so it fits only in two lines',
        description: 'description',
        price: '100',
        count: '10'
    },
    {
        id: 4,
        parent: 3,
        'parent@': null,
        title: 'Fourth Node',
        description: 'description',
        price: '200',
        count: '30'
    },
    {
        id: 5,
        parent: null,
        'parent@': null,
        title: 'Leaf 1',
        description: 'description',
        price: '200',
        count: '30'
    },
    {
        id: 6,
        parent: 1,
        'parent@': null,
        title: 'Leaf 2',
        description: 'description',
        price: '200',
        count: '30'
    },
    {
        id: 7,
        parent: 2,
        'parent@': null,
        title: 'Leaf 3',
        description: 'description',
        price: '200',
        count: '30'
    }
];
