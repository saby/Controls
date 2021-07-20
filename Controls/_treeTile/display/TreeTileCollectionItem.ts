import {Model} from 'Types/entity';
import { mixin } from 'Types/util';
import {
    TileItemMixin,
    TTileItem,
    TActionMode,
    TGradientType,
    TImagePosition,
    TImageViewMode,
    TShadowVisibility,
    TTitleStyle,
    ITileCollectionItemOptions
} from 'Controls/tile';
import {ITreeItemOptions, TreeItem} from 'Controls/display';
import { TemplateFunction } from 'UI/Base';
import * as FolderIcon from 'wml!Controls/_treeTile/render/FolderIcon';
import { TCursor } from 'Controls/baseList';
import {ITreeTileAspectOptions} from './TreeTileCollection';

const DEFAULT_FOLDER_WIDTH = 250;

export interface ITreeTileCollectionItemOptions<S extends Model = Model>
    extends ITreeItemOptions<S>, ITileCollectionItemOptions, ITreeTileAspectOptions {}

export default class TreeTileCollectionItem<T extends Model = Model>
    extends mixin<TreeItem, TileItemMixin>(TreeItem, TileItemMixin) {

    protected _$nodesHeight: number;

    protected _$folderWidth: number;

    getContentTemplate(
        itemType: TTileItem = 'default', contentTemplate?: TemplateFunction, nodeContentTemplate?: TemplateFunction
    ): TemplateFunction {
        if (this.isNode() && nodeContentTemplate) {
            return nodeContentTemplate;
        }
        return super.getContentTemplate(itemType, contentTemplate);
    }

    getNodesHeight(): number {
        return this._$nodesHeight;
    }

    setNodesHeight(nodesHeight: number): void {
        if (this._$nodesHeight !== nodesHeight) {
            this._$nodesHeight = nodesHeight;
            this._nextVersion();
        }
    }

    getFolderWidth(): number {
        return this._$folderWidth;
    }

    setFolderWidth(folderWidth: number): void {
        if (this._$folderWidth !== folderWidth) {
            this._$folderWidth = folderWidth;
            this._nextVersion();
        }
    }

    getTileWidth(
        widthTpl?: number,
        imagePosition: TImagePosition = 'top',
        imageViewMode: TImageViewMode = 'rectangle'
    ): number {
        if (this.isNode() && !this.getTileSize()) {
            return widthTpl || this.getFolderWidth() || DEFAULT_FOLDER_WIDTH;
        } else {
            return super.getTileWidth(widthTpl, imagePosition, imageViewMode);
        }
    }

    getItemType(itemTypeTpl: TTileItem = 'default', nodeContentTemplate?: TemplateFunction): TTileItem {
        let itemType = super.getItemType(itemTypeTpl, nodeContentTemplate);

        // Если nodeContentTemplate задан значит, что для узла используется определенныйы itemType
        if (itemType === 'default' && this.isNode() && !nodeContentTemplate) {
            itemType = 'small';
        }

        return itemType;
    }

    getImageTemplate(itemType: TTileItem = 'default'): TemplateFunction {
        if (this.isNode() && (itemType === 'small' || itemType === 'default')) {
            return FolderIcon;
        } else {
            return super.getImageTemplate(itemType);
        }
    }

    getItemActionsClasses(itemType: TTileItem = 'default', itemActionsClass: string = ''): string {
        let classes = super.getItemActionsClasses(itemType, itemActionsClass);

        if (itemType === 'preview' && this.isNode()) {
            classes += ' controls-TileView__previewTemplate_itemActions_node';
        }

        return classes;
    }

    getItemActionsControl(itemType: TTileItem = 'default'): string|undefined {
        let control = super.getItemActionsControl(itemType);
        if (itemType === 'preview') {
            control = 'Controls/treeTile:TreeTileItemActions';
        }
        return control;
    }

    getActionMode(itemType: TTileItem = 'default'): TActionMode|void {
        if (itemType === 'preview' && this.isNode()) {
            return 'strict';
        } else {
            return super.getActionMode(itemType);
        }
    }

    getActionPadding(itemType: TTileItem = 'default'): string {
        if (itemType === 'preview' && this.isNode()) {
            return '';
        } else {
            return super.getActionPadding(itemType);
        }
    }

    getItemClasses(
        itemType: TTileItem = 'default',
        templateClickable?: boolean,
        hasTitle?: boolean,
        cursor: TCursor = 'pointer',
        marker?: boolean,
        shadowVisibility?: TShadowVisibility,
        border?: boolean
    ): string {
        let classes = super.getItemClasses(
            itemType, templateClickable, hasTitle, cursor, marker, shadowVisibility, border
        );

        if (this.isNode()) {
            classes += ' controls-TreeTileView__node';
            if (this.isDragTargetNode()) {
                classes += ' controls-TreeTileView__dragTargetNode';
            }
        }

        switch (itemType) {
            case 'default':
            case 'medium':
                break;
            case 'rich':
                break;
            case 'preview':
                if (this.isNode()) {
                    classes += ' js-controls-TileView__withoutZoom controls-TileView__previewTemplate_node';
                }
                break;
            case 'small':
                if (this.isNode()) {
                    classes = classes.replace(
                        'controls-TileView__smallTemplate_listItem',
                        'controls-TileView__smallTemplate_nodeItem'
                    );
                }
                break;
        }

        return classes;
    }

    getItemStyles(
        itemType: TTileItem = 'default',
        templateWidth?: number,
        staticHeight?: boolean,
        imagePosition: TImagePosition = 'top',
        imageViewMode: TImageViewMode = 'rectangle'
    ): string {
        if (this.isNode() && (itemType === 'default' || itemType === 'small')) {
            const width = this.getTileWidth(templateWidth, imagePosition, imageViewMode);
            let styles = `-ms-flex-preferred-size: ${width}px; flex-basis: ${width}px;`;

            if (staticHeight) {
                styles += ` height: ${this.getNodesHeight()}px;`;
            }

            return styles;
        } else {
            return super.getItemStyles(itemType, templateWidth, staticHeight, imagePosition, imageViewMode);
        }
    }

    shouldDisplayTitle(itemType: TTileItem = 'default'): boolean {
        switch (itemType) {
            case 'default':
            case 'small':
            case 'medium':
            case 'rich':
                return super.shouldDisplayTitle(itemType);
            case 'preview':
                return super.shouldDisplayTitle(itemType) || this.isNode();
        }
    }

    getTitleClasses(
        itemType: TTileItem = 'default',
        titleStyle?: TTitleStyle,
        hasTitle?: boolean,
        titleLines: number = 1,
        titleColorStyle: string = 'default'
    ): string {
        let classes = super.getTitleClasses(itemType, titleStyle, hasTitle, titleLines, titleColorStyle);

        switch (itemType) {
            case 'default':
            case 'medium':
                break;
            case 'preview':
                if (this.isNode()) {
                    classes += ' controls-fontweight-bold';
                    classes = classes.replace(
                        'controls-fontsize-m',
                        'controls-fontsize-l'
                    );
                }
                break;
            case 'small':
                break;
            case 'rich':
                if (this.isNode()) {
                    classes = classes.replace(
                        'controls-fontsize-xl',
                        'controls-fontsize-3xl'
                    );
                }
                break;
        }

        return classes;
    }

    getTitleWrapperClasses(
        itemType: TTileItem = 'default',
        titleLines: number = 1,
        gradientType: TGradientType = 'dark',
        titleStyle: TTitleStyle = 'light'
    ): string {
        let classes = super.getTitleWrapperClasses(itemType, titleLines, gradientType, titleStyle);
        switch (itemType) {
            case 'default':
            case 'medium':
                break;
            case 'preview':
                if (this.isNode()) {
                    classes += ' controls-fontweight-bold';
                    classes = classes.replace(
                        'controls-fontsize-m',
                        'controls-fontsize-l'
                    );
                }
                break;
            case 'small':
                if (this.isNode()) {
                    classes += ' controls-TileView__smallTemplate_title_node';
                }
                break;
            case 'rich':
                break;
        }

        return classes;
    }

    // region Duplicate TODO роблема с миксинами

    setActive(active: boolean, silent?: boolean): void {
        // TODO This is copied from TileViewModel, but there must be a better
        // place for it. For example, somewhere in ItemActions container
        if (!active && this.isActive() && this.isHovered()) {
            this.getOwner().setHoveredItem(null);
        }
        super.setActive(active, silent);
    }

    setHovered(hovered: boolean, silent?: boolean): void {
        if (!hovered && this.isHovered()) {
            this.setCanShowActions(false);
        }
        super.setHovered(hovered, silent);
    }

    getMultiSelectClasses(): string {
        let classes = super.getMultiSelectClasses();

        const checkboxPositionClass = `controls-ListView__checkbox_position-${this.getMultiSelectPosition()}`;
        classes = classes.replace(checkboxPositionClass, '');
        classes += ' controls-TileView__checkbox controls-TileView__checkbox_top js-controls-TileView__withoutZoom';

        return classes;
    }

    // endregion Duplicate
}

Object.assign(TreeTileCollectionItem.prototype, {
    '[Controls/_treeTile/TreeTileCollectionItem]': true,
    _moduleName: 'Controls/treeTile:TreeTileCollectionItem',
    _instancePrefix: 'tree-tile-item-',
    _$nodesHeight: null,
    _$folderWidth: null
});
