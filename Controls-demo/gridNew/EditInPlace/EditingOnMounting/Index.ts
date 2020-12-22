import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/EditingOnMounting/EditingOnMounting';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithoutWidths();
    protected _editingConfig: object = null;

    protected _beforeMount(): Promise<void> {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: []
        });

        return this._viewSource.create().then((res) => {
            this._editingConfig = {
                toolbarVisibility: true,
                item: res,
                editOnClick: true
            };
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
