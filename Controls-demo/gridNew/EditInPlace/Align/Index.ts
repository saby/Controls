import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Align/Align';
import {Memory} from 'Types/source';
import {getEditing, IColumnRes} from '../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/gridNew/EditInPlace/Align/_cellEditor';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumnRes[] = getEditing().getEditingAlignColumns();
    protected _items: RecordSet;

    protected _beforeMount(): void {
        const data = getEditing().getEditingAlignData();
        this._viewSource = new Memory({
            keyProperty: 'id',
            data
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
