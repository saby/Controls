import * as numberResultTpl from 'wml!Controls-demo/grid/resources/ResultCellTemplates/Number';
import * as countryRatingNumber from 'wml!Controls-demo/grid/resources/CellTemplates/CountryRatingNumber';
import {constants} from 'Env/Env';
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksPhoto';
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksDescription';
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksReceived';
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderMultilineDateTime';
import 'wml!Controls-demo/grid/resources/CellTemplates/LadderMultilineName';
import * as baseEditor from 'wml!Controls-demo/grid/EditInPlace/Decorators/baseEditor';
import * as moneyEditor from 'wml!Controls-demo/grid/EditInPlace/Decorators/moneyEditor';
import * as numberEditor from 'wml!Controls-demo/grid/EditInPlace/Decorators/numberEditor';
import * as defaultEditor from 'wml!Controls-demo/grid/EditInPlace/Decorators/defaultEditor';
import * as Images from 'Controls-demo/DragNDrop/Images';
import * as itemTpl from 'wml!Controls-demo/grid/resources/CellTemplates/CellWithBgc';
import * as itemCountr from 'wml!Controls-demo/grid/resources/CellTemplates/CountryTemp';
import * as resTpl from 'wml!Controls-demo/grid/EditInPlace/EditingCell/resultsTpl';
import * as notScrollableCell from 'wml!Controls-demo/grid/ColumnScroll/DragScrolling/notScrollableCell';
import * as notDraggableCell from 'wml!Controls-demo/grid/ColumnScroll/DragScrolling/notDraggableCell';
import * as dragScrollPopulationCell from 'wml!Controls-demo/grid/ColumnScroll/DragScrolling/populationCell';

import { IColumn } from 'Controls/grid';
import { IHeader } from 'Controls-demo/types';

export interface IData {
    id: number;
    number?: number;
    country?: string;
    capital?: string;
    population?: number;
    square?: number;
    populationDensity?: number;
    date?: string;
    time?: string;
    name?: string;
    message?: string;
    photo?: string;
    state?: string;
    fullName?: string;
    invoice?: number;
    documentSign?: number;
    documentNum?: number;
    taxBase?: number;
    document?: string;
    documentDate?: null | string;
    serviceContract?: null | string;
    description?: string;
    shipper?: null | string;
}

export interface IColumnRes extends IColumn {
    result?: number;
    results?: number;
}

interface IResults {
    full: Array<{ population: number, square: number, populationDensity: number }>;
    partial: number[];
}

interface IImages {
    dogadkin: string;
    kesareva: string;
    korbyt: string;
    krainov: string;
    baturina: string;
}

const resultCellTpl = numberResultTpl;

