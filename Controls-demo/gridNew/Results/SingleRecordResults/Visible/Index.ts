import {Control, TemplateFunction} from 'UI/Base';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import * as Template from 'wml!Controls-demo/gridNew/Results/SingleRecordResults/Visible/Visible';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = Countries.getHeader();
    protected _columns: IColumn[] = Countries.getColumnsWithWidths().map((col) => {
        switch (col.displayProperty) {
            case 'population':
                // tslint:disable-next-line
                col.result = 143420300;
                break;
            case 'square':
                // tslint:disable-next-line
                col.result = 17075200;
                break;
            case 'populationDensity':
                // tslint:disable-next-line
                col.result = 8;
                break;
        }
        return col;
    });

    protected _beforeMount(): void {
        const data = Countries.getData();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: [data[0]]
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
