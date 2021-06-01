import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/AutoAddOnMount/AutoAddOnMount';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';
import { IEditingConfig } from 'Controls/display';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _emptyViewSource: Memory;

    protected _editingConfig: IEditingConfig = null;

    protected _beforeMount(): Promise<void> {

        this._emptyViewSource = new Memory({
            keyProperty: 'key',
            data: []
        });

        this._viewSource = new Memory({
            keyProperty: 'key',
            data: getData().slice(0, 3)
        });

        return this._viewSource.read(1).then((record) => {
            this._editingConfig = {
                autoAddOnInit: true,
                toolbarVisibility: true,
                item: record,
                editOnClick: true
            };
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