const getCountriesStats = () => {
    return {
        getLongCapitalData: (): IData[] => [
            {
                id: 0,
                number: 1,
                country: 'Россия',
                capital: 'Москва',
                population: 143420300,
                square: 17075200,
                populationDensity: 8
            },
            {
                id: 1,
                number: 2,
                country: 'Соединенные Штаты Америки',
                capital: 'Вашингтон',
                population: 295734100,
                square: 9629091,
                populationDensity: 30.71
            },
            {
                id: 2,
                number: 3,
                country: 'Доминиканская Республика',
                capital: 'Санто-Доминго',
                population: 10499707,
                square: 9629091,
                populationDensity: 30.71
            },
            {
                id: 3,
                number: 4,
                country: 'Новая Зеландия',
                capital: 'Веллингтон',
                population: 4942500,
                square: 9629091,
                populationDensity: 30.71
            },
            {
                id: 4,
                number: 5,
                country: 'Бразилия',
                capital: 'Бразилиа',
                population: 186112800,
                square: 8511965,
                populationDensity: 21.86
            }
        ],
        getData: (): IData[] => [
            {
                id: 0,
                number: 1,
                country: 'Россия',
                capital: 'Москва',
                population: 143420300,
                square: 17075200,
                populationDensity: 8
            },
            {
                id: 1,
                number: 2,
                country: 'Канада',
                capital: 'Оттава',
                population: 32805000,
                square: 9976140,
                populationDensity: 3
            },
            {
                id: 2,
                number: 3,
                country: 'Соединенные Штаты Америки',
                capital: 'Вашингтон',
                population: 295734100,
                square: 9629091,
                populationDensity: 30.71
            },
            {
                id: 3,
                number: 4,
                country: 'Китай',
                capital: 'Пекин',
                population: 1306313800,
                square: 9596960,
                populationDensity: 136.12
            },
            {
                id: 4,
                number: 5,
                country: 'Бразилия',
                capital: 'Бразилиа',
                population: 186112800,
                square: 8511965,
                populationDensity: 21.86
            },
            {
                id: 5,
                number: 6,
                country: 'Австралия',
                capital: 'Канберра',
                population: 20090400,
                square: 7686850,
                populationDensity: 3
            },
            {
                id: 6,
                number: 7,
                country: 'Индия',
                capital: 'Нью-Дели',
                population: 1080264400,
                square: 3287590,
                populationDensity: 328.59
            },
            {
                id: 7,
                number: 8,
                country: 'Аргентина',
                capital: 'Буэнос-Айрес',
                population: 39537900,
                square: 2766890,
                populationDensity: 4.29
            },
            {
                id: 8,
                number: 9,
                country: 'Казахстан',
                capital: 'Нур-Султан',
                population: 15185000,
                square: 2717300,
                populationDensity: 6.00
            },
            {
                id: 9,
                number: 10,
                country: 'Судан',
                capital: 'Хартум',
                population: 40187500,
                square: 2505810,
                populationDensity: 16.04
            },
            {
                id: 10,
                number: 11,
                country: 'Алжир',
                capital: 'Алжир',
                population: 32531900,
                square: 2381740,
                populationDensity: 13.66
            },
            {
                id: 11,
                number: 12,
                country: 'Конго',
                capital: 'Браззавиль',
                population: 60085800,
                square: 2345410,
                populationDensity: 25.62
            },
            {
                id: 12,
                number: 13,
                country: 'Мексика',
                capital: 'Мехико',
                population: 106202900,
                square: 1972550,
                populationDensity: 53.84
            },
            {
                id: 13,
                number: 14,
                country: 'Саудовская Аравия',
                capital: 'Эр-Рияд',
                population: 26417600,
                square: 1960582,
                populationDensity: 13.47
            },
            {
                id: 14,
                number: 15,
                country: 'Индонезия',
                capital: 'Джакарта',
                population: 241973900,
                square: 1919440,
                populationDensity: 126.06
            },
            {
                id: 15,
                number: 16,
                country: 'Ливия',
                capital: 'Триполи',
                population: 5765600,
                square: 1759540,
                populationDensity: 3.00
            },
            {
                id: 16,
                number: 17,
                country: 'Иран',
                capital: 'Тегеран',
                population: 68017900,
                square: 1648000,
                populationDensity: 41.27
            },
            {
                id: 17,
                number: 18,
                country: 'Монголия',
                capital: 'Улан-Батор',
                population: 2791300,
                square: 1565000,
                populationDensity: 2.00
            },
            {
                id: 18,
                number: 19,
                country: 'Перу',
                capital: 'Лима',
                population: 27925600,
                square: 1285220,
                populationDensity: 21.73
            }
        ],
        getColumnsForVirtual: (): IColumn[] => [
            {
                displayProperty: 'number',
                width: '40px'
            },
            {
                displayProperty: 'country',
                width: '200px'
            },
            {
                displayProperty: 'capital',
                width: '200px'
            }
        ],

        getColumnsWithoutWidths: (): IColumn[] => [
            {
                displayProperty: 'number',
                width: ''
            },
            {
                displayProperty: 'country',
                width: ''
            },
            {
                displayProperty: 'capital',
                width: ''
            },
            {
                displayProperty: 'population',
                width: ''
            },
            {
                displayProperty: 'square',
                width: ''
            },
            {
                displayProperty: 'populationDensity',
                width: ''
            }
        ],
        getColumnsForLoad: (): IColumn[] => [
            {
                displayProperty: 'id',
                width: '50px'
            },
            {
                displayProperty: 'load',
                width: '200px'
            }

        ],
        getColumnsWithFixedWidths: (): IColumn[] => [
            {
                displayProperty: 'number',
                width: '30px'
            },
            {
                displayProperty: 'country',
                width: '200px'
            },
            {
                displayProperty: 'capital',
                width: '100px'
            },
            {
                displayProperty: 'population',
                width: '150px'
            },
            {
                displayProperty: 'square',
                width: '100px'
            },
            {
                displayProperty: 'populationDensity',
                width: '120px'
            }
        ],
        getColumnsWithWidthsForSortingDemo: (): IColumnRes[] => [
            {
                displayProperty: 'number',
                width: '40px'
            },
            {
                displayProperty: 'country',
                width: '280px'
            },
            {
                displayProperty: 'capital',
                width: '130px'
            },
            {
                displayProperty: 'population',
                width: '100px'
            },
            {
                displayProperty: 'square',
                width: '100px',
                align: 'right'
            },
            {
                displayProperty: 'populationDensity',
                width: '150px',
                result: 5.8,
                align: 'right'
            }
        ],
        getColumnsWithWidths: (): IColumnRes[] => [
            {
                displayProperty: 'number',
                width: '40px'
            },
            {
                displayProperty: 'country',
                width: '300px'
            },
            {
                displayProperty: 'capital',
                width: 'max-content',
                compatibleWidth: '98px'
            },
            {
                displayProperty: 'population',
                width: 'max-content',
                result: 3956986345,
                resultTemplate: resultCellTpl,
                compatibleWidth: '100px'
            },
            {
                displayProperty: 'square',
                width: 'max-content',
                result: 12423523,
                resultTemplate: resultCellTpl,
                compatibleWidth: '83px'
            },
            {
                displayProperty: 'populationDensity',
                width: 'max-content',
                result: 5.8,
                resultTemplate: resultCellTpl,
                compatibleWidth: '175px'
            }
        ],
        getColumnsForDragScrolling: (): IColumn[] => ([
            {
                displayProperty: 'number',
                width: '40px'
            },
            {
                displayProperty: 'country',
                width: '300px',
                template: notDraggableCell
            },
            {
                displayProperty: 'capital',
                width: 'max-content',
                compatibleWidth: '98px'
            },
            {
                width: '200px',
                template: notScrollableCell
            },
            {
                displayProperty: 'population',
                width: 'max-content',
                compatibleWidth: '100px',
                template: dragScrollPopulationCell
            },
            {
                displayProperty: 'square',
                width: 'max-content',
                compatibleWidth: '83px'
            },
            {
                displayProperty: 'populationDensity',
                width: 'max-content',
                compatibleWidth: '175px'
            }
        ]),
        getResults: (): IResults => ({
            full: [
                {
                    population: 3660205559.49,
                    square: 19358447.87,
                    populationDensity: 1.17
                },
                {
                    population: 3945358705.46,
                    square: 19366292.85,
                    populationDensity: 9.13
                },
                {
                    population: 3161196890.87,
                    square: 19709468.10,
                    populationDensity: 1.87
                }
            ],
            // tslint:disable-next-line
            partial: [12345678910, 23456789101, 34567891012]
        }),
        getColumnsWithAlign: (): IColumn[] => [
            {
                displayProperty: 'number',
                width: '40px',
                align: 'right'
            },
            {
                displayProperty: 'country',
                width: '300px',
                align: 'center'
            },
            {
                displayProperty: 'capital',
                width: '1fr',
                align: 'left'
            },
            {
                displayProperty: 'population',
                width: '150px',
                align: 'right'
            },
            {
                displayProperty: 'square',
                width: '150px',
                align: 'left'
            },
            {
                displayProperty: 'populationDensity',
                width: 'max-content',
                compatibleWidth: '60px'
            }
        ],
        getColumnsWithValign: () => [
            {
                displayProperty: 'number',
                width: '40px',
                valign: 'right'
            },
            {
                displayProperty: 'country',
                width: '300px',
                valign: 'top'
            },
            {
                displayProperty: 'capital',
                width: '1fr',
                valign: 'bottom'
            },
            {
                displayProperty: 'population',
                width: '150px'
            }
        ],
        getDefaultHeader: (): IHeader[] => [
            {
                title: '#'
            },
            {
                title: 'Страна'
            },
            {
                title: 'Столица'
            },
            {
                title: 'Население'
            },
            {
                title: 'Площадь км2'
            },
            {
                title: 'Плотность населения чел/км2'
            }
        ],
        getHeaderWithFirstColspan: () => [
            {
                title: 'Страна',
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 3
            },
            {
                title: 'Столица',
                startRow: 1,
                endRow: 2,
                startColumn: 3,
                endColumn: 4
            },
            {
                title: 'Население',
                startRow: 1,
                endRow: 2,
                startColumn: 4,
                endColumn: 5
            },
            {
                title: 'Площадь км2',
                startRow: 1,
                endRow: 2,
                startColumn: 5,
                endColumn: 6
            },
            {
                title: 'Плотность населения чел/км2',
                startRow: 1,
                endRow: 2,
                startColumn: 6,
                endColumn: 7
            }
        ],
        getLongHeader: (textOverflow): IHeader[] => [
            {
                title: '#'
            },
            {
                title: 'Страна'
            },
            {
                title: 'Столица страны из рейтинга',
                textOverflow
            },
            {
                title: 'Население страны по данным на 2018г.',
                textOverflow
            },
            {
                title: 'Площадь территории км2',
                textOverflow
            },
            {
                title: 'Плотность населения чел/км2',
                textOverflow
            }
        ],
        getMultiHeader: (): IHeader[] => [
            {
                title: '#',
                startRow: 1,
                endRow: 3,
                startColumn: 1,
                endColumn: 2
            },
            {
                title: 'Географические данные',
                startRow: 1,
                endRow: 2,
                startColumn: 2,
                endColumn: 4,
                align: 'center'
            },
            {
                title: 'Страна',
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 3
            },
            {
                title: 'Столица',
                startRow: 2,
                endRow: 3,
                startColumn: 3,
                endColumn: 4
            },
            {
                title: 'Цифры',
                startRow: 1,
                endRow: 2,
                startColumn: 4,
                endColumn: 7,
                align: 'center'
            },
            {
                title: 'Население',
                startRow: 2,
                endRow: 3,
                startColumn: 4,
                endColumn: 5
            },
            {
                title: 'Площадь км2',
                startRow: 2,
                endRow: 3,
                startColumn: 5,
                endColumn: 6
            },
            {
                title: 'Плотность населения чел/км2',
                startRow: 2,
                endRow: 3,
                startColumn: 6,
                endColumn: 7
            }
        ],
        getMultiHeaderForTextOverflow: (): IHeader[] => [
            {
                title: '#',
                startRow: 1,
                endRow: 3,
                startColumn: 1,
                endColumn: 2
            },
            {
                title: 'Географические данные и какой-то очень длинный текст с описанием и примерами',
                startRow: 1,
                endRow: 2,
                startColumn: 2,
                endColumn: 4,
                textOverflow: 'ellipsis',
                align: 'center'
            },
            {
                title: 'Страна',
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 3
            },
            {
                title: 'Столица',
                startRow: 2,
                endRow: 3,
                startColumn: 3,
                endColumn: 4
            },
            {
                title: 'Цифры и какой-то очень длинный текст с описанием и примерами',
                startRow: 1,
                endRow: 2,
                startColumn: 4,
                endColumn: 7,
                textOverflow: 'none',
                align: 'center'
            },
            {
                title: 'Население',
                startRow: 2,
                endRow: 3,
                startColumn: 4,
                endColumn: 5
            },
            {
                title: 'Площадь км2',
                startRow: 2,
                endRow: 3,
                startColumn: 5,
                endColumn: 6
            },
            {
                title: 'Плотность населения чел/км2',
                startRow: 2,
                endRow: 3,
                startColumn: 6,
                endColumn: 7
            }
        ],
        getMultiHeaderForDragScrolling: (): IHeader[] => [
            {
                title: '#',
                startRow: 1,
                endRow: 3,
                startColumn: 1,
                endColumn: 2
            },
            {
                title: 'Географические данные',
                startRow: 1,
                endRow: 2,
                startColumn: 2,
                endColumn: 4,
                align: 'center'
            },
            {
                title: 'Страна',
                startRow: 2,
                endRow: 3,
                startColumn: 2,
                endColumn: 3
            },
            {
                title: 'Столица',
                startRow: 2,
                endRow: 3,
                startColumn: 3,
                endColumn: 4
            },
            {
                title: 'Колонка с выключенным перемещением мышью',
                startRow: 1,
                endRow: 3,
                startColumn: 4,
                endColumn: 5
            },
            {
                title: 'Цифры',
                startRow: 1,
                endRow: 2,
                startColumn: 5,
                endColumn: 8,
                align: 'center'
            },
            {
                title: 'Население',
                startRow: 2,
                endRow: 3,
                startColumn: 5,
                endColumn: 6
            },
            {
                title: 'Площадь км2',
                startRow: 2,
                endRow: 3,
                startColumn: 6,
                endColumn: 7
            },
            {
                title: 'Плотность населения чел/км2',
                startRow: 2,
                endRow: 3,
                startColumn: 7,
                endColumn: 8
            }
        ],

        getMultiHeaderVar2: (): IHeader[] => [
            {
                title: 'Географические характеристики стран',
                startRow: 1,
                endRow: 3,
                startColumn: 1,
                endColumn: 2
            },
            {
                title: 'Столица',
                startRow: 1,
                endRow: 3,
                startColumn: 2,
                endColumn: 3
            },
            {
                title: 'Цифры',
                startRow: 1,
                endRow: 2,
                startColumn: 3,
                endColumn: 6,
                align: 'center'
            },
            {
                title: 'Население',
                startRow: 2,
                endRow: 3,
                startColumn: 3,
                endColumn: 4
            },
            {
                title: 'Площадь км2',
                startRow: 2,
                endRow: 3,
                startColumn: 4,
                endColumn: 5
            },
            {
                title: 'Плотность населения чел/км2',
                startRow: 2,
                endRow: 3,
                startColumn: 5,
                endColumn: 6
            }
        ],
        getMultiHeaderVar3: (): IHeader[] => [
            {
                title: 'Географические характеристики стран',
                startRow: 1,
                endRow: 3,
                startColumn: 1,
                endColumn: 2,
                valign: 'bottom'
            },
            {
                title: 'Столица',
                startRow: 1,
                endRow: 3,
                startColumn: 2,
                endColumn: 3,
                valign: 'top'
            },
            {
                title: 'Цифры',
                startRow: 1,
                endRow: 2,
                startColumn: 3,
                endColumn: 6
            },
            {
                title: 'Население',
                startRow: 2,
                endRow: 3,
                startColumn: 3,
                endColumn: 4
            },
            {
                title: 'Площадь км2',
                startRow: 2,
                endRow: 3,
                startColumn: 4,
                endColumn: 5
            },
            {
                title: 'Плотность населения чел/км2',
                startRow: 2,
                endRow: 3,
                startColumn: 5,
                endColumn: 6
            }
        ],
        getHeaderWithSorting: (textOverflow): IHeader[] => [
            {
                title: '#'
            },
            {
                title: 'Страна'
            },
            {
                title: 'Название столицы страны',
                textOverflow,
                sortingProperty: 'capital',
                align: 'left'
            },
            {
                title: 'Население',
                sortingProperty: 'population',
                align: 'left'
            },
            {
                title: 'Площадь км2',
                sortingProperty: 'square',
                align: 'right'
            },
            {
                title: 'Плотность населения чел/км2',
                textOverflow,
                sortingProperty: 'populationDensity',
                align: 'right'
            }
        ],
        getColumnsWithTemplate: (): IColumn[] => [
            {
                displayProperty: 'number',
                width: 'max-content',
                compatibleWidth: '44px',
                template: countryRatingNumber
            },
            {
                displayProperty: 'country',
                width: '300px'
            },
            {
                displayProperty: 'capital',
                width: '100px'
            },
            {
                displayProperty: 'population',
                width: '150px'
            },
            {
                displayProperty: 'square',
                width: '150px'
            },
            {
                displayProperty: 'populationDensity',
                width: 'max-content',
                compatibleWidth: '60px'
            }
        ]
    };
};

