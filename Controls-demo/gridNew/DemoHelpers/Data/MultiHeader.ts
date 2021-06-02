import {IHeaderCell} from "Controls/_grid/display/interface/IHeaderCell";

export const MultiHeader = {
    getHeader1: (): IHeaderCell[] => [
        {
            caption: '#',
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2
        },
        {
            caption: 'Географические данные',
            startRow: 1,
            endRow: 2,
            startColumn: 2,
            endColumn: 4,
            align: 'center'
        },
        {
            caption: 'Страна',
            startRow: 2,
            endRow: 3,
            startColumn: 2,
            endColumn: 3
        },
        {
            caption: 'Столица',
            startRow: 2,
            endRow: 3,
            startColumn: 3,
            endColumn: 4
        },
        {
            caption: 'Цифры',
            startRow: 1,
            endRow: 2,
            startColumn: 4,
            endColumn: 7,
            align: 'center'
        },
        {
            caption: 'Население',
            startRow: 2,
            endRow: 3,
            startColumn: 4,
            endColumn: 5
        },
        {
            caption: 'Площадь км2',
            startRow: 2,
            endRow: 3,
            startColumn: 5,
            endColumn: 6
        },
        {
            caption: 'Плотность населения чел/км2',
            startRow: 2,
            endRow: 3,
            startColumn: 6,
            endColumn: 7
        }
    ],
    getHeader2: (): IHeaderCell[] => [
        {
            title: 'Географические характеристики стран',
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2
        },
        {
            caption: 'Столица',
            startRow: 1,
            endRow: 3,
            startColumn: 2,
            endColumn: 3
        },
        {
            caption: 'Цифры',
            startRow: 1,
            endRow: 2,
            startColumn: 3,
            endColumn: 6,
            align: 'center'
        },
        {
            caption: 'Население',
            startRow: 2,
            endRow: 3,
            startColumn: 3,
            endColumn: 4
        },
        {
            caption: 'Площадь км2',
            startRow: 2,
            endRow: 3,
            startColumn: 4,
            endColumn: 5
        },
        {
            caption: 'Плотность населения чел/км2',
            startRow: 2,
            endRow: 3,
            startColumn: 5,
            endColumn: 6
        }
    ],
    getHeader3: (): IHeaderCell[] => [
        {
            caption: 'Географические характеристики стран',
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2,
            valign: 'bottom'
        },
        {
            caption: 'Столица',
            startRow: 1,
            endRow: 3,
            startColumn: 2,
            endColumn: 3,
            valign: 'top'
        },
        {
            caption: 'Цифры',
            startRow: 1,
            endRow: 2,
            startColumn: 3,
            endColumn: 6
        },
        {
            caption: 'Население',
            startRow: 2,
            endRow: 3,
            startColumn: 3,
            endColumn: 4
        },
        {
            caption: 'Площадь км2',
            startRow: 2,
            endRow: 3,
            startColumn: 4,
            endColumn: 5
        },
        {
            caption: 'Плотность населения чел/км2',
            startRow: 2,
            endRow: 3,
            startColumn: 5,
            endColumn: 6
        }
    ]
}