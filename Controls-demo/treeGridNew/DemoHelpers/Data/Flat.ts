import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';

export const Flat = {
    getData: () => [
        {
            key: 1,
            title: 'Apple',
            country: 'США',
            rating: '8.5',
            parent: null,
            type: true,
            hasChild: true,
            photo: explorerImages[0]
        },
        {
            key: 11,
            title: 'Smartphones1',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true,
            photo: explorerImages[1]
        },
        {
            key: 12,
            title: 'Smartphones2',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true,
            photo: explorerImages[1]
        },
        {
            key: 13,
            title: 'Smartphones3',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true,
            photo: explorerImages[0]
        },
        {
            key: 14,
            title: 'Smartphones4',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true,
            photo: explorerImages[0]
        },
        {
            key: 15,
            title: 'Smartphones5',
            parent: 1,
            rating: '9.2',
            type: true,
            hasChild: true,
            photo: explorerImages[0]
        },
        {
            key: 151,
            title: 'iPhone 4s',
            rating: '9.5',
            parent: 15,
            type: null
        },
        {
            key: 152,
            title: 'iPhone 4',
            rating: '8.9',
            parent: 15,
            type: null
        },
        {
            key: 153,
            title: 'iPhone X Series',
            rating: '7.6',
            parent: 15,
            type: false
        },
        {
            key: 1531,
            title: 'iPhone Xs',
            rating: '7.4',
            parent: 153,
            type: null
        },
        {
            key: 1532,
            title: 'iPhone Xs Max',
            rating: '6.8',
            parent: 153,
            type: null
        },
        {
            key: 1533,
            title: 'iPhone XR',
            rating: '7.1',
            parent: 153,
            type: null
        },
        {
            key: 16,
            title: 'Notebooks',
            parent: 1,
            rating: '9.4',
            type: false
        },
        {
            key: 161,
            title: 'MacBook Pro',
            rating: '7.2',
            modelId: 'MacBookPro15,4',
            size: '13 дюймов',
            year: '2019',
            note: '2 порта Thunderbolt 3',
            parent: 16,
            type: null,
            photo: explorerImages[3]
        },
        {
            key: 162,
            title: 'MacBook Pro',
            modelId: 'MacBookPro15,3',
            rating: '6.9',
            size: '15 дюймов',
            year: '2019',
            note: '',
            parent: 16,
            type: null,
            photo: explorerImages[3]
        },
        {
            key: 163,
            title: 'MacBook Pro',
            modelId: 'MacBookPro15,2',
            size: '13 дюймов',
            rating: '9.1',
            year: '2019',
            note: '4 порта Thunderbolt 3',
            parent: 16,
            type: null,
            photo: explorerImages[3]
        },
        {
            key: 164,
            title: 'MacBook Pro',
            modelId: 'MacBookPro14,3',
            rating: '8.8',
            size: '15 дюймов',
            year: '2017',
            note: '',
            parent: 16,
            type: null,
            photo: explorerImages[3]
        },
        {
            key: 165,
            title: 'MacBook Pro',
            modelId: 'MacBookPro14,2',
            size: '13 дюймов',
            rating: '8.5',
            year: '2017',
            note: '4 порта Thunderbolt 3',
            parent: 16,
            type: null,
            photo: explorerImages[3]
        },
        {
            key: 17,
            title: 'Magic Mouse 2',
            modelId: 'MM16',
            rating: '7.2',
            year: '2016',
            parent: 1,
            type: null
        },
        {
            key: 2,
            title: 'Samsung',
            country: 'Южная Корея',
            rating: '8.0',
            parent: null,
            type: true,
            hasChild: true,
            photo: explorerImages[0]
        },
        {
            key: 21,
            title: 'Samusng A10',
            rating: '9.5',
            parent: 2,
            type: null
        },
        {
            key: 22,
            title: 'Samsung A20',
            rating: '9.5',
            parent: 2,
            type: null
        },
        {
            key: 23,
            title: 'Samsung A30',
            rating: '9.5',
            parent: 2,
            type: null
        },
        {
            key: 24,
            title: 'Samsung A40',
            rating: '9.5',
            parent: 2,
            type: null
        },
        {
            key: 3,
            title: 'Meizu',
            rating: '7.5',
            country: 'КНР',
            parent: null,
            type: true,
            photo: explorerImages[0]
        },
        {
            key: 4,
            title: 'Asus',
            rating: '7.3',
            country: 'Тайвань',
            parent: null,
            type: false,
            photo: explorerImages[0]
        },
        {
            key: 5,
            title: 'Acer',
            rating: '7.1',
            country: 'Тайвань',
            parent: null,
            type: false,
            photo: explorerImages[1]
        }
    ],
    getHeader: () => [
        {
            title: 'Наименование'
        },
        {
            title: 'Рейтинг покупателей'
        },
        {
            title: 'Страна производитель'
        }
    ],
    getColumns: () => [
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
    ],
    getResults: () => {
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
            partial: [23415.454, 56151, 57774]
        };
    }
}
