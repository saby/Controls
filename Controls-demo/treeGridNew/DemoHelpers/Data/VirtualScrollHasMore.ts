import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';

import {IData} from "Controls-demo/treeGridNew/DemoHelpers/Interface";
import {IColumn} from "Controls/grid";

export const VirtualScrollHasMore = {
    // 70 записей. У первой записи 100 детей.
    getData: (): Array<{
        key: number,
        title: string,
        parent: number | null,
        type: boolean | null
    }> => {
        const result = [];
        const itemsCount = 70;

        result[0] = {
            key: 0,
            title: `Запись первого уровня с id = ${0}. Много дочерних элементов.`,
            parent: null,
            type: true
        };

        for (let i = 1; i < itemsCount; i++) {
            result.push(
                {
                    key: i,
                    title: `Запись первого уровня с id = ${i}. Без детей.`,
                    parent: null,
                    type: true
                },
                {
                    key: itemsCount + i,
                    title: `Запись второго уровня с id = ${itemsCount + i}`,
                    parent: 0,
                    type: null
                },
                {   // tslint:disable-next-line
                    id: itemsCount + (2 * i),
                    // tslint:disable-next-line
                    title: `Запись второго уровня с id = ${itemsCount + itemsCount + (2 * i)}`,
                    parent: 0,
                    type: null
                }
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
            type: null
        },
        {
            id: 101,
            title: 'Iphone 2 default',
            parent: 11,
            rating: '9.2',
            type: null
        },
        {
            id: 12,
            title: 'Iphone 3',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true
        },
        {
            id: 103,
            title: 'Iphone 3 pro',
            parent: 12,
            rating: '9.2',
            type: null
        },
        {
            id: 104,
            title: 'Iphone 3 default',
            parent: 12,
            rating: '9.2',
            type: null
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
            type: true
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
            type: true
        },
        {
            id: 6,
            title: 'iPhone X Series',
            rating: '7.6',
            parent: null,
            type: true
        },
        {
            id: 7,
            title: 'iPhone 6s',
            rating: '7.4',
            parent: null,
            type: true
        },
        {
            id: 8,
            title: 'iPhone Xs Max',
            rating: '6.8',
            parent: null,
            type: true
        },
        {
            id: 9,
            title: 'iPhone XR',
            rating: '7.1',
            parent: 6,
            type: true
        },
        {
            id: 10,
            title: 'Notebooks',
            parent: null,
            rating: '9.4',
            type: true
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
            type: true
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
            type: true
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
            type: null
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
            type: null
        },
        {
            id: 24,
            title: 'Samsung 2',
            rating: '9.5',
            parent: 17,
            type: null
        },
        {
            id: 25,
            title: 'Samsung 3',
            rating: '9.5',
            parent: 17,
            type: null
        },
        {
            id: 26,
            title: 'Samsung 4',
            rating: '9.5',
            parent: 17,
            type: null
        },
        {
            id: 30,
            title: 'iPhone 2009',
            rating: '9.5',
            parent: 3,
            hasChild: true,
            type: true
        },
        {
            id: 31,
            title: 'iPhone 2010',
            rating: '8.9',
            parent: 3,
            hasChild: true,
            type: true
        },
        {
            id: 32,
            title: 'iPhone 2011',
            rating: '9.5',
            parent: 3,
            hasChild: true,
            type: true
        },
        {
            id: 33,
            title: 'iPhone 2012',
            rating: '8.9',
            parent: 3,
            hasChild: true,
            type: true
        },
        {
            id: 34,
            title: 'iPhone 2013',
            rating: '9.5',
            parent: 3,
            hasChild: true,
            type: true
        },
        {
            id: 35,
            title: 'iPhone 2014',
            rating: '8.9',
            parent: 3,
            hasChild: true,
            type: true
        },
        {
            id: 36,
            title: 'iPhone 2015',
            rating: '9.5',
            parent: 3,
            hasChild: true,
            type: true
        },
        {
            id: 37,
            title: 'iPhone 2016',
            rating: '8.9',
            parent: 3,
            hasChild: true,
            type: true
        },
        {
            id: 38,
            title: 'iPhone 2017',
            rating: '9.5',
            parent: 3,
            hasChild: true,
            type: true
        },
        {
            id: 39,
            title: 'iPhone 2010',
            rating: '8.9',
            parent: 4,
            hasChild: true,
            type: true
        },
        {
            id: 40,
            title: 'Galaxy 2011',
            rating: '8.9',
            parent: 4,
            hasChild: true,
            type: true
        },
        {
            id: 41,
            title: 'Smthy 2012',
            rating: '8.9',
            parent: 4,
            hasChild: true,
            type: true
        },
        {
            id: 42,
            title: 'Eho 2013',
            rating: '8.9',
            parent: 4,
            hasChild: true,
            type: true
        },
        {
            id: 43,
            title: 'Charger 2014',
            rating: '8.9',
            parent: 4,
            hasChild: true,
            type: true
        },
        {
            id: 44,
            title: 'Phone 2000',
            rating: '8.9',
            parent: null,
            type: null
        },
        {
            id: 45,
            title: 'Asus 2001',
            rating: '3',
            parent: null,
            type: null
        },
        {
            id: 46,
            title: 'Aser 2002',
            rating: '2',
            parent: null,
            type: null
        },
        {
            id: 47,
            title: 'Iphone 2003',
            rating: '2',
            parent: null,
            type: null
        },
        {
            id: 48,
            title: 'Samsung 2004',
            rating: '3.6',
            parent: null,
            type: null
        },
        {
            id: 49,
            title: 'Note 2005',
            rating: '8.9',
            parent: null,
            type: null
        },
        {
            id: 50,
            title: 'Del 2006',
            rating: '8.9',
            parent: null,
            type: null
        },
        {
            id: 51,
            title: 'Hp 2007',
            rating: '9.6',
            parent: null,
            type: null
        },
        {
            id: 52,
            title: 'Cristal 2008',
            rating: '3.1',
            parent: null,
            type: null
        },
        {
            id: 53,
            title: 'Phone 2009',
            rating: '2.4',
            parent: null,
            type: null
        },
        {
            id: 54,
            title: 'Balalaika 2010',
            rating: '8.9',
            parent: null,
            type: null
        },
        {
            id: 55,
            title: 'Elements 2011',
            rating: '9',
            parent: null,
            type: null
        },
        {
            id: 56,
            title: 'Light House 2012',
            rating: '4',
            parent: null,
            type: null
        },
        {
            id: 57,
            title: 'Google Chrome',
            rating: '0.2',
            parent: null,
            type: null
        },
        {
            id: 58,
            title: 'Explorer',
            rating: '5',
            parent: null,
            type: null
        },
        {
            id: 59,
            title: 'Spider Monky',
            rating: '6',
            parent: null,
            type: null
        },
        {
            id: 60,
            title: 'V8',
            rating: '8',
            parent: null,
            type: null
        },
        {
            id: 61,
            title: 'IE 2001',
            rating: '8.9',
            parent: null,
            type: null
        },
        {
            id: 62,
            title: 'IE 2002',
            rating: '3',
            parent: null,
            type: null
        },
        {
            id: 63,
            title: 'IE 2003',
            rating: '2',
            parent: null,
            type: null
        },
        {
            id: 64,
            title: 'IE 2004',
            rating: '2',
            parent: null,
            type: null
        },
        {
            id: 65,
            title: 'IE 2005',
            rating: '3.6',
            parent: null,
            type: null
        },
        {
            id: 66,
            title: 'Chrome 2006',
            rating: '8.9',
            parent: null,
            type: null
        },
        {
            id: 67,
            title: 'Mozila 2007',
            rating: '8.9',
            parent: null,
            type: null
        },
        {
            id: 68,
            title: 'Mozila 2008',
            rating: '9.6',
            parent: null,
            type: null
        },
        {
            id: 69,
            title: 'Chrome 2009',
            rating: '3.1',
            parent: null,
            type: null
        },
        {
            id: 70,
            title: 'Yandex 2010',
            rating: '2.4',
            parent: null,
            type: null
        },
        {
            id: 71,
            title: 'Chrome 2010',
            rating: '8.9',
            parent: null,
            type: null
        },
        {
            id: 72,
            title: 'Mozila 2011',
            rating: '9',
            parent: null,
            type: null
        },
        {
            id: 73,
            title: 'Light House 2011',
            rating: '4',
            parent: null,
            type: null
        },
        {
            id: 74,
            title: 'Google Chrome 2014',
            rating: '0.2',
            parent: null,
            type: null
        },
        {
            id: 75,
            title: 'Explorer 2015',
            rating: '5',
            parent: null,
            type: null
        },
        {
            id: 76,
            title: 'Web engine 2016',
            rating: '6',
            parent: null,
            type: null
        },
        {
            id: 77,
            title: 'V8 2017',
            rating: '8',
            parent: null,
            type: null
        }
    ]
};
