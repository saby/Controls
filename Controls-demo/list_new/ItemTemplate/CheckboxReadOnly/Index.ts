import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemTemplate/CheckboxReadOnly/CheckboxReadOnly';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected checkboxReadOnly: Boolean;
    protected _selectedKeys: [] = [];
    protected _excludedKeys: [] = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
        this.checkboxReadOnly = true;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
