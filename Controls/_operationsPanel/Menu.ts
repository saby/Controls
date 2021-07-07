import {Control, TemlateFunction, IControlOptions} from 'UI/Base';
import * as template from 'wml!Controls/_operationsPanel/Menu/Menu';
import {Memory} from 'Types/source';
import Store from 'Controls/Store';
import {Button} from 'Controls/dropdown';
import {SyntheticEvent} from 'Vdom/Vdom';
import {Model} from 'Vdom/Vdom';
import {object} from 'Types/util';
import 'css!Controls/operationsPanel';

interface IOperation {
    id: string;
    title: string;
    icon: string;
    iconStyle: string;
    tooltip?: string;
    activateHandler: string;
    iconSize: string;
}

const DEFAULT_OPERATIONS: IOperation[] = [{
    id: 'toggleAll',
    title: 'Инвертировать',
    icon: 'icon-Check2',
    iconSize: 'm',
    iconStyle: '',
    activateHandler: 'Controls/operationsPanel:ActivateHandler'
}];

export default class MassOperationMenu extends Control<IControlOptions> {
    protected _template: TemlateFunction = template;
    protected _source: Memory;
    protected _operationPanelItemsStoreId: string = '';
    protected _operationPanelOpenMenu: string = '';
    protected _storeContextChangedId: string = '';
    protected _children: Record<string, Control> = {
        menu: Button
    };
    protected _createObservers(): void {
        if (this._operationPanelItemsStoreId) {
            Store.unsubscribe(this._operationPanelItemsStoreId);
        }

        if (this._operationPanelOpenMenu) {
            Store.unsubscribe(this._operationPanelOpenMenu);
        }
        this._operationPanelItemsStoreId = Store.onPropertyChanged('operationToolbarItems', (items) => {
            if (Store.getState().operationsMenuExpanded) {
                this._openMenu();
            } else {
                this._source = this._getMenuSource();
            }
        });
        this._operationPanelOpenMenu = Store.onPropertyChanged('operationsMenuExpanded', (value) => {
            if (value) {
                this._openMenu();
            } else {
                this._children.menu.closeMenu();
            }
        });
    }
    protected _beforeMount(): void {
        this._source = this._getMenuSource();
        this._storeContextChangedId = Store.onPropertyChanged('_contextName', () => {
            this._createObservers();
        }, true);
    }

    protected _openMenu(): void {
        return this._children.menu.openMenu({
            templateOptions: {
                source: this._getMenuSource()
            }
        });
    }

    protected _menuItemClick(event: SyntheticEvent, item: Model): boolean {
        event.stopImmediatePropagation();
        this._notify('menuItemActivate', [item]);
        return false;
    }

    private _getMenuSource(): Memory {
        let toolbarItems = [];
        const actions = Store.getState().operationToolbarItems as IOperation[];
        this._toolbarItems = actions;
        if (actions) {
            toolbarItems = [...DEFAULT_OPERATIONS, ...object.clone(actions)];
            toolbarItems.forEach((item) => {
                item.activateHandler = 'Controls/operationsPanel:ActivateHandler';
                item.iconSize = 'm';
                item.title = item.title || item.tooltip;
            });
        }
        return new Memory({
            data: toolbarItems,
            keyProperty: 'id'
        });
    }

    protected _close(): void {
        this._source = this._getMenuSource();
    }

    protected _afterMount(): void {
        this._source = this._getMenuSource();
        this._createObservers();
    }

    protected _beforeUnmount(): void {
        if (this._operationPanelItemsStoreId) {
            Store.unsubscribe(this._operationPanelItemsStoreId);
        }

        if (this._operationPanelOpenMenu) {
            Store.unsubscribe(this._operationPanelOpenMenu);
        }

        if (this._storeContextChangedId) {
            Store.unsubscribe(this._storeContextChangedId);
        }
    }
}
