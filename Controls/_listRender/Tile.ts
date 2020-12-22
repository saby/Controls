import { TemplateFunction } from 'UI/Base';

import { default as BaseRender, IRenderOptions } from './Render';

import template = require('wml!Controls/_listRender/Tile/Tile');
import defaultItemTemplate = require('wml!Controls/_listRender/Tile/resources/ItemTemplateWrapper');

import { TileCollection, TileCollectionItem } from 'Controls/display';
import { debounce } from 'Types/function';
import { SyntheticEvent } from 'Vdom/Vdom';
import { TouchContextField } from 'Controls/context';
import {constants} from 'Env/Env';

const HOVERED_ITEM_CHANGE_DELAY = 150;

export interface ITileRenderOptions extends IRenderOptions {
    listModel: TileCollection<unknown>;
}

export default class TileRender extends BaseRender {
    protected _options: ITileRenderOptions;
    protected _template: TemplateFunction = template;

    protected _animatedItem: TileCollectionItem<unknown> = null;
    protected _animatedItemTargetPosition: string;
    protected _shouldPerformAnimation: boolean;

    private _debouncedSetHoveredItem: typeof TileRender.prototype._setHoveredItem;
    private _destroyed: boolean = false;

    protected _beforeMount(options: ITileRenderOptions): void {
        super._beforeMount(options);
        this._templateKeyPrefix = 'tile-render';

        this._debouncedSetHoveredItem = debounce(
            this._setHoveredItem.bind(this),
            HOVERED_ITEM_CHANGE_DELAY
        ) as typeof TileRender.prototype._setHoveredItem;
    }

    protected _afterMount(options: ITileRenderOptions): void {
        super._afterMount(options);
        this._notify('register', ['controlResize', this, this._resetHoverState], { bubbling: true });
        this._notify('register', ['scroll', this, this._resetHoverState], { bubbling: true });
    }

    protected _beforeUpdate(newOptions: ITileRenderOptions): void {
        super._beforeUpdate(newOptions);
        if (newOptions.listModel !== this._options.listModel) {
            this._animatedItem = null;
            this._debouncedSetHoveredItem(null);
        }
        this._shouldPerformAnimation =
            this._animatedItem && !this._animatedItem.destroyed && this._animatedItem.isFixed();
    }

    protected _afterUpdate(): void {
        super._afterUpdate();
        if (this._animatedItem) {
            if (this._animatedItem.destroyed) {
                this._animatedItem = null;
            } else if (
                this._shouldPerformAnimation &&
                this._animatedItem.isFixed() &&
                !this._animatedItem.isAnimated()
            ) {
                this._animatedItem.setAnimated(true);
                this._animatedItem.setFixedPositionStyle(this._animatedItemTargetPosition);
                this._animatedItem.setCanShowActions(true);
                this._animatedItem = null;
            }
        }
    }

    protected _beforeUnmount(): void {
        this._animatedItem = null;

        this._notify('unregister', ['controlResize', this], { bubbling: true });
        this._notify('unregister', ['scroll', this], { bubbling: true });

        super._beforeUnmount();
    }

    protected _resetHoverState(): void {
        this._setHoveredItem(null);
    }

    protected _onItemWheel(): void {
        this._resetHoverState();
    }

    protected _onItemMouseMove(e: SyntheticEvent<MouseEvent>, item: TileCollectionItem<unknown>): void {
        if (!item.isFixed() && this._shouldProcessHover() /* && !this._listModel.getDragItemData() */) {
            // TODO Might be inefficient, can get called multiple times per hover. Should
            // be called immediately before or after the hovered item is set in the model,
            // but then we can't get the hover target element.
            // Doesn't look too bad in the demo profile, so leaving it as is for now.
            this._setHoveredItemPosition(e, item);
        }
        super._onItemMouseMove(e, item);
    }

