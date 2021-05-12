import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Decorators/Decorators';
import {Memory} from 'Types/source';
import {getEditing} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _header: IHeaderCell[] = getEditing().getDecoratedEditingHeader();
    protected _columns: IColumn[] = getEditing().getDecoratedEditingColumns();

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getEditing().getDecoratedEditingData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
