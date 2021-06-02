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
            key: 6,
            date: '02 мая',
            time: '08:25',
            name: 'Авраменко А.'
        },
        {
            key: 61,
            date: '02 мая',
            time: '08:25',
            name: 'Панихин К.'
        },
        {
            key: 8,
            date: '03 мая',
            time: '09:41',
            name: 'Колесов В.'
        },
        {
            key: 81,
            date: '03 мая',
            time: '09:41',
            name: 'Колесов В.'
        },
        {
            key: 82,
            date: '03 мая',
            time: '09:41',
            name: 'Авраменко А.'
        },
        {
            key: 9,
            date: '03 мая',
            time: '09:55',
            name: 'Колесов В.'
        },
        {
            key: 91,
            date: '03 мая',
            time: '09:55',
            name: 'Авраменко А.'
        },
        {
            key: 11,
            date: '04 мая',
            time: '06:02',
            name: 'Колесов В.'
        },
        {
            key: 12,
            date: '04 мая',
            time: '06:02',
            name: 'Авраменко А.'
        },
        {
            key: 13,
            date: '04 мая',
            time: '08:25',
            name: 'Авраменко А.'
        },
        {
            key: 14,
            date: '04 мая',
            time: '08:25',
            name: 'Колесов В.'
        },
        {
            key: 141,
            date: '04 мая',
            time: '08:41',
            name: 'Колесов В.'
        },
        {
            key: 142,
            date: '04 мая',
            time: '08:41',
            name: 'Колесов В.'
        },
        {
            key: 15,
            date: '06 мая',
            time: '07:41',
            name: 'Колесов В.'
        },
        {
            key: 17,
            date: '06 мая',
            time: '07:41',
            name: 'Колесов В.'
        },
        {
            key: 18,
            date: '06 мая',
            time: '09:41',
            name: 'Колесов В.'
        },
        {
            key: 19,
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
