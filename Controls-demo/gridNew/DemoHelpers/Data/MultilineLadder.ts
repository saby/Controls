import 'wml!Controls-demo/gridNew/resources/CellTemplates/LadderMultilineDateTime';
import 'wml!Controls-demo/gridNew/resources/CellTemplates/LadderMultilineName';

import {IData} from "Controls-demo/gridNew/DemoHelpers/DataCatalog";

export const MultilineLadder = {
    getData: (): IData[] => [
        {
            key: 1,
            date: '01 мая',
            time: '06:02',
            name: 'Колесов В.'
        },
        {
            key: 3,
            date: '01 мая',
            time: '06:02',
            name: 'Авраменко А.'
        },
        {
            key: 30,
            date: '01 мая',
            time: '06:02',
            name: 'Панихин К.'
        },
        {
            key: 31,
            date: '01 мая',
            time: '08:25',
            name: 'Авраменко А.'
        },
        {
            key: 32,
            date: '01 мая',
            time: '08:25',
            name: 'Панихин К.'
        },
        {
            key: 33,
            date: '01 мая',
            time: '08:33',
            name: 'Авраменко А.'
        },
        {
            key: 34,
            date: '01 мая',
            time: '08:33',
            name: 'Панихин К.'
        },
        {
            key: 35,
            date: '01 мая',
            time: '08:33',
            name: 'Колесов В.'
        },
        {
            key: 5,
            date: '02 мая',
            time: '07:41',
            name: 'Колесов В.'
        },
        {
            key: 51,
            date: '02 мая',
            time: '07:41',
            name: 'Авраменко А.'
        },
        {
            id: 6,
            date: '02 мая',
            time: '08:25',
            name: 'Авраменко А.'
        },
        {
            id: 61,
            date: '02 мая',
            time: '08:25',
            name: 'Панихин К.'
        },
        {
            id: 8,
            date: '03 мая',
            time: '09:41',
            name: 'Колесов В.'
        },
        {
            id: 81,
            date: '03 мая',
            time: '09:41',
            name: 'Колесов В.'
        },
        {
            id: 82,
            date: '03 мая',
            time: '09:41',
            name: 'Авраменко А.'
        },
        {
            id: 9,
            date: '03 мая',
            time: '09:55',
            name: 'Колесов В.'
        },
        {
            id: 91,
            date: '03 мая',
            time: '09:55',
            name: 'Авраменко А.'
        },
        {
            id: 11,
            date: '04 мая',
            time: '06:02',
            name: 'Колесов В.'
        },
        {
            id: 12,
            date: '04 мая',
            time: '06:02',
            name: 'Авраменко А.'
        },
        {
            id: 13,
            date: '04 мая',
            time: '08:25',
            name: 'Авраменко А.'
        },
        {
            id: 14,
            date: '04 мая',
            time: '08:25',
            name: 'Колесов В.'
        },
        {
            id: 141,
            date: '04 мая',
            time: '08:41',
            name: 'Колесов В.'
        },
        {
            id: 142,
            date: '04 мая',
            time: '08:41',
            name: 'Колесов В.'
        },
        {
            id: 15,
            date: '06 мая',
            time: '07:41',
            name: 'Колесов В.'
        },
        {
            id: 17,
            date: '06 мая',
            time: '07:41',
            name: 'Колесов В.'
        },
        {
            id: 18,
            date: '06 мая',
            time: '09:41',
            name: 'Колесов В.'
        },
        {
            id: 19,
            date: '06 мая',
            time: '09:41',
            name: 'Колесов В.'
        }
    ],
    getColumns: () => [
        {
            template: 'wml!Controls-demo/gridNew/resources/CellTemplates/LadderMultilineDateTime',
            width: '125px',
            stickyProperty: ['date', 'time']
        },
        {
            template: 'wml!Controls-demo/gridNew/resources/CellTemplates/LadderMultilineName',
            width: '300px'
        }
    ],
    getHeader: () => [
        {
            title: 'Время'
        },
        {
            title: 'Имя'
        }
    ]
}
