import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Validation/Validation';
import {Memory} from 'Types/source';
import 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorEmail';
import 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorLength';
import 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorRequired';
import 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorTitle';
import {LengthChecker, ChangedChecker} from './Custom';
import {getMoreActions} from 'Controls-demo/list_new/DemoHelpers/ItemActionsCatalog';
import { IColumn } from 'Controls/grid';
import { IHeaderCell } from 'Controls/grid';
import { TItemsReadyCallback } from 'Controls-demo/types';
import {RecordSet} from 'Types/collection';
import { IItemAction } from 'Controls/itemActions';
import { Editing } from 'Controls-demo/gridNew/DemoHelpers/Data/Editing';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = Editing.getEditingColumnsValidation();
    protected _header: IHeaderCell[] = Editing.getEditingHeaderValidations();
    protected _markedKey: number;
    protected _dataLoadCallback: TItemsReadyCallback = this._dataCallback.bind(this);
    protected _items: RecordSet;
    protected _itemActions: IItemAction[] = [...getMoreActions()];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'key',
            data: Editing.getEditingValidationData()
        });
    }

    private _dataCallback(items: RecordSet): void {
        this._items = items;
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}

export {
    LengthChecker,
    ChangedChecker
};
