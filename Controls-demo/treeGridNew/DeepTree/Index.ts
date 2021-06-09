import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/DeepTree/DeepTree';
import {CrudEntityKey, Memory} from 'Types/source';
import * as elipsisTpl from 'wml!Controls-demo/treeGridNew/DeepTree/elipsisTpl';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = [
        {
            displayProperty: 'title',
            width: '200px',
            template: elipsisTpl
        },
        {
            displayProperty: 'rating',
            width: '150px',
            template: elipsisTpl
        },
        {
            displayProperty: 'country',
            width: '150px',
            template: elipsisTpl
        }
    ];
    // tslint:disable-next-line
    protected _expandedItems: CrudEntityKey[] = [1, 11, 111, 1111, 11111, 111111, 2, 22, 222, 2222];

    protected _beforeMount(): void {
        const data = [
            {
                key: 1, title: 'Node', Раздел: null, 'Раздел@': true, Раздел$: null, hasChild: true, rating: 1, country: 'Russia'
            },
            {
                key: 11, title: 'Node2', Раздел: 1, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia'
            },
            {
                key: 111, title: 'Node3', Раздел: 11, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia'
            },
            {
                key: 1111, title: 'Node4', Раздел: 111, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia'
            },
            {
                key: 11111, title: 'Node5', Раздел: 1111, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia'
            },
            {
                key: 111111, title: 'Node6', Раздел: 11111, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia'
            },
            {
                key: 2, title: 'Node7', Раздел: 111111, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia'
            },
            {
                key: 22, title: 'Node8', Раздел: 2, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia'
            },
            {
                key: 222, title: 'Node9', Раздел: 22, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia'
            },
            {
                key: 2222, title: 'Node10', Раздел: 222, 'Раздел@': true, Раздел$: null, rating: 1, country: 'Russia'
            }
        ];
        this._viewSource = new Memory({
            keyProperty: 'key',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
