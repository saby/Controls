import {IColumnRes} from "Controls-demo/gridNew/DemoHelpers/DataCatalog";
import {IHeaderCell} from "Controls/_grid/display/interface/IHeaderCell";

export const Sorting = {
    getColumns: (): IColumnRes[] => [
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
    getHeader: (textOverflow): IHeaderCell[] => [
        {
            caption: '#'
        },
        {
            caption: 'Страна'
        },
        {
            caption: 'Название столицы страны',
            textOverflow,
            sortingProperty: 'capital',
            align: 'left'
        },
        {
            caption: 'Население',
            sortingProperty: 'population',
            align: 'left'
        },
        {
            caption: 'Площадь км2',
            sortingProperty: 'square',
            align: 'right'
        },
        {
            caption: 'Плотность населения чел/км2',
            textOverflow,
            sortingProperty: 'populationDensity',
            align: 'right'
        }
    ]
}