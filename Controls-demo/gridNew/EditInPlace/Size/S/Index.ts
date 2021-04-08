import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/grid/EditInPlace/Size/S/S';
import {Memory} from 'Types/source';
import {getEditing, IColumnRes} from '../../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/grid/EditInPlace/Size/S/_cellEditor';
import {RecordSet} from 'Types/collection';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumnRes[] = getEditing().getEditingSizeColumns('S');
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
