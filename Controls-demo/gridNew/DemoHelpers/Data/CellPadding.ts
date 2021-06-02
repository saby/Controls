import * as itemTpl from 'wml!Controls-demo/gridNew/resources/CellTemplates/CellWithBgc';
import * as itemCountr from 'wml!Controls-demo/gridNew/resources/CellTemplates/CountryTemp';

export const CellPadding = {
    getColumns: () => [
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
    ],
    getHeader: () => [
        {
            title: 'right: S'
        },
        {
            title: 'left: S and right: null'
        },
        {
            title: 'left: default'
        }
    ],
    getData: () => [
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
    ]
}