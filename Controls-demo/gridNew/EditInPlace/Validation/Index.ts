import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/gridNew/EditInPlace/Validation/Validation';
import {Memory} from 'Types/source';
import {getEditing} from '../../DemoHelpers/DataCatalog';
import 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditor';
import 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorDate';
import 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorRequired';
import 'wml!Controls-demo/gridNew/EditInPlace/Validation/_cellEditorTitle';
import {LengthChecker, ChangedChecker} from './Custom';
import {getMoreActions} from '../../../list_new/DemoHelpers/ItemActionsCatalog';
import { IColumn } from 'Controls/grid';
import { IHeader, TItemsReadyCallback } from 'Controls-demo/types';
import {RecordSet} from 'Types/collection';
import { IItemAction } from 'Controls/itemActions';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _columns: IColumn[] = getEditing().getEditingColumnsValidation();
    protected _header: IHeader[] = getEditing().getEditingHeaderValidations();
    protected _markedKey: number;
    protected _dataLoadCallback: TItemsReadyCallback = this._dataCallback.bind(this);
    protected _items: RecordSet;
    protected _itemActions: IItemAction[] = [...getMoreActions()];

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getEditing().getEditingValidationData()
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