const getMultilineLadder = () => {
    return {
        getData: (): IData[] => [
            {
                id: 1,
                date: '01 мая',
                time: '06:02',
                name: 'Колесов В.'
            },
            {
                id: 3,
                date: '01 мая',
                time: '08:25',
                name: 'Авраменко А.'
            },
            {
                id: 30,
                date: '01 мая',
                time: '18:33',
                name: 'Авраменко А.'
            },
            {
                id: 5,
                date: '02 мая',
                time: '07:41',
                name: 'Колесов В.'
            },
            {
                id: 6,
                date: '02 мая',
                time: '08:25',
                name: 'Авраменко А.'
            },
            {
                id: 8,
                date: '03 мая',
                time: '09:41',
                name: 'Колесов В.'
            },
            {
                id: 9,
                date: '03 мая',
                time: '09:55',
                name: 'Колесов В.'
            },
            {
                id: 11,
                date: '04 мая',
                time: '06:02',
                name: 'Колесов В.'
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
                time: '08:25',
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
                time: '09:55',
                name: 'Колесов В.'
            }
        ],
        getColumns: () => [
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderMultilineDateTime',
                width: '125px',
                stickyProperty: ['date', 'time']
            },
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderMultilineName',
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
    };
};

const getTasks = () => {
    return {
        getData: (): IData[] => [
            {
                id: 1,
                message: 'Регламент: Ошибка в разработку. Автор: Дубенец Д.А. Описание: (reg-chrome-presto) 3.18.150 controls - Поехала верстка кнопок когда они задизейблены prestocarry',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '6 мар',
                state: 'Review кода (нач. отдела)'
            },
            {
                id: 2,
                message: 'Регламент: Ошибка в разработку. Автор: Волчихина Л.С. Описание: Отображение колонок. При снятии галки с колонки неверная всплывающая подсказка',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '6 мар',
                state: 'Review кода (нач. отдела)'
            },
            {
                id: 3,
                message: 'Смотри надошибку. Нужно сделать тесты, чтобы так в будущем не разваливалось',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '6 мар',
                state: 'Выполнение'
            },
            {
                id: 4,
                message: 'Регламент: Ошибка в разработку. Автор: Оборевич К.А. Описание: Розница. Замечания к шрифтам в окнах Что сохранить в PDF/Excel и Что напечатать',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '12 ноя',
                state: 'Review кода (нач. отдела)'
            },
            {
                id: 5,
                message: 'Пустая строка при сканировании в упаковку Тест-онлайн adonis1/adonis123 1) Создать документ списания 2) отсканировать в него наименование/открыть РР/+Упаковка 3) Заполнить данные по упаковке/отсканировать еще 2 марки',
                fullName: 'Корбут Антон',
                photo: getImages().korbyt,
                date: '5 мар',
                state: 'Выполнение'
            },
            {
                id: 6,
                message: 'Разобраться с getViewModel - либо наследование, либо создавать модель прямо в TreeControl и передавать в BaseControl, либо ещё какой то вариант придумать.',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение'
            },
            {
                id: 7,
                message: 'Научить reload обновлять табличное представление VDOM с сохранением набранных данных (например загруженных по кнопке "еще"). В данный момент есть deepReload, но он не сохраняет набранные данные.',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение'
            },
            {
                id: 8,
                message: 'Лесенка на VDOM. Перевести алгоритм на предварительный расчет в модели. Сделать демку.',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение'
            },
            {
                id: 9,
                message: 'Прошу сделать возможность отключения: 1) ховера на айтемах  у Controls/List, 2) курсор: поинтер',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение'
            },
            {
                id: 10,
                message: 'через шаблон ячейки должна быть возможность управлять colspan (или rowspan) отдельной ячейки. <ws:partial template="standartCellTemplate" colspan="2"> типа такого если я напишу, то у меня будет ячейка на две колонки',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение'
            },
            {
                id: 11,
                message: 'Не работают хлебные крошки и навигация по' +
                    'ним если идентификатор записи равен 0 Как повторить',
                fullName: 'Догадкин Владимир',
                photo: getImages().dogadkin,
                date: '28 фев',
                state: 'Выполнение'
            },
            {
                id: 12,
                message: 'Не работает collapse в группировке в дереве test-online.sbis.ru сталин/Сталин123',
                fullName: 'Догадкин Владимир',
                photo: getImages().dogadkin,
                date: '26 фев',
                state: 'Выполнение'
            }
        ],
        getColumns: () => [
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksPhoto',
                width: '98px'
            },
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksDescription',
                width: '1fr'
            },
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksReceived',
                width: '200px'
            }
        ],
        getDefaultColumns: (): IColumn[] => [
            {
                displayProperty: 'id',
                width: '30px'
            },
            {
                displayProperty: 'state',
                width: '200px'
            },
            {
                displayProperty: 'date',
                width: '100px'
            }
        ],
        getDefaultWithEditingColumns: (): IColumn[] => [
            {
                displayProperty: 'id',
                width: '30px'
            },
            {
                displayProperty: 'state',
                width: '200px',
                template: 'wml!Controls-demo/grid/Grouped/WithEditing/_cellEditor'
            },
            {
                displayProperty: 'date',
                width: '100px',
                template: 'wml!Controls-demo/grid/Grouped/WithEditing/_cellEditor'
            }
        ]
    };
};

