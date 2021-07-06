import {TColumns} from 'Controls/grid';
import * as EditableCellTemplate from 'wml!Controls-demo/gridNew/EditInPlace/Excel/StartColumnIndex/editableCellTemplate';

export const Excel = {
    getColumns(): TColumns {
        return [
            {
                displayProperty: 'title',
                width: '180px',
                editable: false
            },
            {
                displayProperty: 'price',
                width: '100px',
                template: EditableCellTemplate
            },
            {
                displayProperty: 'balance',
                width: '100px',
                template: EditableCellTemplate
            },
            {
                displayProperty: 'balanceCostSumm',
                width: '100px',
                template: EditableCellTemplate
            }
        ];
    },
    getData() {
        return [
            {
                key: 1,
                title: 'Время',
                description: 'Погода',
                price: '1',
                balance: '1',
                balanceCostSumm: '2',
                reserve: '2',
                costPrice: '3'
            },
            {
                key: 2,
                title: 'Масса',
                description: 'Скорость',
                price: '1',
                balance: '1',
                balanceCostSumm: '2',
                reserve: '2',
                costPrice: '3'
            },
            {
                key: 3,
                title: 'Давление',
                description: 'Плотность',
                price: '1',
                balance: '1',
                balanceCostSumm: '2',
                reserve: '2',
                costPrice: '3'
            }
        ];
    }
};
