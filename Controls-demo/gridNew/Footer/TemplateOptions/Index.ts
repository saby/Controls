// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/gridNew/Footer/TemplateOptions/Index';
import 'wml!Controls-demo/gridNew/Footer/TemplateOptions/FooterCellTemplate';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import {Control, TemplateFunction} from 'UI/Base';
import { IColumn } from 'Controls/grid';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithoutWidths().slice(0, 4);
    protected _footerCfg: unknown[] = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getCountriesStats().getData().slice(0, 7)
        });

        this._columns.forEach((c, index) => {
            this._footerCfg.push({
                template: 'wml!Controls-demo/gridNew/Footer/TemplateOptions/FooterCellTemplate',
                templateOptions: {
                    myVar: index
                }
            });
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
