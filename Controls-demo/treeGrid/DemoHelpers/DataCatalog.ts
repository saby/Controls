import * as CntTpl from 'wml!Controls-demo/treeGrid/ItemTemplate/WithPhoto/content';
import * as CntTwoLvlTpl from 'wml!Controls-demo/treeGrid/ItemTemplate/WithPhoto/contentTwoLvl';
import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';

import { IHeader } from 'Controls-demo/types';
import { IColumn } from 'Controls/_grid/interface/IColumn';

interface IData {
   id: number,
   parent?: null | number,
   'parent@'?: null | Boolean,
   title: string,
   Раздел?: null | number,
   'Раздел@'?: null | boolean,
   Раздел$?: null | boolean,
   hasChild?: boolean,
   rating?: number | string,
   country?: string,
   type?: boolean | null,
   photo?: string,
   modelId?: string,
   size?: string,
   year?: string,
   note?: string,
   nodeType?: boolean | null
}

interface IResults {
    full: Array<{ rating: number, price: number }>;
    partial: number[];
}

export const Gadgets = {
    getDeepSet(): IData[] {
        return [
            {
                id: 1, title: 'Node', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: true, rating: 1, country: 'Russia',
            },
            {
                id: 11, title: 'Node2', Раздел: 1, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia',
            },
            {
                id: 111, title: 'Node3', Раздел: 11, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia',
            },
            {
                id: 1111, title: 'Node4', Раздел: 111, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia',
            },
            {
                id: 11111, title: 'Node5', Раздел: 1111, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia',
            },
            {
                id: 111111, title: 'Node6', Раздел: 11111, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia',
            },
            {
                id: 2, title: 'Node7', Раздел: 111111, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia',
            },
            {
                id: 22, title: 'Node8', Раздел: 2, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia',
            },
            {
                id: 222, title: 'Node9', Раздел: 22, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia',
            },
            {
                id: 2222, title: 'Node10', Раздел: 222, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia',
            },
        ];
    },

    getDataSet(): IData[] {
        return [
            {
                id: 1, title: 'Node', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: true
            },
            {
                id: 11, title: 'Node', Раздел: 1, 'Раздел@': true, Раздел$: null
            },
            {
                id: 111, title: 'Leaf', Раздел: 11, 'Раздел@': null, Раздел$: null
            },
            {
                id: 12, title: 'Hidden node', Раздел: 1, 'Раздел@': false, Раздел$: true
            },
            {
                id: 13, title: 'Leaf', Раздел: 1, 'Раздел@': null, Раздел$: null
            },
            {
                id: 2, title: 'Node 2', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: true
            },
            {
                id: 21, title: 'Leaf 21', Раздел: 2, 'Раздел@': null, Раздел$: null
            },
            {
                id: 3, title: 'Node 3', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: false
            }
        ];
    },

    getFlatData(): IData[] {
        return [
            {
                id: 1,
                title: 'Apple',
                country: 'США',
                rating: '8.5',
                parent: null,
                type: true,
                hasChild: true,
                photo: explorerImages[0]
            },
                {
                    id: 11,
                    title: 'Smartphones1',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: explorerImages[1]
                },
                {
                    id: 12,
                    title: 'Smartphones2',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: explorerImages[1]
                },
                {
                    id: 13,
                    title: 'Smartphones3',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: explorerImages[0]
                },
                {
                    id: 14,
                    title: 'Smartphones4',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: explorerImages[0]
                },
                {
                    id: 15,
                    title: 'Smartphones5',
                    parent: 1,
                    rating: '9.2',
                    type: true,
                    hasChild: true,
                    photo: explorerImages[0]
                },
                    {
                        id: 151,
                        title: 'iPhone 4s',
                        rating: '9.5',
                        parent: 15,
                        type: null
                    },
                    {
                        id: 152,
                        title: 'iPhone 4',
                        rating: '8.9',
                        parent: 15,
                        type: null
                    },
                    {
                        id: 153,
                        title: 'iPhone X Series',
                        rating: '7.6',
                        parent: 15,
                        type: false
                    },
                        {
                            id: 1531,
                            title: 'iPhone Xs',
                            rating: '7.4',
                            parent: 153,
                            type: null
                        },
                        {
                            id: 1532,
                            title: 'iPhone Xs Max',
                            rating: '6.8',
                            parent: 153,
                            type: null
                        },
                        {
                            id: 1533,
                            title: 'iPhone XR',
                            rating: '7.1',
                            parent: 153,
                            type: null
                        },
                {
                    id: 16,
                    title: 'Notebooks',
                    parent: 1,
                    rating: '9.4',
                    type: false
                },
                    {
                        id: 161,
                        title: 'MacBook Pro',
                        rating: '7.2',
                        modelId: 'MacBookPro15,4',
                        size: '13 дюймов',
                        year: '2019',
                        note: '2 порта Thunderbolt 3',
                        parent: 16,
                        type: null
                    },
                    {
                        id: 162,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro15,3',
                        rating: '6.9',
                        size: '15 дюймов',
                        year: '2019',
                        note: '',
                        parent: 16,
                        type: null
                    },
                    {
                        id: 163,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro15,2',
                        size: '13 дюймов',
                        rating: '9.1',
                        year: '2019',
                        note: '4 порта Thunderbolt 3',
                        parent: 16,
                        type: null
                    },
                    {
                        id: 164,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro14,3',
                        rating: '8.8',
                        size: '15 дюймов',
                        year: '2017',
                        note: '',
                        parent: 16,
                        type: null
                    },
                    {
                        id: 165,
                        title: 'MacBook Pro',
                        modelId: 'MacBookPro14,2',
                        size: '13 дюймов',
                        rating: '8.5',
                        year: '2017',
                        note: '4 порта Thunderbolt 3',
                        parent: 16,
                        type: null
                    },
                {
                    id: 17,
                    title: 'Magic Mouse 2',
                    modelId: 'MM16',
                    rating: '7.2',
                    year: '2016',
                    parent: 1,
                    type: null
                },
            {
                id: 2,
                title: 'Samsung',
                country: 'Южная Корея',
                rating: '8.0',
                parent: null,
                type: true,
                hasChild: true,
                photo: explorerImages[0]
            },
                {
                    id: 21,
                    title: 'Samusng A10',
                    rating: '9.5',
                    parent: 2,
                    type: null
                },
                {
                    id: 22,
                    title: 'Samsung A20',
                    rating: '9.5',
                    parent: 2,
                    type: null
                },
                {
                    id: 23,
                    title: 'Samsung A30',
                    rating: '9.5',
                    parent: 2,
                    type: null
                },
                {
                    id: 24,
                    title: 'Samsung A40',
                    rating: '9.5',
                    parent: 2,
                    type: null
                },
            {
                id: 3,
                title: 'Meizu',
                rating: '7.5',
                country: 'КНР',
                parent: null,
                type: true,
                photo: explorerImages[0]
            },
            {
                id: 4,
                title: 'Asus',
                rating: '7.3',
                country: 'Тайвань',
                parent: null,
                type: false,
                photo: explorerImages[0]
            },
            {
                id: 5,
                title: 'Acer',
                rating: '7.1',
                country: 'Тайвань',
                parent: null,
                type: false,
                photo: explorerImages[1]
            }
        ];
    },

    getDataTwoLvl: function(): IData[] {
        return [
            {
                id: 1, title: 'Apple', 'Раздел': null, 'Раздел@': true, photo: explorerImages[1], rating: '9.5',
                country: 'Южная Корея',
            },
            {
                id: 2, title: 'Samsung', 'Раздел': null, 'Раздел@': true, photo: explorerImages[1], rating: '9.5',
                country: 'Южная Корея',
            },
            {
                id: 3, title: 'Asus', 'Раздел': null, 'Раздел@': true, photo: explorerImages[1], rating: '9.5',
                country: 'Южная Корея',
            },
            {
                id: 11, title: 'Asus', 'Раздел': 1, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея',
            },
            {
                id: 12, title: 'Apple', 'Раздел': 1, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея',
            },
            {
                id: 13, title: 'Samsung', 'Раздел': 1, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея',
            },
            {
                id: 21, title: 'Apple', 'Раздел': 2, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея',
            },
            {
                id: 22, title: 'SamsungApple', 'Раздел': 2, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея',
            },
            {
                id: 23, title: 'Samsung 2', 'Раздел': 3, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея',
            },
            {
                id: 31, title: 'Samsung', 'Раздел': 3, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея',
            },
            {
                id: 32, title: 'Samsung', 'Раздел': 3, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея',
            }
        ];
    },

    getResults(): IResults {
        return {
            full: [
                {
                    rating: 8.4,
                    price: 1554
                },
                {
                    rating: 4.58,
                    price: 2855.5
                },
                {
                    rating: 9.41,
                    price: 3254.09
                }
            ],
            partial: [
                23415.454, 56151, 57774
            ]
        };
    },

    getColumnsForFlat(): IColumn[] {
        return [
            {
                displayProperty: 'title',
                width: ''
            }
        ];
    },
    getColumnsForColumnScroll(): IColumn[] {
        return [
            {
                displayProperty: 'id',
                width: '60px'
            },
            {
                displayProperty: 'title',
                width: '200px'
            },
            {
                displayProperty: 'country',
                width: '150px'
            },
            {
                displayProperty: 'rating',
                width: '60px'
            },
            {
                displayProperty: 'hasChild',
                width: '120px'
            },
            {
                displayProperty: 'country',
                width: '120px'
            },
            {
                displayProperty: 'rating',
                width: '120px'
            }
        ];
    },
    getHeaderForColumnScroll(): IHeader[] {
        return [
            {
                title: '#'
            },
            {
                title: 'Бренд'
            },
            {
                title: 'Страна производителя'
            },
            {
                title: 'Рейтинг'
            },
            {
                title: 'Есть товары?'
            },
            {
                title: 'Еще раз страна'
            },
            {
                title: 'Еще раз рейтинг'
            }
        ];
    },
    getGridColumnsForFlat(): IColumn[] {
        return [
            {
                displayProperty: 'title',
                width: ''
            },
            {
                displayProperty: 'rating',
                width: ''
            },
            {
                displayProperty: 'country',
                width: ''
            }
        ];
    },
    getGridColumnsWithPhoto(): IColumn[] {
        return [
            {
                displayProperty: 'title',
                template: CntTpl,
                width: ''
            },
            {
                displayProperty: 'rating',
                width: ''
            },
            {
                displayProperty: 'country',
                width: ''
            }
        ]
    },
    getGridTwoLevelColumnsWithPhoto(): IColumn[] {
        return [
            {
                displayProperty: 'title',
                template: CntTwoLvlTpl,
                width: ''
            },
            {
                displayProperty: 'rating',
                width: ''
            },
            {
                displayProperty: 'country',
                width: ''
            }
        ]
    },

    getCellPaddingHeader: (): IHeader[] => {
        return [
            {
                title: 'cellPadding: right: S',
            },
            {
                title: 'cellPadding:  left: S and right: null',
            },
            {
                title: 'cellPadding left: default',
            },
        ];
    },

    getGridColumnsWithCellPadding(): IColumn[] {
        return [
            {
                displayProperty: 'title',
                cellPadding: {
                    right: 'S'
                },
                width: ''
            },
            {
                displayProperty: 'rating',
                cellPadding: {
                    left: 'S',
                    right: 'null'
                },
                width: ''
            },
            {
                displayProperty: 'country',
                width: ''
            }
        ];
    },
    getColumnsWithFixedWidth(): IColumn[] {
        return [
            {
                displayProperty: 'title',
                width: '200px'
            },
            {
                displayProperty: 'rating',
                width: '150px'
            },
            {
                displayProperty: 'country',
                width: '150px'
            }
        ];
    },
    getHeaderForFlat(): IHeader[] {
        return [
            {
                title: 'Наименование'
            },
            {
                title: 'Рейтинг покупателей'
            },
            {
                title: 'Страна производитель'
            }
        ];
    },
    getLongHeader: (): IHeader[] => [
        {
            title: 'Население страны по данным на 2018г - 2019г.'
        },
        {
            title: 'Площадь км2'
        },
        {
            title: 'Плотность населения чел/км2'
        }
    ],
    getMultiHeader: (): IHeader[] => [
        {
            title: 'Название',
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2
        },
        {
            title: 'Общие',
            startRow: 1,
            endRow: 2,
            startColumn: 2,
            endColumn: 4,
            align: 'center'
        },
        {
            title: 'Цена',
            startRow: 2,
            endRow: 3,
            startColumn: 2,
            endColumn: 3
        },
        {
            title: 'Стоимость',
            startRow: 2,
            endRow: 3,
            startColumn: 3,
            endColumn: 4
        }
    ]
};

