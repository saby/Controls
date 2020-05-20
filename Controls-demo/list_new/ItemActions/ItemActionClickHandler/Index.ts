import {Control, TemplateFunction} from "UI/Base"
import * as Template from "wml!Controls-demo/list_new/ItemActions/ItemActionClickHandler/ItemActionClickHandler"
import {Memory} from "Types/source"
import {Model} from "Types/entity"
import {getContactsCatalog as getData} from "../../DemoHelpers/DataCatalog"
import {getActionsForContacts as getItemActions} from "../../DemoHelpers/ItemActionsCatalog"
import {SyntheticEvent} from "Vdom/Vdom";

export default class extends Control {
    protected _template: TemplateFunction = Template;
    protected _viewSource: Memory;
    private _itemActions = getItemActions();
    protected _clickedMessage: string;

    protected _beforeMount() {
        this._itemActions[0].handler = (item: Model): void => {
            this._clickedMessage = `У операции "Прочитано" отдельный обработчик. Элемент с id=${item.getId()}.`;
        };

        this._viewSource = new Memory({
            keyProperty: 'id',
            data: getData()
        });
    }

    protected _actionClick(e: SyntheticEvent<null>, itemAction, item: Model): void {
        this._clickedMessage = `Кликнули на операцию "${itemAction.title}" у элемента с id="${item.getId()}".`;
    }

    protected _clearMessage(): void {
        this._clickedMessage = '';
    }

    static _styles: string[] = ['Controls-demo/Controls-demo'];
}
