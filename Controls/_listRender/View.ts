import { Control, TemplateFunction, IControlOptions } from 'UI/Base';

import template = require('wml!Controls/_listRender/View/View');

import { RecordSet } from 'Types/collection';
import { Model } from 'Types/entity';
import { create as diCreate } from 'Types/di';

import {
    Collection,
    CollectionItem,
    ItemActionsController,
    MarkerCommands,
    ICollectionCommand
} from 'Controls/display';
import tmplNotify = require('Controls/Utils/tmplNotify');

import { load as libraryLoad } from 'Core/library';
import { SyntheticEvent } from 'Vdom/Vdom';

import { constants } from 'Env/Env';

export interface IViewOptions extends IControlOptions {
    items: RecordSet;

    collection: string;
    render: string;

    itemActions?: any[];
    itemActionVisibilityCallback?: (action, item) => boolean;
    itemActionsPosition?: string;
    itemActionsProperty?: string;
    style?: string;

    actionAlignment?: string;
    actionCaptionPosition?: 'right'|'bottom'|'none';

    editingConfig?: any;
}

interface ISwipeEvent extends Event {
    direction: string;
}

export default class View extends Control<IViewOptions> {
    protected _template: TemplateFunction = template;
    protected _tmplNotify: Function = tmplNotify;

    protected _collection: Collection<Model>;

    protected async _beforeMount(options: IViewOptions): Promise<void> {
        this._collection = this._createCollection(options.collection, options.items, options);

        ItemActionsController.calculateActionsTemplateConfig(
            this._collection,
            {
                itemActionsPosition: options.itemActionsPosition,
                style: options.style,
                actionAlignment: options.actionAlignment,
                actionCaptionPosition: options.actionCaptionPosition
            }
        );

        return libraryLoad(options.render).then(() => null);
    }

    protected _beforeUpdate(options: IViewOptions): void {
        let collectionRecreated = false;

        if (options.items !== this._options.items) {
            if (this._collection) {
                this._collection.destroy();
            }
            this._collection = this._createCollection(options.collection, options.items, options);
            collectionRecreated = true;
        }

        if (options.editingConfig !== this._options.editingConfig || options.editingConfig && collectionRecreated) {
            this._collection.setEditingConfig(options.editingConfig);
        }

        if (
            options.itemActions !== this._options.itemActions ||
            options.itemActionVisibilityCallback !== this._options.itemActionVisibilityCallback ||
            options.itemActionsProperty !== this._options.itemActionsProperty ||
            (options.itemActions || options.itemActionsProperty) && collectionRecreated
        ) {
            ItemActionsController.resetActionsAssignment(this._collection);

            // TODO Only reassign actions if Render is hovered. Otherwise wait
            // for mouseenter or touchstart to recalc the items
            this._assignItemActions(
                options.itemActions,
                options.itemActionsProperty,
                options.itemActionVisibilityCallback
            );
        }

        ItemActionsController.calculateActionsTemplateConfig(
            this._collection,
            {
                itemActionsPosition: options.itemActionsPosition,
                style: options.style,
                actionAlignment: options.actionAlignment,
                actionCaptionPosition: options.actionCaptionPosition
            }
        );
    }

    protected _beforeUnmount(): void {
        if (this._collection) {
            this._collection.destroy();
            this._collection = null;
        }
    }

    protected _onRenderMouseEnter(e: SyntheticEvent<MouseEvent>): void {
        this._assignItemActions(
            this._options.itemActions,
            this._options.itemActionsProperty,
            this._options.itemActionVisibilityCallback
        );
    }

    protected _onRenderTouchStart(e: SyntheticEvent<TouchEvent>): void {
        this._assignItemActions(
            this._options.itemActions,
            this._options.itemActionsProperty,
            this._options.itemActionVisibilityCallback
        );
    }

    protected _onItemClick(
        e: SyntheticEvent<null>,
        item: Model,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        const moveMarker = new MarkerCommands.Mark(item.getKey());
        this._executeCommands([moveMarker]);
        // TODO fire 'markedKeyChanged' event
    }

    protected _onItemSwipe(
        e: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        swipeEvent: SyntheticEvent<ISwipeEvent>,
        swipeContainerHeight: number
    ): void {
        switch (swipeEvent.nativeEvent.direction) {
        case 'left':
            ItemActionsController.activateSwipe(
                this._collection,
                item.getContents().getKey(),
                swipeContainerHeight
            );
            break;
        default:
            // TODO How to close swipe with animation
            ItemActionsController.deactivateSwipe(this._collection);
            break;
        }
    }

    protected _onItemActionClick(
        e: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        action: unknown,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        const moveMarker = new MarkerCommands.Mark(item.getContents().getKey());
        this._executeCommands([moveMarker]);
        // TODO fire 'markedKeyChanged' event

        ItemActionsController.processActionClick(
            this._collection,
            item.getContents().getKey(),
            action,
            clickEvent,
            false
        );
        // TODO fire 'actionClick' event
    }

    protected _onItemContextMenu(
        e: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        clickEvent: SyntheticEvent<MouseEvent>
    ): void {
        ItemActionsController.prepareActionsMenuConfig(
            this._collection,
            item.getContents().getKey(),
            clickEvent,
            null,
            true
        );
    }

    protected _onItemKeyDown(
        e: SyntheticEvent<null>,
        item: CollectionItem<Model>,
        keyDownEvent: SyntheticEvent<KeyboardEvent>
    ): void {
        const commands: Array<ICollectionCommand<unknown>> = [];
        switch (keyDownEvent.nativeEvent.keyCode) {
        case constants.key.down:
            commands.push(new MarkerCommands.MarkNext());
            break;
        case constants.key.up:
            commands.push(new MarkerCommands.MarkPrevious());
            break;
        }
        this._executeCommands(commands);
        // TODO fire 'markedKeyChanged' event if needed
    }

    protected _executeCommands(commands: Array<ICollectionCommand<unknown>>): void {
        commands.forEach((command) => command.execute(this._collection));
    }

    private _createCollection(
        module: string,
        items: RecordSet,
        collectionOptions: IViewOptions
    ): Collection<Model> {
        return diCreate(module, { ...collectionOptions, collection: items });
    }

    protected _assignItemActions(
        itemActions: any[],
        itemActionsProperty: string,
        itemActionsVisibilityCallback: (action, item) => boolean
    ): void {
        const actionsGetter =
            itemActionsProperty
            ? (item) => item.getContents().get(itemActionsProperty)
            : () => itemActions;
        ItemActionsController.assignActions(
            this._collection,
            actionsGetter,
            itemActionsVisibilityCallback
        );
    }

    static getDefaultOptions(): Partial<IViewOptions> {
        return {
            itemActionsPosition: 'inside',
            actionAlignment: 'horizontal',
            actionCaptionPosition: 'none',
            style: 'default'
        };
    }
}
