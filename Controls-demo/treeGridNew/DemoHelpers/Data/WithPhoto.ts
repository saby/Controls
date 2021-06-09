import * as explorerImages from 'Controls-demo/Explorer/ExplorerImagesLayout';
import {IData} from "Controls-demo/treeGridNew/DemoHelpers/Interface";
import {IColumn} from "Controls/_grid/display/interface/IColumn";
import * as CntTpl from 'wml!Controls-demo/treeGridNew/ItemTemplate/WithPhoto/content';
import * as CntTwoLvlTpl from 'wml!Controls-demo/treeGridNew/ItemTemplate/WithPhoto/contentTwoLvl';

export const WithPhoto = {
    getDataTwoLvl(): IData[] {
        return [
            {
                key: 1, title: 'Apple', Раздел: null, 'Раздел@': true, photo: explorerImages[1], rating: '9.5',
                country: 'Южная Корея'
            },
            {
                key: 2, title: 'Samsung', Раздел: null, 'Раздел@': true, photo: explorerImages[1], rating: '9.5',
                country: 'Южная Корея'
            },
            {
                key: 3, title: 'Asus', Раздел: null, 'Раздел@': true, photo: explorerImages[1], rating: '9.5',
                country: 'Южная Корея'
            },
            {
                key: 11, title: 'Asus', Раздел: 1, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                key: 12, title: 'Apple', Раздел: 1, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                key: 13, title: 'Samsung', Раздел: 1, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                key: 21, title: 'Apple', Раздел: 2, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                key: 22, title: 'SamsungApple', Раздел: 2, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                key: 23, title: 'Samsung 2', Раздел: 3, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                key: 31, title: 'Samsung', Раздел: 3, 'Раздел@': null, photo: null, rating: '9.5',
                country: 'Южная Корея'
            },
            {
                key: 32, title: 'Samsung', Раздел: 3, 'Раздел@': null, photo: null, rating: '9.5',
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
