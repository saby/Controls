import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/EditingOnMounting/EditingOnMounting';
import * as EditingTemplate from 'wml!Controls-demo/gridNew/EditInPlace/EditingOnMounting/EditingTemplate';
import {Memory} from 'Types/source';
import { IColumn } from 'Controls/grid';
import { TColspanCallbackResult } from 'Controls/display';
import { Countries } from 'Controls-demo/gridNew/DemoHelpers/Data/Countries';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Countries.getColumns();
    protected _editingConfig: object = null;

    protected _colspanCallback(item, column, columnIndex, isEditing): TColspanCallbackResult {
        return isEditing ? 'end' : undefined;
    }

    protected _beforeMount(): Promise<void> {
        this._columns[0].template = EditingTemplate;
        this._viewSource = new Memory({
            keyProperty: 'key',
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
