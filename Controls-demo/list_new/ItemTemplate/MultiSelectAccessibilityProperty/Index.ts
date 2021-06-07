import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemTemplate/MultiSelectAccessibilityProperty/MultiSelectAccessibilityProperty';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _selectedKeys: [] = [1];
    protected _excludedKeys: [] = [];

    protected _beforeMount(): void {
        const data = getData();
        data[0].checkboxState = false;
        data[1].checkboxState = false;
        data[2].checkboxState = null;
        data[3].checkboxState = true;
        data[4].checkboxState = true;

        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
