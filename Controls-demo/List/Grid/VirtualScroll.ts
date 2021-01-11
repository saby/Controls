import {Control} from 'UI/Base';
import template = require('wml!Controls-demo/List/Grid/resources/VirtualScroll/VirtualScroll')
import {getGridData} from "./../Utils/listDataGenerator"
import {Memory} from 'Types/source'



class GridVirtualScroll extends Control {
    protected _template: Function = template;
    protected _viewSource: Memory;
    protected _columns = [
        {
            displayProperty: 'idName',
            width: 'auto'
        },
        {
            displayProperty: 'id',
            width: 'auto'
        },
        {
            displayProperty: 'title',
            width: 'auto'
        },
        {
            displayProperty: 'text',
            width: '1fr'
        }
    ];

    protected _beforeMount() {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: dataArray
        });
    }

    protected afterMount() {
        this._children.gridOne.reload();
    }



    static _styles: string[] = ['Controls-demo/List/Grid/resources/VirtualScroll/VirtualScroll'];
}

let dataArray = getGridData(1000, {
    idName: 'id: ',
    title: 'Заголовок',
    text: {
        type: 'string',
        randomData: true
    },
});


export = GridVirtualScroll;