const getTasksWithHiddenGroup = () => {
    return {
        getData: (): IData[] => [
            {
                id: 1,
                message: 'Регламент: Ошибка в разработку. Автор: Дубенец Д.А. Описание: (reg-chrome-presto) 3.18.150 controls - Поехала верстка кнопок когда они задизейблены prestocarry',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '6 мар',
                state: 'Review кода (нач. отдела)',
                group: 'CONTROLS_HIDDEN_GROUP'
            },
            {
                id: 2,
                message: 'Регламент: Ошибка в разработку. Автор: Волчихина Л.С. Описание: Отображение колонок. При снятии галки с колонки неверная всплывающая подсказка',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '6 мар',
                state: 'Review кода (нач. отдела)',
                group: 'CONTROLS_HIDDEN_GROUP'
            },
            {
                id: 3,
                message: 'Смотри надошибку. Нужно сделать тесты, чтобы так в будущем не разваливалось',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '6 мар',
                state: 'Выполнение',
                group: 'CONTROLS_HIDDEN_GROUP'
            },
            {
                id: 4,
                message: 'Регламент: Ошибка в разработку. Автор: Оборевич К.А. Описание: Розница. Замечания к шрифтам в окнах Что сохранить в PDF/Excel и Что напечатать',
                fullName: 'Крайнов Дмитрий',
                photo: getImages().krainov,
                date: '12 ноя',
                state: 'Review кода (нач. отдела)',
                group: 'Крайнов Дмитрий'
            },
            {
                id: 5,
                message: 'Пустая строка при сканировании в упаковку Тест-онлайн adonis1/adonis123 1) Создать документ списания 2) отсканировать в него наименование/открыть РР/+Упаковка 3) Заполнить данные по упаковке/отсканировать еще 2 марки',
                fullName: 'Корбут Антон',
                photo: getImages().korbyt,
                date: '5 мар',
                state: 'Выполнение',
                group: 'Корбут Антон'
            },
            {
                id: 6,
                message: 'Разобраться с getViewModel - либо наследование, либо создавать модель прямо в TreeControl и передавать в BaseControl, либо ещё какой то вариант придумать.',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение',
                group: 'Кесарева Дарья'
            },
            {
                id: 7,
                message: 'Научить reload обновлять табличное представление VDOM с сохранением набранных данных (например загруженных по кнопке "еще"). В данный момент есть deepReload, но он не сохраняет набранные данные.',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение',
                group: 'Кесарева Дарья'
            },
            {
                id: 8,
                message: 'Лесенка на VDOM. Перевести алгоритм на предварительный расчет в модели. Сделать демку.',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение',
                group: 'Кесарева Дарья'
            },
            {
                id: 9,
                message: 'Прошу сделать возможность отключения: 1) ховера на айтемах  у Controls/List, 2) курсор: поинтер',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение',
                group: 'Кесарева Дарья'
            },
            {
                id: 10,
                message: 'через шаблон ячейки должна быть возможность управлять colspan (или rowspan) отдельной ячейки. <ws:partial template="standartCellTemplate" colspan="2"> типа такого если я напишу, то у меня будет ячейка на две колонки',
                fullName: 'Кесарева Дарья',
                photo: getImages().kesareva,
                date: '12 сен',
                state: 'Выполнение',
                group: 'Кесарева Дарья'
            },
            {
                id: 11,
                message: 'Не работают хлебные крошки и навигация по' +
                'ним если идентификатор записи равен 0 Как повторить',
                fullName: 'Догадкин Владимир',
                photo: getImages().dogadkin,
                date: '28 фев',
                state: 'Выполнение',
                group: 'Догадкин Владимир'
            },
            {
                id: 12,
                message: 'Не работает collapse в группировке в дереве test-online.sbis.ru сталин/Сталин123',
                fullName: 'Догадкин Владимир',
                photo: getImages().dogadkin,
                date: '26 фев',
                state: 'Выполнение',
                group: 'Догадкин Владимир'
            }
        ],
        getColumns: () => [
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksPhoto',
                width: '98px'
            },
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksDescription',
                width: '1fr'
            },
            {
                template: 'wml!Controls-demo/grid/resources/CellTemplates/LadderTasksReceived',
                width: '200px'
            }
        ],
        getDefaultColumns: (): IColumn[] => [
            {
                displayProperty: 'id',
                width: '30px'
            },
            {
                displayProperty: 'state',
                width: '200px'
            },
            {
                displayProperty: 'date',
                width: '100px'
            }
        ],
        getDefaultWithEditingColumns: (): IColumn[] => [
            {
                displayProperty: 'id',
                width: '30px'
            },
            {
                displayProperty: 'state',
                width: '200px',
                template: 'wml!Controls-demo/grid/Grouped/WithEditing/_cellEditor'
            },
            {
                displayProperty: 'date',
                width: '100px',
                template: 'wml!Controls-demo/grid/Grouped/WithEditing/_cellEditor'
            }
        ]
    };
};

