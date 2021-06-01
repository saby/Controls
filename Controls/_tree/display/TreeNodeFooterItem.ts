import { TemplateFunction } from 'UI/Base';
import { Model } from 'Types/entity';
import TreeItem from './TreeItem';

export default class TreeNodeFooterItem extends TreeItem<null> {
    readonly '[Controls/tree:TreeNodeFooterItem]': boolean;
    readonly Markable: boolean = false;
    readonly DraggableItem: boolean = false;
    readonly SelectableItem: boolean = false;
    readonly ItemActionsItem: boolean = false;

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
        return super.getContentClasses(theme, style) + ' controls-TreeView__itemContent';
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
}

Object.assign(TreeNodeFooterItem.prototype, {
    '[Controls/tree:TreeNodeFooterItem]': true,
    _moduleName: 'Controls/tree:TreeNodeFooterItem',
    _instancePrefix: 'tree-node-footer-item-'
});
