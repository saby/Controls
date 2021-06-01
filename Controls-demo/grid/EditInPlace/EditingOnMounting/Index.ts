import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/EditInPlace/EditingOnMounting/EditingOnMounting';
import {Memory} from 'Types/source';
import {getCountriesStats} from '../../DemoHelpers/DataCatalog';
import { IColumn } from 'Controls/grid';
import {IEditingConfig} from 'Controls/display';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getCountriesStats().getColumnsWithoutWidths();
    protected _editingConfig: IEditingConfig = null;

    protected _beforeMount(): Promise<void> {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: []
        });Controls-demo/treeGrid/LoadMore/Index.ts

        return this._viewSource.create().then((record) => {
            this._editingConfig = {
                toolbarVisibility: true,
                item: record,
                editOnClick: true
            };
        });
    }
    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
