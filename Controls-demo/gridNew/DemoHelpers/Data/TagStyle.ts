import {IColumn} from "Controls/_grid/display/interface/IColumn";
import {IData} from "Controls-demo/gridNew/DemoHelpers/DataCatalog";

export const TagStyle = {
    getColumns: (): IColumn[] => [
        {
            displayProperty: 'number',
            width: '40px'
        },
        {
            displayProperty: 'country',
            width: '200px'
        },
        {
            displayProperty: 'population',
            width: '150px',
            align: 'right',
            tagStyleProperty: 'tagStyle'
        }
    ],
    getData: (): IData[] => [
        {
            key: 0,
            number: 1,
            country: 'Россия',
            capital: 'Москва',
            population: 143420300,
            square: 17075200,
            populationDensity: 8,
            tagStyle: null
        },
        {
            key: 1,
            number: 2,
            country: 'Канада',
            capital: 'Оттава',
            population: 32805000,
            square: 9976140,
            populationDensity: 3,
            tagStyle: 'info'
        },
        {
            key: 2,
            number: 3,
            country: 'Соединенные Штаты Америки',
            capital: 'Вашингтон',
            population: 295734100,
            square: 9629091,
            populationDensity: 30.71,
            tagStyle: 'danger'
        },
        {
            key: 3,
            number: 4,
            country: 'Китай',
            capital: 'Пекин',
            population: 1306313800,
            square: 9596960,
            populationDensity: 136.12,
            tagStyle: 'primary'
        },
        {
            key: 4,
            number: 5,
            country: 'Бразилия',
            capital: 'Бразилиа',
            population: 186112800,
            square: 8511965,
            populationDensity: 21.86,
            tagStyle: 'success'
        },
        {
            key: 5,
            number: 6,
            country: 'Австралия',
            capital: 'Канберра',
            population: 20090400,
            square: 7686850,
            populationDensity: 3,
            tagStyle: 'warning'
        },
        {
            key: 6,
            number: 7,
            country: 'Индия',
            capital: 'Нью-Дели',
            population: 1080264400,
            square: 3287590,
            populationDensity: 328.59,
            tagStyle: 'secondary'
        },
        {
            key: 7,
            number: 8,
            country: 'Аргентина',
            capital: 'Буэнос-Айрес',
            population: 39537900,
            square: 2766890,
            populationDensity: 4.29,
            tagStyle: 'info'
        }
    ]
}
