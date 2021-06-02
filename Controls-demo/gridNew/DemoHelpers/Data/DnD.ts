import { IColumn } from 'Controls/grid';
import * as Images from 'Controls-demo/DragNDrop/Images';

interface IDndData {
    id: number;
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
        id: 0,
        title: 'America',
        additional: 'USA',
        image: Images[0],
        'Раздел@': true,
        Раздел: null
    }, {
        id: 1,
        title: 'France',
        additional: 'Europe',
        image: Images[1],
        'Раздел@': true,
        Раздел: null
    }, {
        id: 2,
        title: 'Solar',
        additional: 'Star',
        image: Images[2],
        'Раздел@': true,
        Раздел: null
    }, {
        id: 3,
        title: 'Luna',
        additional: 'Sattelite',
        image: Images[3],
        'Раздел@': null,
        Раздел: null
    }, {
        id: 4,
        title: 'Pizza',
        additional: 'Food',
        image: Images[4],
        'Раздел@': null,
        Раздел: null
    }, {
        id: 5,
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
