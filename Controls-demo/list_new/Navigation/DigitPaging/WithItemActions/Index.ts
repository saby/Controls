import {Control, TemplateFunction} from 'UI/Base';
import * as Template from 'wml!Controls-demo/list_new/Navigation/DigitPaging/WithItemActions/WithItemActions';
import {Memory} from 'Types/source';
import {generateData} from '../../../DemoHelpers/DataCatalog';
import {getActionsForContacts as getItemActions} from '../../../DemoHelpers/ItemActionsCatalog';
import { IItemAction } from 'Controls/itemActions';

interface IItem {
    title: string;
    id: number | string;
}

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    protected _itemActions: IItemAction[] = getItemActions();
    private _dataArray: unknown = generateData({
        count: 100,
        beforeCreateItemCallback: (item: IItem) => {
            item.title = `Запись с идентификатором ${item.id} и каким то не очень длинным текстом`;
        }
    });

    protected _beforeMount(): void {
        this._viewSource = new Memory({
            keyProperty: 'id',
            data: this._dataArray
        });
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