export const VirtualScrollHasMore = {
    // 70 записей. У первой записи 100 детей.
    getData: (): Array<{
        id: number,
        title: string,
        parent: number | null,
        type: boolean | null
    }> => {
        const result = [];
        const itemsCount = 70;

        result[0] = {
            id: 0,
            title: `Запись первого уровня с id = ${0}. Много дочерних элементов.`,
            parent: null,
            type: true
        };

        for (let i = 1; i < itemsCount; i++) {
            result.push(
                {
                    id: i,
                    title: `Запись первого уровня с id = ${i}. Без детей.`,
                    parent: null,
                    type: true
                },
                {
                    id: itemsCount + i,
                    title: `Запись второго уровня с id = ${itemsCount + i}`,
                    parent: 0,
                    type: null
                },
                {
                    id: itemsCount + (2 * i),
                    title: `Запись второго уровня с id = ${itemsCount + itemsCount + (2 * i)}`,
                    parent: 0,
                    type: null
                },
            );
        }

        return result.sort((a, b) => a.id > b.id ? 1 : -1);
    },
    getColumns: (): IColumn[] => ([{
        displayProperty: 'title',
        width: ''
    }]),

    getDataForVirtual: (): IData[] => [
        {
            id: 1,
            title: 'Apple',
            country: 'США',
            rating: '8.5',
            parent: null,
            type: true,
            hasChild: true,
            photo: explorerImages[0]
        },
        {
            id: 2,
            title: 'Iphone 1',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true,
            photo: explorerImages[1]
        },
        {
            id: 11,
            title: 'Iphone 2',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true,
            photo: explorerImages[1]
        },
        {
            id: 100,
            title: 'Iphone 1 pro',
            parent: 11,
            rating: '9.2',
            type: null,
        },
        {
            id: 101,
            title: 'Iphone 2 default',
            parent: 11,
            rating: '9.2',
            type: null,
        },
        {
            id: 12,
            title: 'Iphone 3',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true,
        },
        {
            id: 103,
            title: 'Iphone 3 pro',
            parent: 12,
            rating: '9.2',
            type: null,
        },
        {
            id: 104,
            title: 'Iphone 3 default',
            parent: 12,
            rating: '9.2',
            type: null,
        },
        {
            id: 13,
            title: 'Iphone 3s',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true,
            photo: explorerImages[0]
        },
        {
            id: 14,
            title: 'Iphone 4',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true,
            photo: explorerImages[0]
        },
        {
            id: 3,
            title: 'iPhone 5',
            rating: '9.5',
            parent: null,
            hasChild: true,
            type: true,
        },
        {
            id: 135,
            title: 'Usable Phone',
            modelId: 'MM16',
            rating: '7.2',
            year: '2016',
            parent: 3,
            type: null
        },
        {
            id: 136,
            title: 'Unusable Phone',
            modelId: 'MM16',
            rating: '7.2',
            year: '2016',
            parent: 3,
            type: null
        },
        {
            id: 137,
            title: 'Pencel',
            modelId: 'MM16',
            rating: '7.2',
            year: '2016',
            parent: 3,
            type: null
        },
        {
            id: 138,
            title: 'Magic Pencel',
            modelId: 'MM16',
            rating: '7.2',
            year: '2016',
            parent: 3,
            type: null
        },
        {
            id: 4,
            title: 'iPhone 5s',
            rating: '8.9',
            parent: null,
            hasChild: true,
            type: true,
        },
        {
            id: 6,
            title: 'iPhone X Series',
            rating: '7.6',
            parent: null,
            type: true,
        },
        {
            id: 7,
            title: 'iPhone 6s',
            rating: '7.4',
            parent: null,
            type: true,
        },
        {
            id: 8,
            title: 'iPhone Xs Max',
            rating: '6.8',
            parent: null,
            type: true,
        },
        {
            id: 9,
            title: 'iPhone XR',
            rating: '7.1',
            parent: 6,
            type: true,
        },
        {
            id: 10,
            title: 'Notebooks',
            parent: null,
            rating: '9.4',
            type: true,
        },
        {
            id: 11,
            title: 'MacBook Pro',
            rating: '7.2',
            modelId: 'MacBookPro15,4',
            size: '13 дюймов',
            year: '2019',
            note: '2 порта Thunderbolt 3',
            parent: null,
            type: true,
        },
        {
            id: 12,
            title: 'MacBook Pro',
            modelId: 'MacBookPro15,3',
            rating: '6.9',
            size: '15 дюймов',
            year: '2019',
            note: '',
            parent: null,
            type: true
        },
        {
            id: 120,
            title: 'MacBook Pro Next',
            rating: '7.2',
            modelId: 'MacBookPro15,4',
            size: '13 дюймов',
            year: '2019',
            note: '2 порта Thunderbolt 3',
            parent: 12,
            type: true,
        },
        {
            id: 121,
            title: 'MacBook Pro Prev',
            modelId: 'MacBookPro15,3',
            rating: '6.9',
            size: '15 дюймов',
            year: '2019',
            note: '',
            parent: 12,
            type: null
        },
        {
            id: 123,
            title: 'MacBook Air',
            rating: '7.2',
            modelId: 'MacBookPro15,4',
            size: '13 дюймов',
            year: '2019',
            note: '2 порта Thunderbolt 3',
            parent: 13,
            type: null,
        },
        {
            id: 124,
            title: 'MacBook Air',
            modelId: 'MacBookPro15,3',
            rating: '6.9',
            size: '15 дюймов',
            year: '2019',
            note: '',
            parent: 13,
            type: null
        },
        {
            id: 13,
            title: 'MacBook Air',
            modelId: 'MacBookPro15,2',
            size: '13 дюймов',
            rating: '9.1',
            year: '2019',
            note: '4 порта Thunderbolt 3',
            parent: null,
            type: true
        },
        {
            id: 15,
            title: 'MacBook Pro',
            modelId: 'MacBookPro14,2',
            size: '13 дюймов',
            rating: '8.5',
            year: '2017',
            note: '4 порта Thunderbolt 3',
            parent: null,
            type: true
        },
        {
            id: 16,
            title: 'Magic Mouse 2',
            modelId: 'MM16',
            rating: '7.2',
            year: '2016',
            parent: 1,
            type: null
        },
        {
            id: 130,
            title: 'Magic Mouse 3',
            modelId: 'MM16',
            rating: '7.2',
            year: '2016',
            parent: 1,
            type: null
        },
        {
            id: 131,
            title: 'Magic Pencel 3',
            modelId: 'MM16',
            rating: '7.2',
            year: '2016',
            parent: 1,
            type: null
        },
        {
            id: 132,
            title: 'Magic Stick',
            modelId: 'MM16',
            rating: '7.2',
            year: '2016',
            parent: 1,
            type: null
        },
        {
            id: 133,
            title: 'Magic Box',
            modelId: 'MM16',
            rating: '7.2',
            year: '2016',
            parent: 1,
            type: null
        },
        {
            id: 17,
            title: 'Samsung',
            country: 'Южная Корея',
            rating: '8.0',
            parent: null,
            type: true,
            hasChild: true,
            photo: explorerImages[0]
        },
        {
            id: 18,
            title: 'Meizu',
            rating: '7.5',
            country: 'КНР',
            parent: null,
            type: true,
            photo: explorerImages[0]
        },
        {
            id: 19,
            title: 'Asus',
            rating: '7.3',
            country: 'Тайвань',
            parent: null,
            type: false,
            photo: explorerImages[0]
        },
        {
            id: 20,
            title: 'Acer',
            rating: '7.1',
            country: 'Тайвань',
            parent: null,
            type: false,
            photo: explorerImages[1]
        },
        {
            id: 23,
            title: 'Samusng 1',
            rating: '9.5',
            parent: 17,
            type: null,
        },
        {
            id: 24,
            title: 'Samsung 2',
            rating: '9.5',
            parent: 17,
            type: null,
        },
        {
            id: 25,
            title: 'Samsung 3',
            rating: '9.5',
            parent: 17,
            type: null,
        },
        {
            id: 26,
            title: 'Samsung 4',
            rating: '9.5',
            parent: 17,
            type: null,
        },
        {
            id: 30,
            title: 'iPhone 2009',
            rating: '9.5',
            parent: 3,
            hasChild: true,
            type: true,
        },
        {
            id: 31,
            title: 'iPhone 2010',
            rating: '8.9',
            parent: 3,
            hasChild: true,
            type: true,
        },
        {
            id: 32,
            title: 'iPhone 2011',
            rating: '9.5',
            parent: 3,
            hasChild: true,
            type: true,
        },
        {
            id: 33,
            title: 'iPhone 2012',
            rating: '8.9',
            parent: 3,
            hasChild: true,
            type: true,
        },
        {
            id: 34,
            title: 'iPhone 2013',
            rating: '9.5',
            parent: 3,
            hasChild: true,
            type: true,
        },
        {
            id: 35,
            title: 'iPhone 2014',
            rating: '8.9',
            parent: 3,
            hasChild: true,
            type: true,
        },
        {
            id: 36,
            title: 'iPhone 2015',
            rating: '9.5',
            parent: 3,
            hasChild: true,
            type: true,
        },
        {
            id: 37,
            title: 'iPhone 2016',
            rating: '8.9',
            parent: 3,
            hasChild: true,
            type: true,
        },
        {
            id: 38,
            title: 'iPhone 2017',
            rating: '9.5',
            parent: 3,
            hasChild: true,
            type: true,
        },
        {
            id: 39,
            title: 'iPhone 2010',
            rating: '8.9',
            parent: 4,
            hasChild: true,
            type: true,
        },
        {
            id: 40,
            title: 'Galaxy 2011',
            rating: '8.9',
            parent: 4,
            hasChild: true,
            type: true,
        },
        {
            id: 41,
            title: 'Smthy 2012',
            rating: '8.9',
            parent: 4,
            hasChild: true,
            type: true,
        },
        {
            id: 42,
            title: 'Eho 2013',
            rating: '8.9',
            parent: 4,
            hasChild: true,
            type: true,
        },
        {
            id: 43,
            title: 'Charger 2014',
            rating: '8.9',
            parent: 4,
            hasChild: true,
            type: true,
        },
        {
            id: 44,
            title: 'Phone 2000',
            rating: '8.9',
            parent: null,
            type: null,
        },
        {
            id: 45,
            title: 'Asus 2001',
            rating: '3',
            parent: null,
            type: null,
        },
        {
            id: 46,
            title: 'Aser 2002',
            rating: '2',
            parent: null,
            type: null,
        },
        {
            id: 47,
            title: 'Iphone 2003',
            rating: '2',
            parent: null,
            type: null,
        },
        {
            id: 48,
            title: 'Samsung 2004',
            rating: '3.6',
            parent: null,
            type: null,
        },
        {
            id: 49,
            title: 'Note 2005',
            rating: '8.9',
            parent: null,
            type: null,
        },
        {
            id: 50,
            title: 'Del 2006',
            rating: '8.9',
            parent: null,
            type: null,
        },
        {
            id: 51,
            title: 'Hp 2007',
            rating: '9.6',
            parent: null,
            type: null,
        },
        {
            id: 52,
            title: 'Cristal 2008',
            rating: '3.1',
            parent: null,
            type: null,
        },
        {
            id: 53,
            title: 'Phone 2009',
            rating: '2.4',
            parent: null,
            type: null,
        },
        {
            id: 54,
            title: 'Balalaika 2010',
            rating: '8.9',
            parent: null,
            type: null,
        },
        {
            id: 55,
            title: 'Elements 2011',
            rating: '9',
            parent: null,
            type: null,
        },
        {
            id: 56,
            title: 'Light House 2012',
            rating: '4',
            parent: null,
            type: null,
        },
        {
            id: 57,
            title: 'Google Chrome',
            rating: '0.2',
            parent: null,
            type: null,
        },
        {
            id: 58,
            title: 'Explorer',
            rating: '5',
            parent: null,
            type: null,
        },
        {
            id: 59,
            title: 'Spider Monky',
            rating: '6',
            parent: null,
            type: null,
        },
        {
            id: 60,
            title: 'V8',
            rating: '8',
            parent: null,
            type: null,
        },
        {
            id: 61,
            title: 'IE 2001',
            rating: '8.9',
            parent: null,
            type: null,
        },
        {
            id: 62,
            title: 'IE 2002',
            rating: '3',
            parent: null,
            type: null,
        },
        {
            id: 63,
            title: 'IE 2003',
            rating: '2',
            parent: null,
            type: null,
        },
        {
            id: 64,
            title: 'IE 2004',
            rating: '2',
            parent: null,
            type: null,
        },
        {
            id: 65,
            title: 'IE 2005',
            rating: '3.6',
            parent: null,
            type: null,
        },
        {
            id: 66,
            title: 'Chrome 2006',
            rating: '8.9',
            parent: null,
            type: null,
        },
        {
            id: 67,
            title: 'Mozila 2007',
            rating: '8.9',
            parent: null,
            type: null,
        },
        {
            id: 68,
            title: 'Mozila 2008',
            rating: '9.6',
            parent: null,
            type: null,
        },
        {
            id: 69,
            title: 'Chrome 2009',
            rating: '3.1',
            parent: null,
            type: null,
        },
        {
            id: 70,
            title: 'Yandex 2010',
            rating: '2.4',
            parent: null,
            type: null,
        },
        {
            id: 71,
            title: 'Chrome 2010',
            rating: '8.9',
            parent: null,
            type: null,
        },
        {
            id: 72,
            title: 'Mozila 2011',
            rating: '9',
            parent: null,
            type: null,
        },
        {
            id: 73,
            title: 'Light House 2011',
            rating: '4',
            parent: null,
            type: null,
        },
        {
            id: 74,
            title: 'Google Chrome 2014',
            rating: '0.2',
            parent: null,
            type: null,
        },
        {
            id: 75,
            title: 'Explorer 2015',
            rating: '5',
            parent: null,
            type: null,
        },
        {
            id: 76,
            title: 'Web engine 2016',
            rating: '6',
            parent: null,
            type: null,
        },
        {
            id: 77,
            title: 'V8 2017',
            rating: '8',
            parent: null,
            type: null,
        },
    ]

};

