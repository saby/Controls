// tslint:disable-next-line:ban-ts-ignore
// @ts-ignore
import * as Template from 'wml!Controls-demo/gridNew/Footer/TemplateOptions/Index';
import 'wml!Controls-demo/gridNew/Footer/TemplateOptions/FooterCellTemplate';
import {Control, TemplateFunction} from 'UI/Base';
import { IColumn } from 'Controls/grid';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';
import {Memory} from 'Types/source';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumns().slice(0, 4);
    protected _footerCfg: unknown[] = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Countries.getData().slice(0, 7)
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
