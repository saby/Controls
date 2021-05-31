import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/CrossbrowserCellWidth/CrossbrowserCellWidth';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { getCountriesStats } from 'Controls-demo/gridNew/DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = [
        {
            displayProperty: 'number',
            width: '40px'
        },
        {
            displayProperty: 'country',
            width: '2fr'
        },
        {
            displayProperty: 'capital',
            width: '1fr',
            compatibleWidth: '98px'
        },
        {
            displayProperty: 'population',
            width: 'max-content',
            compatibleWidth: '118px'
        },
        {
            displayProperty: 'square',
            width: 'max-content',
            compatibleWidth: '156px'
        },
        {
            displayProperty: 'populationDensity',
            width: 'max-content',
            compatibleWidth: '60px'
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