function getImages(): IImages {
    return {
        dogadkin: 'data:image/png;base64,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',
        kesareva: 'data:image/png;base64,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',
        korbyt: 'data:image/png;base64,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',
        krainov: 'data:image/png;base64,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',
        baturina: 'data:image/png;base64,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'
    };
}

const getPorts = () => {
    return {
        getData: (): IData[] => [
            {
                id: 1,
                name: 'Новороссийский морской торговый порт',
                invoice: 3500,
                documentSign: 1,
                documentNum: 10,
                taxBase: 17215.00,
                document: 'б/н',
                documentDate: null,
                serviceContract: null,
                description: 'морской/речной',
                shipper: null
            },
            {
                id: 2,
                name: 'Морской порт Санкт-Петербург',
                invoice: 3501,
                documentSign: 1,
                documentNum: 10,
                taxBase: 21015.00,
                document: '48000560-ABCC',
                documentDate: null,
                serviceContract: null,
                description: 'морской/речной',
                shipper: null
            },
            {
                id: 3,
                name: 'Морской торговый порт Усть-Луга',
                invoice: 3502,
                documentSign: 2,
                documentNum: 10,
                taxBase: 890145.04,
                document: '456990005',
                documentDate: null,
                serviceContract: null,
                description: 'ж/д, морской/речной',
                shipper: null
            }
        ],
        getColumns: (): IColumn[] => [
            {
                width: '100px',
                displayProperty: 'invoice'
            },
            {
                width: '200px',
                displayProperty: 'documentSign'
            },
            {
                width: '200px',
                displayProperty: 'document'
            },
            {
                width: '1fr',
                displayProperty: 'description'
            },
            {
                width: '200px',
                displayProperty: 'taxBase'
            }
        ],
        getColumnsDND: (): IColumn[] => [
            {
                width: '100px',
                displayProperty: 'invoice'
            },
            {
                width: '200px',
                displayProperty: 'documentNum'
            },
            {
                width: '200px',
                displayProperty: 'taxBase'
            },
            {
                width: '1fr',
                displayProperty: 'description'
            },
            {
                width: '200px',
                displayProperty: 'document'
            }
        ],
        getDocumentSigns: (): Array<{ id: number, title: string }> => [
            {
                id: 1,
                title: 'ТД предусмотрено'
            },
            {
                id: 2,
                title: 'ТД не предусмотрено'
            }
        ]
    };
};

