import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/Header/Valign/Valign';
import * as HeaderCellTemplate from 'wml!Controls-demo/gridNew/Header/Valign/HeaderCell';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IHeaderCell } from 'Controls/grid';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = [
        {
            title: '# (default)',
            template: HeaderCellTemplate
        },
        {
            title: 'Страна (top)',
            valign: 'top'
        },
        {
            title: 'Столица (center)',
            valign: 'center'
        },
        {
            title: 'Население (bottom)',
            valign: 'bottom'
        },
        {
            title: 'Население (baseline)',
            valign: 'baseline'
        }
    ];
    protected _columns: IColumn[] = [
        {
            displayProperty: 'number',
            width: '80px'
        },
        {
            displayProperty: 'country',
            width: '200px'
        },
        {
            displayProperty: 'capital',
            width: 'max-content',
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
        }
    ];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: getCountriesStats().getData().slice(0, 5)
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