export const DeepInside = {
    getColumns: (): IColumn[] => ([{
        displayProperty: 'title',
        width: ''
    }]),
    getData: (): IData[] => ([
        { id: 1, title: 'Узел 1', parent: null, nodeType: true },
        { id: 11, title: 'Узел 1-1', parent: 1, nodeType: true },
        { id: 111, title: 'Узел 1-1-1', parent: 11, nodeType: true },
        { id: 1111, title: 'Лист 1-1-1-1', parent: 111, nodeType: null },
        { id: 1112, title: 'Лист 1-1-1-2', parent: 111, nodeType: null },
        { id: 1113, title: 'Лист 1-1-1-3', parent: 111, nodeType: null },
        { id: 112, title: 'Узел 1-1-2', parent: 11, nodeType: true },
        { id: 113, title: 'Узел 1-1-3', parent: 11, nodeType: true },

        { id: 12, title: 'Узел 1-2', parent: 1, nodeType: true },
        { id: 121, title: 'Узел 1-2-1', parent: 12, nodeType: true },
        { id: 1211, title: 'Лист 1-2-1-1', parent: 121, nodeType: null },
        { id: 12111, title: 'Лист 1-2-1-1-1', parent: 1211, nodeType: null },
        { id: 121111, title: 'Лист 1-2-1-1-1-1', parent: 12111, nodeType: null },
        { id: 1211111, title: 'Лист 1-2-1-1-1-1-1', parent: 121111, nodeType: null },
        { id: 2, title: 'Узел 2', parent: null, nodeType: true },
        { id: 3, title: 'Скрытый узел 3', parent: null, nodeType: false },
        { id: 4, title: 'Скрытый узел 4', parent: null, nodeType: false },
        { id: 5, title: 'Лист 5', parent: null, nodeType: null },
        { id: 6, title: 'Лист 6', parent: null, nodeType: null },
        { id: 7, title: 'Лист 7', parent: null, nodeType: null },
        { id: 8, title: 'Лист 8', parent: null, nodeType: null }
    ])
};
