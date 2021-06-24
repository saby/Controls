import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/ItemActions/ItemActionsParent/ItemActionsParent';
import {Memory} from 'Types/source';
import { IItemAction } from 'Controls/itemActions';
import {getContactsCatalog} from '../../DemoHelpers/DataCatalog';
import {showType} from 'Controls/toolbars';

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[];

    protected _beforeMount(): void {
        this._itemActions = [
            {
                id: 1,
                title: 'Show',
                showType: showType.MENU,
                parent: null,
                'parent@': false
            },
            {
                id: 2,
                title: 'Edit',
                showType: showType.MENU,
                parent: null,
                'parent@': true
            },
            {
                id: 3,
                title: 'Edit description',
                showType: showType.MENU,
                parent: 2,
                'parent@': null
            }
        ];
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getContactsCatalog()
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
