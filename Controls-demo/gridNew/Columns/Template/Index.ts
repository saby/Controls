import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Columns/Template/Template';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import * as countryRatingNumber from 'wml!Controls-demo/gridNew/resources/CellTemplates/CountryRatingNumber';
import {Countries} from "Controls-demo/gridNew/DemoHelpers/Data/Countries";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;

    protected _columns: IColumn[] = [
        {
            displayProperty: 'number',
            width: 'max-content',
            compatibleWidth: '44px',
            template: countryRatingNumber
        },
        {
            displayProperty: 'country',
            width: '300px'
        },
        {
            displayProperty: 'capital',
            width: '100px'
        },
        {
            displayProperty: 'population',
            width: '150px'
        },
        {
            displayProperty: 'square',
            width: '150px'
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
            // tslint:disable-next-line
            data: Countries.getData().slice(0, 5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
