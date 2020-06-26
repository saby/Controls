import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/Columns/TextOverflow/Ellipsis/Ellipsis';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../../DemoHelpers/DataCatalog';
import { IHeader } from 'Controls-demo/types';
import { IColumn } from 'Controls/_grid/interface/IColumn';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

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
            data: getCountriesStats().getData().slice(0, 5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
