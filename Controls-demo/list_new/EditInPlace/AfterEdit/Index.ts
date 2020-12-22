import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/EditInPlace/AfterEdit/AfterEdit';
import {Memory} from 'Types/source';
import {Model} from 'Types/entity';
import {getEditableCatalog as getData} from '../../DemoHelpers/DataCatalog';
import {SyntheticEvent} from 'Vdom/Vdom';
import {editing as constEditing} from 'Controls/list';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _isShowAddButton: Boolean;

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
        this._isShowAddButton = true;
    }

    // tslint:disable-next-line
    protected _afterBeginEdit(e: SyntheticEvent<null>, {item}: { item: Model }, isAdd: boolean): void {
        this._isShowAddButton = false;
    }

    protected _afterEndEdit(e: SyntheticEvent<null>, {item}: { item: Model }, isAdd: boolean): void {
        this._isShowAddButton = true;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
