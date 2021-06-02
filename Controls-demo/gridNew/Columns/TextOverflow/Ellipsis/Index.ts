import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Columns/TextOverflow/Ellipsis/Ellipsis';
import {Memory} from 'Types/source';
import { IHeaderCell } from 'Controls/grid';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    // tslint:disable-next-line
    protected _header: IHeaderCell[] = Countries.getHeader().slice(1, 4);
    protected _columns: IColumn[] = [
        {
            displayProperty: 'country',
            width: '100px',
            textOverflow: 'ellipsis'
        },
        {
            displayProperty: 'capital',
            width: '200px'
        },
        {
            displayProperty: 'population',
            width: '200px'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: [
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
                    country: 'Соединенные Штаты Америки',
                    capital: 'Вашингтон',
                    population: 295734100,
                    square: 9629091,
                    populationDensity: 30.71
                },
                {
                    key: 2,
                    number: 3,
                    country: 'Доминиканская Республика',
                    capital: 'Санто-Доминго',
                    population: 10499707,
                    square: 9629091,
                    populationDensity: 30.71
                },
                {
                    key: 3,
                    number: 4,
                    country: 'Новая Зеландия',
                    capital: 'Веллингтон',
                    population: 4942500,
                    square: 9629091,
                    populationDensity: 30.71
                },
                {
                    key: 4,
                    number: 5,
                    country: 'Бразилия',
                    capital: 'Бразилиа',
                    population: 186112800,
                    square: 8511965,
                    populationDensity: 21.86
                }
            ]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
