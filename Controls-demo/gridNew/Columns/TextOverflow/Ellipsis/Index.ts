import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Columns/TextOverflow/Ellipsis/Ellipsis';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IHeader } from 'Controls-demo/types';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    // tslint:disable-next-line
    protected _header: IHeader[] = getCountriesStats().getDefaultHeader().slice(1, 4);
    protected _columns: IColumn[] = [
        {
            displayProperty: 'country',
            width: '100px',
            textOverflow: 'ellipsis'
        },
        {
            displayProperty: 'capital',
            width: '200px'
        },
        {
            displayProperty: 'population',
            width: '200px'
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            // tslint:disable-next-line
            data: getCountriesStats().getLongCapitalData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