interface IEditingData {
    id: number | string;
    title?: string;
    description?: string;
    price?: string;
    balance?: string;
    balanceCostSumm?: string;
    reserve?: string;
    costPrice?: string;
    email?: string;
    required?: string;
    length?: string;
    documentSign?: number;
    taxBase?: number;
    document?: string;
}

const getEditing = () => {
    return {
        getEditingData: (): IEditingData[] => [
            {
                id: 1,
                title: 'Время',
                description: 'Погода',
                price: '1',
                balance: '1',
                balanceCostSumm: '2',
                reserve: '2',
                costPrice: '3'
            },
            {
                id: 2,
                title: 'Масса',
                description: 'Скорость',
                price: '1',
                balance: '1',
                balanceCostSumm: '2',
                reserve: '2',
                costPrice: '3'
            },
            {
                id: 3,
                title: 'Давление',
                description: 'Плотность',
                price: '1',
                balance: '1',
                balanceCostSumm: '2',
                reserve: '2',
                costPrice: '3'
            }
        ],
        getEditingAlignData: (): IEditingData[] => [
            {
                id: 1,
                title: 'Очень длинный текст, с выравниванием по правому краю.',
                description: 'Текст 1'
            },
            {
                id: 2,
                title: 'Длинный текст',
                description: 'Текст 2'
            },
            {
                id: 3,
                title: 'Текст',
                description: 'Текст 3'
            }
        ],
        getEditingValidationData: (): IEditingData[] => [
            {
                id: '1',
                email: 'semen@gmail.com',
                required: '89069953970',
                length: '1234',
                title: 'title'
            },
            {
                id: '2',
                email: 'artem@gmail.com',
                required: '89069953970',
                length: '123',
                title: 'title'
            },
            {
                id: '3',
                email: 'oleg@gmail.com',
                required: '89069953970',
                length: 'hello',
                title: 'title'
            }
        ],
        getEditingColumns: (): IColumn[] => [
            {
                displayProperty: 'title',
                width: '180px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor'
            },
            {
                displayProperty: 'price',
                width: '100px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor',
                resultTemplate: resTpl,
                results: 3
            },
            {
                displayProperty: 'balance',
                width: '100px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor',
                resultTemplate: resTpl,
                results: 3
            },
            {
                displayProperty: 'description',
                width: '200px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor'
            },
            {
                displayProperty: 'costPrice',
                width: '100px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor',
                resultTemplate: resTpl,
                results: 9
            },
            {
                displayProperty: 'balanceCostSumm',
                width: '100px',
                template: 'wml!Controls-demo/grid/EditInPlace/EditingCell/_cellEditor',
                resultTemplate: resTpl,
                results: 6
            }
        ],
        getEditingAlignColumns: (): IColumn[] => [
            {
                displayProperty: 'title',
                width: '180px',
                template: 'wml!Controls-demo/grid/EditInPlace/Align/_cellEditor',
                align: 'right'
            },
            {
                displayProperty: 'description',
                width: '100px',
                template: 'wml!Controls-demo/grid/EditInPlace/Align/_cellEditor',
                align: 'right'
            }
        ],
        getEditingSizeColumns: (size): IColumn[] => [
            {
                displayProperty: 'title',
                width: '180px',
                template: `wml!Controls-demo/grid/EditInPlace/Size/${size}/_cellEditor`,
            },
            {
                displayProperty: 'description',
                width: '100px',
                template: `wml!Controls-demo/grid/EditInPlace/Size/${size}/_cellEditor`,
            }
        ],
        getEditingColumnsValidation: () => [
            {
                displayProperty: 'email',
                width: '200px',
                template: 'wml!Controls-demo/grid/EditInPlace/Validation/_cellEditor'
            },
            {
                displayProperty: 'required',
                width: 'max-content',
                template: 'wml!Controls-demo/grid/EditInPlace/Validation/_cellEditorRequired'
            },
            {
                displayProperty: 'length',
                width: 'max-content',
                template: 'wml!Controls-demo/grid/EditInPlace/Validation/_cellEditorDate'
            },
            {
                displayProperty: 'title',
                width: 'max-content',
                template: 'wml!Controls-demo/grid/EditInPlace/Validation/_cellEditorTitle'
            }
        ],
        getEditingHeaderValidations: (): IHeader[] => [
            {
                title: 'email'
            },
            {
                title: 'required'
            },
            {
                title: 'Length'
            },
            {
                title: 'Title'
            }
        ],
        getDecoratedEditingData: (): IEditingData[] => [
            {
                id: 1,
                title: 'Новороссийский морской торговый порт',
                documentSign: 145465097,
                taxBase: 17215.00,
                document: 'б/н'
            },
            {
                id: 2,
                title: 'Морской порт Санкт-Петербург',
                documentSign: 1015108104,
                taxBase: 21015.00,
                document: '48000560-ABCC'
            },
            {
                id: 3,
                title: 'Морской торговый порт Усть-Луга',
                documentSign: 2418052,
                taxBase: 890145.04,
                document: '456990005'
            }
        ],
        getDecoratedEditingHeader: (): IHeader[] => [
            { title: 'Порт прибытия' },
            { title: 'Цена по накладной' },
            { title: 'Номер накладной' },
            { title: 'Код накладной' }
        ],
        getDecoratedEditingColumns: (): IColumn[] => [
            {
                displayProperty: 'title',
                width: '300px',
                template: baseEditor
            },
            {
                displayProperty: 'taxBase',
                width: '200px',
                template: moneyEditor
            },
            {
                displayProperty: 'documentSign',
                width: '150px',
                template: numberEditor
            },
            {
                displayProperty: 'document',
                width: '150px',
                template: defaultEditor
            }
        ]
    };
};

