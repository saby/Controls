import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/treeGridNew/MultiSelect/CustomPosition/CustomPosition';
import {Memory} from 'Types/source';
import * as cellTemplate from 'wml!Controls-demo/treeGridNew/MultiSelect/CustomPosition/CellTemplate';
import {Flat} from "Controls-demo/treeGridNew/DemoHelpers/Data/Flat";

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
            data: Flat.getData()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
