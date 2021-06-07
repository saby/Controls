import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/MultiSelect/CustomPosition/CustomPosition';
import {Memory} from 'Types/source';
import {Gadgets} from '../../DemoHelpers/DataCatalog';
import * as cellTemplate from 'wml!Controls-demo/treeGridNew/MultiSelect/CustomPosition/CellTemplate';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    private _viewSource: Memory;
    private _columns = [
        { displayProperty: 'title', width: '200px', template: cellTemplate },
        { displayProperty: 'country', width: '200px' }
    ];
    private _selectedKeys = [];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: Gadgets.getFlatData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
