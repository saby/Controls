import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemTemplate/MultiSelectAccessibilityProperty/MultiSelectAccessibilityProperty';
import {Memory} from 'Types/source';
import {getFewCategories as getData} from '../../DemoHelpers/DataCatalog';
import {MultiSelectAccessibility} from 'Controls/display';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _selectedKeys: [] = [1];
    protected _excludedKeys: [] = [];

    protected _beforeMount(): void {
        const data = getData();
        data[0].checkboxState = MultiSelectAccessibility.disabled;
        data[1].checkboxState = MultiSelectAccessibility.disabled;
        data[2].checkboxState = MultiSelectAccessibility.hidden;
        data[3].checkboxState = MultiSelectAccessibility.enabled;
        data[4].checkboxState = MultiSelectAccessibility.enabled;

        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
