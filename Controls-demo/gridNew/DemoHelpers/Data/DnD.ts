import { IColumn } from 'Controls/grid';
import * as Images from 'Controls-demo/DragNDrop/Images';

interface IDndData {
    key: number;
    title: string;
    additional: string;
    image: string;
    'Раздел@': boolean;
    Раздел: null | boolean;
}

interface IForDnD {
    getData: () => IDndData[];
    getColumns: () => IColumn[];
}

export const DnD: IForDnD = {
    getData: () => [{
        key: 0,
        title: 'America',
        additional: 'USA',
        image: Images[0],
        'Раздел@': true,
        Раздел: null
    }, {
        key: 1,
        title: 'France',
        additional: 'Europe',
        image: Images[1],
        'Раздел@': true,
        Раздел: null
    }, {
        key: 2,
        title: 'Solar',
        additional: 'Star',
        image: Images[2],
        'Раздел@': true,
        Раздел: null
    }, {
        key: 3,
        title: 'Luna',
        additional: 'Sattelite',
        image: Images[3],
        'Раздел@': null,
        Раздел: null
    }, {
        key: 4,
        title: 'Pizza',
        additional: 'Food',
        image: Images[4],
        'Раздел@': null,
        Раздел: null
    }, {
        key: 5,
        title: 'Monkey',
        additional: 'Animals',
        image: Images[5],
        'Раздел@': null,
        Раздел: null
    }],
    getColumns: () =>  [{
        displayProperty: 'id',
        width: '30px'
    }, {
        displayProperty: 'title',
        width: '200px'
    }, {
        displayProperty: 'additional',
        width: '200px'
    }]
};
