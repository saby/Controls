import { TemplateFunction } from 'UI/Base';
import { Model } from 'Types/entity';
import TreeItem from './TreeItem';

export default class TreeNodeFooterItem extends TreeItem<null> {
    readonly '[Controls/tree:TreeNodeFooterItem]': boolean;
    readonly Markable: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly EnumerableItem: boolean = false;
    readonly EdgeRowSeparatorItem: boolean = false;
    readonly ItemActionsItem: boolean = false;

    protected _$moreFontColorStyle: string;

    get node(): TreeItem<Model> {
        return this.getNode();
    }

    getNode(): TreeItem<Model> {
        return this.getParent();
    }

    getTemplate(): TemplateFunction | string {
        return this._$owner.getNodeFooterTemplate() || 'Controls/tree:NodeFooterTemplate';
    }

    getNodeFooterTemplateMoreButton(): TemplateFunction {
        return this._$owner.getNodeFooterTemplateMoreButton();
    }

    getItemClasses(): string {
        return 'controls-ListView__itemV controls-Tree__nodeFooter';
    }

    getContentClasses(theme: string, style: string = 'default'): string {
        return super.getContentClasses(theme, style) + ' controls-Tree__itemContentTreeWrapper';
    }

    getExpanderPaddingClasses(tmplExpanderSize?: string, theme: string = 'default'): string {
        let classes = super.getExpanderPaddingClasses(tmplExpanderSize, theme);

        classes = classes.replace(
           'controls-TreeGrid__row-expanderPadding',
           'controls-TreeGrid__node-footer-expanderPadding'
        );

        return classes;
    }

    shouldDisplayVisibleFooter(content: TemplateFunction): boolean {
        return this.hasMoreStorage() || !!content;
    }

    getMoreFontColorStyle(): string {
        return this._$moreFontColorStyle;
    }

    setMoreFontColorStyle(moreFontColorStyle: string): void {
        if (this._$moreFontColorStyle !== moreFontColorStyle) {
            this._$moreFontColorStyle = moreFontColorStyle;
            this._nextVersion();
        }
    }

    protected _getLeftSpacingContentClasses(): string {
        if (this._isDefaultRenderMultiSelect()) {
            return ` controls-ListView__itemContent_withCheckboxes`;
        } else {
            return ` controls-ListView__item-leftPadding_${this.getOwner().getLeftPadding().toLowerCase()}`;
        }
    }
}

Object.assign(TreeNodeFooterItem.prototype, {
    '[Controls/tree:TreeNodeFooterItem]': true,
    _moduleName: 'Controls/tree:TreeNodeFooterItem',
    _instancePrefix: 'tree-node-footer-item-',
    _$moreFontColorStyle: null
});
