import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Background/Background';
import {Memory} from 'Types/source';
import 'wml!Controls-demo/gridNew/EditInPlace/Align/_cellEditor';
import {RecordSet} from 'Types/collection';
import { Editing } from 'Controls-demo/gridNew/DemoHelpers/Data/Editing';
import {IColumnRes} from "Controls-demo/gridNew/DemoHelpers/DataCatalog";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumnRes[] = Editing.getEditingAlignColumns();
    protected _items: RecordSet;

    protected _beforeMount(): void {
        const data = Editing.getEditingAlignData();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    static _styles: string[] = [
        'Controls-demo/Controls-demo',
        'Controls-demo/gridNew/EditInPlace/Background/style'
    ];
}
