// @ts-ignore
import * as numberResultTpl from 'wml!Controls-demo/gridNew/resources/ResultCellTemplates/Number';

import {IColumnRes, IData} from "Controls-demo/gridNew/DemoHelpers/DataCatalog";
import {IColumn, IHeaderCell} from "Controls/grid";

interface IResults {
    full: Array<{ population: number, square: number, populationDensity: number }>;
    partial: number[];
}

export const Countries = {
    getData: (): IData[] => [
        {
            key: 0,
            number: 1,
            country: 'Россия',
            capital: 'Москва',
            population: 143420300,
            square: 17075200,
            populationDensity: 8
        },
        {
            key: 1,
            number: 2,
            country: 'Канада',
            capital: 'Оттава',
            population: 32805000,
            square: 9976140,
            populationDensity: 3
        },
        {
            key: 2,
            number: 3,
            country: 'Соединенные Штаты Америки',
            capital: 'Вашингтон',
            population: 295734100,
            square: 9629091,
            populationDensity: 30.71
        },
        {
            key: 3,
            number: 4,
            country: 'Китай',
            capital: 'Пекин',
            population: 1306313800,
            square: 9596960,
            populationDensity: 136.12
        },
        {
            key: 4,
            number: 5,
            country: 'Бразилия',
            capital: 'Бразилиа',
            population: 186112800,
            square: 8511965,
            populationDensity: 21.86
        },
        {
            key: 5,
            number: 6,
            country: 'Австралия',
            capital: 'Канберра',
            population: 20090400,
            square: 7686850,
            populationDensity: 3
        },
        {
            key: 6,
            number: 7,
            country: 'Индия',
            capital: 'Нью-Дели',
            population: 1080264400,
            square: 3287590,
            populationDensity: 328.59
        },
        {
            key: 7,
            number: 8,
            country: 'Аргентина',
            capital: 'Буэнос-Айрес',
            population: 39537900,
            square: 2766890,
            populationDensity: 4.29
        },
        {
            key: 8,
            number: 9,
            country: 'Казахстан',
            capital: 'Нур-Султан',
            population: 15185000,
            square: 2717300,
            populationDensity: 6.00
        },
        {
            key: 9,
            number: 10,
            country: 'Судан',
            capital: 'Хартум',
            population: 40187500,
            square: 2505810,
            populationDensity: 16.04
        },
        {
            key: 10,
            number: 11,
            country: 'Алжир',
            capital: 'Алжир',
            population: 32531900,
            square: 2381740,
            populationDensity: 13.66
        },
        {
            key: 11,
            number: 12,
            country: 'Конго',
            capital: 'Браззавиль',
            population: 60085800,
            square: 2345410,
            populationDensity: 25.62
        },
        {
            key: 12,
            number: 13,
            country: 'Мексика',
            capital: 'Мехико',
            population: 106202900,
            square: 1972550,
            populationDensity: 53.84
        },
        {
            key: 13,
            number: 14,
            country: 'Саудовская Аравия',
            capital: 'Эр-Рияд',
            population: 26417600,
            square: 1960582,
            populationDensity: 13.47
        },
        {
            key: 14,
            number: 15,
            country: 'Индонезия',
            capital: 'Джакарта',
            population: 241973900,
            square: 1919440,
            populationDensity: 126.06
        },
        {
            key: 15,
            number: 16,
            country: 'Ливия',
            capital: 'Триполи',
            population: 5765600,
            square: 1759540,
            populationDensity: 3.00
        },
        {
            key: 16,
            number: 17,
            country: 'Иран',
            capital: 'Тегеран',
            population: 68017900,
            square: 1648000,
            populationDensity: 41.27
        },
        {
            key: 17,
            number: 18,
            country: 'Монголия',
            capital: 'Улан-Батор',
            population: 2791300,
            square: 1565000,
            populationDensity: 2.00
        },
        {
            key: 18,
            number: 19,
            country: 'Перу',
            capital: 'Лима',
            population: 27925600,
            square: 1285220,
            populationDensity: 21.73
        }
    ],
    getHeader: (): IHeaderCell[] => [
        { caption: '#' },
        { caption: 'Страна' },
        { caption: 'Столица' },
        { caption: 'Население' },
        { caption: 'Площадь км2' },
        { caption: 'Плотность населения чел/км2' }
    ],
    getColumns: (): IColumn[] => [
        { displayProperty: 'number' },
        { displayProperty: 'country' },
        { displayProperty: 'capital' },
        { displayProperty: 'population' },
        { displayProperty: 'square' },
        { displayProperty: 'populationDensity' }
    ],
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
        partial: [12345678910, 23456789101, 34567891012]
    }),
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
            resultTemplate: numberResultTpl,
            compatibleWidth: '118px'
        },
        {
            displayProperty: 'square',
            width: 'max-content',
            result: 12423523,
            resultTemplate: numberResultTpl,
            compatibleWidth: '156px'
        },
        {
            displayProperty: 'populationDensity',
            width: 'max-content',
            result: 5.8,
            resultTemplate: numberResultTpl,
            compatibleWidth: '60px'
        }
    ],
    getLongHeader: (textOverflow): IHeaderCell[] => [
        {
            caption: '#'
        },
        {
            caption: 'Страна'
        },
        {
            caption: 'Столица страны из рейтинга',
            textOverflow
        },
        {
            caption: 'Население страны по данным на 2018г.',
            textOverflow
        },
        {
            caption: 'Площадь территории км2',
            textOverflow
        },
        {
            caption: 'Плотность населения чел/км2',
            textOverflow
        }
    ],
}