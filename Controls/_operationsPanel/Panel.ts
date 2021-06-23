import {Control, IControlOptions, TemplateFunction} from 'UI/Base';
import * as template from 'wml!Controls/_operationsPanel/Panel/Panel';
import {Memory} from 'Types/source';
import 'css!Controls/operationsPanel';
import {SyntheticEvent} from 'UI/Events';
import {isEqual} from 'Types/object';
import {IDragObject, Container} from 'Controls/dragnDrop';
import Store from 'Controls/Store';

export interface IOperationsPanelOptions extends IControlOptions {
    source: Memory;
}

export default class extends Control<IOperationsPanelOptions> {
    protected _template: TemplateFunction = template;
    protected _operationPanelConfig: Record<string, any>;
    protected _operationPanelConfigStoreId: string = '';
    protected _children: Record<string, any> = {
        dragNDrop: Container
    };

    protected _beforeMount(): void {
        this._operationPanelConfig = Store.getState().operationPanelConfig;
    }

    protected _afterMount(): void {
        this._operationPanelConfigStoreId = Store.onPropertyChanged('operationPanelConfig', (config) => {
            if (!isEqual(config, this._operationPanelConfig)) {
                if (config.selectedKeys.length !== this._operationPanelConfig.selectedKeys) {
                    Store.sendCommand('openOperationsMenu');
                }
                this._operationPanelConfig = Store.getState().operationPanelConfig;
            }
        });
    }

    protected _beforeUnmount(): void {
        if (this._operationPanelConfigStoreId) {
            Store.unsubscribe(this._operationPanelConfigStoreId);
        }
    }
    protected _onDragEnd(): void {
        this._notify('popupDragEnd', [], {bubbling: true});
    }

    protected _onDragMove(event: SyntheticEvent<Event>, dragObject: IDragObject): void {
        this._notify('popupDragStart', [dragObject.offset], {bubbling: true});
    }

    protected _onMouseDown(event: SyntheticEvent<MouseEvent>): void {
        this._startDragNDrop(event);
    }

    private _startDragNDrop(event: SyntheticEvent<Event>): void {
        this._children.dragNDrop.startDragNDrop(null, event);
    }

    protected _closePanel(e: SyntheticEvent): void {
        e.stopImmediatePropagation();
        Store.dispatch('operationsPanelExpanded', false);
    }

    protected _selectedTypeChanged(e: SyntheticEvent, type: string): void {
        Store.dispatch('selectedType', type);
    }

    protected _click(e: SyntheticEvent): void {
        Store.sendCommand('openOperationPanel');
    }
}
