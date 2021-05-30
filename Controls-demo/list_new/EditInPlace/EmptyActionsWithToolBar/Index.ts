import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/EmptyActionsWithToolBar/EmptyActionsWithToolBar';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';
import {IEditingConfig} from 'Controls/display';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    protected _editingConfig: IEditingConfig = null;
    private _newData: unknown = getData().slice(0, 1);
    protected _beforeMount(): Promise<void> {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._newData
        });
        return this._viewSource.read(1).then((res) => {
            this._editingConfig = {
                toolbarVisibility: true,
                item: res,
                editOnClick: true
            };
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
