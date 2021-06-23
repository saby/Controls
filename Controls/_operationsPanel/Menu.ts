import {Control, TemlateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_operationsPanel/Menu/Menu';
import {Memory} from 'Types/source';
import Store from 'Controls/Store';
import {Button} from 'Controls/dropdown'
import {object} from 'Types/util';
import 'css!Controls/operationsPanel';

interface IOperation {
    id: string;
    title: string;
    icon: string;
    iconStyle: string;
    activateHandler: string;
}

const DEFAULT_OPERATIONS: IOperation[] = [{
    id: 'toggleAll',
    title: 'Инвертировать',
    icon: 'icon-Check2',
    iconStyle: '',
    activateHandler: 'Controls/operationsPanel:ActivateHandler'
}];

export default class MassOperationMenu extends Control<IControlOptions> {
    protected _template: TemlateFunction = template;
    protected _source: Memory;
    protected _operationPanelItemsStoreId: string = '';
    protected _operationPanelOpenMenu: string = '';
    protected _children: Record<string, Control> = {
        menu: Button
    };

    private _getMenuSource(): Memory {
        const toolbarItems = object.clone(DEFAULT_OPERATIONS.concat(Store.getState().operationToolbarItems));
        toolbarItems.forEach((item) => {
            item.activateHandler = 'Controls/operationsPanel:ActivateHandler';
        });
        return new Memory({
            data: toolbarItems,
            keyProperty: 'id'
        });
    }

    protected _afterMount(): void {
        this._source = this._getMenuSource();
        this._operationPanelItemsStoreId = Store.onPropertyChanged('operationToolbarItems', () => {
            this._source = this._getMenuSource();
        });
        this._operationPanelOpenMenu = Store.declareCommand('openOperationsMenu', () => {
            this._children.menu.openMenu();
        });
    }

    protected _beforeUnmount(): void {
        if (this._operationPanelItemsStoreId) {
            Store.unsubscribe(this._operationPanelItemsStoreId);
        }

        if (this._operationPanelOpenMenu) {
            Store.unsubscribe(this._operationPanelOpenMenu);
        }
    }
}
