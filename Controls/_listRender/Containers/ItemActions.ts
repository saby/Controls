import { Control, TemplateFunction, IControlOptions } from 'UI/Base';

import template = require('wml!Controls/_listRender/Containers/ItemActions/ItemActions');

import { SyntheticEvent } from 'Vdom/Vdom';
import { CollectionItem, Collection } from 'Controls/display';
import { Model } from 'Types/entity';

import * as itemActionsUtil from './ItemActions/processItemActions';

export type TItemActionVisibilityCallback = (action, item: Model) => boolean;

export interface IItemActionsControlOptions extends IControlOptions {
    listModel: Collection<Model>;

    itemActions?: any[];
    itemActionVisibilityCallback?: TItemActionVisibilityCallback;
    itemActionsPosition?: string;
    itemActionsProperty?: string;

    contextMenuConfig?: any;
}

export default class ItemActionsControl extends Control<IItemActionsControlOptions> {
    protected _template: TemplateFunction = template;

    // TODO React to collection change here or in the manager
    protected _initializedActions: boolean = false;

    protected _beforeUpdate(options: IItemActionsControlOptions): void {
        if (
            this._initializedActions &&
            (
                options.listModel !== this._options.listModel ||
                options.itemActions !== this._options.itemActions ||
                options.itemActionsProperty !== this._options.itemActionsProperty ||
                options.itemActionVisibilityCallback !== this._options.itemActionVisibilityCallback
            )
        ) {
            this._assignItemActions(
                options.listModel,
                options.itemActions,
                options.itemActionsProperty,
                options.itemActionVisibilityCallback
            );
        }
    }

    protected _onContainerMouseEnter(): void {
        if (!this._initializedActions) {
            this._assignItemActions(
                this._options.listModel,
                this._options.itemActions,
                this._options.itemActionsProperty,
                this._options.itemActionVisibilityCallback
            );
            this._initializedActions = true;
        }
    }

    protected _onItemActionsClick(event: SyntheticEvent<MouseEvent>, action: any, item: CollectionItem<Model>): void {
        itemActionsUtil.processItemActionClick.call(
            this,
            event,
            action,
            item
        );
    }

    protected _onItemContextMenu(
        event: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        itemActionsUtil.openActionsMenu.call(
            this,
            item,
            clickEvent,
            true
        );
    }

    protected _assignItemActions(
        listModel: Collection<Model>,
        itemActions: any[],
        itemActionsProperty: string,
        itemActionVisibilityCallback: TItemActionVisibilityCallback
    ): void {
        const actionsGetter =
            itemActionsProperty
            ? (item) => item.getContents().get(itemActionsProperty)
            : () => itemActions;

        listModel.getItemActionsManager().assignItemActions(
            actionsGetter,
            itemActionVisibilityCallback
        );
    }

    static getDefaultOptions(): Partial<IItemActionsControlOptions> {
        return {
            itemActionsPosition: 'inside'
        };
    }
}