interface IDataForShow {
    id: number;
    px: string;
    fr1of3: string;
    fr2of3: string;
    minMax: string;
    auto: string;
    maxContent: string;
}

function forShowWidths(): {
    getData(): IDataForShow[];
    getHeader(): IHeader[];
    getColumns1(): IColumn[];
    getColumns2(): IColumn[];
} {
    return {
        getData(): IDataForShow[] {
            return [
                {
                    id: 1,
                    px: 'Строго 150px',
                    fr1of3: '1/3 свободного пространства. fr - гибкая ширина. fr расчитывается как доля от оставшегося свободного пространства внутри грида. Грубо говоря, сначала браузер просчитает ширины всех остальных колонок, потом fr',
                    fr2of3: '2/3 свободного пространства. После этого доступная ширина будет разделена на сумму всех коэффициентов указаных у колонок с fr(в данном гриде - 3) и распределена между колонками, в соответствии с коэффициентами.',
                    minMax: 'От 50px до 200px в зависимости от контента ячеек колонки',
                    auto: 'Пример работы auto',
                    maxContent: 'По ширине'
                },
                {
                    id: 2,
                    px: 'Ячейка 2/1',
                    maxContent: 'самой широкой ячеки',
                    fr1of3: 'Ячейка 2/3',
                    fr2of3: 'Ячейка 2/4',
                    auto: 'Ячейка 3/4',
                    minMax: 'Ячейка 2/6'
                }
            ];
        },
        getHeader(): IHeader[] {
            return [
                {
                    title: '150px'
                },
                {
                    title: 'max-content'
                },
                {
                    title: '1fr'
                },
                {
                    title: '2fr'
                },
                {
                    title: 'auto'
                },
                {
                    title: 'minmax(50px, 200px)'
                }
            ];
        },
        getColumns1(): IColumn[] {
            return [
                {
                    displayProperty: 'px',
                    width: '150px'
                },
                {
                    displayProperty: 'maxContent',
                    width: 'max-content',
                    compatibleWidth: '147px'
                },
                {
                    displayProperty: 'fr1of3',
                    width: '1fr',
                    compatibleWidth: '30%'
                },
                {
                    displayProperty: 'fr2of3',
                    width: '2fr',
                    compatibleWidth: '60%'
                },
                {
                    displayProperty: 'auto',
                    width: 'auto',
                    compatibleWidth: '139px'
                },
                {
                    displayProperty: 'minMax',
                    width: 'minmax(50px, 200px)',
                    compatibleWidth: '200px'
                }
            ];
        },
        getColumns2(): IColumn[] {
            return [
                {
                    displayProperty: 'px',
                    width: '150px'
                },
                {
                    displayProperty: 'maxContent',
                    width: 'max-content',
                    compatibleWidth: '147px'
                },
                {
                    displayProperty: 'auto',
                    width: 'auto',
                    compatibleWidth: '139px'
                },
                {
                    displayProperty: 'minMax',
                    width: 'minmax(50px, 200px)',
                    compatibleWidth: '200px'
                }
            ];
        }
    };
}

