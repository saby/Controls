import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Header/Align/Align';
import {Memory} from 'Types/source';
import { IHeaderCell } from 'Controls/grid';
import { IColumn } from 'Controls/grid';
import {Countries} from "Controls-demo/gridNew/DemoHelpers/Data/Countries";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = [
        {
            title: '# (default)'
        },
        {
            title: 'Страна (left)',
            align: 'left'
        },
        {
            title: 'Столица (center)',
            align: 'center'
        },
        {
            title: 'Население (right)',
            align: 'right'
        }
    ];
    protected _columns: IColumn[] = [
        {
            displayProperty: 'number',
            width: '100px'
        },
        {
            displayProperty: 'country',
            width: '200px'
        },
        {
            displayProperty: 'capital',
            width: '150px',
            compatibleWidth: '98px'
        },
        {
            displayProperty: 'population',
            width: '150px',
            compatibleWidth: '118px'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData().slice(0, 5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
