import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGrid/Expander/ExpanderPosition/RightWithColumnTemplate/RightWithColumnTemplate';
import * as CntTpl from 'wml!Controls-demo/treeGrid/Expander/ExpanderPosition/RightWithColumnTemplate/content';
import {Memory} from 'Types/source';
import {Gadgets} from '../../../DemoHelpers/DataCatalog';
import {IColumn} from 'Controls/grid';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
        this._columns = [
            {
                displayProperty: 'title',
                template: CntTpl,
                width: ''
            },
            {
                displayProperty: 'rating',
                width: ''
            },
            {
                displayProperty: 'country',
                width: ''
            }
        ];
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
