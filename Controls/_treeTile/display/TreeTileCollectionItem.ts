import {Model} from 'Types/entity';
import { mixin } from 'Types/util';
import {TileItemMixin} from 'Controls/tile';
import { TreeItem } from 'Controls/display';
import { TemplateFunction } from 'UI/Base';
import * as FolderIcon from 'wml!Controls/_treeTile/render/FolderIcon';

const DEFAULT_FOLDER_WIDTH = 250;

export default class TreeTileCollectionItem<T extends Model = Model>
    extends mixin<TreeItem, TileItemMixin>(TreeItem, TileItemMixin) {

    protected _$nodesHeight: number;

    protected _$folderWidth: number;

    getContentTemplate(itemType: string = 'default', contentTemplate?: TemplateFunction, nodeContentTemplate?: TemplateFunction): TemplateFunction {
        if (this.isNode() && nodeContentTemplate) {
            return nodeContentTemplate;
        }
        return super.getContentTemplate(itemType, contentTemplate, nodeContentTemplate);
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

    getTileWidth(widthTpl?: number): number {
        if (this.isNode()) {
            return widthTpl || this.getFolderWidth() || DEFAULT_FOLDER_WIDTH;
        } else {
            return super.getTileWidth(widthTpl);
        }
    }

    getImageTemplate(itemType: string = 'default'): TemplateFunction {
        if (this.isNode() && (itemType === 'small' || itemType === 'default')) {
            return FolderIcon;
        } else {
            return super.getImageTemplate(itemType);
        }
    }

    getImageClasses(itemTypeTpl: string = 'default', widthTpl?: number, imageAlign: string = 'center', imageViewMode?: string, imageProportion?: number, imagePosition?: string, imageSize?: string, imageFit?: string, imageProportionOnItem?: string): string {
        let itemType = itemTypeTpl;
        if (itemType === 'default' && this.isNode()) {
            itemType = 'small';
        }
        return super.getImageClasses(itemType, widthTpl, imageAlign, imageViewMode, imageProportion, imagePosition, imageSize, imageFit, imageProportionOnItem);
    }

    getImageWrapperClasses(itemTypeTpl: string = 'default', templateHasTitle?: boolean, templateTitleStyle?: string, imageViewMode: string = 'rectangle'): string {
        let itemType = itemTypeTpl;
        if (itemType === 'default' && this.isNode()) {
            itemType = 'small';
        }
        return super.getImageWrapperClasses(itemType, templateHasTitle, templateTitleStyle, imageViewMode);
    }

    getItemActionsClasses(itemTypeTpl: string = 'default', itemActionsClass: string = ''): string {
        let itemType = itemTypeTpl;
        if (itemType === 'default' && this.isNode()) {
            itemType = 'small';
        }

        let classes = super.getItemActionsClasses(itemType, itemActionsClass);

        if (itemType === 'preview' && this.isNode()) {
            classes += ' controls-TileView__previewTemplate_itemActions_node';
        }

        return classes;
    }

    getActionMode(itemType: string = 'default'): string {
        if (itemType === 'preview' && this.isNode()) {
            return 'strict';
        } else {
            return super.getActionMode(itemType);
        }
    }

    getActionPadding(itemType: string = 'default'): string {
        if (itemType === 'preview' && this.isNode()) {
            return '';
        } else {
            return super.getActionPadding(itemType);
        }
    }

    getItemClasses(itemTypeTpl: string = 'default', templateClickable?: boolean, hasTitle?: boolean, cursor: string = 'pointer', marker?: boolean, shadowVisibility?: string, border?: boolean): string {
        let itemType = itemTypeTpl;
        if (itemType === 'default' && this.isNode()) {
            itemType = 'small';
        }

        let classes = super.getItemClasses(itemType, templateClickable, hasTitle, cursor, marker, shadowVisibility, border);

        if (this.isNode()) {
            classes += ' controls-TreeTileView__node';
            if (this.isDragTargetNode()) {
                classes += ` controls-TileView__dragTargetNode`;
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

    getItemStyles(itemType: string, templateWidth?: number, staticHeight?: number): string {
        if (this.isNode() && (itemType === 'default' || itemType === 'small')) {
            const width = this.getTileWidth(templateWidth);
            return `-ms-flex-preferred-size: ${width}px; flex-basis: ${width}px;`;
        } else {
            return super.getItemStyles(itemType, templateWidth, staticHeight);
        }
    }

    getWrapperStyles(itemTypeTpl: string = 'default'): string {
        let itemType = itemTypeTpl;
        if (itemType === 'default' && this.isNode()) {
            itemType = 'small';
        }
        return super.getWrapperStyles(itemType);
    }

    shouldDisplayTitle(itemType: string = 'default'): boolean {
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

    getTitleClasses(itemTypeTpl: string = 'default', titleStyle?: string, hasTitle?: boolean, titleLines: number = 1, titleColorStyle: string = 'default'): string {
        let itemType = itemTypeTpl;
        if (itemType === 'default' && this.isNode()) {
            itemType = 'small';
        }
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
                if (this.isNode()) {
                    classes += ' controls-TileView__smallTemplate_title_node';
                }
                break;
            case 'rich':
                if (this.isNode()) {
                    classes = classes.replace(
                        `controls-fontsize-xl`,
                        `controls-fontsize-3xl`
                    );
                }
                break;
        }

        return classes;
    }

    getTitleWrapperStyles(itemTypeTpl: string = 'default', imageViewMode: string, imagePosition: string, gradientColor: string = '#FFF'): string {
        let itemType = itemTypeTpl;
        if (itemType === 'default' && this.isNode()) {
            itemType = 'small';
        }
        return super.getTitleWrapperStyles(itemType, imageViewMode, imagePosition, gradientColor);
    }

    getTitleWrapperClasses(itemType: string = 'default', titleLines: number = 1, gradientType: string = 'dark', titleStyle: string = 'light'): string {
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
                break;
            case 'rich':
                break;
        }

        return classes;
    }

    getEllipsisClasses(itemTypeTpl: string = 'default', titleLines: number = 1, staticHeight?: boolean, hasTitle?: boolean): string {
        let itemType = itemTypeTpl;
        if (itemType === 'default' && this.isNode()) {
            itemType = 'small';
        }
        return super.getEllipsisClasses(itemType, titleLines, staticHeight, hasTitle);
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

    getMultiSelectClasses(theme: string): string {
        let classes = super.getMultiSelectClasses(theme);
        classes = classes.replace(`controls-ListView__checkbox_position-${this.getOwner().getMultiSelectPosition()}`, '');
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
