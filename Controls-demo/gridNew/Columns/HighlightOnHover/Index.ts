import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Columns/HighlightOnHover/HighlightOnHover';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import {Countries} from "Controls-demo/gridNew/DemoHelpers/Data/Countries";

const columns: IColumn[] = [
    {
        displayProperty: 'number',
        width: '30px'
    },
    {
        displayProperty: 'country',
        width: '200px',
        hoverBackgroundStyle: 'transparent'
    },
    {
        displayProperty: 'capital',
        width: '100px',
        hoverBackgroundStyle: 'transparent'
    },
    {
        displayProperty: 'population',
        width: '150px'
    },
    {
        displayProperty: 'square',
        width: '100px'
    },
    {
        displayProperty: 'populationDensity',
        width: '120px'
    }
];

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _columns: IColumn[] = columns;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            // tslint:disable-next-line
            data: Countries.getData().slice(0, 5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
