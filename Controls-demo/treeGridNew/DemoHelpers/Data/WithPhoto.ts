import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import {IData} from "Controls-demo/treeGridNew/DemoHelpers/Interface";
import {IColumn} from "Controls/_grid/display/interface/IColumn";
import * as CntTpl from 'wml!Controls-demo/treeGridNew/ItemTemplate/WithPhoto/content';
import * as CntTwoLvlTpl from 'wml!Controls-demo/treeGridNew/ItemTemplate/WithPhoto/contentTwoLvl';

export const WithPhoto = {
    getDataTwoLvl(): IData[] {
        return [
            {
                id: 1, title: 'Apple', Раздел: null, 'Раздел@': true, photo: explorerImages[1], rating: '9.5',
                country: 'Южная Корея'
            },
            {
                id: 2, title: 'Samsung', Раздел: null, 'Раздел@': true, photo: explorerImages[1], rating: '9.5',
                country: 'Южная Корея'
            },
            {
                id: 3, title: 'Asus', Раздел: null, 'Раздел@': true, photo: explorerImages[1], rating: '9.5',
                country: 'Южная Корея'
            },
            {
                id: 11, title: 'Asus', Раздел: 1, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                id: 12, title: 'Apple', Раздел: 1, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                id: 13, title: 'Samsung', Раздел: 1, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                id: 21, title: 'Apple', Раздел: 2, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                id: 22, title: 'SamsungApple', Раздел: 2, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                id: 23, title: 'Samsung 2', Раздел: 3, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                id: 31, title: 'Samsung', Раздел: 3, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                id: 32, title: 'Samsung', Раздел: 3, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
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
        ];
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
        ];
    },
}