    protected _onItemMouseEnter(e: SyntheticEvent<MouseEvent>, item: TileCollectionItem<unknown>): void {
        super._onItemMouseEnter(e, item);
        if (this._shouldProcessHover()) {
            this._debouncedSetHoveredItem(item);
        }
    }

    protected _onItemMouseLeave(e: SyntheticEvent<MouseEvent>, item: TileCollectionItem<unknown>): void {
        super._onItemMouseLeave(e, item);
        if (!this._isTouch() && !item.isActive()) {
            this._debouncedSetHoveredItem(null);
        }
    }

    protected _setHoveredItemPosition(e: SyntheticEvent<MouseEvent>, item: TileCollectionItem<unknown>): void {
        const target = e.target as HTMLElement;
        const tileScalingMode = this._options.listModel.getTileScalingMode();

        if (tileScalingMode === 'none' || target.closest('.js-controls-TileView__withoutZoom')) {
            item.setCanShowActions(true);
            return;
        }

        const itemContainer: HTMLElement = target.closest('.controls-TileView__item');
        const itemContainerRect = itemContainer.getBoundingClientRect();

        const viewContainer = tileScalingMode === 'inside'
            ? this.getItemsContainer()
            : constants.isBrowserPlatform && document.documentElement;
        const viewContainerRect = viewContainer.getBoundingClientRect();

        const targetItemSize = this._options.listModel.getItemContainerSize(itemContainer);
        const targetItemPosition = this._options.listModel.getItemContainerPosition(
            targetItemSize,
            itemContainerRect,
            viewContainerRect
        );

        const documentRect = constants.isBrowserPlatform && document.documentElement.getBoundingClientRect();
        const targetItemPositionInDocument = this._options.listModel.getItemContainerPositionInDocument(
            targetItemPosition,
            viewContainerRect,
            documentRect
        );

        // TODO This should probably be moved to some kind of animation manager
        if (targetItemPositionInDocument) {
            const targetPositionStyle = this._convertPositionToStyle(targetItemPositionInDocument);
            if (tileScalingMode !== 'overlap') {
                const startItemPositionInDocument = this._options.listModel.getItemContainerStartPosition(
                    itemContainerRect,
                    documentRect
                );
                item.setFixedPositionStyle(this._convertPositionToStyle(startItemPositionInDocument));
                this._animatedItem = item;
                this._animatedItemTargetPosition = targetPositionStyle;
            } else {
                item.setFixedPositionStyle(targetPositionStyle);
                item.setCanShowActions(true);
            }
        }
    }

    protected _convertPositionToStyle(position): string {
        let result = '';
        for (const key in position) {
            if (position.hasOwnProperty(key)) {
                result += `${key}: ${position[key]}px;`;
            }
        }
        return result;
    }

    destroy(): void {
        this._destroyed = true;
        super.destroy();
    }

    private _setHoveredItem(item: CollectionItem<unknown>): void {
        // TODO Adding this to prevent constantly resetting null and
        // causing version change. But version should only change when
        // the state actually changes, so probably managers should
        // keep track of the version and not the collection itself.
        // The "destroyed" check is necessary, because _setHoveredItem is called using debouncer
        if (
            !this._destroyed &&
            this._options.listModel && !this._options.listModel.destroyed &&
            this._options.listModel.getHoveredItem() !== item &&
            !this._options.listModel.getActiveItem()
        ) {
            this._options.listModel.setHoveredItem(item);
        }
    }

    private _isTouch(): boolean {
        return this._context?.isTouch?.isTouch;
    }

    private _shouldProcessHover(): boolean {
        return (
            !this._isTouch() &&
            !document.body.classList.contains('ws-is-drag')
        );
    }

    static _theme: string[] = ['Controls/tile'];

    static getDefaultOptions(): Partial<ITileRenderOptions> {
        return {
            itemTemplate: defaultItemTemplate
        };
    }

    static contextTypes() {
        return {
            isTouch: TouchContextField
        };
    }
}
