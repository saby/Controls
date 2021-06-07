import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Base/Base';
import {Memory} from 'Types/source';
import {getPorts} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getPorts().getColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getPorts().getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