interface IDataForPadding {
    id: number;
    number: string;
    country: string;
    capital: string;
    population: number;
    square: number;
    populationDensity: number;
}

const cellPadding = () => ({
    getCollumns: () => ([
        {
            displayProperty: 'number',
            width: '100px',
            template: itemCountr,
            cellPadding: {
                right: 's'
            }
        },
        {
            displayProperty: 'country',
            width: '100px',
            template: itemTpl,
            cellPadding: {
                left: 's',
                right: 'null'
            }
        },
        {
            displayProperty: 'capital',
            width: '100px'
        }
    ]),
    getData: (): IDataForPadding[] => ([
        {
            id: 0,
            number: 'Russian Federation',
            country: 'Российская Федерация',
            capital: 'Москва',
            population: 143420300,
            square: 17075200,
            populationDensity: 8
        },
        {
            id: 1,
            number: 'Canada',
            country: 'Канада',
            capital: 'Оттава',
            population: 32805000,
            square: 9976140,
            populationDensity: 3
        },
        {
            id: 2,
            number: 'Unated States of America',
            country: 'Соединенные Штаты Америки',
            capital: 'Вашингтон',
            population: 295734100,
            square: 9629091,
            populationDensity: 30.71
        },
        {
            id: 3,
            number: 'Peoples Republic of China',
            country: 'Китайская народная республика',
            capital: 'Пекин',
            population: 1306313800,
            square: 9596960,
            populationDensity: 136.12
        },
        {
            id: 4,
            number: 'trinidad and tabago',
            country: 'Тринидад и Табаго',
            capital: 'Город',
            population: 186112800,
            square: 8511965,
            populationDensity: 21.86
        }
    ]),
    getCellPaddingHeader: (): IHeader[] => {
        return [
            {
                title: 'right: S'
            },
            {
                title: 'left: S and right: null'
            },
            {
                title: 'left: default'
            }
        ];
    }
});

interface IDndData {
    id: number;
    title: string;
    additional: string;
    image: string;
    'Раздел@': boolean;
    Раздел: null | boolean;
}

interface IForDnD {
  data: IDndData[];
  columns: IColumn[];
}

const DragNDrop = (): IForDnD => ({
    data: [{
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
        // tslint:disable-next-line
        image: Images[2],
        'Раздел@': true,
        Раздел: null
    }, {
        id: 3,
        title: 'Luna',
        additional: 'Sattelite',
        // tslint:disable-next-line
        image: Images[3],
        'Раздел@': null,
        Раздел: null
    }, {
        id: 4,
        title: 'Pizza',
        additional: 'Food',
        // tslint:disable-next-line
        image: Images[4],
        'Раздел@': null,
        Раздел: null
    }, {
        id: 5,
        title: 'Monkey',
        additional: 'Animals',
        // tslint:disable-next-line
        image: Images[5],
        'Раздел@': null,
        Раздел: null
    }],
    columns: [{
        displayProperty: 'id',
        width: '30px'
    }, {
        displayProperty: 'title',
        width: '200px'
    }, {
        displayProperty: 'additional',
        width: '200px'
    }]
});

interface IDataForChangeSource {
    id: number;
    load: string | number;
    title: string;
}

interface IChangeSource {
    data: IDataForChangeSource[];
    data2: IDataForChangeSource[];
}

const changeSourceData = (): IChangeSource => ({
    data: [
        {
            id: 1,
            load: 'One',
            title: 'hello'
        }, {
            id: 2,
            load: 'Two',
            title: 'hello'

        }, {
            id: 3,
            load: 'three',
            title: 'hello'

        }, {
            id: 4,
            load: 'Four',
            title: 'hello'

        }, {
            id: 5,
            load: 'Five',
            title: 'hello'

        }, {
            id: 6,
            load: 'Six',
            title: 'hello'

        }, {
            id: 7,
            load: 'Seven',
            title: 'hello'

        }],
    data2: [
        {
            id: 1,
            load: 1,
            title: 'hello'
        }, {
            id: 2,
            load: 2,
            title: 'hello'

        }, {
            id: 3,
            load: 2,
            title: 'hello'

        }, {
            id: 4,
            load: 2,
            title: 'hello'

        }, {
            id: 5,
            load: 2,
            title: 'hello'

        }, {
            id: 6,
            load: 2,
            title: 'hello'

        }, {
            id: 7,
            load: 2,
            title: 'hello'

        }]
});
// tslint:disable
const countries: string[] = ["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas"
    ,"Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands"
    ,"Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica"
    ,"Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea"
    ,"Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana"
    ,"Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India"
    ,"Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia"
    ,"Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania"
    ,"Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia"
    ,"New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal"
    ,"Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles"
    ,"Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan"
    ,"Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia"
    ,"Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","United States Minor Outlying Islands","Uruguay"
    ,"Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"];

export {
    getCountriesStats,
    getTasks,
    getTasksWithHiddenGroup,
    getPorts,
    forShowWidths,
    getEditing,
    countries,
    DragNDrop,
    cellPadding,
    changeSourceData,
    getMultilineLadder
}
