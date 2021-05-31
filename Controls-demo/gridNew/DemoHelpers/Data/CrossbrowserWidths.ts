import {IColumn, IHeaderCell} from "Controls/grid";

interface IDataForShow {
    id: number;
    px: string;
    fr1of3: string;
    fr2of3: string;
    minMax: string;
    auto: string;
    maxContent: string;
}


export const CrossBrowserWidths = {
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
    getHeader(): IHeaderCell[] {
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
    getColumns(): IColumn[] {
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
    }
};
